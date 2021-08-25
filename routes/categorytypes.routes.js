const express = require('express');
const router = express.Router();
const categorytypeCtrl = require('../controllers/categorytype.controller');

router.get('/', categorytypeCtrl.getAll);
router.post('/', categorytypeCtrl.createOne);
router.delete('/:id',categorytypeCtrl.deleteOne);
router.delete('/',categorytypeCtrl.deleteAll);
//router.post('/file', trackpointCtrl.createAll);

module.exports = router;