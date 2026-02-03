package discover

import (
	"errors"
	"os"
	"strings"

	"github.com/aproton/neutron/cmd/neutron/config"
)

func CheckPassword(username, password string) (bool, error) {
	if config.GlobalConfig.Users == nil || config.GlobalConfig.Users.PasswordsFile == "" {
		return false, errors.New("no password file configured")
	}

	cnt, err := os.ReadFile(config.GlobalConfig.Users.PasswordsFile)
	if err != nil {
		return false, err
	}

	lines := strings.Split(string(cnt), "\n")
	for _, line := range lines {
		parts := strings.SplitN(line, ":", 2)
		if len(parts) != 2 {
			continue
		}
		if parts[0] == username && parts[1] == password {
			return true, nil
		}
	}

	return false, errors.New("invalid username or password")
}
