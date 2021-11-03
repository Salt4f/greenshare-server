const { StatusCodes } = require('http-status-codes');
const {
    BadRequestError,
    UnauthenticatedError,
    InternalServerError,
} = require('../errors');

const db = require('../db/connect');
const validate = require('../utils/data-validation');
const logger = require('../utils/logger');
const { inspect } = require('util');

const createOffer = async (req, res) => {
    res.send('offer created');
};

const createRequest = async (req, res) => {
    res.send('request created');
};

const editRequest = async (req, res) => {
    res.send('request edited');
};

const editOffer = async (req, res) => {
    res.send('offer edited');
};

const editOffer = async (req, res) => {
    res.send('offer edited');
};

const getOfferById = async (req, res) => {
    res.send('offer');
};

const getRequestById = async (req, res) => {
    res.send('request');
};

const getOfferByQuery = async (req, res) => {
    res.send('offers');
};

const getRequestByQuery = async (req, res) => {
    res.send('requests');
};

module.exports = {
    createOffer,
    createRequest,
    editRequest,
    editOffer,
    getOfferById,
    getRequestById,
    getOfferByQuery,
    getRequestByQuery,
};
