const base64ToBuffer = (base64String) => {
    return new Buffer(base64String, 'base64');
};

const bufferToBase64 = (buffer) => {
    return buffer.toString('base64');
};

module.exports = { base64ToBuffer, bufferToBase64 };
