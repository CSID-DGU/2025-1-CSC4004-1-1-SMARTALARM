require('dotenv').config();

const fastify = require('fastify')({ logger: true });
const fastifyCORS = require('@fastify/cors');

const config = require('./config');
const createTables = require('./db/createTables');
// const knex = require('knex');

const users = require('./routes/users');

// eslint-disable-next-line import/no-extraneous-dependencies

// Run the server!
const start = async () => {
    // Create DB tables
    await createTables();

    // Import plugins
    fastify.register(fastifyCORS);

    // default route for health check
    fastify.get('/', async () => ({ status: 'ok' }));

    // register routes
    // ex) fastify.register(require('./routes/schedule'));
    //     fastify.register(require('./routes/user'));
    fastify.register(users, { prefix: '/api' });

    // Start the server
    try {
        await fastify.listen({
            port: config.app.port,
            host: '0.0.0.0'
        });
        fastify.log.info(`Server listening on port ${config.app.port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
