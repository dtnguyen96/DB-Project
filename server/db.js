// CREATE TABLE todo(
//   todo_id SERIAL PRIMARY KEY,
//   description VARCHAR(255)  
// );
// only two attributes in the table: todo_id and description
const Pool = require('pg').Pool;
const input = require('./password.json');

const pool = new Pool({
  host: 'code.cs.uh.edu',
  user: input.user,
  password: input.password,
  port: 5432,
  database: 'COSC3380'
});

module.exports = pool;
