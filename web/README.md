# ipfs-senc web - viewer for ipfs-senc shares

> WARNING: NOT AUDITED! USE AT OWN RISK. DONT USE FOR ANYTHING SERIOUS.

## First, see [ipfs-senc](https://github.com/jbenet/ipfs-senc)

This is a tool to view `ipfs-senc` shared files on the web.

- Encrypt files with `ipfs-senc share`
- Links carry decryption keys in the `#anchor` (never sent to browser)
- Decrypts right in the browser
- Works out of any ipfs gateway

## Example

- Check out this live example:
https://ipfs.io/ipfs/QmSHWKevbs3wS5yUitjbtJGQ2oacdVWkeUreMvVB9gAfQc/#z7ctM2TbRQJ7soyjtU7qZgCmf9qmd1RsNdrYak5Tot7jP:/ipfs/QmT4gwMTHhMhiNCAfWk591hc8WX3vvTFJHdgGV2TDnijXC
- Corresponding ciphertext: https://ipfs.io/ipfs/QmT4gwMTHhMhiNCAfWk591hc8WX3vvTFJHdgGV2TDnijXC
- Corresponding key: `z7ctM2TbRQJ7soyjtU7qZgCmf9qmd1RsNdrYak5Tot7jP`

## Usage

### Step 1. Encrypt and share the files with `ipfs-senc`
```
> ipfs-senc --random-key share test-senc
Initializing ipfs node...
Sharing test-senc ...
Shared as:  /ipfs/QmT4gwMTHhMhiNCAfWk591hc8WX3vvTFJHdgGV2TDnijXC
Ciphertext on local gateway:  http://localhost:8080/ipfs/QmT4gwMTHhMhiNCAfWk591hc8WX3vvTFJHdgGV2TDnijXC
Ciphertext on global gateway:  https://ipfs.io/ipfs/QmT4gwMTHhMhiNCAfWk591hc8WX3vvTFJHdgGV2TDnijXC
Get, Decrypt, and Unbundle with:
    ipfs-senc --key z7ctM2TbRQJ7soyjtU7qZgCmf9qmd1RsNdrYak5Tot7jP download /ipfs/QmT4gwMTHhMhiNCAfWk591hc8WX3vvTFJHdgGV2TDnijXC dstPath
Web slug: #z7ctM2TbRQJ7soyjtU7qZgCmf9qmd1RsNdrYak5Tot7jP:/ipfs/QmT4gwMTHhMhiNCAfWk591hc8WX3vvTFJHdgGV2TDnijXC
# this outputs a key to use
```

This yielded:
- `key: z7ctM2TbRQJ7soyjtU7qZgCmf9qmd1RsNdrYak5Tot7jP`
- `(ciphertext) path: /ipfs/QmT4gwMTHhMhiNCAfWk591hc8WX3vvTFJHdgGV2TDnijXC`
- `web slug (combination): #z7ctM2TbRQJ7soyjtU7qZgCmf9qmd1RsNdrYak5Tot7jP:/ipfs/QmT4gwMTHhMhiNCAfWk591hc8WX3vvTFJHdgGV2TDnijXC`

### 2. View the files using the `key` and `path`

- Browse https://ipfs.io/ipfs/QmSHWKevbs3wS5yUitjbtJGQ2oacdVWkeUreMvVB9gAfQc/
- Use the `key` and `path` from above in the fields
- Or copy-paste the web slug into the URL.
