MAIN := ./cmd/server

.PHONY := run build test clean seed clean-seed reset-db

run:
	go run $(MAIN)

build:
	go build -o bin/server $(MAIN)

test:
	go test ./...

# NOTE make sure to add scripts/ which is in .gitignore
seed:
	sh ../scripts/seed.sh

clean-seed:
	sh ../scripts/cleanup.sh

reset-db:
	sh ../scripts/cleanup.sh --reset-db

clean:
	rm -rf bin/
