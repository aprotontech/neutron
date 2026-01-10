package fs

type FileSystem interface {
	List(path string) ([]*NodeAttr, error)
	Open(path string) (FileOperator, error)
	Stat(path string) (*NodeAttr, error)
}
