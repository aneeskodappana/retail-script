import date from 'human-date';
import { writeFileSync, mkdirSync } from 'fs';
import { queryLogBuilder } from './query-log-builder';

const sanitizeFilename = (name: string) =>
    name
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-') // replace characters illegal on Windows/most filesystems
        .replace(/\s+/g, ' ') // collapse multiple spaces
        .trim();
        
export const writeLogFiles = () => {

    const prettyDate = date.prettyPrint(new Date(), { showTime: true });
    const safePrettyDate = sanitizeFilename(prettyDate);


    // UTILITY: ensure the output directory exists
    mkdirSync('sql', { recursive: true });
    const upFileName = `sql/${Date.now()}-[${safePrettyDate}]-up.sql`;
    const downFileName = `sql/${Date.now()}-[${safePrettyDate}]-down.sql`;
    const upQueries = queryLogBuilder.getQuery();
    // const transactionalDownSql = `BEGIN;\n${downRawSql}\nCOMMIT;`;
    writeFileSync(upFileName, upQueries);
    queryLogBuilder.clear();
    console.log(`Wrote UP migration to ${upFileName}`);
    // writeFileSync(downFileName, transactionalDownSql);
    console.log(`Wrote DOWN migration to ${downFileName}`);
}