import date from 'human-date';
import { writeFileSync, mkdirSync } from 'fs';
import { queryLogBuilder } from './query-log-builder';
import { createReadStream } from "fs";
import csv from 'csv-parser';

const sanitizeFilename = (name: string) =>
    name
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-') // replace characters illegal on Windows/most filesystems
        .replace(/\s+/g, ' ') // collapse multiple spaces
        .trim();
        
export const writeLogFilesAndFlush = (type: 'down' | 'up') => {

    const prettyDate = date.prettyPrint(new Date(), { showTime: true });
    const safePrettyDate = sanitizeFilename(prettyDate);


    // UTILITY: ensure the output directory exists
    mkdirSync('sql', { recursive: true });
    const upFileName = `sql/${Date.now()}-[${safePrettyDate}]-${type}.sql`;
    const queries = queryLogBuilder.getQuery();
    writeFileSync(upFileName, queries);
    console.log(`Wrote migration to ${upFileName}`);
    queryLogBuilder.clear();
}

export const getCSVContents = async <T>(filePath: string): Promise<Array<T>> => {
    return new Promise((resolve, reject) => {
        const results: Array<T> = [];
        createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}