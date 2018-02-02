package main

import (
  "os"
  "fmt"
  "flag"
  "errors"
  "strings"

  mb "github.com/multiformats/go-multibase"
  ipfssenc "github.com/jbenet/ipfs-senc"
  senc "github.com/jbenet/go-simple-encrypt"
)

// flags
var (
  Key string
  API string
  RandomKey bool
)

// errors
var (
  ErrNoIPFS = errors.New("ipfs node error: not online")
)

var Usage = `ENCRYPT AND SEND
    # will ask for a key
    ipfs-senc share <local-source-path>

    # encrypt with a known key. (256 bits please)
    ipfs-senc --key <secret-key> share <local-source-path>

    # encrypt with a randomly generated key. will be printed out.
    ipfs-senc --random-key share <local-source-path>


GET AND DECRYPT
    # will ask for key
    ipfs-senc download <ipfs-link> <local-destination-path>

    # decrypt with given key.
    ipfs-senc --key <secret-key> download <ipfs-link> <local-destination-path>

OPTIONS
    --h, --help              show usage
    --random-key             generate a random key to use
    --key <secret-key>       a 256bit secret key, encoded with multibase
    --api <ipfs-api-url>     an ipfs node api to use (overrides defaults)

EXAMPLES
    > ipfs-senc share my_secret_dir
    Enter a 256 bit AES key in multibase:
`

func init() {
  flag.BoolVar(&RandomKey, "random-key", false, "use a randomly generated key")
  flag.StringVar(&Key, "key", "", "an AES encryption key in hex")
  flag.StringVar(&API, "api", "", "override IPFS node API")
  flag.Usage = func() {
    fmt.Fprintf(os.Stderr, Usage)
  }
}

func decodeKey(k string) ([]byte, error) {
  _, b, err := mb.Decode(k)
  if err != nil {
    return nil, fmt.Errorf("multibase decoding error: %v", err)
  }
  if len(b) != 32 {
    return nil, fmt.Errorf("key must be exactly 256 bits. Was: %d", len(b))
  }
  return b, nil
}

func getSencKey() (ipfssenc.Key, error) {
  NilKey := ipfssenc.Key(nil)

  var k []byte
  var err error
  if Key != "" {
    k, err = decodeKey(Key)
  } else if RandomKey {
    k, err = senc.RandomKey()
  } else {
    err = errors.New("Please enter a key with --key or use --random-key")
  }
  if err != nil {
    return NilKey, err
  }

  return ipfssenc.Key(k), nil
}

func cmdDownload(args []string) error {
  if RandomKey {
    return errors.New("cannot use --random-key with download")
  }
  if len(args) < 2 {
    return errors.New("not enough arguments. download requires 2. see -h")
  }

  srcLink := ipfssenc.IPFSLink(args[0])
  if len(srcLink) < 1 {
    return errors.New("invalid ipfs-link")
  }

  dstPath := args[1]
  if dstPath == "" {
    return errors.New("requires a destination path")
  }

  // check for Key, get key.
  key, err := getSencKey()
  if err != nil {
    return err
  }

  fmt.Println("Initializing ipfs node...")
  n := ipfssenc.GetROIPFSNode(API)
  if !n.IsUp() {
    return ErrNoIPFS
  }

  fmt.Println("Getting", srcLink, "...")
  err = ipfssenc.GetDecryptAndUnbundle(n, srcLink, dstPath, key)
  if err != nil {
    return err
  }
  fmt.Println("Unbundled to:", dstPath)
  return nil
}

func cmdShare(args []string) error {
  if len(args) < 1 {
    return errors.New("not enough arguments. share requires 1. see -h")
  }
  srcPath := args[0]
  if srcPath == "" {
    return errors.New("requires a source path")
  }

  // check for Key, get key.
  key, err := getSencKey()
  if err != nil {
    return err
  }

  fmt.Println("Initializing ipfs node...")
  n, err := ipfssenc.GetRWIPFSNode(API)
  if err != nil {
    return err
  }
  if !n.IsUp() {
    return ErrNoIPFS
  }

  fmt.Println("Sharing", srcPath, "...")
  link, err := ipfssenc.BundleEncryptAndPut(n, srcPath, key)
  if err != nil {
    return err
  }

  l := string(link)
  if !strings.HasPrefix(l, "/ipfs/") {
    l = "/ipfs/" + l
  }

  keyStr, err := mb.Encode(mb.Base58BTC, key)
  if err != nil {
    return err
  }

  fmt.Println("Shared as: ", l)
  fmt.Println("Ciphertext on local gateway: ", l)
  fmt.Println("Ciphertext on global gateway: ", l)
  fmt.Println("Get, Decrypt, and Unbundle with:")
  fmt.Println("    ipfs-senc --key", keyStr, "download", l, "dstPath")
  return nil
}

func errMain(args []string) error {
  // no command is not an error. it's usage.
  if len(args) == 0 {
    fmt.Println(Usage)
    return nil
  }

  cmd := args[0]
  switch cmd {
  case "download":
    return cmdDownload(args[1:])
  case "share":
    return cmdShare(args[1:])
  default:
    return errors.New("Unknown command: " + cmd)
  }
}

func main() {
  flag.Parse()
  args := flag.Args()
  if err := errMain(args); err != nil {
    fmt.Fprintln(os.Stderr, "error:", err)
    os.Exit(-1)
  }
}
