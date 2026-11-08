const {MongoMemoryServer}=require('mongodb-memory-server');
const {randomBytes}=require('crypto');
(async()=>{
 // shortcut: the demonstration database is temporary; set MONGO_URL to use persistent MongoDB.
 if(!process.env.MONGO_URL){const mongo=await MongoMemoryServer.create();process.env.MONGO_URL=mongo.getUri();}
 process.env.JWT_SECRET ||= randomBytes(32).toString('hex');
 process.env.MONGO_DB ||= 'secondChance';
 const db=await require('../secondChance-backend/models/db')();
 const collection=db.collection('secondChanceItems');
 if(await collection.countDocuments()===0){const {docs}=require('../secondChance-backend/util/import-mongo/secondChanceItems.json');const result=await collection.insertMany(docs);console.log('Imported documents into MongoDB:',result.insertedCount);}
 console.log('MongoDB documents:',await collection.countDocuments());
 require('../secondChance-backend/app').listen(process.env.PORT||3060,'127.0.0.1',()=>console.log('SecondChance running at http://localhost:'+(process.env.PORT||3060)));
})().catch(e=>{console.error(e);process.exit(1);});
