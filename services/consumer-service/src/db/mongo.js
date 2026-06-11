const { MongoClient } = require('mongodb')

const client = new MongoClient('mongodb://localhost:27017')

let db

const connectMongo = async () => {
  await client.connect()
  db = client.db('activityfeed')
  console.log('MongoDB connected')
}

const getFeedsCollection = () => db.collection('feeds')

module.exports = { connectMongo, getFeedsCollection }