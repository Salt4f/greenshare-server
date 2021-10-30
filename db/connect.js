const mariadb = require('mariadb');
require('dotenv').config();

const { Sequelize } = require('sequelize');

// const pool = mariadb.createPool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     connectionLimit: process.env.DB_CONNECTION_LIMIT,
//     acquireTimeout: process.env.DB_ACQUIRE_TIMEOUT,
// });

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        define: {
            underscored: false,
            timestamps: false,
        },
        dialectOptions: {
            options: {
                requestTimeout: process.env.DB_ACQUIRE_TIMEOUT,
            },
        },
        pool: {
            max: 15,
        },
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models / tables
db.users = require('./models/User')(sequelize, Sequelize);

sequelize.sync({ force: false });

module.exports = db;
