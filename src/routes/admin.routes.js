const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');

router.get('/:id', adminCtrl.getOne);
router.get('/', adminCtrl.getAll);

router.post('/', adminCtrl.createOne);
router.post('/login', adminCtrl.login);

router.put('/', adminCtrl.updateOne);

router.delete('/:id', adminCtrl.deleteOne);
router.delete('/:', adminCtrl.deleteAll);
//router.post('/file', trackpointCtrl.createAll);

module.exports = router;