const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const connectToDatabase = require('../models/db');
const { authenticate } = require('./authRoutes');
const directory = path.join(__dirname,'../public/images');
fs.mkdirSync(directory,{recursive:true});
const upload = multer({
 storage:multer.diskStorage({destination:directory,filename:(req,file,cb)=>cb(null,randomUUID()+path.extname(file.originalname).toLowerCase())}),
 limits:{fileSize:5*1024*1024},
 fileFilter:(req,file,cb)=>cb(null,/^image\/(jpeg|png|gif|webp)$/.test(file.mimetype) && /\.(jpe?g|png|gif|webp)$/i.test(file.originalname))
});
router.get('/',async(req,res,next)=>{
 try {const db=await connectToDatabase();res.json(await db.collection('secondChanceItems').find({}).toArray());}catch(e){next(e);}
});
router.get('/:id',async(req,res,next)=>{
 try {const db=await connectToDatabase();const item=await db.collection('secondChanceItems').findOne({id:req.params.id});if(!item)return res.status(404).json({error:'Item not found'});res.json(item);}catch(e){next(e);}
});
router.post('/',authenticate,upload.single('file'),async(req,res,next)=>{
 try {
  const {name,category,condition,zipcode,description}=req.body;
  const age_days=Number(req.body.age_days);
  if(![name,category,condition,zipcode,description].every(v=>typeof v==='string' && v.trim()) || !Number.isFinite(age_days) || age_days<0 || !req.file) {
   if(req.file)fs.unlinkSync(req.file.path);
   return res.status(400).json({error:'Item fields, valid age and an image are required'});
  }
  const item={id:randomUUID(),name,category,condition,zipcode,description,age_days,age_years:age_days/365,date_added:Math.floor(Date.now()/1000),posted_by:req.user.id,image:'/images/'+req.file.filename,comments:[]};
  const db=await connectToDatabase();await db.collection('secondChanceItems').insertOne(item);res.status(201).json(item);
 }catch(e){next(e);}
});
router.put('/:id',authenticate,async(req,res,next)=>{
 try {
  const patch={};
  for(const key of ['name','description','category','condition','zipcode'])if(typeof req.body[key]==='string' && req.body[key].trim())patch[key]=req.body[key];
  if(!Object.keys(patch).length)return res.status(400).json({error:'No valid changes'});
  const db=await connectToDatabase();const item=await db.collection('secondChanceItems').findOneAndUpdate({id:req.params.id,posted_by:req.user.id},{$set:patch},{returnDocument:'after'});
  if(!item)return res.status(404).json({error:'Owned item not found'});res.json(item);
 }catch(e){next(e);}
});
router.delete('/:id',authenticate,async(req,res,next)=>{
 try {const db=await connectToDatabase();const result=await db.collection('secondChanceItems').deleteOne({id:req.params.id,posted_by:req.user.id});if(!result.deletedCount)return res.status(404).json({error:'Owned item not found'});res.json({message:'Item deleted'});}catch(e){next(e);}
});
module.exports=router;
