const logger = {
    log: (message, level) => {
        // level: 0=error 1=info 2=finest
        const tag = level == 0 ? 'ERROR' : level == 1 ? 'INFO' : 'FINEST';
        console.log('\x1b[32m%s\x1b[0m', `[${tag}]: ${message}`);
    },
};

module.exports = logger;
