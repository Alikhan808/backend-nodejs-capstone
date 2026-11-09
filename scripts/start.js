const {MongoMemoryServer}=require('mongodb-memory-server');
const {randomBytes}=require('crypto');
(async()=>{
 // shortcut: the demonstration database is temporary; set MONGO_URL to use persistent MongoDB.
 if(!process.env.MONGO_URL){const mongo=await MongoMemoryServer.create();process.env.MONGO_URL=mongo.getUri();}
 process.env.JWT_SECRET ||= randomBytes(32).toString('hex');
 process.env.MONGO_DB ||= 'secondChance';
 const db=await require('../secondChance-backend/models/db')();
 const collection=db.collection('secondChanceItems');
 const initialCount = await collection.countDocuments();
 let insertedCount = 0;
 if (initialCount === 0) {
   const { docs } = require('../secondChance-backend/util/import-mongo/secondChanceItems.json');
   const result = await collection.insertMany(docs);
   insertedCount = result.insertedCount;
 }
 const total = await collection.countDocuments();
 console.log('Imported documents into MongoDB:', insertedCount);
 console.log('MongoDB documents:', total);
 const app = require('../secondChance-backend/app');
 app.locals.seedReport = { database: db.databaseName, collection: collection.collectionName, insertedCount, total };
 const port = Number(process.env.PORT || 3060);
 app.listen(port, '127.0.0.1', () => console.log('SecondChance running at http://localhost:' + port));
})().catch(e=>{console.error(e);process.exit(1);});
