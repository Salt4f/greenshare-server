const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: "mariadb",
    user: "user",
    password: "p4ssw0rd",
    database: "greenshare",
    connectionLimit: 5,
});

module.exports = pool;