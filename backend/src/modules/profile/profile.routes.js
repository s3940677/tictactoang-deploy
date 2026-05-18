const express = require('express');
const router = express.Router();
const profileController = require('./profile.controller');
const { verifyToken } = require('../../shared/middleware/auth.middleware');
const { updateProfileValidator, changePasswordValidator } = require('../../shared/middleware/validator.middleware');
const { upload, processAvatar } = require('../../shared/middleware/upload.middleware');

router.use(verifyToken);

router.get('/', profileController.getProfile);
router.put('/', updateProfileValidator, profileController.updateProfile);
router.put('/password', changePasswordValidator, profileController.changePassword);
router.post('/avatar', upload.single('avatar'), processAvatar, profileController.uploadAvatar);
router.get('/history', profileController.getGameHistory);
router.post('/wallet/deposit', profileController.deposit);
router.post('/subscription', profileController.subscribe);
router.post('/subscription/stripe/create-checkout-session', profileController.stripeCheckout);

module.exports = router;
