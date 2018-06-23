# ipfs-senc web - viewer for ipfs-senc shares

> WARNING: NOT AUDITED! USE AT OWN RISK. DONT USE FOR ANYTHING SERIOUS.

## First, see [ipfs-senc](https://github.com/jbenet/ipfs-senc)

This is a tool to view `ipfs-senc` shared files on the web.

- Encrypt files with `ipfs-senc share`
- Links carry decryption keys in the `#anchor` (never sent to browser)
- Decrypts right in the browser
- Works out of any ipfs gateway

## Examples

- Full Demo: https://ipfs.io/ipns/ipfs-senc.net/#zGekfyfuYnk9FPsMnJLPQeJ9s9M3AcE4pdNq2ujrKu5WR:/ipfs/QmQgMRb5FZBtX5KBDWGRcc5Vkq5FMvndpEh6YzhMzjCZVo
- Small Demo: https://ipfs.io/ipns/ipfs-senc.net/#z5xBkE3by6qydJRKq3qG7miwBAo4VKnVUemUN2NkdWPGz:/ipfs/QmawKztbUe4DuYdKuCX3JMqDakhAcqas5zxwRRNxSZbEgf
- Secret Sintel: https://ipfs.io/ipns/ipfs-senc.net/#z8C6ojoe8MXsnHBo7R3JkpbfHQfiNHvssPpMSrf8LUUmh:/ipfs/QmShBDVU7aMP517Zg4F85pPpmXZKvxpcGpaPeu9ADeoYRe

### Anatomy of the URL

A URL like https://ipfs.io/ipns/ipfs-senc.net/#zGekfyfuYnk9FPsMnJLPQeJ9s9M3AcE4pdNq2ujrKu5WR:/ipfs/QmQgMRb5FZBtX5KBDWGRcc5Vkq5FMvndpEh6YzhMzjCZVo is broken down into:

```
(gateway-url)(webapp-path)#(key):(ciphertext-path)
```

For example

```
https://ipfs.io                             - ipfs gateway to use
  /ipns/ipfs-senc.net                       - tag for the latest webapp release
  #                                         - anchor tag: dont send the rest to servers (keys!)
    zGekfyfuYnk9FPsMnJLPQeJ9s9M3AcE4pdNq2ujrKu5WR         - symmetric encryption key (read cap)
    :                                                     - separator
    /ipfs/QmQgMRb5FZBtX5KBDWGRcc5Vkq5FMvndpEh6YzhMzjCZVo  - ipfs path to ciphertext
```

## Usage

### Step 1. Encrypt and share the files with `ipfs-senc`
```
# pick a folder to share (here, it is test-senc)
> mkdir test-senc
> # add files.
> ipfs-senc share senc-demo-full
skipping top level dir
Shared as:  /ipfs/QmQgMRb5FZBtX5KBDWGRcc5Vkq5FMvndpEh6YzhMzjCZVo
Key:  zGekfyfuYnk9FPsMnJLPQeJ9s9M3AcE4pdNq2ujrKu5WR
Ciphertext on local gateway:  https://gateway.ipfs.io /ipfs/QmQgMRb5FZBtX5KBDWGRcc5Vkq5FMvndpEh6YzhMzjCZVo
Ciphertext on global gateway:  http://localhost:8080 /ipfs/QmQgMRb5FZBtX5KBDWGRcc5Vkq5FMvndpEh6YzhMzjCZVo

Get, Decrypt, and Unbundle with:
    ipfs-senc --key zGekfyfuYnk9FPsMnJLPQeJ9s9M3AcE4pdNq2ujrKu5WR download /ipfs/QmQgMRb5FZBtX5KBDWGRcc5Vkq5FMvndpEh6YzhMzjCZVo dstPath

View on the web: https://ipfs.io/ipns/ipfs-senc.net/#zGekfyfuYnk9FPsMnJLPQeJ9s9M3AcE4pdNq2ujrKu5WR:/ipfs/QmQgMRb5FZBtX5KBDWGRcc5Vkq5FMvndpEh6YzhMzjCZVo
```

This yielded:
- `key: zGekfyfuYnk9FPsMnJLPQeJ9s9M3AcE4pdNq2ujrKu5WR`
- `(ciphertext) path: /ipfs/QmQgMRb5FZBtX5KBDWGRcc5Vkq5FMvndpEh6YzhMzjCZVo`
- `web slug (combination): #zGekfyfuYnk9FPsMnJLPQeJ9s9M3AcE4pdNq2ujrKu5WR:/ipfs/QmQgMRb5FZBtX5KBDWGRcc5Vkq5FMvndpEh6YzhMzjCZVo`

### 2. View the files using the `key` and `path`

- Browse https://ipfs.io/ipns/ipfs-senc
- Use the `key` and `path` from above in the fields
- Or copy-paste the web slug into the URL.
