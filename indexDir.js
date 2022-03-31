import fs from 'fs/promises';
import path from 'path';
import { properties } from './constants.js';

// Recursively searches dir and adds all files found to tree
const indexDir = async (tree, dirPath, verbose) => {
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
                [properties.CONTENT_TYPE]: contentType,
                [properties.FILE_NAME]: path.basename(fullPath, contentType),
                [properties.FILE_SIZE]: stats.size,
                [properties.LOCATION]: dirPath,
            });
            if (verbose) {
                console.log(`Added ${fullPath} to index`);
            }
        } else if (dirent.isDirectory()) {
            await indexDir(tree, fullPath, verbose);
        }
    }
};

export default indexDir;
