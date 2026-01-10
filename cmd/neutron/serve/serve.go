package serve

import "github.com/spf13/cobra"

func ServeCommand() *cobra.Command {
	serveCmd := &cobra.Command{
		Use:     "serve",
		Short:   "netron filesystem service",
		Aliases: []string{"server"},
	}

	startCmd := &cobra.Command{
		Use:   "start",
		Short: "Start server",
		Run:   StartServer,
	}

	testCmd := &cobra.Command{
		Use:   "test",
		Short: "Test",
		Run:   Test,
	}

	serveCmd.AddCommand(startCmd)
	serveCmd.AddCommand(testCmd)

	return serveCmd
}
