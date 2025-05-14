const fp = require('fastify-plugin');
const jwt = require('jsonwebtoken');

module.exports = fp(async (fastify, opts) => {
    const { JWT_SECRET } = process.env;

    // Middleware to authenticate JWT token
    fastify.decorate('authenticate', async (request, reply) => {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                return reply.status(401).send({ error: 'Token not provided' });
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            request.user = decoded;
            return undefined;
        } catch (err) {
            return reply.status(401).send({ error: 'Invalid token' });
        }
    });
});
