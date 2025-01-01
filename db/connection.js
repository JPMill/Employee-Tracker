const { Client } = require('pg');

const db = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres', 
  password: 'milly', 
  database: 'employee_db', 
});

db.connect()
  .then(() => console.log('Connected to the employee_db database.'))
  .catch((err) => console.error('Connection error', err.stack));

module.exports = db;