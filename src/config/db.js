import mysql from "serverless-mysql";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create MySQL connection pool
export const pool = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    //port: process.env.MYSQL_PORT,
  },
});

export async function query(q, values) {
  const results = await pool.query(q, values);
  await pool.end();
  return results;
}

// Test the connection
pool.query('SELECT 1')
  .then(() => {
    console.log('Connected to MySQL server');
  })
  .catch(error => {
    console.error('Error connecting to MySQL:', error);
    process.exit(1); // Exit the process with an error code
  });
