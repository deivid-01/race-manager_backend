const Category = require('../models/category.js');
const CategoryType = require('../models/categorytype.js');
const Race = require('../models/race.js');
const categorytypeCtrl = {};

categorytypeCtrl.getAll= async ( req , res ) =>
{
  const categorytypes = await CategoryType.find();
  res.json(categorytypes);
}
categorytypeCtrl.createOne = async ( req , res ) =>
{
    console.log("olas");
 try
 {
    var categorytype =  new Category(req.body);
    await categorytype.save( async (err)=>{
     if ( err ) return err;
       try
       {
        var race =  await  Race.findById({"_id":req.body.race_id } );
       
        race.categorytypes.push(categorytype._id);
        await Race.findByIdAndUpdate(race._id,race);   
        res.json({
            'status': 'Category saved'
        });
       } 
       catch(err){
        
        await CategoryType.findByIdAndDelete(categorytype._id);
        return res.status(400).json({msg : " race_id don't founded",solution:"check race_id in body request"});
     
      }
       
     }
 
    );

 }
 catch(err)
  {
    return res.json(err);
  }
 
}

categorytypeCtrl.createMany = async ( req , res ) => {

    //Create Category Types
    await CategoryType.insertMany(req.body.types);
    res.status(200).json({"msg":"Category types created"});
}

categorytypeCtrl.deleteOne = async ( req,res) => {

  //Delete from Race
  var race = await Race.findById({"_id":req.body.race_id});
  race.categorytypes = race.categorytypes.filter((categorytype_id)=> (String(categorytype_id)).localeCompare(req.params.id));
  await Race.findByIdAndUpdate(race._id,race);

  //Delete  Category
  await CategoryType.findByIdAndDelete(req.params.id);
   res.json({'status': 'Category  Deleted'})
}

categorytypeCtrl.deleteAll = async ( req, res ) => {
  //Delete from Race
  //var race = await Race.findById({"_id":req.body.race_id});
  //race.categorytypes =[]
  //await Race.findByIdAndUpdate(race._id,race);

  //Delete All categorytypes
  await CategoryType.deleteMany({});
  res.json({'status': 'All categorytypes deleted'})

}
module.exports = categorytypeCtrl;
