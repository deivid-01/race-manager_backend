const Category = require('../models/category.js');
const CategoryType = require('../models/categorytype.js');
const partialresult = require('../models/partialresult.js');
const PartialResult = require('../models/partialresult.js');
const Trackpoint = require('../models/trackpoint.js');
const Race = require('../models/race.js');
const stage = require('../models/stage.js');
const categoryCtrl = {};


categoryCtrl.getOne= async ( req , res ) =>
{
  try
  {
    await Category.findById(req.params.id).
    populate("race","name").
    populate("categorytype","name").
    populate("stages","name").
    populate("competitors","name").exec((err,category)=>
    {
      res.status(200).json(category);
    })
  }
  catch(err)
  {
    return res.status(400).json(err);
  }
 
 
}
categoryCtrl.getAll= async ( req , res ) =>
{
  await Category.find().
  populate("race","name").
  populate("categorytype","name").
  populate("stages","name").
  populate("competitors","name").exec((err,categories)=>
  {
    res.json(categories);
  })
 
}
categoryCtrl.createOne = async ( req , res ) =>
{
    
 try
 {
    var category =  new Category(req.body);
    await category.save( async (err)=>{
     if ( err ) return err;
       try
       {
        var race =  await  Race.findById({"_id":req.body.race_id } );
       
        race.categories.push(category._id);
        await Race.findByIdAndUpdate(race._id,race);   
        res.json({
            'status': 'Category saved'
        });
       } 
       catch(err){
        
        await Category.findByIdAndDelete(category._id);
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

categoryCtrl.createMany = async ( req , res ) => {

    //Create Category Types
    await CategoryType.insertMany(req.body.types,async(err,categorytypes)=>{
 
      var cont = 1;
      categories_ids = []
      await Promise.all(categorytypes.map(async(categoryType)=>{
        var categoryData = {}
        categoryData.categoryType=categoryType._id;
        var category = new Category(categoryData);
        await category.save(async(err)=>{
          categories_ids.push (category._id);
       
          if (cont >= categorytypes.length)
          {       
            res.status(200).json({"msg":"Category types created","Ids":categories_ids});
            return;

          }
          cont +=1;
        })
      
        
        
      }))

      
    });
    
}

categoryCtrl.deleteOne = async ( req,res) => {

  var category_id = req.params.id;
  try
  {
    await Category.findById(category_id)
 
    .populate({path:'stages',select:['partialresults','categories'],
    populate:{path:'partialresults',select:'competitor'}})
    .exec(async (err,category)=>{
  
      if (err) return res.status(400).json(err);

      try
      {
          //Delete from Stage
          for (stage of category.stages)
          {
            //Delete partialresults and trackpoints
            for (partialresult of stage.partialresults)
            {
              if (category.competitors.includes(partialresult.competitor))
              {
                
                stage.partialresults=stage.partialresults.filter((pr=>String(pr._id)!=String(partialresult._id)))
                
                //Remove trackpoints
                await Trackpoint.deleteMany({partialresult: partialresult._id})
                //Remove partial result
                await PartialResult.deleteOne({_id:partialresult._id})
              }
            }

            stage.categories=stage.categories.filter((categ=>String(categ._id)!=String(category._id)))

            stage.save()
          }

          //Delete from race

          var race = await Race.findById(category.race)
  
          race.categories=race.categories.filter((categ=>String(categ)!=String(category._id)))
    
          race.save();
      }
      catch(err)
      {
        return res.status(400).json(err);
      }

      
  
    })
  
    await Category.findByIdAndDelete(category_id);
    return res.status(200).json({'status': 'Category  Deleted'})

  }

  catch(err)
  {
    return res.status(400).json(err);
  }
 

}

categoryCtrl.deleteAll = async ( req, res ) => {

  //Delete All categories
  await Category.deleteMany({});
  res.json({'status': 'All categories deleted'})

}
module.exports = categoryCtrl;
