const express = require('express');
const router = express.Router();
const comepetitorCtrl = require('../controllers/competitor.controller');

router.get('/:id', comepetitorCtrl.getOne);
router.get('/', comepetitorCtrl.getAll);
router.post('/', comepetitorCtrl.createOne);
router.post('/file', comepetitorCtrl.createAll);
router.put('/', comepetitorCtrl.createOne);
router.put('/file', comepetitorCtrl.updateAll);
router.delete('/:id', comepetitorCtrl.deleteOne);
router.delete('/', comepetitorCtrl.deleteAll);

module.exports = router;