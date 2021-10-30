var pool = require('../connect');
const logger = require('../../utils/logger');

const { Sequelize, DataTypes } = require('sequelize');

// const createUser = async (id, email, nickname) => {
//     let conn;
//     try {
//         conn = await pool.getConnection();
//         const res = await conn.query(
//             `INSERT INTO Users(id, email, nickname) VALUES (?, ?, ?)`,
//             [id, email, nickname]
//         );
//         logger.log(`Successfully created user: ${res}`, 1);
//     } catch (e) {
//         // logger.log(e.message, 0);

//         throw new Error(e);
//     } finally {
//         logger.log('Ending db connection', 1);
//         if (conn) conn.end();
//     }
// };

const User = Sequelize.define(
    'Users',
    {
        // Model attributes are defined here
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dni: {
            type: DataTypes.DATEONLY,
        },
        birthDate: {
            type: DataTypes.STRING,
        },
        fullName: {
            type: DataTypes.STRING,
        },
        profilePicture: {
            type: DataTypes.BLOB,
        },
        aboutMe: {
            type: DataTypes.STRING,
        },
        banned: {
            type: DataTypes.BOOLEAN,
        },
    },
    {
        // Other model options go here
    }
);

module.exports = {
    User,
};
