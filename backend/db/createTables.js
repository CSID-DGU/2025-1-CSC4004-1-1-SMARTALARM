const tables = require('./tables');
const knex = require('./knex');

module.exports = async () => {
    const tableNames = Object.keys(tables);

    // eslint-disable-next-line no-restricted-syntax, no-await-in-loop
    for (const name of tableNames) {
        // eslint-disable-next-line no-await-in-loop
        if (!(await knex.schema.hasTable(name))) {
            // eslint-disable-next-line no-await-in-loop
            await knex.schema.createTable(name, tables[name]);
        }
    }
};
