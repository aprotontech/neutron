package log

import (
	"fmt"
	"path/filepath"
	"runtime"

	"github.com/sirupsen/logrus"
)

var Debug = logrus.Debug
var Debugf = logrus.Debugf
var Infof = logrus.Infof
var Info = logrus.Info
var Warn = logrus.Warn
var Warnf = logrus.Warnf
var Fatal = logrus.Fatal
var Fatalf = logrus.Fatalf

var PrintToConsole = fmt.Println

func init() {
	logrus.SetReportCaller(true)
	logrus.SetFormatter(&logrus.TextFormatter{
		FullTimestamp:   true,
		TimestampFormat: "20240831-230900.000",
		ForceColors:     true,
		CallerPrettyfier: func(f *runtime.Frame) (string, string) {
			filename := filepath.Base(f.File)
			return "", fmt.Sprintf("[%s:%d]", filename, f.Line)
		},
	})
}
