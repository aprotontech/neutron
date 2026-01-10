package portal

import "context"

type Portal interface {
	Run(ctx context.Context) error
}
