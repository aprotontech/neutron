package remote

type Block struct {
	UUID string
}

type FileContentSlice struct {
	blockID string
	offset  int64
	length  int64
}
