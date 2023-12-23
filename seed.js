import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seedData() {
    try {
        const filePath = path.join(__dirname, 'seed.json');
        const json = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(json);

        const response = await axios.post('http://localhost:3000/api/upload-backup', data);
        console.log(response.data);
    } catch (error) {
        console.error(`Error while seeding data: ${error}`);
    }
}

await seedData();
