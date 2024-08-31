package filesystem

type FileSystem interface {
	List(path string) ([]*FileState, error)
	Open(path string) (*File, error)
}
