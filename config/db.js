const Pool = require('pg').Pool;

const dbPool = new Pool({
    user: "postgres",
    password: "root",
    host: "localhost",
    port: 5432,
    database: "postgres"
});

module.exports = dbPool;