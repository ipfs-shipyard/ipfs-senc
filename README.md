# ipfs-senc - simple private file sharing on ipfs.

> WARNING: NOT AUDITED! USE AT OWN RISK. DONT USE FOR ANYTHING SERIOUS.

Currently, IPFS does not have an inbuilt content encryption system. Many solutions exist on top. I wanted something easy. This builds on [senc](https://github.com/jbenet/go-simple-encrypt).

> WARNING: i cannot maintain small pieces of software anymore. if you want to use this, pull it into ipfs-shipyard (i'm happy to transfer it) and maintain it there. I just put it under @jbenet for simplicity.

## View examples on the web

- Full Demo: https://ipfs.io/ipns/ipfs-senc.net/#zGekfyfuYnk9FPsMnJLPQeJ9s9M3AcE4pdNq2ujrKu5WR:/ipfs/QmQgMRb5FZBtX5KBDWGRcc5Vkq5FMvndpEh6YzhMzjCZVo
- Small Demo: https://ipfs.io/ipns/ipfs-senc.net/#z5xBkE3by6qydJRKq3qG7miwBAo4VKnVUemUN2NkdWPGz:/ipfs/QmawKztbUe4DuYdKuCX3JMqDakhAcqas5zxwRRNxSZbEgf
- Secret Sintel: https://ipfs.io/ipns/ipfs-senc.net/#z8C6ojoe8MXsnHBo7R3JkpbfHQfiNHvssPpMSrf8LUUmh:/ipfs/QmShBDVU7aMP517Zg4F85pPpmXZKvxpcGpaPeu9ADeoYRe


[See the viewer webapp docs here](./web)

## On the commandline

This tool is command-line based.

### Install

Using go get:

```
go get github.com/jbenet/ipfs-senc/ipfs-senc
```

### How to encrypt & share

```
# encrypt with a known key. (>256bits please)
ipfs-senc --key <secret-key> share  <path-to-file-or-directory>

# encrypt with a randomly generated key. will be printed out.
ipfs-senc share <path-to-file-or-directory>
```

Leave your IPFS node running, or pin this somewhere. consider [ipfs-cluster](https://github.com/ipfs/ipfs-cluster).

### How to download & decrypt

```
# will ask for key
ipfs-senc download <ipfs-link> <local-source-dir-or-file>

# decrypt with given key.
ipfs-senc --key <secret-key> download  <ipfs-link> [<local-destination-dir>]
```

Will use your local ipfs node, or the ipfs-gateway if no local node is available.

## Shell Script

If you have [the `senc` tool](https://github.com/jbenet/go-simple-encrypt/senc), then you can also use the script provided in [ipfs-senc/ipfs-senc.sh](ipfs-senc/ipfs-senc.sh)

## On the browser

This can work entirely on the browser. The viewer code [is included in this repo](./web). It needs to learn how to add files too. ([drag-it, drop-it, crypt-it, pin-it, share-it, click-it, load-it, de-crypt, view-it](https://www.youtube.com/watch?v=D8K90hX4PrE)).

## License

MIT, copyright Protocol Labs, Inc.
