package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"

	"github.com/aproton/neutron/cmd/neutron/config"
	"github.com/aproton/neutron/cmd/neutron/serve"
	"github.com/aproton/neutron/pkg/utils/log"
)

func main() {
	var configPath string

	rootCmd := &cobra.Command{
		Use:   "neutron",
		Short: "Neutron is a family file service",
		PersistentPreRun: func(cmd *cobra.Command, args []string) {
			content, err := os.ReadFile(configPath)
			if err != nil {
				log.PrintToConsole(err)
				return
			}

			var cfg config.Config
			if err := yaml.Unmarshal(content, &cfg); err != nil {
				_, _ = log.PrintToConsole(err)
				return
			}

			config.GlobalConfig = &cfg
		},
	}

	rootCmd.PersistentFlags().StringVar(&configPath, "config", "etc/config.yaml", "Config file path")

	rootCmd.AddCommand(serve.ServeCommand())

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
