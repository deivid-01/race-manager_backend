const express = require('express');
const router = express.Router();
const waypointCtrl = require('../controllers/waypoint.controller');

router.get('/:id', waypointCtrl.getOne);
router.get('/', waypointCtrl.getAll);
router.put('/:id', waypointCtrl.updateOne);
router.post('/file', waypointCtrl.createAll);

router.delete('/:id',waypointCtrl.deleteOne)
router.delete('/', waypointCtrl.deleteAll);


module.exports = router;