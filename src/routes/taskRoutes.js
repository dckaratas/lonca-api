const express = require('express');
const controller = require('../controllers/taskController');
const { validateCreate, validateUpdate, validateId, validateQuery } = require('../middleware/validateTask');

const router = express.Router();

router.param('id', validateId);

// /search ve /assignee, /:id'den önce tanımlanmalı
router.get('/search', validateQuery, controller.search);                 // Anahtar kelimeyle arama
router.get('/assignee/:name', validateQuery, controller.getByAssignee);  // Maceracıya göre görevler

router.get('/', validateQuery, controller.getAll);       // Görev listeleme (filtre/sıralama/sayfalama)
router.get('/:id', controller.getById);                  // Görev detayı
router.post('/', validateCreate, controller.create);     // Görev ekleme
router.put('/:id', validateUpdate, controller.update);   // Görev güncelleme
router.delete('/:id', controller.remove);                // Görev silme

module.exports = router;
