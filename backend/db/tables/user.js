// user table schema

/*
    user_id: string(UUID), primary key
    email: string, use for login, unique
    username: string
    password: string, hashed password (bcrypt)
    preferred_margin: integer, default 0, margin for arrival time
*/

module.exports = (table) => {
    table.string('user_id').primary();
    table.string('email').notNullable().unique();
    table.string('username').notNullable();
    table.string('password').notNullable();
    table.integer('preferred_margin').defaultTo(0);
};
