const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: "localhost:80",
    user: "user",
    password: "p4ssw0rd",
    connectionLimit: 5,
})

module.exports = pool;