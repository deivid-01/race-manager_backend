const express = require('express');
const router = express.Router();
const raceCtrl = require('../controllers/race.controller');

router.get('/:id', raceCtrl.getOne);
router.get('/', raceCtrl.getByAdmin);

router.post('/', raceCtrl.createOne);

router.delete('/:id',raceCtrl.deleteOne);
router.delete('/',raceCtrl.deleteAll);
//router.post('/file', trackpointCtrl.createAll);

module.exports = router;