const express = require('express');
const app = express();

const auth = require('./routes/auth.js');
const authenticateUser = require('./middlewares/authentication');

// Middlewares
app.use(express.json());

// Routes
app.use('/api/auth', auth);
//app.use('/api/posts/', authenticateUser, jobsRouter);

const port = process.env.PORT || 13000;

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
