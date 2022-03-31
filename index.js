#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { SBTree } from 'sbtree';

// TODO: read these from input
const verbose = true;
const rootPath = 'test_data';

const tree = new SBTree({ order: 3, exclude: ['location'] });

// TODO: remove this when done
const log = obj => {
	console.dir(obj, { depth: null });
}

const main = async () => {
	// Create index file if none exists
	if (tree.size === 0) {
		await indexDir(path.resolve(rootPath));
		await fs.writeFile('fileIndex.json', JSON.stringify(tree.toJSON()));
		console.log('Indexing complete.');
	}

	await search();
	process.exit(0);
};

// Recursively searches dir and adds all files found to tree
const indexDir = async (dirPath) => {
	const dir = await fs.opendir(dirPath);
	if (verbose) {
		console.log(`Opened ${dirPath}`);
	}

	for await (const dirent of dir) {
		const fullPath = path.join(dirPath, dirent.name);

		if (dirent.isFile()) {
			const stats = await fs.stat(fullPath);
			const contentType = path.extname(fullPath);

			// TODO: Insert multiple at once
			await tree.insertDocuments({
				contentType,
				fileName: path.basename(fullPath, contentType),
				fileSize: stats.size,
				location: dirPath,
			});
			if (verbose) {
				console.log(`Added ${fullPath} to index`);
			}
		} else if (dirent.isDirectory()) {
			await indexDir(fullPath);
		}
	}
};

// Prompts user for search terms, then grabs data from the tree
const search = async () => {
	const { searchType } = await inquirer.prompt([
		{
			type: 'list',
			name: 'searchType',
			message: 'Lookup files by:',
			choices: [
				{ name: 'Name', value: 'fileName' },
				{ name: 'Size', value: 'size' },
				{ name: 'Content Type', value: 'contentType' },
			],
		}
	]);

	const { query } = await inquirer.prompt([
		{
			type: 'input',
			name: 'query',
			message: 'Enter your search term:'
		}
	]);

	const results = await tree.findDocuments({ [searchType]: query });

	for (const { location, fileName, contentType, fileSize } of results) {
		console.log(`File: ${path.join(location, fileName + contentType)} \t Size: ${fileSize}B`);
	}
};

tree.on('ready', main);

