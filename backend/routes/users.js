const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('../db/knex');

const config = require('../config');

const JWT_SECRET = config.jwt.secret;

module.exports = async (fastify, opts) => {
    // POST /api/users/register
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

    // POST /api/users/login
    fastify.post('/users/login', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 }
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
            const { email, password } = request.body;

            // Check if the user exists
            const user = await knex('user').where({ email }).first();
            if (!user) {
                return reply
                    .status(401)
                    .send({ error: 'Invalid email or password' });
            }

            // Check if the password is correct
            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            );
            if (!isPasswordValid) {
                return reply
                    .status(401)
                    .send({ error: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, {
                expiresIn: '1h'
            });

            return { userId: user.user_id, token };
        }
    });

    // GET /api/users/me
    // To be implemented: defaultHome and defaultWork
    fastify.get('/users/me', {
        preValidation: [fastify.authenticate],
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        nickname: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            const { userId } = request.user;

            // Get the user information
            const user = await knex('user').where({ user_id: userId }).first();
            if (!user) {
                return reply.status(404).send({ error: 'User not found' });
            }

            return {
                userId: user.user_id,
                email: user.email,
                nickname: user.username
            };
        }
    });

    // PUT /api/users/me
    // WIP
    fastify.put('/users/me', {
        preValidation: [fastify.authenticate],
        schema: {
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    nickname: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        nickname: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            const { userId } = request.user;
            const { email, nickname } = request.body;

            // Update the user information
            await knex('user')
                .where({ user_id: userId })
                .update({ email, username: nickname });

            return {
                status: 'updated'
            };
        }
    });

    // DELETE /api/users/me
    // WIP, now only deletes the user (not handling related data)
    // TODO: Handle related data deletion (after setup related databases)
    fastify.delete('/users/me', {
        preValidation: [fastify.authenticate],
        handler: async (request, reply) => {
            const { userId } = request.user;

            // Delete the user
            await knex('user').where({ user_id: userId }).del();

            return {
                status: 'deleted'
            };
        }
    });
};
