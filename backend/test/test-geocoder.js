/* eslint-disable no-console */

require('dotenv').config();

const Fastify = require('fastify');
const geocoderPlugin = require('../scripts/geocoder');

(async () => {
    const fastify = Fastify({ logger: true });

    fastify.register(geocoderPlugin);

    try {
        await fastify.ready();

        const address = '서울특별시 강남구 테헤란로 427';
        const result = await fastify.getCoordinates(address);

        console.log('Coordinates:', result);
    } catch (err) {
        console.error('Error during test:', err);
    } finally {
        await fastify.close();
    }
})();
