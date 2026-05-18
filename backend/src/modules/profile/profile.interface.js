const profileService = require('./profile.service');

module.exports = {
    isUserPremium: (userId) => profileService.isUserPremium(userId),
};
