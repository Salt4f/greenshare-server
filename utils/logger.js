const logger = {
    log: (message, level) => {
        // level: 0 = ERROR | 1 = INFO | 2 = FINEST
        const tag = level == 0 ? 'ERROR' : level == 1 ? 'INFO' : 'FINEST';
        console.log(`[${tag}]: ${message}`);
    },
};

module.exports = logger;
