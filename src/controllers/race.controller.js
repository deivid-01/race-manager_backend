const jwt = require('jsonwebtoken');
const Race = require('../models/race.js');
const Admin = require('../models/admin.js');
const Category = require('../models/category.js');
const Stage = require('../models/stage.js')
const Trackpoint = require('../models/trackpoint.js')
const Competitor = require('../models/competitor.js');
const PartialResult = require('../models/partialresult.js');
const Waypoint = require('../models/waypoint.js');
const raceCtrl = {};


raceCtrl.getByAdmin = async (req, res ) =>{

  const authorization = req.get('authorization')
 
  let token = null
  let decodedToken = null
  if ( authorization && authorization.toLowerCase().startsWith('bearer'))
  {
    token = authorization.split(' ')[1]
    decodedToken = jwt.verify(token,process.env.SECRET || '123')
  }

  if ( !token || !decodedToken.id)
  {
    return res.status(401).json({error:"Token missing or invalid"})
  }
  
  const {id: admin_id} = decodedToken
  
  try
  {
  
    var races =  await Race.find({admin:admin_id})
   

    return res.status(200).json(races)
  }
  catch(err)
  {
   
    return res.status(400).json(err)
  }

}

raceCtrl.getAll= async ( req , res ) =>
{
  await Race.find().
  populate({
    path:"categories",select:"categorytype",
    populate:{path:"categorytype",select:"name"}}).
  populate("competitors","name").
  populate("admin","name").
    exec((err,races)=>{
      res.json(races);
  });
}

raceCtrl.getOne= async ( req , res ) =>
{
  try
  {
    await Race.findById(req.params.id).
    populate({
      path:"categories",select:"categorytype",
      populate:{path:"categorytype",select:"name"}}).
    populate("competitors","name").
    populate("admin","name").
      exec((err,race)=>{
        if (err) return res.status(400).json(err);

        return res.status(200).json(race);
    });
    
  }
  catch(err)
  {
    return res.status(400).json(err);
  }
}
raceCtrl.createOne = async ( req , res ) =>
{
  const authorization = req.get('authorization')
 
  let token = null
  let decodedToken = null
  if ( authorization && authorization.toLowerCase().startsWith('bearer'))
  {
    token = authorization.split(' ')[1]
    decodedToken = jwt.verify(token,process.env.SECRET || '123')
  }

  if ( !token || !decodedToken.id)
  {
    return res.status(401).json({error:"Token missing or invalid"})
  }
 
  
  const {id: admin_id} = decodedToken
  
  
  try
  {

    req.body.admin = admin_id
    var race =  new Race(req.body);
    await race.save().then(async (race)=>{
      
      try
      {



            typesAdded = []
           //Create categories

            for ( competitor_id of race.competitors)
            {
              
              
              var competitor = await Competitor.findById(competitor_id);
     
          
                if ( !typesAdded.includes(String(competitor.categorytype)))
                {
                  //Create Category
                    data = {
                      competitors :[]
                    }
                    data.categorytype = competitor.categorytype;
                    data.race = race._id;
                    data.competitors.push(competitor._id);
                    var category = new Category(data);
                    await category.save();
                    typesAdded.push(String(competitor.categorytype));
                }
                else
                {
                  var category = await Category.findOne({race:race._id,categorytype:competitor.categorytype});
            
                  category.competitors.push( competitor._id);
                  await category.save();
                  if(!race.categories.includes(category._id))
                  {
                    race.categories.push(category._id);
                  }
                }

                competitor.races.push(race._id);
                await competitor.save();
                
            }
          
          
        //add race to admin
        var admin =  await  Admin.findById(race.admin);
        admin.races.push(race._id);
        await admin.save();

        await race.save();
        

        res.status(200).json({"msg":"Race Saved"});
      }
      catch(err){
        console.log(err)
        //await Race.findByIdAndDelete(race._id);
        return res.status(500).json(err);
     
      }
     }
 
    );
    }
    catch(err)
    {
      return res.json(err);
    }
}

raceCtrl.deleteOne = async ( req,res) => {
  
  var race_id = req.params.id;
  try
  {
    await Race.findById(race_id)
    .populate({ path:'categories',select:'stages',
    populate:{path:'stages',select:'partialresults'}})
    .exec(async(err,race)=>{
      if (err || race==null) return res.status(400).json(err)
      
      
        for (var  category of race.categories) 
        {
          for (var stage of category.stages) 
          {
            for(var partialresult of stage.partialresults)
            {                            
              await Trackpoint.deleteMany({partialresult: partialresult._id})
            }
    
            await PartialResult.deleteMany({stage:stage._id})
            await Waypoint.deleteMany({stage:stage._id})
            await Stage.deleteOne({_id:stage._id})
          }    
        }

        //Remove from competitors
        for(var competitor_id of race.competitors)
        {
          var competitor= await  Competitor.findById(competitor_id)
          competitor.races =competitor.races.filter((race_id)=> (String(race_id)!=String(race._id)))
          competitor.save();
        }
    
        await Category.deleteMany({race:race._id})
    
        //Delete from User
        var user = await Admin.findById(race.admin)
        user.races =user.races.filter((race_id)=> (String(race_id)!=String(race._id)))
        user.save();
       
        await Race.findByIdAndDelete(race_id);
       
        return res.status(200).json({'status': 'Race Deleted'})
   
    })
  }
  catch(err)
  {
    
    return res.status(400).json(err)

  }
   
  



}

raceCtrl.deleteAll = async ( req, res ) => {
  try
  {
    await Race.deleteMany({});
    return res.status(200).json({'msg': 'All races deleted'})
  }
  catch(err)
  {
    return res.status(400).json(err);
  }
  
}
module.exports = raceCtrl;
