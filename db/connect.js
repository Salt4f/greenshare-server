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
db.acceptedPosts = require('./models/AcceptedPost')(sequelize, Sequelize);
db.completedPosts = require('./models/CompletedPost')(sequelize, Sequelize);
db.tags = require('./models/Tag')(sequelize, Sequelize);
db.photos = require('./models/Photo')(sequelize, Sequelize);
db.posts = require('./models/Post')(sequelize, Sequelize);
db.reports = require('./models/Report')(sequelize, Sequelize);
db.rewards = require('./models/Reward')(sequelize, Sequelize);

// Relations
db.offers.belongsTo(db.users, { foreignKey: 'ownerId' });
db.requests.belongsTo(db.users, { foreignKey: 'ownerId' });
db.users.hasMany(db.offers, { foreignKey: 'ownerId' });
db.users.hasMany(db.requests, { foreignKey: 'ownerId' });

db.completedPosts.belongsTo(db.acceptedPosts, { foreignKey: 'acceptedPostId' });

db.tags.belongsToMany(db.offers, {
    through: 'OfferTag',
    as: 'offersUsing',
});
db.offers.belongsToMany(db.tags, {
    through: 'OfferTag',
    as: 'tags',
});
db.tags.belongsToMany(db.requests, {
    through: 'RequestTag',
    as: 'requestsUsing',
});
db.requests.belongsToMany(db.tags, {
    through: 'RequestTag',
    as: 'tags',
});

db.offers.hasMany(db.photos, { foreignKey: 'offerId' });
db.photos.belongsTo(db.offers, { foreignKey: 'offerId' });

db.offers.hasMany(db.requests, { constraints: false });
db.requests.hasMany(db.offers, { constraints: false });

// Sync with the db
sequelize.sync({ force: false });

module.exports = db;
