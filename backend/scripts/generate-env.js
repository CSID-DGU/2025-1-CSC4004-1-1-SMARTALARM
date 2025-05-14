/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENV_PATH = path.join(__dirname, '.env');

let env = '';
if (fs.existsSync(ENV_PATH)) {
    env = fs.readFileSync(ENV_PATH, 'utf-8');
}

const envLines = env.split('\n');
const envMap = Object.fromEntries(
    envLines
        .filter((line) => line.trim() && !line.startsWith('#'))
        .map((line) => {
            const [key, value] = line.split('=');
            return [key.trim(), value.trim()];
        })
);

if (!envMap.JWT_SECRET) {
    const secret = crypto.randomBytes(32).toString('hex');
    envMap.JWT_SECRET = secret;

    console.log(`JWT_SECRET generated and added to ${ENV_PATH}`);
    const envContent = Object.entries(envMap)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    fs.writeFileSync(ENV_PATH, envContent);
} else {
    console.log(`JWT_SECRET already exists in ${ENV_PATH}`);
}
