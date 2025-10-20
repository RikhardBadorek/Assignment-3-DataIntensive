const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')

const uris = {
  fitnessDB1: "mongodb+srv://rikhard:fitnessDB1@fitnessdb1.3bhrtlr.mongodb.net",
  fitnessDB2: "mongodb+srv://rikhard:fitnessDB1@fitnessdb2.3bhrtlr.mongodb.net",
  fitnessDB3: "mongodb+srv://rikhard:fitnessDB1@fitnessdb3.3bhrtlr.mongodb.net"
}

const collections = ["memberships", "trainers", "workouts", "sessions", "users"]

//https://www.codevertiser.com/import-json-file-to-mongodb-using-nodejs/

async function importCollection(db, collectionName, filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"))
  const collection = db.collection(collectionName)
  await collection.deleteMany({});
  await collection.insertMany(data)
}

async function main() {
  for (const [dbName, uri] of Object.entries(uris)) {

    const client = new MongoClient(uri)
    
    try {
      await client.connect()
      const db = client.db(dbName)
      for (const col of collections) {
        const filePath = path.join(__dirname, "data", dbName, col + ".json")
        await importCollection(db, col, filePath)
      }
    } catch (err) {
      console.error(err)
    } finally {
      await client.close()
    }
  }
}

module.exports = main;
