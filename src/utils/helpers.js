const crypto = require('crypto');
const moment = require('moment-timezone');

const generateRequestId = () => {
    const currentTime = moment().tz('Africa/Lagos').format('YYYYMMDDHHmm');
    const randomString = crypto.randomBytes(5).toString('hex');
    return `${currentTime}${randomString}`;
};

module.exports = { generateRequestId };
