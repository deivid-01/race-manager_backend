const moongose = require("mongoose");
const {Schema} = moongose;



const CategorySchema = new Schema({

    categorytype : {type: Schema.Types.ObjectId, ref :'CategoryType'},
    competitors : [ {type: Schema.Types.ObjectId, ref :'Competitor'} ],
    stages : [ {type: Schema.Types.ObjectId, ref :'Stage'} ],
    race : {type: Schema.Types.ObjectId, ref :'Race'}

});

module.exports = moongose.model('Category',CategorySchema);