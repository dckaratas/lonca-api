const express = require('express');
const controller = require('../controllers/taskController');

const router = express.Router();

router.get('/', controller.getAll);        // Görev listeleme
router.get('/:id', controller.getById);    // Görev detayı
router.post('/', controller.create);       // Görev ekleme
router.put('/:id', controller.update);     // Görev güncelleme
router.delete('/:id', controller.remove);  // Görev silme

module.exports = router;
