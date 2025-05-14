require('dotenv').config();

const fastify = require('fastify')({ logger: true });
const fastifyCORS = require('@fastify/cors');

const config = require('./config');
const db = require('./db');

const authPlugin = require('./scripts/authenticate');

const users = require('./routes/users');

// Run the server!
const start = async () => {
    // Create DB tables
    await db.createTables();

    // Import plugins
    fastify.register(fastifyCORS);
    fastify.register(authPlugin);

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
