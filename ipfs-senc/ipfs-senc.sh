#!/bin/sh

set -e

localAPI=http://localhost:4001
localGWY=http://localhost:8080
globalGWY=https://ipfs.io

usage() {
  echo "USAGE"
  echo "    Share:"
  echo "        $0 --key <key> share <local-path>"
  echo "    Download:"
  echo "        $0 --key <key> download <ipfs-link> <local-path>"
  exit 0
}

die() {
  echo "error: $@"
  exit 1
}

cmd_share() {
  key=$1
  path=$2

  d=$(date +"%Y-%m-%dT%H:%M:%SZ")
  tmp1=$(mktemp "/tmp/ipfs-senc-sh.$date.XXXXXX.tar")
  tmp2=$(mktemp "/tmp/ipfs-senc-sh.$date.XXXXXX.senc")

  echo "Sharing $path ..."
  tar -czf "$tmp1" "$path"
  senc -e -k "$key" <"$tmp1" >"$tmp2"
  hash=(ipfs add -q "$tmp2")
  ilink="/ipfs/$hash"

  rm "$tmp1"
  rm "$tmp2"

  echo "Shared as: $ilink"
  echo "Ciphertext on local gateway: $localGWY/$ilink"
  echo "Ciphertext on global gateway: $globalGWY/$ilink"
  echo "Get, Decrypt, and Unbundle with:"
  echo "    ipfs-senc.sh --key $key download $ilink $path"
}

cmd_download() {
  key=$1
  ilink=$2
  path=$3

  d=$(date +"%Y-%m-%dT%H:%M:%SZ")
  tmp1=$(mktemp "/tmp/ipfs-senc-sh.$d.XXXXXX.tar")
  tmp2=$(mktemp "/tmp/ipfs-senc-sh.$d.XXXXXX.senc")

  echo "Getting $ilink ..."
  ipfs cat "$ilink" >"$tmp2"
  senc -d -k "$key" <"$tmp2" >"$tmp1"
  mkdir -p "$path"
  tar -xzf "$tmp1" -C "$path"
  echo "Unbundled into: $path"
}

checkIpfs() {
  ipfs swarm addrs local >/dev/null || die "ipfs node offline"
}

# ---- main ----

if [ $# -eq 0 ]; then
  usage
elif [ "$1" = "-h" ]; then
  usage
elif [ $# -gt 4 ]; then

  key=$1
  cmd=$3
  if [ "$1" != "--key" ]; then
    die "must have --key flag"
  fi

  checkIpfs

  case "$cmd" in
  share) cmd_share $2 $4 ;;
  download) cmd_download $2 $4 $5 ;;
  esac
else
  die "wrong number of arguments"
fi
