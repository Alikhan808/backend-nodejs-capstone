require('dotenv').config();
const express=require('express');
const cors=require('cors');
const path=require('path');
const app=express();
app.use(cors());app.use(express.json({limit:'64kb'}));
app.use('/images',express.static(path.join(__dirname,'public/images'),{setHeaders:res=>res.setHeader('X-Content-Type-Options','nosniff')}));
app.use('/api/auth',require('./routes/authRoutes'));
app.use('/api/secondchance/items',require('./routes/secondChanceItemsRoutes'));
app.use('/api/secondchance/search',require('./routes/searchRoutes'));
app.get('/api/health',(req,res)=>res.json({status:'ok'}));
app.get('/api/seed-report', (req, res) => {
  const report = app.locals.seedReport;
  if (!report) return res.status(404).send('Import report unavailable');
  res.type('text').send([
    'SecondChance | MongoDB import',
    'Database: ' + report.database,
    'Collection: ' + report.collection,
    'Documents imported: ' + report.insertedCount,
    'Documents in collection after import: ' + report.total
  ].join(String.fromCharCode(10)));
});
app.use('/api',(req,res)=>res.status(404).json({error:'Not found'}));
const build=path.join(__dirname,'../secondChance-frontend/build');
app.get('/',(req,res)=>res.sendFile(path.join(build,'home.html')));
app.use(express.static(build));
app.get('/app*',(req,res)=>res.sendFile(path.join(build,'index.html')));
app.use((err,req,res,next)=>{console.error(err.message);res.status(err.code==='LIMIT_FILE_SIZE'?413:500).json({error:err.code==='LIMIT_FILE_SIZE'?'Image exceeds 5 MB':'Request failed'});});
if(require.main===module){if(!process.env.JWT_SECRET)throw new Error('Set JWT_SECRET');app.listen(process.env.PORT||3060,()=>console.log('SecondChance listening'));}
module.exports=app;
