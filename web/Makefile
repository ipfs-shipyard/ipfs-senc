
ggway=https://gateway.ipfs.io
lgway=http://localhost:8080

build: static build/bundle.js

static = index.html spinner.gif
static: $(static)
	cp $(static) build

build/bundle.js: index.js
	node_modules/.bin/browserify $^ >$@

clean:
	rm build/*

test: build
	@export hash=$(shell ipfs add --pin=false -q -r build | tail -n1); \
		echo "local gway: ${lgway}/ipfs/$$hash"; \
		echo "global gway: ${ggway}/ipfs/$$hash"; \
		open "${lgway}/ipfs/$$hash";
