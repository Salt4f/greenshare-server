require('dotenv').config();

const { Sequelize } = require('sequelize');

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

// Connect all the models/tables in the database to a db object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models / tables
db.users = require('./models/User')(sequelize, Sequelize);
db.offers = require('./models/Offer')(sequelize, Sequelize);
db.requests = require('./models/Request')(sequelize, Sequelize);

// Relations
db.offers.belongsTo(db.users);
db.requests.belongsTo(db.users);
db.users.hasMany(db.offers);
db.users.hasMany(db.requests);

// Sync with the db
sequelize.sync({ force: false });

module.exports = db;
