const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { verifyToken, authorize } = require('../../shared/middleware/auth.middleware');

router.use(verifyToken, authorize(['ADMIN']));

router.get('/players', adminController.getAllPlayers);
router.patch('/status/:id', adminController.toggleStatus);

router.get('/games', adminController.getOnlineGames);
router.get('/games/search', adminController.searchOnlineGames);
router.post('/games/:id/close', adminController.closeGameRoom);

module.exports = router;
