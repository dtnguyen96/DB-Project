// CREATE TABLE todo(
//   todo_id SERIAL PRIMARY KEY,
//   description VARCHAR(255)  
// );
// only two attributes in the table: todo_id and description
const Pool = require('pg').Pool;

const pool = new Pool({
  host: 'code.cs.uh.edu',
  user:
  password:
  port:
  database:
});

module.exports = pool;
