const mongoose = require('mongoose');
require('dotenv').config({path:'variables.env'});
const URL = process.env.DB_URL;

mongoose.connect( URL, { useNewUrlParser: true , useUnifiedTopology:true , useFindAndModify:false} )
    .then(db => console.log("Database is connected"))
    .catch( err => console.error(err));

module.exports = mongoose ; 
