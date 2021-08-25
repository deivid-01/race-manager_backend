const express = require('express');
const router = express.Router();
const trackpointCtrl = require('../controllers/trackpoint.controller');

router.get('/', trackpointCtrl.getAll);
router.get('/:id', trackpointCtrl.getOneByPartialresult);

router.post('/', trackpointCtrl.createOne);
router.post('/file/', trackpointCtrl.createAll);

module.exports = router;