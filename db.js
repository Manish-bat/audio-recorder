const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'directus',
  database: 'new_terrasharp',
  port: 5432,
});

async function saveRecording(fileName, filePath) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'INSERT INTO recordings (file_name, file_path) VALUES ($1, $2) RETURNING id',
            [fileName, filePath]
        );
        return result.rows[0].id;
    } finally {
        client.release();
    }
}

module.exports = {
    saveRecording
};