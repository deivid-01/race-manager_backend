const express = require('express');
const router = express.Router();
const partialResultCtrl = require('../controllers/partialresult.controller');
const partialresult = require('../models/partialresult');
const race = require('../models/race');

router.get('/:id', partialResultCtrl.getOne);
router.get('/', partialResultCtrl.getAll);
router.get('/stage/:id', partialResultCtrl.getByStage);

router.post('/file', partialResultCtrl.createMany);
router.post('/', partialResultCtrl.createOne);

router.put('/:id',partialResultCtrl.updateOne);

router.delete('/:id',partialResultCtrl.deleteOne);
router.delete('/',partialResultCtrl.deleteAll);

module.exports = router;