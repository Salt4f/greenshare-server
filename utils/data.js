const base64ToBuffer = (base64String) => {
    const buff = Buffer.from(base64String, 'base64');
    return buff;
};

const bufferToBase64 = (buffer) => {
    return buffer.toString('base64');
};

module.exports = { base64ToBuffer, bufferToBase64 };
