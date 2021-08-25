const Admin = require("../models/admin");
const Competitor = require("../models/competitor");
const CategoryType = require("../models/categorytype");
const Race = require("../models/race");
const Category = require("../models/category");
const Stage = require("../models/stage");
const Waypoint = require("../models/waypoint");
const Trackpoint = require("../models/trackpoint");
const PartialResult = require('../models/partialresult.js');
testingCtrl = {}


testingCtrl.reset = async( req, res) =>{
    await Admin.deleteMany({});
    await Competitor.deleteMany({});
    await CategoryType.deleteMany({});
    await Race.deleteMany({});
    await Category.deleteMany({});
    await Stage.deleteMany({});
    await Waypoint.deleteMany({});
    await Trackpoint.deleteMany({});
    await PartialResult.deleteMany({});
    res.status(200).json({"msg":"Database reseted"});
}


module.exports = testingCtrl;