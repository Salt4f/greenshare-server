const logger = {
    log: (message, level) => {
        // level: 0=error 1=info 2=finest
        date = new Date().toLocaleString('es-MA');
        const tag = level == 0 ? 'ERROR' : level == 1 ? 'INFO' : 'FINEST';
        if (level === 0) {
            console.log('\x1b[31m%s\x1b[0m', `[${date}] [${tag}]: ${message}`);
        } else {
            console.log('\x1b[32m%s\x1b[0m', `[${date}] [${tag}]: ${message}`);
        }
    },
};

module.exports = logger;
