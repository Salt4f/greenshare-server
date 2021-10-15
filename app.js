const express = require('express');
const app = express();

// Middlewares
app.use(express.json());
//app.use(notFoundMiddleware);
//app.use(errorHandlerMiddleware);

// Routers
const auth = require('./routes/auth.js');

// Routes
app.use('/api/auth', auth);

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        //await connectDB(process.env.MONGO_URI);
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
