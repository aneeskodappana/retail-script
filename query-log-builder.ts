let upQuery = '';
let downQuery = '';

export const queryLogBuilder = {
    addUp: (part: string) => {
        upQuery += part + '\n';
    },
    addDown: (part: string) => {
        downQuery += part + '\n';
    },

    getUpQuery: () => `BEGIN;\n${upQuery}\nCOMMIT;`,
    getDownQuery: () => `BEGIN;\n${downQuery}\nCOMMIT;`,

    clearUpQuery: () => { upQuery = ''; },
    clearDownQuery: () => { downQuery = ''; }
}