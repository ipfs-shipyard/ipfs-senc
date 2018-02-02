# ipfs-senc - simple private file sharing on ipfs.

> WARNING: NOT AUDITED! USE AT OWN RISK. DONT USE FOR ANYTHING SERIOUS.

Currently, IPFS does not have an inbuilt content encryption system. Many solutions exist on top. I wanted something easy. This builds on [senc](https://github.com/jbenet/go-simple-encrypt).

> WARNING: i cannot maintain small pieces of software anymore. if you want to use this, pull it into ipfs-shipyard (i'm happy to transfer it) and maintain it there. I just put it under @jbenet for simplicity.

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
ipfs-senc share --key <secret-key> <path-to-file-or-directory>

# encrypt with a randomly generated key. will be printed out.
ipfs-senc share --random-key <path-to-file-or-directory>
```

Leave your IPFS node running, or pin this somewhere. consider [ipfs-cluster](https://github.com/ipfs/ipfs-cluster).

### How to download & decrypt

```
# will ask for key
ipfs-senc download <ipfs-link> <local-source-dir-or-file>

# decrypt with given key.
ipfs-senc download --key <secret-key> <ipfs-link> [<local-destination-dir>]
```

Will use your local ipfs node, or the ipfs-gateway if no local node is available.

## Shell Script

If you have [the `senc` tool](https://github.com/jbenet/go-simple-encrypt/senc), then you can also use the script provided in [ipfs-senc/ipfs-senc.sh](ipfs-senc/ipfs-senc.sh)

## On the browser

This can work entirely on the browser. PRs accepted for a single-page webapp that decrypts these on the browser and lets people download them. Bonus points for showing the filesystem (dirs and files) on the browser before the user downloads anything to their desktop.

## License

MIT, copyright Protocol Labs, Inc.
