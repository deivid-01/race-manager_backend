const mongoose = require('mongoose');
const { Schema } = mongoose;



const  CompetitorSchema = new Schema({
   
    number: { type: Number},
    name : {type: String , required : true},
    lastname : {type: String , required : true},
    categorytype : {type: Schema.Types.ObjectId, ref :'CategoryType'},
    vehicle: {type:String, required: false},
    races : [ {type: Schema.Types.ObjectId, ref :'Race'} ]

}
)


module.exports = mongoose.model('Competitor',CompetitorSchema);
