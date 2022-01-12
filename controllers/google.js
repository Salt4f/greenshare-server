const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
// TODO: implement services for google requests
const {
    registerService,
    loginService,
} = require('../services/auth');
const { StatusCodes } = require('http-status-codes');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const name = payload['name'];
  const email = payload['email'];
  return {
      name: name,
      email: email
  };
}

let pendingGoogleSignins = [];

const login = async (req, res, next) => {
    logger.log('Received Google login request', 1);
    try {
        let token = req.query.token;
        if (token == undefined) {
            logger.log(`Received login request with no token in query`, 0);
            return;
        }
        let loginHTML = fs.readFileSync(path.resolve(__dirname, './html/googleLogin.html')).toString();
        loginHTML = loginHTML.replace('[BASEURL]', process.env.LOGIN_BASE_URL);
        loginHTML = loginHTML.replace('[UNIQUETOKEN]', token);
        res.send(loginHTML);
        return;
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
}

const loginPost = async (req, res, next) => {
    logger.log('Received Google login post', 1);
    try {
        let body = req.body;
        let token = req.query.token;
        if (token == undefined) {
            logger.log(`Received login post request with no token in query`, 0);
            return;
        }
        else {
            logger.log('Received unique token', 1);
        }
        let clientId = body?.clientId;
        if (clientId == undefined){
            logger.log(`No clientId in loginPost request`, 0);
            return;
        }
        let credential = body?.credential;
        if (credential == undefined){
            logger.log(`No credential in loginPost request`, 0);
            return;
        }
        logger.log(`Successfully received JWT`, 1);
        let userdata = await verify(credential);
        logger.log(`Got data from JWT: email: ${userdata.email} name: ${userdata.name}`, 1);
        logger.log(`Logging in with Google data...`, 1);
        try {
            const credentials = await loginService({
                email: userdata.email,
                password: 'googlepassword'
            });
            if (credentials.id != undefined && credentials.token != undefined) {
                logger.log(`Successfully logged in with Google data`, 1);
                pendingGoogleSignins[token] = {
                    id: credentials.id,
                    token: credentials.token,
                    newUser: false
                };
                res.sendFile('/html/welcome.html', {root: __dirname});
                return;
            }
        } catch (e) {
            logger.log(`Couldn't login with google data. Trying to register account...`, 1);

            const register = await registerService({
                email: userdata.email,
                password: 'googlepassword',
                nickname: userdata.email.split('@')[0],
                dni: '92200087X',
                birthDate: '2000-11-06T00:00:00Z',
                fullName: userdata.name
            });
            if (register.id != undefined && register.token != undefined) {
                logger.log(`Successfully registered account with Google data`, 1);
                pendingGoogleSignins[token] = {
                    id: register.id,
                    token: register.token,
                    newUser: true
                };
                res.sendFile('/html/welcome.html', {root: __dirname});
                return;
            } 
        }
        
        logger.log(`Couldn't register nor login account with google data`, 0);
        res.sendFile('/html/notwelcome.html', {root: __dirname});

        
    } catch (error) {
        logger.log(error.message, 0);
        res.sendFile('/html/error.html', {root: __dirname});
    }
}

const loginStatus = async (req, res, next) => {
    logger.log('Received loginStatus request', 1);
    try {
        let token = req.query.token;
        if (token == undefined) {
            logger.log(`Received login post request with no token in query`, 0);
            return;
        }
        if (pendingGoogleSignins[token] == undefined) {
            res.status(StatusCodes.BAD_REQUEST).send({
                status: `token doesn't match a successful login`
            });
            return;
        }

        res.send({
            id: pendingGoogleSignins[token].id,
            token: pendingGoogleSignins[token].token,
            newUser: pendingGoogleSignins[token].newUser,
        })
        
    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
}

const callback = async (req, res, next) => {
    logger.log('Received Google callback request', 1);
    try {

    } catch (error) {
        logger.log(error.message, 0);
        next(error);
    }
}

module.exports = {
    login,
    loginPost,
    loginStatus,
    callback,
};
