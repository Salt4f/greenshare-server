const sharp = require('sharp');

const compressIcon = async (parsedIcon) => {
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
    return compressedIcon;
};

const compressPhoto = async (parsedPhoto) => {
    const compressedPhoto = await sharp(parsedPhoto)
        .toFormat('jpg', {
            quality: 25,
        })
        .toBuffer();
    return compressedPhoto;
};

module.exports = { compressIcon, compressPhoto };
