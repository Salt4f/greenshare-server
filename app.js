const express = require('express');
const app = express();

const auth = require('./routes/auth.js');
const posts = require('./routes/posts');
const user = require('./routes/user');

const logger = require('./utils/logger');

const notFoundMiddleware = require('./middlewares/not-found');
const errorHandlerMiddleware = require('./middlewares/error-handler');

require('dotenv').config();

// Middlewares
app.use(express.json({ limit: '200MB' }));

// Routes
app.use('/api/auth', auth);
app.use('/api/posts', posts);
app.use('/api/user', user);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 13000;

const start = async () => {
    try {
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        logger.log(e.message, 0);
    }
};

start();
