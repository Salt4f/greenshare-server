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
const { distanceBetweenPoints } = require('../utils/math');

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
    logger.log(`Received getOffersByQuery request`, 1);

    const { location, owner, quantity } = req.query;
    let { tags, distance } = req.query;
    let tagsArray = [];
    let whereObject = {
        active: true,
    };

    if (tags !== undefined) {
        tagsArray = tags.split(';');
    }

    if (owner !== undefined) {
        whereObject.ownerId = owner;
    }

    logger.log(
        `Query params are: location: ${location}, distance: ${distance}, tags: ${tagsArray}, owner: ${owner}, quantity: ${quantity}`,
        1
    );

    logger.log(`Selecting query...`, 1);

    const offersFinal = [];

    const offers = await db.offers.findAll({
        where: whereObject,
        attributes: ['id', 'location', 'name', 'icon', 'ownerId'],
        include: [
            {
                association: 'tags',
                model: db.tags,
                attributes: ['name', 'isOfficial'],
            },
        ],
    });

    const queryLocation = location.split(',');

    let numTags = tagsArray.length;
    for (const offer of offers) {
        let count = 0;
        for (const tag of offer.tags) {
            for (const tagQuery of tagsArray) {
                if (tagQuery == tag.name) count++;
            }
        }
        if (numTags == count) {
            const user = await db.users.findOne({
                where: { id: offer.ownerId },
                attributes: ['nickname'],
            });
            offer.dataValues.nickname = user.nickname;

            let offerLocation = offer.location.split(',');
            const dist = distanceBetweenPoints(
                parseFloat(offerLocation[0]),
                parseFloat(offerLocation[1]),
                parseFloat(queryLocation[0]),
                parseFloat(queryLocation[1])
            );

            if (distance === undefined || dist <= parseInt(distance)) {
                offer.dataValues.distance = dist;
                offersFinal.push(offer);
            }
        }
    }

    offersFinal.sort((a, b) => {
        return b.dataValues.distance - a.dataValues.distance;
    });

    let offersv3 = [];

    if (quantity !== undefined) {
        offersv3 = offersFinal.slice(0, quantity);
    } else {
        offersv3 = offersFinal;
    }

    res.status(StatusCodes.OK).json(offersv3);
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
