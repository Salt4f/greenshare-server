var pool;

const createUser = async (id, email, nickname) => {
    if (pool === undefined) {
        console.log('first query');
        pool = await require('./connect');
    }

    return pool.getConnection()
        .then(conn => {
            return conn.query(`INSERT INTO Users(id, email, nickname) VALUES (?, ?, ?)`, [id, email, nickname]);
        })
        .then(res => {
            console.log(`Successfully created user: ${res}`);
        });
}

module.exports = {
    createUser
};