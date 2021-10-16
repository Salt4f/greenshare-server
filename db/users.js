const pool = require('./connect');

const createUser = (id, email, nickname) => {
    return pool.getConnection()
        .then(conn => {
            return conn.query(`INSERT INTO Users(id, email, nickname) VALUES (${id}, ${email}, ${nickname})`);
        })
        .then(res => {
            console.log(`Successfully created user: ${res}`);
        });
}

module.exports = { createUser };