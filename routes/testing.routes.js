const express = require('express');
const router = express.Router();
const testingCtrl = require('../controllers/testing.controller');

router.delete('/reset', testingCtrl.reset);


module.exports = router;