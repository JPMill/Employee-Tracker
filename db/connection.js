const { Client } = require('pg');

// Create a new PostgreSQL client
const db = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres', // Replace with your PostgreSQL username
  password: 'milly', // Replace with your PostgreSQL password
  database: 'employee_db', // Replace with your database name
});

// Connect to the database
db.connect()
  .then(() => console.log('Connected to the employee_db database.'))
  .catch((err) => console.error('Connection error', err.stack));

module.exports = db;