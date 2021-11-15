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
const { waitForDebugger } = require('inspector');

const createOffer = async (req, res) => {
    logger.log('Received createOffer request, creating...', 1);

    // TO-DO: validar todos los campos de la req.body

    const { id, name, description, terminateAt, location, icon, photos, tags } =
        req.body;

    try {
        const offer = await db.offers.create({
            name,
            description,
            terminateAt,
            location,
            icon,
            photos,
            ownerId: id,
        });
        logger.log('Created offer, setting up tags...', 1);

        // TO-DO: comprobar si existe tag

        for (const element of tags) {
            const [tag, created] = await db.tags.findOrCreate({
                where: {
                    name: element,
                },
                defaults: {
                    name: element,
                    isOfficial: false,
                },
            });

            logger.log(
                `Current tag's id: ${tag.id}, name: ${tag.name}, isOfficial: ${tag.isOfficial}`,
                1
            );
            await offer.addTag(tag);

            logger.log(
                `Added tag with id: ${tag.id} to offer with id: ${offer.id}`,
                1
            );
        }

        logger.log('Successfully created offer, sending response...', 1);

        res.status(StatusCodes.CREATED).json({
            id: offer.id,
            createdAt: offer.createdAt,
        });
    } catch (error) {
        logger.log(error.message, 0);
    }
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

const getOfferById = async (req, res) => {
    res.send('offer');
};

const getRequestById = async (req, res) => {
    res.send('request');
};

const getOffersByQuery = async (req, res) => {
    res.send('offers');
};

const getRequestsByQuery = async (req, res) => {
    res.send('requests');
};

module.exports = {
    createOffer,
    createRequest,
    editRequest,
    editOffer,
    getOfferById,
    getRequestById,
    getOffersByQuery,
    getRequestsByQuery,
};
