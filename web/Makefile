globalgway=https://ipfs.io
localgway=http://localhost:8080

build: build/bundle.js index.html $(shell find static)
	cp index.html build/.
	cp -r static build/.

build/bundle.js: *.js
	mkdir -p build
	node_modules/.bin/browserify main.js >$@

clean:
	rm -rf build

serve: build
	node_modules/.bin/live-server --port=7654 build

watch:
	node_modules/.bin/watch -p '/build|node_modules|test/' 'make build' .

publish-to-ipfs: build
	@export hash=$(shell ipfs add -Q -r build) && \
		export path="/ipfs/$$hash" && \
		echo "published version: $$path" && \
		echo "global: $(globalgway)$$path" && \
		echo "local: $(localgway)$$path"
