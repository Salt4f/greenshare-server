const logger = {
    log: (message, level) => {
        // level: 0=error 1=info 2=finest
        const tag = level == 0 ? 'ERROR' : level == 1 ? 'INFO' : 'FINEST';
        console.log(`[${tag}]: ${message}`);
    },
};

module.exports = logger;
