const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/artisanController');

router.get('/', ctrl.listArtisans);
router.get('/:id', ctrl.getArtisan);
router.post('/', ctrl.createArtisan);
router.put('/:id', ctrl.updateArtisan);
router.delete('/:id', ctrl.deleteArtisan);

module.exports = router;
