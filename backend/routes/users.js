const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('../db/knex');

const config = require('../config');
const JWT_SECRET = config.jwt.secret;

module.exports = async function (fastify, opts) {
    fastify.post('/users/register', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password', 'nickname'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    nickname: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string' },
                        token: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            const { email, password, nickname } = request.body;

            // Check if the email is already registered
            const existingUser = await knex('user').where({ email }).first();
            if (existingUser) {
                return reply
                    .status(400)
                    .send({ error: 'Email already registered' });
            }

            const userId = uuidv4();
            const hashedPassword = await bcrypt.hash(password, 10);
            await knex('user').insert({
                user_id: userId,
                email,
                password: hashedPassword,
                username: nickname
            });

            // Generate JWT token
            const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

            return { userId, token };
        }
    });
};
