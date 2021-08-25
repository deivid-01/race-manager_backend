const moongose = require("mongoose");
const {Schema} = moongose;

const AdminSchema = new Schema({

    name : { type:String, required:true},
    lastname : { type:String, required:false},
    username : {type:String,required: true},
    password : {type:String,required: true},
    races : [ {type: Schema.Types.ObjectId, ref :'Race'} ]
});

AdminSchema.set('toJSON',{
    transform: (document,returnedObject) => {
        delete  returnedObject.__v
        delete returnedObject.password
    }
})



module.exports = moongose.model('Admin',AdminSchema);