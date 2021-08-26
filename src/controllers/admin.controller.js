const jwt = require('jsonwebtoken')
require('dotenv').config({path:'variables.env'});
const bcrypt = require('bcrypt')
const Admin = require("../models/admin");

const adminCtrl = {}

adminCtrl.login = async ( req , res)  => {
  try
  {
    var admin = await Admin.findOne({
                        username:req.body.username}).
                        populate('races','name')
    const passCorrect = ( admin == null) ? false:
                                          await  bcrypt.compare(req.body.password,admin.password)
    if ( !passCorrect)
    {
      return res.status(401).json({"error":"Invalid user or password"})

    }

    const adminForToken = {
      id : admin._id,
      username: admin.username,
      name: admin.name,
      lastname: admin.lastname,
      races: admin.races
    }

    const token = jwt.sign(adminForToken,process.env.SECRET || 123)

    
    return res.status(200).json({
      admin:admin,
      token:token
    })
    
  }
  catch(err)
  {
    res.status(400).json(err)
  }
}


adminCtrl.getOne= async ( req , res ) =>
{
  try
  {
    const admin = await Admin.findById(req.params.id).
    populate("races","name").exec((err,admin)=>{
        res.status(200).json(admin);
    });
    
  }
  catch(err)
  {
    res.status(400).json(err);
  }
}

adminCtrl.getAll= async ( req , res ) =>
{
  const admins = await Admin.find().
  populate("races","name").exec((err,admins)=>{
    res.json(admins);
  });
  
}
adminCtrl.createOne = async ( req , res ) =>
{ 
  try
  {
    req.body.password = await bcrypt.hash(req.body.password,10)
    var admin =  new Admin(req.body);
    await admin.save();
   res.json({
       'status': 'Admin saved'
   });
  }
  catch(err)
  {
    
    res.status(400).json({msg:"Sign up failed"})
  }
  
}
adminCtrl.updateOne = async ( req, res ) =>{

  try{
    await Admin.findByIdAndUpdate(req.params.id,req.body);
    res.status(200).json({"msg":"Admin Updated"});

  }
  catch(err)
  {
    res.status(400).json(err);
  }

}

adminCtrl.deleteOne = async ( req, res )=>{

  try
  {
    /**Delete Races...
     * 
     * 
     * 
     * 
     * ...
     */


    await Admin.findByIdAndDelete(req.params.id);
    res.status(200).json({"msg":"Admin Deleted"});

  }  
  catch(err)
  {
    res.status(400).json(err);
  }
}
adminCtrl.deleteAll = async ( req, res )=>{

  /**Delete All races from all admins...
   * 
   * 
   * 
   * 
   *  */  
  
  
  await Admin.deleteMany({});
    res.status(200).json({"msg":"All Admins Deleted"});


}


module.exports = adminCtrl;