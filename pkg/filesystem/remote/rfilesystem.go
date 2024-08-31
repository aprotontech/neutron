package remote

type TreeNode struct {
	Path string
	Permission int
	
	Children map[string]*TreeNode
}

type RemoteFile struct {
	TreeNode
	Content []FileContentSlice
}

type RemoteFolder struct {
	TreeNode
}

type RemoteFileSystem struct {
	history* Histroy
	blocks map[string]*Block
	root *TreeNode

	cacheFiles map[string]*RemoteFile
	cacheFolders map[string]*RemoteFolder
}