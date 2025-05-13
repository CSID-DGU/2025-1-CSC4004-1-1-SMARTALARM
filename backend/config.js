module.exports = {
    app: {
        port: 4568
    },
    database: {
        client: 'better-sqlite3',
        connection: {
            filename: './dev.sqlite'
        },
        useNullAsDefault: true
    },
    jwt: {
        secret: process.env.JWT_SECRET
    }
};
