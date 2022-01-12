const express = require('express');
const app = express();
const db = require('./db/connect');

const google = require('./routes/google.js');
const auth = require('./routes/auth.js');
const posts = require('./routes/posts');
const user = require('./routes/user');
const admin = require('./routes/admin');
const rewards = require('./routes/rewards');
const logger = require('./utils/logger');
const job = require('./utils/cron');

const {
    bannedCheck,
    authenticateAdmin,
    authenticateUser,
} = require('./middlewares/authentication');
const notFoundMiddleware = require('./middlewares/not-found');
const errorHandlerMiddleware = require('./middlewares/error-handler');

require('dotenv').config();

// Middlewares
app.use(express.json({ limit: '200MB' }));
app.use(express.urlencoded({extended: true}));

// Routes
app.use('/google', google);
app.use('/api/auth', bannedCheck, auth);
app.use('/api/posts', bannedCheck, authenticateUser, posts);
app.use('/api/user', bannedCheck, user);
app.use('/api/admin', authenticateAdmin, admin);
app.use('/api/rewards', bannedCheck, rewards);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 13000;

const start = async () => {
    try {
        app.listen(port, async () => {
            const [admin, created] = await db.users.findOrCreate({
                where: { id: process.env.ADMIN_ID },
                defaults: {
                    id: process.env.ADMIN_ID,
                    email: process.env.ADMIN_EMAIL,
                    nickname: 'admin',
                },
            });
            job.start();
            console.log(`Server is listening on port ${port}...`);
        });
    } catch (error) {
        logger.log(e.message, 0);
    }
};

start();
