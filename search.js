import inquirer from 'inquirer';
import path from 'path';
import { properties } from './constants.js';

// Prompts user for search terms, then grabs data from the tree
const search = async (tree) => {
    const { searchType, query } = await inquirer.prompt([
        {
            type: 'list',
            name: 'searchType',
            message: 'Lookup files by:',
            choices: [
                { name: 'Name', value: properties.FILE_NAME },
                { name: 'Size', value: properties.FILE_SIZE },
                { name: 'Content Type', value: properties.CONTENT_TYPE },
            ],
        },
        {
            type: 'input',
            name: 'query',
            message: 'Enter a file name:',
            when: ({ searchType }) => searchType === properties.FILE_NAME,
        },
        {
            type: 'number',
            name: 'query',
            message: 'Enter a size:',
            when: ({ searchType }) => searchType === properties.FILE_SIZE,
        },
        {
            type: 'input',
            name: 'query',
            message: 'Enter a file type:',
            when: ({ searchType }) => searchType === properties.CONTENT_TYPE,
        },
    ]);

    const results = await tree.findDocuments({ [searchType]: query });

    for (const { location, fileName, contentType, fileSize } of results) {
        console.log(`File: ${path.join(location, fileName + contentType)} \t Size: ${fileSize}B`);
    }

    if (results.length === 0) {
        console.log('Sorry, no files matching your query were found.');
    }
};

export default search;
