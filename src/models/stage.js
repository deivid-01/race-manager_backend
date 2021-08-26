const moongose = require("mongoose");
const {Schema} = moongose;



const StageSchema = new Schema({

    name : { type:String, required:false},
    waypoints : [ {type: Schema.Types.ObjectId, ref :'Waypoint'} ],
    speedControls : [ {type:Number} ],
    categories : [ {type: Schema.Types.ObjectId, ref :'Category'} ],
    partialresults : [ {type: Schema.Types.ObjectId, ref :'PartialResult'} ]


});

module.exports = moongose.model('Stage',StageSchema);