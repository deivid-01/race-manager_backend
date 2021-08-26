const Waypoint = require('../models/waypoint');
const Stage = require('../models/stage');
const toolsCtrl = require('../controllers/tools.controller');
const waypoint = require('../models/waypoint');
const waypointCtrl = {};


waypointCtrl.getOne = async ( req , res ) =>
{
  const waypoint = await Waypoint.findById(req.params.id);
  res.json(waypoint);
}


waypointCtrl.getAll = async ( req , res ) =>
{
  const waypoints = await Waypoint.find();
  res.json(waypoints);
}

waypointCtrl.createOne = async ( req , res ) =>
{
    const waypoint =  new Waypoint(req.body);
   await waypoint.save();
  res.json({
      'status': 'Waypoint saved'
  });
}

waypointCtrl.createOne_ = async ( wayPointData,stage_id) =>
{
  var stage =  await  Stage.findById({"_id":stage_id } );
  const waypoint =  new Waypoint(wayPointData);
 
  await waypoint.save(async (err)=>{
    if ( err ) return err;     
      //console.log(waypoint._id);
      stage.waypoints.push(waypoint._id);
      await Stage.findByIdAndUpdate(stage._id,stage);

    }
);


}
waypointCtrl.createAll = async ( req , res ) =>
{
  if (req.files === null) {
    return res.status(400).json({msg:'No file uploaded'});
  }
 

  if (!req.files.file.name.endsWith('.csv'))
  {
    return res.status(400).json({msg:'File type must be .CSV'});
  }
  

  //Cleaning waypoints

  var waypoints = toolsCtrl.getWaypointsFromFile(req.files.file) // Data pre-processing
  
  waypoints.forEach((waypoint)=>{
    waypoint.stage = req.body.stage;
  })

  //Send to database
  try
  {
    await Waypoint.insertMany(waypoints).then(async(waypoints)=>{
    
      
      try
      {
        //Save Waypoints in Stage
        var stage =  await  Stage.findById(req.body.stage );
        stage.waypoints =waypoints.map(waypoint=>waypoint._id);
        await stage.save();
        
        res.status(201).json({msg:' Waypoints uploaded'});
        
      }
      catch(err)
      {
        await Waypoint.deleteMany({});
        return res.status(400).json({msg : " stage_id don't founded",solution:"check stage_id in body request"});
  
      }
      

  
    })
  }
  catch(err)
  {
    return res.status(400).json(err);
  }

  

  

 
}
waypointCtrl.updateOne = async ( req , res ) =>{

  var data = req.body
    
  try{
      await Waypoint.findByIdAndUpdate(req.params.id,data);
      res.status(200).json({"msg":"Waypoint Updated"});
  
    }
    catch(err)
    {
      res.status(400).json(err);
    }


}


waypointCtrl.deleteOne = async ( req,res) => {

  //Delete from stage
  try
  {
    var waypoint = await Waypoint.findById(req.params.id)
    var stage = await Stage.findById(waypoint.stage);
    stage.waypoints =stage.waypoints.filter((wp_id)=> (String(wp_id)).localeCompare(req.params.id));
    stage.save();
  
    //Delete  Waypoints
    await Waypoint.findByIdAndDelete(req.params.id);
     res.json({'status': 'Waypoint Deleted'})
  }
  catch(err)
  {
    return res.status(400).json(err);
  }

}

waypointCtrl.deleteAll = async ( req, res ) => {

  //THIS IS NOT HAS BEEN TESTED YET

  //Delete from Stage
  var stage = await Stage.findById({"_id":req.body.stage_id});
  stage.waypoints =[]
  await stage.save()

  //Delete All waypoints
  await Waypoint.deleteMany({});
  res.json({'status': 'All waypoints deleted'})

}



module.exports = waypointCtrl;
