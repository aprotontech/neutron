package storage

import (
	"context"

	"github.com/aproton/neutron/pkg/web"
)

type Storage interface {
	GetWebHandles() map[string]web.Handle
	Open(ctx context.Context) error
	Read(ctx context.Context, path string, offset int, data []byte) (int, error)
	Write(ctx context.Context, path string, offset int, data []byte) (int, error)
	Remove(ctx context.Context, path string) error
	Close() error
}
