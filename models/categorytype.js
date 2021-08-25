const moongose = require("mongoose");
const {Schema} = moongose;



const CategoryTypeSchema = new Schema({

    name : { type:String, required:true},
});

module.exports = moongose.model('CategoryType',CategoryTypeSchema);