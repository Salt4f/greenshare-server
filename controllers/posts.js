const { StatusCodes } = require('http-status-codes');

const db = require('../db/connect');
const validate = require('../utils/data-validation');
const logger = require('../utils/logger');
const { inspect } = require('util');
const { distanceBetweenPoints } = require('../utils/math');
const dataEncoding = require('../utils/data');
const sharp = require('sharp');

const createOffer = async (req, res) => {
    logger.log('Received createOffer request...', 1);

    const { id, name, description, terminateAt, location, icon, photos, tags } =
        req.body;

    logger.log('Starting data validation...', 1);
    const { passed, message } = validate.offer(
        id,
        name,
        description,
        terminateAt,
        location,
        icon,
        photos,
        tags
    );

    if (!passed) {
        logger.log(message, 1);
        res.status(StatusCodes.BAD_REQUEST).json({
            error: message,
        });
        return;
    }

    logger.log('Data validation passed, creating offer...', 1);

    try {
        logger.log('Parsing icon...', 1);
        const parsedIcon = dataEncoding.base64ToBuffer(icon);
        logger.log('Parsed icon', 1);

        logger.log('Compressing icon...', 1);
        let compressedIcon;
        compressedIcon = await sharp(parsedIcon);
        const { width, height } = compressedIcon.metadata();
        if (height < width) {
            compressedIcon = compressedIcon
                .resize({
                    width: height,
                    height: height,
                })
                .toFormat('jpg', { quality: 15 })
                .toBuffer();
        } else {
            compressedIcon = compressedIcon
                .resize({
                    width: width,
                    height: width,
                })
                .toFormat('jpg', { quality: 15 })
                .toBuffer();
        }
        logger.log('Compressed icon...', 1);

        logger.log('Creating offer...', 1);
        const offer = await db.offers.create({
            name,
            description,
            terminateAt,
            location,
            icon: compressedIcon,
            ownerId: id,
        });
        logger.log('Created offer, setting up photos...', 1);

        for (let photo of photos) {
            logger.log('Parsing photo...', 1);
            const parsedPhoto = dataEncoding.base64ToBuffer(photo);
            logger.log('Parsed photo', 1);
            logger.log('Compressing photo...', 1);
            const compressedPhoto = await sharp(parsedPhoto)
                .toFormat('jpg', {
                    quality: 25,
                })
                .toBuffer();
            logger.log('Compressed photo...', 1);

            await db.photos.create({
                image: compressedPhoto,
                offerId: offer.dataValues.id,
            });
        }

        logger.log('Setting up tags...', 1);
        for (const element of tags) {
            const [tag, created] = await db.tags.findOrCreate({
                where: {
                    name: element.name,
                },
                defaults: {
                    name: element.name,
                    isOfficial: false,
                    color: element.color != undefined ? element.color : null,
                },
            });

            logger.log(
                `Current tag's id: ${tag.id}, name: ${tag.name}, isOfficial: ${tag.isOfficial}, color: ${tag.color}`,
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
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const createRequest = async (req, res) => {
    logger.log('Received createRequest request...', 1);

    const { id, name, description, terminateAt, location, tags } = req.body;

    logger.log('Starting data validation...', 1);
    const { passed, message } = validate.request(
        id,
        name,
        description,
        terminateAt,
        location,
        tags
    );

    if (!passed) {
        logger.log(message, 1);
        res.status(StatusCodes.BAD_REQUEST).json({
            error: message,
        });
        return;
    }

    logger.log('Data validation passed, creating request...', 1);

    try {
        const request = await db.requests.create({
            name,
            description,
            terminateAt,
            location,
            ownerId: id,
        });
        logger.log('Created request, setting up tags...', 1);

        for (const element of tags) {
            const [tag, created] = await db.tags.findOrCreate({
                where: {
                    name: element.name,
                },
                defaults: {
                    name: element.name,
                    isOfficial: false,
                    color: element.color != undefined ? element.color : null,
                },
            });

            logger.log(
                `Current tag's id: ${tag.id}, name: ${tag.name}, isOfficial: ${tag.isOfficial}`,
                1
            );
            await request.addTag(tag);

            logger.log(
                `Added tag with id: ${tag.id} to request with id: ${request.id}`,
                1
            );
        }

        logger.log('Successfully created request, sending response...', 1);

        res.status(StatusCodes.CREATED).json({
            id: request.id,
            createdAt: request.createdAt,
        });
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const editRequest = async (req, res) => {
    logger.log('Received editRequest request, editing...', 1);

    const { id, name, description, terminateAt, location, tags } = req.body;

    const requestId = req.params.requestId;

    logger.log('Starting data validation of id and requestId...', 1);

    if (!validate.id(id)) {
        var message = `Invalid id`;
        res.status(StatusCodes.BAD_REQUEST).json({
            error: message,
        });
        return;
    }

    if (!validate.id(requestId)) {
        var message = `Invalid request Id`;
        res.status(StatusCodes.BAD_REQUEST).json({
            error: message,
        });
        return;
    }
    logger.log('Data validation of id and requestId passed, checking...', 1);

    try {
        const request = await db.requests.findOne({
            where: {
                id: requestId,
                active: true,
            },
        });

        if (request == undefined) {
            logger.log(
                `request with id: ${requestId} not found, sending response...`,
                1
            );
            var message = `Request with given id not found`;
            res.status(StatusCodes.NOT_FOUND).json({
                error: message,
            });
            return;
        }

        if (name != undefined) {
            if (validate.name(name)) {
                request.name = name;
            } else {
                var message = `Invalid name`;
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: message,
                });
                return;
            }
        }

        if (description != undefined) {
            if (validate.description(description)) {
                request.description = description;
            } else {
                var message = `Invalid description`;
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: message,
                });
                return;
            }
        }

        if (terminateAt != undefined) {
            if (validate.terminateAt(terminateAt)) {
                request.terminateAt = terminateAt;
            } else {
                var message = `Invalid terminateAt date`;
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: message,
                });
                return;
            }
        }

        if (location != undefined) {
            if (validate.location(location)) {
                request.location = location;
            } else {
                var message = `Invalid location`;
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: message,
                });
                return;
            }
        }

        if (tags != undefined) {
            if (validate.tags(tags)) var newTags = [];
            for (var newTagObject of tags) {
                const [newTag, created] = await db.tags.findOrCreate({
                    where: {
                        name: newTagObject.name,
                    },
                    defaults: {
                        name: newTagObject.name,
                        color:
                            newTagObject.color != undefined
                                ? newTagObject.color
                                : null,
                        isOfficial: false,
                    },
                });

                logger.log(
                    `Current tag's id: ${newTag.id}, name: ${newTag.name}, isOfficial: ${newTag.isOfficial}`,
                    1
                );
                newTags.push(newTag);
            }
            request.setTags(newTags);
        }

        request.save();
        res.send('Request edited');
        return;
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const editOffer = async (req, res) => {
    logger.log('Received editOffer request, editing...', 1);

    const { id, name, description, terminateAt, location, tags, icon, photos } =
        req.body;

    const offerId = req.params.offerId;

    logger.log('Starting data validation of id and offerId...', 1);

    if (!validate.id(id)) {
        var message = `Invalid id`;
        res.status(StatusCodes.BAD_REQUEST).json({
            error: message,
        });
        return;
    }

    if (!validate.id(offerId)) {
        var message = `Invalid offer Id`;
        res.status(StatusCodes.BAD_REQUEST).json({
            error: message,
        });
        return;
    }

    logger.log('Data validation of id and offerId passed...', 1);

    try {
        const offer = await db.offers.findOne({
            where: {
                id: offerId,
                active: true,
            },
        });

        if (offer == undefined) {
            logger.log(
                `offer with id: ${offerId} not found, sending response...`,
                1
            );
            var message = `Offer with given id not found`;
            res.status(StatusCodes.NOT_FOUND).json({
                error: message,
            });
            return;
        }

        if (name != undefined) {
            if (validate.name(name)) {
                offer.name = name;
            } else {
                var message = `Invalid name`;
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: message,
                });
                return;
            }
        }

        if (description != undefined) {
            if (validate.description(description)) {
                offer.description = description;
            } else {
                var message = `Invalid description`;
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: message,
                });
                return;
            }
        }

        if (terminateAt != undefined) {
            if (validate.terminateAt(terminateAt)) {
                offer.terminateAt = terminateAt;
            } else {
                var message = `Invalid terminateAt date`;
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: message,
                });
                return;
            }
        }

        if (location != undefined) {
            if (validate.location(location)) {
                offer.location = location;
            } else {
                var message = `Invalid location`;
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: message,
                });
                return;
            }
        }

        if (tags != undefined) {
            if (validate.tags(tags)) var newTags = [];
            for (var newTagObject of tags) {
                const [newTag, created] = await db.tags.findOrCreate({
                    where: {
                        name: newTagObject.name,
                    },
                    defaults: {
                        name: newTagObject.name,
                        color:
                            newTagObject.color != undefined
                                ? newTagObject.color
                                : null,
                        isOfficial: false,
                    },
                });

                logger.log(
                    `Current tag's id: ${newTag.id}, name: ${newTag.name}, isOfficial: ${newTag.isOfficial}`,
                    1
                );
                newTags.push(newTag);
            }
            offer.setTags(newTags);
        }
        if (photos != undefined) {
            if (validate.photos(photos)) {
                offer.photos = photos;
            } else {
                var message = `missing photos`;
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: message,
                });
                return;
            }
        }
        if (icon != undefined) {
            if (validate.icon(icon)) {
                logger.log('Parsing icon...', 1);
                const parsedIcon = dataEncoding.base64ToBuffer(icon);
                logger.log('Parsed icon', 1);

                logger.log('Compressing icon...', 1);
                let compressedIcon;
                compressedIcon = await sharp(parsedIcon);
                const { width, height } = compressedIcon.metadata();
                if (height < width) {
                    compressedIcon = compressedIcon
                        .resize({
                            width: height,
                            height: height,
                        })
                        .toFormat('jpg', { quality: 15 })
                        .toBuffer();
                } else {
                    compressedIcon = compressedIcon
                        .resize({
                            width: width,
                            height: width,
                        })
                        .toFormat('jpg', { quality: 15 })
                        .toBuffer();
                }
                logger.log('Compressed icon...', 1);

                offer.icon = compressedIcon;
            } else {
                var message = `missing icon`;
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: message,
                });
                return;
            }
        }

        logger.log('Updating offer...', 1);
        offer.save();
        res.send('Offer updated');
        return;
    } catch (error) {
        logger.log(error.message, 0);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Something went wrong',
        });
    }
};

const getOfferById = async (req, res) => {
    logger.log(`Received getOfferById request`, 1);

    const offerId = req.params.offerId;
    logger.log(`The offerId is: ${offerId}`, 1);

    logger.log(`Looking for offer in db...`, 1);
    const offer = await db.offers.findOne({
        where: { id: offerId },
        include: [
            {
                association: 'tags',
                model: db.tags,
                attributes: ['name', 'isOfficial', 'color'],
            },
            {
                model: db.photos,
                attributes: ['image'],
            },
        ],
    });

    if (offer == null) {
        logger.log(
            `Offer with id: ${offerId} not found, sending response...`,
            1
        );
        res.status(StatusCodes.NOT_FOUND).send();
        return;
    }
    logger.log(`Got offer with id: ${offerId}`, 1);

    const user = await db.users.findOne({
        where: { id: offer.ownerId },
        attributes: ['nickname'],
    });
    offer.dataValues.author = user.nickname;

    logger.log('Cleaning up tags...', 1);
    for (let t of offer.tags) {
        delete t.dataValues.OfferTag;
    }
    logger.log('Encoding icon to base64...', 1);
    offer.icon = dataEncoding.bufferToBase64(offer.icon);
    logger.log('Encoded icon to base64', 1);

    let photosArray = [];

    logger.log('Encoding photos to base64...', 1);
    for (let photo of offer.Photos) {
        photosArray.push(dataEncoding.bufferToBase64(photo.dataValues.image));
    }
    logger.log('Encoded photos to base64...', 1);
    console.log(offer.dataValues.photos);
    offer.dataValues.photos = photosArray;
    delete offer.dataValues.Photos;

    res.status(StatusCodes.OK).json(offer);
};

const getRequestById = async (req, res) => {
    logger.log(`Received getRequestById request`, 1);

    const requestId = req.params.requestId;
    logger.log(`The requestId is: ${requestId}`, 1);

    logger.log(`Looking for request in db...`, 1);
    const request = await db.requests.findOne({
        where: { id: requestId },
        include: [
            {
                association: 'tags',
                model: db.tags,
                attributes: ['name', 'isOfficial', 'color'],
            },
        ],
    });

    logger.log('Cleaning up tags...', 1);
    for (let t in request.tags) {
        delete t.dataValues.OfferTag;
    }

    if (request == null) {
        logger.log(
            `request with id: ${requestId} not found, sending response...`,
            1
        );
        res.status(StatusCodes.NOT_FOUND).send();
    } else {
        logger.log(`Got request with id: ${requestId}, sending back...`, 1);
        res.status(StatusCodes.OK).json(request);
    }
};

const getOffersByQuery = async (req, res) => {
    logger.log(`Received getOffersByQuery request`, 1);

    const { location, owner, quantity } = req.query;
    var { tags, distance } = req.query;
    var tagsArray = [];
    var whereObject = {
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
                attributes: ['name', 'isOfficial', 'color'],
            },
            {
                model: db.photos,
                attributes: ['image'],
            },
        ],
    });

    const queryLocation = location.replace(',', '.').split(';');

    var numTags = tagsArray.length;
    logger.log(`Checking tags...`, 1);
    for (const offer of offers) {
        var count = 0;
        for (const tag of offer.tags) {
            for (const tagQuery of tagsArray) {
                if (tagQuery.name == tag.name) count++;
            }
        }

        if (numTags == count) {
            logger.log('Cleaning up tags...', 1);
            for (let t of offer.tags) {
                delete t.dataValues.OfferTag;
            }
            logger.log('Tags cleaned...', 1);

            const user = await db.users.findOne({
                where: { id: offer.ownerId },
                attributes: ['nickname'],
            });

            offer.dataValues.author = user.nickname;

            logger.log(`Checking location...`, 1);
            var offerLocation = offer.location.replace(',', '.').split(';');
            const dist = distanceBetweenPoints(
                parseFloat(offerLocation[0]),
                parseFloat(offerLocation[1]),
                parseFloat(queryLocation[0]),
                parseFloat(queryLocation[1])
            );
            logger.log(`Checking distance...`, 1);
            if (distance === undefined || dist <= parseInt(distance)) {
                offer.dataValues.distance = dist;
                logger.log('Encoding icon to base64...', 1);
                offer.dataValues.icon = dataEncoding.bufferToBase64(
                    offer.dataValues.icon
                );
                logger.log('Encoded icon to base64', 1);

                let photoArray = [];
                logger.log('Encoding photos to base64...', 1);
                for (let photo of offer.Photos) {
                    photoArray.push(
                        dataEncoding.bufferToBase64(photo.dataValues.image)
                    );
                }
                logger.log('Encoded photos to base64...', 1);
                offer.dataValues.photos = photoArray;
                delete offer.dataValues.Photos;
                offersFinal.push(offer);
            }
        }
    }

    offersFinal.sort((a, b) => {
        return b.dataValues.distance - a.dataValues.distance;
    });

    var offersSlice = [];

    if (quantity !== undefined) {
        offersSlice = offersFinal.slice(0, quantity);
    } else {
        offersSlice = offersFinal;
    }
    logger.log(`Got offer(s), sending back response...`, 1);
    res.status(StatusCodes.OK).json(offersSlice);
};

const getRequestsByQuery = async (req, res) => {
    logger.log(`Received getRequestsByQuery request`, 1);

    const { location, owner, quantity } = req.query;
    var { tags, distance } = req.query;
    var tagsArray = [];
    var whereObject = {
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

    const requestsFinal = [];

    const requests = await db.requests.findAll({
        where: whereObject,
        attributes: ['id', 'location', 'name', 'ownerId'],
        include: [
            {
                association: 'tags',
                model: db.tags,
                attributes: ['name', 'isOfficial', 'color'],
            },
        ],
    });

    const queryLocation = location.replace(',', '.').split(';');

    var numTags = tagsArray.length;
    logger.log(`Checking tags...`, 1);
    for (const request of requests) {
        var count = 0;
        for (const tag of request.tags) {
            for (const tagQuery of tagsArray) {
                if (tagQuery.name == tag.name) count++;
            }
        }
        if (numTags == count) {
            logger.log('Cleaning up tags...', 1);
            for (let t of request.tags) {
                delete t.dataValues.OfferTag;
            }
            logger.log('Tags cleaned...', 1);

            const user = await db.users.findOne({
                where: { id: request.ownerId },
                attributes: ['nickname'],
            });
            request.dataValues.nickname = user.nickname;
            logger.log(`Checking location...`, 1);
            var requestLocation = request.location.replace(',', '.').split(';');
            const dist = distanceBetweenPoints(
                parseFloat(requestLocation[0]),
                parseFloat(requestLocation[1]),
                parseFloat(queryLocation[0]),
                parseFloat(queryLocation[1])
            );
            logger.log(`Checking distance...`, 1);
            if (distance === undefined || dist <= parseInt(distance)) {
                request.dataValues.distance = dist;
                requestsFinal.push(request);
            }
        }
    }

    requestsFinal.sort((a, b) => {
        return b.dataValues.distance - a.dataValues.distance;
    });

    var requestsSlice = [];

    if (quantity !== undefined) {
        requestsSlice = requestsFinal.slice(0, quantity);
    } else {
        requestsSlice = requestsFinal;
    }
    logger.log(`Got request(s), sending back response...`, 1);
    res.status(StatusCodes.OK).json(requestsSlice);
};

const requestOffer = async (req, res) => {
    logger.log('Received requestOffer request...', 1);

    const { requestId } = res.body;
    const offerId = req.params.offerId;

    // 1. find offer & request
    const request = await db.requests.findOne({
        where: { id: requestId },
    });
    const offer = await db.offers.findOne({
        where: { id: offerId },
    });

    // 2. offer.addRequest(request)
    offer.addRequest(request);

    // 3. request.status = 'pending'
    request.status = 'pending';
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
    requestOffer,
};
