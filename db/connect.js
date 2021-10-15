const mariadb = require('mariadb');

// ask raul about the connection variables
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    connectionLimit: 2,
});

// async function asyncFunction() {
//     let conn;
//     try {
//         conn = await pool.getConnection();
//         const rows = await conn.query('SELECT 1 as val');
//         console.log(rows); //[ {val: 1}, meta: ... ]
//         const res = await conn.query('INSERT INTO myTable value (?, ?)', [
//             1,
//             'mariadb',
//         ]);
//         console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
//     } catch (err) {
//         throw err;
//     } finally {
//         if (conn) return conn.end();
//     }
// }

// connect and check for errors
pool.getConnection((err, conn) => {
    try {
        return connection.release();
    } catch (err) {
        throw err;
    }
});

module.exports = pool;
