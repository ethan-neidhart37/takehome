#!/usr/bin/env node

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

// TODO: Implement search
const search = async () => {
	log(tree.toJSON());

	const sample = await tree.findDocuments({ fileName: 'sample' });
	log(sample);
	const forest = await tree.findDocuments({ fileName: 'random-forest' });
	log(forest);
	const rgrssn = await tree.findDocuments({ fileName: 'linear-regression-plot' });
	log(rgrssn);
	const user1 = await tree.findDocuments({ fileName: 'user1' });
	log(user1);
	const user2 = await tree.findDocuments({ fileName: 'user2' });
	log(user2);

	process.exit(0);
};

tree.on('ready', main);

