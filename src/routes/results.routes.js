const express = require('express');
const router = express.Router();
const resultCtrl = require('../controllers/results.controller');


router.get('/stage/:id/:categorytype_id', resultCtrl.getStageResult);
router.get('/category/:id/', resultCtrl.getCategoryResults);
router.get('/races/:id', resultCtrl.getRaceResult);



module.exports = router;