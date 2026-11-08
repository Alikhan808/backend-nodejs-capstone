require('dotenv').config();
const { MongoClient } = require('mongodb');
let connection;
let client;
async function connectToDatabase() {
  if (!connection) {
    connection = (async () => {
      client = new MongoClient(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017');
      await client.connect();
      return client.db(process.env.MONGO_DB || 'secondChance');
    })().catch(error => { connection = null; throw error; });
  }
  return connection;
}
module.exports = connectToDatabase;

module.exports.close = async () => { if (client) await client.close(); connection = null; };
