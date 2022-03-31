# Take Home Project

Challenge: A directory contains multiple files and directories of non-uniform file and directory names. Create a program that traverses a base directory and creates an index file that can be used to quickly lookup files by name, size, and content type.

# Usage

This application uses [SBTree](https://www.npmjs.com/package/sbtree) to index a directory using B+
trees. The index is saved to `fileIndex.json` at the project's root directory, and is loaded from
there on subsequent uses unless otherwise specified.

After the index is created or loaded, the application prompts the user on whether they are searching
by file name, content type, or file size in bytes, and then asks for a search term. Finally, each
file matching the search term is displayed with the full filepath and size in bytes, or a message is
instead shown if no files could be found.

This application was developed on Linux Mint `20.1 Ulyssa` running Node `16.14.2`.

## Installation

```bash
git clone git@github.com:ethan-neidhart37/takehome.git && cd ./takehome
npm i
```

## Running

**Node v12 or greater must be installed in order for this application to run properly.**

```bash
./app.js [--verbose] [--rootDir <dir>] [--ignoreIndex]
```

### Options

* `--verbose`, `-v`: Enables additional logging output when creating the index file.
  * default: `false`
* `--rootDir`, `-r`: The directory to index. Can be relative or absolute.
  * When no value is provided and no index file exists, uses `test_data` by default.
  * When no value is provided but an index file does exist, the index file is instead loaded to use for searching.
  * When any value is provided, a new index file is always created.
* `--ignoreIndex, -i`: Ensures a new index file is always created.
  * default: `false`
