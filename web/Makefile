deps: bindeps node_modules

bindeps:
	@which dnslink-dnsimple || go get github.com/ipfs/dnslink-dnsimple
	@which ipfs || (echo "please install ipfs" && exit 1)

node_modules:
	npm install

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
	# reflex -R '(build|node_modules|test|.git|bin)' 'sh -c make build'
	node_modules/.bin/watch -p '/(build|node_modules|test|.git|bin)/' 'make build' .

publish-to-ipfs: build
	bin/publish-to-ipfs

publish-to-dns: publish-to-ipfs
	bin/publish-to-dns
