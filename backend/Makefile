MAIN := ./cmd/server

.PHONY := run build test clean

run:
	go run $(MAIN)

build:
	go build -o bin/server $(MAIN)

test:
	go test ./...

clean:
	rm -rf bin/
