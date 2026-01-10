package fs

type FileOperator interface {
	Read(cnt []byte) (int, error)

	Write(cnt []byte) (int, error)

	Close() error
}
