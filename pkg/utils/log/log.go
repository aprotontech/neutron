package log

import (
	"fmt"

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
	logrus.SetReportCaller(false)
	logrus.SetFormatter(&logrus.TextFormatter{
		TimestampFormat: "20240831-230900.000",
	})
}
