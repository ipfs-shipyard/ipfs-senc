package ipfssenc

import (
  "os"
  "io"
  "fmt"
  "strings"
  "path/filepath"
  "archive/tar"
)


// Bundle groups all the contents of a given localPath into a TarBall
func Bundle(localPath string) (bundle io.Reader, err error) {
  r, w := io.Pipe()
  go func() {
    err := TarAndZip(localPath, w)
    w.CloseWithError(err)
  }()
  return r, nil
}

// Unbundle all contents of a bundle into a localPath
func Unbundle(bundle io.Reader, localPath string) error {
  return UnzipAndUntar(localPath, bundle)
}

// from: https://medium.com/@skdomino/taring-untaring-files-in-go-6b07cf56bc07
//
// TarAndZip takes a source and variable writers and walks 'source' writing each file
// found to the tar writer; the purpose for accepting multiple writers is to allow
// for multiple outputs (for example a file, or md5 hash)
func TarAndZip(src string, writers ...io.Writer) error {

  // ensure the src actually exists before trying to tar it
  if _, err := os.Stat(src); err != nil {
    return fmt.Errorf("Unable to tar files - %v", err.Error())
  }

  mw := io.MultiWriter(writers...)

  // gzw := gzip.NewWriter(mw)
  // defer gzw.Close()

  tw := tar.NewWriter(mw)
  defer tw.Close()

  // walk path
  return filepath.Walk(src, func(file string, fi os.FileInfo, err error) error {

    // return on any error
    if err != nil {
      return err
    }

    if fi.IsDir() && fi.Name() == ".DS_Store" {
      return filepath.SkipDir
    }

    // create a new dir/file header
    header, err := tar.FileInfoHeader(fi, fi.Name())
    if err != nil {
      return err
    }

    // update the name to correctly reflect the desired destination when untaring
    trimPath := filepath.Dir(src)
    relPath := strings.TrimPrefix(file, trimPath)
    header.Name = strings.TrimPrefix(relPath, string(filepath.Separator))

    // write the header
    if err := tw.WriteHeader(header); err != nil {
      return err
    }

    // return on non-regular files (thanks to [kumo](https://medium.com/@komuw/just-like-you-did-fbdd7df829d3) for this suggested update)
    if !fi.Mode().IsRegular() {
      return nil
    }

    // open files for taring
    f, err := os.Open(file)
    defer f.Close()
    if err != nil {
      return err
    }

    // copy file data into tar writer
    if _, err := io.Copy(tw, f); err != nil {
      return err
    }

    return nil
  })
}

// UnzipAndUntar takes a destination path and a reader; a tar reader loops over the tarfile
// creating the file structure at 'dst' along the way, and writing any files
func UnzipAndUntar(dst string, r io.Reader) error {

  // gzr, err := gzip.NewReader(r)
  // defer gzr.Close()
  // if err != nil {
  //   return err
  // }

  tr := tar.NewReader(r)

  for {
    header, err := tr.Next()

    switch {

    // if no more files are found return
    case err == io.EOF:
      return nil

    // return any other error
    case err != nil:
      return err

    // if the header is nil, just skip it (not sure how this happens)
    case header == nil:
      continue
    }

    // the target location where the dir/file should be created

    target := filepath.Join(dst, header.Name)

    // the following switch could also be done using fi.Mode(), not sure if there
    // a benefit of using one vs. the other.
    // fi := header.FileInfo()

    // check the file type
    switch header.Typeflag {

    // if its a dir and it doesn't exist create it
    case tar.TypeDir:
      if _, err := os.Stat(target); err != nil {
        if err := os.MkdirAll(target, 0755); err != nil {
          return err
        }
      }

    // if it's a file create it
    case tar.TypeReg:
      f, err := os.OpenFile(target, os.O_CREATE|os.O_RDWR, os.FileMode(header.Mode))
      if err != nil {
        return err
      }
      defer f.Close()

      // copy over contents
      if _, err := io.Copy(f, tr); err != nil {
        return err
      }
    }
  }
}
