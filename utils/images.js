const sharp = require('sharp');
const logger = require('../utils/logger');

const compressIcon = async (buff) => {
    let compressedIcon;
    const { width, height } = await sharp(buff).metadata();

    if (height < width) {
        compressedIcon = await sharp(buff)
            .resize({
                width: height,
                height: height,
            })
            .toFormat('jpg', { quality: 15 })
            .toBuffer();
    } else {
        compressedIcon = await sharp(buff)
            .resize({
                width: width,
                height: width,
            })
            .toFormat('jpg', { quality: 15 })
            .toBuffer();
    }
    return compressedIcon;
};

const compressPhoto = async (buff) => {
    const compressedPhoto = await sharp(buff)
        .toFormat('jpg', {
            quality: 25,
        })
        .toBuffer();
    return compressedPhoto;
};

module.exports = { compressIcon, compressPhoto };
