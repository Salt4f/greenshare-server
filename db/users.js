var pool = require('./connect');

const logger = require('../utils/logger');

const createUser = async (id, email, nickname) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const res = await conn.query(
            `INSERT INTO Users(id, email, nickname) VALUES (?, ?, ?)`,
            [id, email, nickname]
        );
        logger.log(`Successfully created user: ${res}`, 1);
    } catch (e) {
        logger.log(e.message, 0);

        throw new Error(e);
    } finally {
        logger.log('Ending db connection', 1);
        if (conn) conn.end();
    }
};

module.exports = {
    createUser,
};
