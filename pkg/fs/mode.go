package fs

import "os"

type NeutronFileMode uint64

const ModeDir NeutronFileMode = 0x01 << 60
const ModeFile NeutronFileMode = 0x00 << 32

func (nfm NeutronFileMode) ToOSFileMode(osType OperationSystem) os.FileMode {
	switch osType {
	case LinuxSystem:
		return os.FileMode((uint32)(nfm & 0xFFFFFFFF))
	}
	panic("not supported system")
}

func (nfm *NeutronFileMode) FromOSFileMode(osType OperationSystem, mode os.FileMode) {
	switch osType {
	case LinuxSystem:
		*nfm = NeutronFileMode(uint64(mode))
		if mode.IsDir() {
			*nfm += ModeDir
		}

		return
	}
	panic("not supported system")
}

func FromSystemFileMode(osType OperationSystem, mode os.FileMode) NeutronFileMode {
	var nfm NeutronFileMode
	nfm.FromOSFileMode(osType, mode)
	return nfm
}
