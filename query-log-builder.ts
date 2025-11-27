let query = '';

export const queryLogBuilder ={
        add: (part: string) => {
            query += part + '\n';
        },
        getQuery: () => `BEGIN;\n${query}\nCOMMIT;`,
        clear: () => { query = ''; }
}