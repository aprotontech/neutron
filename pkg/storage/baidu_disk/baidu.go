package baidudisk

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"time"

	"github.com/google/uuid"

	"github.com/aproton/neutron/pkg/storage/baidu_disk/openapi"
	"github.com/aproton/neutron/pkg/utils"
	"github.com/aproton/neutron/pkg/utils/log"
	"github.com/aproton/neutron/pkg/web"
)

type Config struct {
	AppID       string
	AppKey      string
	SecretKey   string
	SignKey     string
	PrefixPath  string
	RedirectUri string
	CachePath   string
}

type Metadata struct {
	AccessToken  string `json:"AccessToken"`
	RefreshToken string `json:"RefreshToken"`
	ExpiresTime  int64  `json:"ExpiresTime"`
}

type BaiduFileMetadata struct {
	FSID           uint64
	Size           uint64
	LocalCachePath string
}

type BaiduDisk struct {
	config       Config
	accessToken  string
	refreshToken string
	expiresTime  time.Time
	statusCode   string
	codeChan     chan string

	client *openapi.APIClient

	fileListCache map[string]*BaiduFileMetadata

	http *http.Client
}

func NewBaiduDisk(config Config) *BaiduDisk {
	return &BaiduDisk{
		accessToken:   "",
		config:        config,
		codeChan:      make(chan string),
		statusCode:    "",
		fileListCache: map[string]*BaiduFileMetadata{},
		http:          &http.Client{},
	}
}

func (pan *BaiduDisk) CodeHandler(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")

	pan.codeChan <- code
	fmt.Fprintf(w, "Hello, World!")
}

func (pan *BaiduDisk) AuthHandler(w http.ResponseWriter, r *http.Request) {
	pan.statusCode = utils.Hash(uuid.New().String(), 16)
	params := url.Values{}
	params.Add("response_type", "code")
	params.Add("client_id", pan.config.AppKey)
	params.Add("redirect_uri", pan.config.RedirectUri+"/code")
	params.Add("scope", "basic,netdisk")
	params.Add("device_id", pan.config.AppID)
	params.Add("qrcode", "1")
	params.Add("status", pan.statusCode)

	baiduCodeURI := "https://openapi.baidu.com/oauth/2.0/authorize?" + params.Encode()
	log.Infof("BaiduAPI: %s", baiduCodeURI)
	http.Redirect(w, r, baiduCodeURI, http.StatusFound)
}

func (pan *BaiduDisk) GetWebHandles() map[string]web.Handle {
	return map[string]web.Handle{
		"/baidu_pan/code": pan.CodeHandler,
		"/baidu_pan/open": pan.AuthHandler,
	}
}

func (pan *BaiduDisk) Open(ctx context.Context) error {
	configuration := openapi.NewConfiguration()
	pan.client = openapi.NewAPIClient(configuration)

	err := pan.loadCache()

	if err == nil {
		log.Infof("Try to refresh token")
		resp, r, err := pan.client.AuthApi.OauthTokenRefreshToken(ctx).
			ClientId(pan.config.AppKey).ClientSecret(pan.config.SecretKey).RefreshToken(pan.refreshToken).
			Execute()
		if err == nil {
			pan.accessToken = *resp.AccessToken
			pan.refreshToken = *resp.RefreshToken
			pan.expiresTime = time.Now().Add(time.Duration(*resp.ExpiresIn) * time.Second)
			log.Infof("refresh token success")

			_ = pan.saveCache()
			return nil
		}

		log.Warnf("Refresh token failed, raw response is: %v", r)
	}

	log.Infof("Load cache failed with %v", err)

	log.Infof("Local URI: %s", pan.config.RedirectUri+"/open")

	var code string
	select {
	case code = <-pan.codeChan:
	case <-ctx.Done():
		return errors.New("context closed")
	}

	resp, r, err := pan.client.AuthApi.OauthTokenCode2token(ctx).
		Code(code).ClientId(pan.config.AppKey).
		ClientSecret(pan.config.SecretKey).
		RedirectUri(pan.config.RedirectUri + "/code").
		Execute()
	if err != nil {
		log.Warnf("Error when calling `AuthApi.OauthTokenCode2token``: %v\n", err)
		log.Warnf("Full HTTP response: %v\n", r)
		return nil
	}

	pan.accessToken = *resp.AccessToken
	pan.refreshToken = *resp.RefreshToken
	pan.expiresTime = time.Now().Add(time.Duration(*resp.ExpiresIn) * time.Second)
	log.Infof("AccessToken %s, RefreshToken: %s, expiresTime: %s",
		pan.accessToken, pan.refreshToken, pan.expiresTime.Format("2025-11-22 10:00:00"))

	_ = pan.saveCache()

	return nil
}

func (pan *BaiduDisk) Read(ctx context.Context, path string, offset int, data []byte) (int, error) {
	if metadata, ok := pan.fileListCache[path]; ok && metadata.LocalCachePath != "" {
		n, err := pan.readFromCache(metadata, offset, data)
		if err == nil {
			return n, err
		}
	}

	if err := pan.getFileMetadata(ctx, path); err != nil {
		log.Warnf("Query file %s metadata info from remote failed with %s", path, err.Error())
		return 0, err
	}

	if metadata, ok := pan.fileListCache[path]; ok {
		if err := pan.downloadFile(ctx, metadata); err != nil {
			log.Warnf("Download file (%s) from remote failed with %s", path, err.Error())
			return 0, err
		}

		return pan.readFromCache(metadata, offset, data)
	}

	return 0, errors.New("get file information failed")
}

func (pan *BaiduDisk) readFromCache(metadata *BaiduFileMetadata, offset int, data []byte) (int, error) {
	fp, err := os.Open(metadata.LocalCachePath)
	if err == nil {
		defer fp.Close()

		return fp.ReadAt(data, int64(offset))
	}
	if err := os.Remove(metadata.LocalCachePath); err != nil {
		log.Warnf("remove local cache file (%s) failed %s", metadata.LocalCachePath, err.Error())
	}

	metadata.LocalCachePath = ""
	return 0, errors.New("open local cache file failed")

}

func (pan *BaiduDisk) getFileMetadata(ctx context.Context, path string) error {
	folder := filepath.Dir(path)
	for start, limit := 0, 500; ; {
		x, _, err := pan.client.FileinfoApi.Xpanfilelist(ctx).
			AccessToken(pan.accessToken).Dir(folder).Start(strconv.Itoa(start)).Limit(int32(limit)).Execute()
		if err != nil {
			log.Warnf("List path(%s) failed with error %s", folder, err.Error())
			return err
		}

		type _ItemInfo struct {
			Size uint64 `json:"size"`
			FSID uint64 `json:"fs_id"`
			Name string `json:"server_filename"`
		}

		type _Result struct {
			List []*_ItemInfo `json:"list"`
		}

		var result _Result
		if err = json.Unmarshal([]byte(x), &result); err != nil {
			log.Warnf("List path(%s) failed when decode response with error %s", folder, err.Error())
			return err
		}

		for _, item := range result.List {
			fullpath := folder + "/" + item.Name
			pan.fileListCache[fullpath] = &BaiduFileMetadata{
				FSID:           item.FSID,
				Size:           item.Size,
				LocalCachePath: "",
			}

			log.Debugf("cache %s, fsid=%d", fullpath, item.FSID)
		}

		if len(result.List) == limit {
			start += limit
		} else {
			break
		}
	}

	return nil
}

func (pan *BaiduDisk) downloadFile(ctx context.Context, metadata *BaiduFileMetadata) error {
	fsids, err := json.Marshal([]uint64{metadata.FSID})
	if err != nil {
		return fmt.Errorf("format FSID failed %w", err)
	}

	log.Infof("fsids=%s", string(fsids))

	info, _, err := pan.client.MultimediafileApi.Xpanmultimediafilemetas(ctx).
		AccessToken(pan.accessToken).Dlink("1").Fsids(string(fsids)).Execute()
	if err != nil {
		return fmt.Errorf("query download uri of fdids(%s) failed %w", string(fsids), err)
	}

	log.Infof(info)

	type _FileDownloadInfo struct {
		DownloadUri string `json:"dlink"`
		Size        uint64 `json:"size"`
		Name        string `json:"filename"`
		IsDir       int    `json:"isdir"`
	}

	type _DownloadResult struct {
		List []*_FileDownloadInfo `json:"list"`
	}

	var result _DownloadResult
	if err := json.Unmarshal([]byte(info), &result); err != nil {
		return err
	}

	if len(result.List) <= 0 {
		return errors.New("get download uri failed")
	}

	file := result.List[0]

	if err := os.MkdirAll(filepath.Join(pan.config.CachePath, "files"), 0755); err != nil {
		return fmt.Errorf("mkdir failed %w", err)
	}

	metadata.LocalCachePath = filepath.Join(pan.config.CachePath, "files", fmt.Sprintf("%d", metadata.FSID))

	fp, err := os.Create(metadata.LocalCachePath)
	if err != nil {
		return err
	}

	defer fp.Close()

	log.Infof("Try to download uri: %s", file.DownloadUri)
	req, err := http.NewRequest("GET", file.DownloadUri+"&access_token="+pan.accessToken, nil)
	if err != nil {
		return err
	}
	req.Header.Add("User-Agent", "pan.baidu.com")
	resp, err := pan.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if _, err := io.Copy(fp, resp.Body); err != nil {
		return err
	}

	log.Infof("Finished download %d to %s", metadata.FSID, metadata.LocalCachePath)

	return nil
}

func (pan *BaiduDisk) Write(ctx context.Context, path string, offset int, data []byte) (int, error) {
	metadata, ok := pan.fileListCache[path]
	if ok && metadata.LocalCachePath != "" {
		os.Remove(metadata.LocalCachePath)
	}

	metadata, err := pan.uploadToBaidu(ctx, path, data)

	if err != nil {
		log.Warnf("upload to baidu failed %s", err.Error())
		return 0, err
	}

	pan.fileListCache[path] = metadata

	return len(data), nil
}

func (pan *BaiduDisk) Remove(ctx context.Context, path string) error {
	r, err := pan.client.FilemanagerApi.Filemanagerdelete(ctx).
		AccessToken(pan.accessToken).Filelist(utils.JsonEncode([]string{path})).Async(0).Execute()

	if err != nil {
		return err
	}

	defer r.Body.Close()

	cnt, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}

	type _DeleteResult struct {
		ErrNo int `json:"errno"`
	}

	var result _DeleteResult
	if err := json.Unmarshal(cnt, &result); err != nil {
		return err
	}

	if result.ErrNo != 0 {
		log.Warnf("raw content: %s", string(cnt))
		return fmt.Errorf("delete failed with errno: %d", result.ErrNo)
	}

	delete(pan.fileListCache, path)

	return nil
}

func (pan *BaiduDisk) Close() error {
	return nil
}

func (pan *BaiduDisk) loadCache() error {
	metaPath := path.Join(pan.config.CachePath, "meta.json")

	cnt, err := os.ReadFile(metaPath)
	if err != nil {
		return err
	}

	metadata := Metadata{}

	if err := json.Unmarshal(cnt, &metadata); err != nil {
		return err
	}

	pan.accessToken = metadata.AccessToken
	pan.refreshToken = metadata.RefreshToken
	pan.expiresTime = time.Unix(metadata.ExpiresTime, 0)

	if pan.expiresTime.Compare(time.Now()) < 0 {
		return errors.New("token is timeout")
	}

	return nil
}

func (pan *BaiduDisk) saveCache() error {
	if err := os.MkdirAll(pan.config.CachePath, 0755); err != nil {
		return err
	}

	metaPath := path.Join(pan.config.CachePath, "meta.json")

	metadata := Metadata{
		AccessToken:  pan.accessToken,
		RefreshToken: pan.refreshToken,
		ExpiresTime:  pan.expiresTime.Unix(),
	}

	ctn, err := json.Marshal(metadata)
	if err != nil {
		return err
	}

	return os.WriteFile(metaPath, ctn, 0644)
}

func (pan *BaiduDisk) splitUploadData(data []byte) [][]byte {
	chunk_size := 4 * 1024 * 1024 // 4MB
	bufs := [][]byte{}
	for {
		if len(data) <= chunk_size {
			bufs = append(bufs, data)
			break
		}

		bufs = append(bufs, data[0:chunk_size])
		data = data[chunk_size:]
	}
	return bufs
}

func (pan *BaiduDisk) uploadToBaidu(ctx context.Context, path string, data []byte) (*BaiduFileMetadata, error) {
	chunks := pan.splitUploadData(data)

	hashs := []string{}
	for _, chunk := range chunks {
		hashs = append(hashs, utils.Hash(chunk, 0))
	}

	blocklisthash := utils.JsonEncode(hashs)

	log.Infof("block hash : %s", blocklisthash)

	r, raw, err := pan.client.FileuploadApi.Xpanfileprecreate(ctx).Autoinit(1).Rtype(3).
		AccessToken(pan.accessToken).Path(path).Size(int32(len(data))).Isdir(0).BlockList(blocklisthash).
		Execute()
	if err != nil {
		log.Infof("raw response: %v", raw)
		return nil, err
	}

	if *r.Errno != 0 {
		return nil, fmt.Errorf("create file failed with errno: %d", *r.Errno)
	}

	log.Infof("uploadid %s, block list %v", *r.Uploadid, *r.BlockList)

	if len(*r.BlockList) != len(chunks) {
		return nil, fmt.Errorf("input chunks length %d  not equal block list length %d", len(chunks), len(*r.BlockList))
	}

	for i := range chunks {
		s, _, err := pan.client.FileuploadApi.Pcssuperfile2(ctx).
			AccessToken(pan.accessToken).Path(path).Type_("tmpfile").
			Uploadid(*r.Uploadid).Partseq(strconv.Itoa(int((*r.BlockList)[i]))).Content(chunks[i]).Execute()
		if err != nil {
			return nil, err
		}

		log.Infof("response: %s", s)
	}

	cr, _, err := pan.client.FileuploadApi.Xpanfilecreate(ctx).
		AccessToken(pan.accessToken).Path(path).Size(int32(len(data))).Isdir(0).
		BlockList(blocklisthash).Uploadid(*r.Uploadid).Rtype(3).Execute()
	if err != nil {
		return nil, err
	}

	return &BaiduFileMetadata{
		FSID:           uint64(*cr.FsId),
		Size:           uint64(*cr.Size),
		LocalCachePath: "",
	}, nil
}
