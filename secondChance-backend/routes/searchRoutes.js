const router=require('express').Router();
const connectToDatabase=require('../models/db');
router.get('/',async(req,res,next)=>{
 try {
  const db=await connectToDatabase();const query={};
  for(const key of ['name','category','condition','age_years'])if(req.query[key]!==undefined && typeof req.query[key]!=='string')return res.status(400).json({error:'Invalid filter'});
  if(req.query.name)query.name={$regex:req.query.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),$options:'i'};
  if(req.query.category)query.category=req.query.category;
  if(req.query.condition)query.condition=req.query.condition;
  if(req.query.age_years){const age=Number(req.query.age_years);if(!Number.isFinite(age)||age<0)return res.status(400).json({error:'Invalid age'});query.age_years={$lte:age};}
  res.json(await db.collection('secondChanceItems').find(query).toArray());
 }catch(e){next(e);}
});
module.exports=router;
