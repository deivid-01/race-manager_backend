const analysisCtrl = require('./analysis.controller');
const Stages = require('../models/stage');
const Trackpoints = require('../models/trackpoint');
const raceCtrl = require('./race.controller');
const toolsCtrl = require('./tools.controller');
const Category = require('../models/category');



const resultCtrl = {};

resultCtrl.filterStageByCategoryType = (stage,categorytype_id) => {
  //Filter categorytype
  stage.partialresults = stage.partialresults
                        .filter((partialresult)=>
                        String(partialresult.competitor.categorytype._id).localeCompare(categorytype_id)==0)
  
  return stage
}

resultCtrl.getStageResult=async(req,res)=>{
    
  //Gets Stage
  var {id:stage_id, categorytype_id } = req.params
  try
  {
    await Stages.findById(stage_id)
    .populate("waypoints")
    .populate({
      path:"partialresults",
      select:["competitor",
              'start_time',
              'gpx_uploaded',
              'arrival_time',
              'neutralization',
              'penalization',
              'speedPoints',
              'discount',
              'waypointsMissed'],
      populate:{path:"competitor",select:["name",'lastname','categorytype'],
      populate:{path:'categorytype',select:'name'}}})
    .exec(async (err,stage)=>{
      stage = resultCtrl.filterStageByCategoryType (stage,categorytype_id)
      if ( stage)
      {
        var waypoints = stage.waypoints;
        var partialresults = stage.partialresults;

        partialresults=partialresults.filter((pResult,err)=>pResult.gpx_uploaded)
      
  
        for ( partialR of partialresults)
        {  
        
            var trackpoints = await Trackpoints.find({partialresult:partialR._id});
        
            if(trackpoints.length> 0 )
            {
              var analysisRes  = analysisCtrl.checkWaypoints(waypoints,trackpoints);
     
              partialR.penalization = toolsCtrl.hoursToHHMMSS(analysisRes.totalPenalization/60) //WARNING : Convert to hours
              partialR.waypointsMissed = analysisRes.noPassedWaypoints
             
             
              partialR.speedPoints = analysisRes.dzPoints
              partialR.save()
            }
          
 
        }
    
        partialresults=raceCtrl.sortByTotal(partialresults);

        return res.status(200).json(resultCtrl.translateResults(partialresults))

      }

      return res.status(400).json({msg:'Stage dont fround'})

      
 
 
     })
  }
  catch(err)
  {
    console.log(err)
    return res.status(400).json({msg:"Wrong id"})
  }
   

 
};

resultCtrl.getCategoryResults = async (req,res) =>{


  var category_id = req.params.id;
  try{

    await Category.findById(category_id)
    .populate({
      path:"stages",select:"partialresults",
      populate:{path:"partialresults",
      populate:{path:"competitor", select:"categorytype"}}})
    .populate('competitors').exec((err,category)=>{

      if(err) return res.status(400).json(err)

      var competitors = category.competitors.map(comp=>({
        position: -1,
        fullName: `${comp.name} ${comp.lastname}`,
        number:comp.number,
        vehicle:comp.vehicle,
        stagesTime:[],
        totalTime:"00:00:00"
      }));

      category.stages.forEach((stage)=>{
        var partialresults = stage.partialresults.filter(partialresult=>
          String(category.categorytype) ==String(partialresult.competitor.categorytype))
          partialresults.forEach((partialRes,i)=>{
            
            competitors[i].stagesTime.push(partialRes.totalTime);
            competitors[i].totalTime = toolsCtrl.hoursToHHMMSS ( toolsCtrl.HHMMSSToHours (competitors[i].totalTime) + toolsCtrl.HHMMSSToHours(partialRes.totalTime));
         })
      });
        //Sort competitors by total
      competitors = resultCtrl.sortByTotal(competitors);

      //Setting position values
      for (let i = 0; i < competitors.length; i++) {
        competitors[i].position= i+1;
      }
    

      //Set positions
      return res.status(200).json(competitors);
    })
  
  }
  catch(err)
  {
    return res.status(400).json(rtt);

  }
}

resultCtrl.sortByTotal = (items) =>// sort by name
{
  items.sort(function(resultA, resultB) {
   
    if (resultA.totalTime < resultB.totalTime) {
      return -1;
    }
    if (resultA.totalTime > resultB.totalTime) {
      return 1;
    }
    return 0 
  })
  return items;
}

raceCtrl.fixSpeedPoints = (points) =>{
  dzPoints = []
  points.forEach((p=>{
        p.penalization/60
  }))
}
raceCtrl.sortByTotal = (items) =>// sort by name
{
items.sort(function(totalA, totalB) {
  if (totalA < totalB) {
    return -1;
  }
  if (totalA > totalB) {
    return 1;
  }
  return 0 
})
return items;
}


resultCtrl.translateResults = (results) => {

  var posResults=[
    
  ]

  results.forEach((result,i)=>{
 
      var item = {
        id:result._id,
        position:i+1,
        start_time:result.start_time,
        arrival_time:result.arrival_time,
        partial_time:toolsCtrl.hoursToHHMMSS(toolsCtrl.HHMMSSToHours(result.arrival_time)-toolsCtrl.HHMMSSToHours(result.start_time)),
        neutralization:result.neutralization,
        penalization:"+"+result.penalization,
        competitor_name:result.competitor.name,
        competitor_lastname:result.competitor.lastname,
        competitor_category:result.competitor.categorytype.name,
        total:'',
        waypointsMissed:result.waypointsMissed,
        speedPoints:result.speedPoints
      }
      var totalHours = toolsCtrl.HHMMSSToHours(result.arrival_time)-toolsCtrl.HHMMSSToHours(result.start_time)
      item.total = toolsCtrl.hoursToHHMMSS(totalHours + toolsCtrl.HHMMSSToHours(result.penalization) - toolsCtrl.HHMMSSToHours(result.neutralization))
     
      posResults.push(item)
    })

  
    return posResults
}



raceCtrl.getWaypointsMissed = (waypoints) => {
  ids = []
  waypoints.forEach(waypoint =>{
    ids.push(waypoint._id)
  })
  return ids
}

raceCtrl.hoursToHHMMSS = (hours) => {

  var HH = Math.floor(hours)
  var num = (hours-HH)*60
  var MM = Math.floor(num)
  var SS = Math.floor ((num-MM)*60)


  return String(HH)+":"+String(MM)+':'+String(SS)



}

resultCtrl.getRaceResult=async(req,res)=>{
    //req.params.id id de la carrera
    
};

module.exports = resultCtrl;