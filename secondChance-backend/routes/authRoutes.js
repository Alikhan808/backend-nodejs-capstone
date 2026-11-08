const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const connectToDatabase = require('../models/db');
function authenticate(req, res, next) {
  try {
    req.user = jwt.verify((req.headers.authorization || '').replace(/^Bearer /, ''), process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Please log in' }); }
}
function token(user) { return jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '2h' }); }
router.post('/register', async (req,res,next) => {
  try {
    const {firstName,lastName,email,password} = req.body;
    if (![firstName,lastName,email,password].every(v => typeof v === 'string') || !firstName.trim() || !lastName.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 8) return res.status(400).json({error:'Provide a name, valid email and password of at least 8 characters'});
    const users = (await connectToDatabase()).collection('users');
    await users.createIndex({email:1},{unique:true});
    const user = {firstName:firstName.trim(),lastName:lastName.trim(),email:email.trim().toLowerCase(),password:await bcrypt.hash(password,12)};
    const result = await users.insertOne(user); user._id = result.insertedId;
    res.status(201).json({authtoken:token(user),email:user.email,userName:user.firstName,userEmail:user.email});
  } catch(e) { if(e.code===11000) return res.status(409).json({error:'Email already registered'});next(e); }
});
router.post('/login', async(req,res,next)=>{
  try {
    const {email,password} = req.body;
    if(typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({error:'Email and password required'});
    const user = await (await connectToDatabase()).collection('users').findOne({email:email.trim().toLowerCase()});
    if(!user || !await bcrypt.compare(password,user.password)) return res.status(401).json({error:'Invalid email or password'});
    res.json({authtoken:token(user),userName:user.firstName,userEmail:user.email});
  }catch(e){next(e);}
});
router.put('/update',authenticate,async(req,res,next)=>{
 try {
   const name=req.body.name;
   if(typeof name!=='string' || !name.trim() || name.length>100) return res.status(400).json({error:'Valid name required'});
   const result=await (await connectToDatabase()).collection('users').updateOne({_id:new ObjectId(req.user.id)},{$set:{firstName:name.trim()}});
   if(!result.matchedCount)return res.status(404).json({error:'User not found'});
   res.json({name:name.trim()});
 }catch(e){next(e);}
});
module.exports=router;
module.exports.authenticate=authenticate;
