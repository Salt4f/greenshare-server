const logger = {
    log: (message, level) => {
        // level: 0=error 1=info 2=finest
        const tag = info == 0 ? 'ERROR' : info == 1 ? 'INFO' : 'FINEST';
        console.log(`[${tag}]: ${message}`);
    },
};

module.exports = logger;
