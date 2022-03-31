#!/usr/bin/env node

import fs from 'fs/promises';
import parseArgs from 'minimist';
import path from 'path';
import { constants as fsConstants } from 'fs';
import { SBTree } from 'sbtree';
import indexDir from './indexDir.js';
import search from './search.js';

const argv = parseArgs(process.argv.slice(2), {
	alias: {
		i: 'ignoreIndex',
		r: 'rootDir',
		v: 'verbose',
	},
	default: {
		ignoreIndex: false,
		verbose: false,
	}
});

const indexName = 'fileIndex.json';

const { ignoreIndex, rootDir, verbose } = argv;
let rootPath = path.resolve(rootDir ?? 'test_data');

let tree;
let indexExists;

// Check for existence of index file
try {
	await fs.access(indexName, fsConstants.R_OK);

	// Overwrite index when flagged to ignore or when new location is given
	indexExists = rootDir === undefined && !ignoreIndex;
} catch {
	indexExists = false;
}

// Create a tree and load index file if it exists
if (indexExists) {
	const indexedData = await fs.readFile(indexName, 'utf8');
	tree = new SBTree(JSON.parse(indexedData));
	if (verbose) {
		console.log('Index loaded.');
	}
} else {
	tree = new SBTree({ order: 100, exclude: ['location'] });
}

// Populate tree and save index file if it needs to be written
const indexAndSearch = async () => {
	if (!indexExists) {
		await indexDir(tree, rootPath, verbose);
		await fs.writeFile(indexName, JSON.stringify(tree.toJSON()));
		if (verbose) {
			console.log('Indexing complete.');
		}
	}

	await search(tree);
	process.exit(0);
}

tree.on('ready', indexAndSearch);
