var pool = require('./connect');

const createUser = async (id, email, nickname) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const res = await conn.query(
            `INSERT INTO Users(id, email, nickname) VALUES (?, ?, ?)`,
            [id, email, nickname]
        );
        console.log(`Successfully created user: ${res}`);
    } catch (e) {
        throw new Error(e);
    } finally {
        if (conn) conn.end();
    }
};

module.exports = {
    createUser,
};
