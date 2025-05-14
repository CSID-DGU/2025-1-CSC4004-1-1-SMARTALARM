const fp = require('fastify-plugin');
const NodeGeocoder = require('node-geocoder');

module.exports = fp(async (fastify, opts) => {
    const { API_KEY } = process.env;
    if (!API_KEY) {
        throw new Error('API_KEY is not defined in the environment variables');
    }
    const options = {
        provider: 'google',
        apiKey: API_KEY,
        formatter: null
    };
    const geocoder = NodeGeocoder(options);

    // Function to get coordinates from address
    fastify.decorate('getCoordinates', async (address) => {
        try {
            const res = await geocoder.geocode(address);
            if (res.length > 0) {
                return {
                    lat: res[0].latitude,
                    lon: res[0].longitude
                };
            }
            throw new Error('No results found');
        } catch (error) {
            throw new Error(`Geocoding error: ${error.message}`);
        }
    });
});
