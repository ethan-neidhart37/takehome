#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { constants as fsConstants } from 'fs';
import { SBTree } from 'sbtree';
import indexDir from './indexDir.js';
import search from './search.js';

const indexName = 'fileIndex.json';

// TODO: read these from input
const verbose = true;
const rootPath = path.resolve('test_data');

let tree;
let indexExists;

// Check for existence of index file
try {
	await fs.access(indexName, fsConstants.R_OK);
	indexExists = true;
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
	tree = new SBTree({ order: 3, exclude: ['location'] });
}

// Populate tree and save index file if it doesn't exist
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
