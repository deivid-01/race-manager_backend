const moongose = require("mongoose");
const {Schema} = moongose;

const RaceSchema = new Schema({

    name : { type:String, required:true},
    categories : [ {type: Schema.Types.ObjectId, ref :'Category'} ],
    competitors : [ {type: Schema.Types.ObjectId, ref :'Competitor'} ],
    admin : {type: Schema.Types.ObjectId, ref :'Admin'} 
});

module.exports = moongose.model('Race',RaceSchema);