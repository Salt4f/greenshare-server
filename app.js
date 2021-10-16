const express = require('express');
const app = express();

const auth = require('./routes/auth.js');
const notFoundMiddleware = require('./middlewares/not-found');
const authenticateUser = require('./middlewares/authentication');

// Middlewares
app.use(express.json());
//app.use(notFoundMiddleware);
//app.use(errorHandlerMiddleware);

// Routes
app.use('/api/auth', auth);
// example of auth middleware:  app.use('/api/posts/', authenticateUser, jobsRouter);

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
