package remote

type Record struct {
	reversion int64
	mod       int
	path      string
	version   int32
	content   []FileContentSlice
}

type Histroy struct {
	records []Record
}
