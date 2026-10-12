const express = require('express');
const controller = require('../controllers/reportController');

const router = express.Router();

router.get('/completed', controller.completed);  // Tamamlanan görevler
router.get('/pending', controller.pending);      // Bekleyen görevler
router.get('/summary', controller.summary);      // Genel özet

module.exports = router;
