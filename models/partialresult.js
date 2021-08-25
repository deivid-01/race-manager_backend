const moongose = require("mongoose");
const {Schema} = moongose;


const PartialResultSchema = new Schema({

    competitor:{type: Schema.Types.ObjectId, ref :'Competitor',required:true} ,
    start_time     : { type: String, required: false,default:'00:00:00'},
    arrival_time     : { type: String, required: false,default:'00:00:00'},
    neutralization     : { type: String, required: false,default:'00:00:00'},
    penalization     : { type: String, required: false,default:'00:00:00'},
    discount      : { type: String, required: false,default:'00:00:00'},
    waypointsMissed      : [{type: Schema.Types.ObjectId, ref :'Waypoint'} ],
    speedPoints      : [ {type: Object }],
    gpx_uploaded      : { type: Boolean, required: false, default:false},
    totalTime : { type: String, required: false, default:"00:00:00"},
    
    stage:{type: Schema.Types.ObjectId, ref :'Stage', required:true}  

});

module.exports = moongose.model('PartialResult',PartialResultSchema);