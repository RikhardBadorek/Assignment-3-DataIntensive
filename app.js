const {MongoClient, ObjectId} = require('mongodb');

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
}); //https://www.w3schools.com/nodejs/nodejs_readline.asp

const restoreData = require('./restoreData');

const DB1_URI = "mongodb+srv://rikhard:fitnessDB1@fitnessdb1.3bhrtlr.mongodb.net";
const DB2_URI = "mongodb+srv://rikhard:fitnessDB1@fitnessdb2.3bhrtlr.mongodb.net";
const DB3_URI = "mongodb+srv://rikhard:fitnessDB1@fitnessdb3.3bhrtlr.mongodb.net";

const dbCollections = [
    "users",
    "trainers",
    "workouts",
    "memberships",
    "sessions"
]

function askQuestion(query) {
    return new Promise(resolve => {
        rl.question(query, resolve);
    })
        //https://www.w3schools.com/nodejs/nodejs_readline.asp
        // used this nested questions in the while loop
}

async function main() {
    let dbChoice = '';

    while(dbChoice !== '0') {
        console.log("Databases:");
        console.log("1: fitnessDB1");
        console.log("2: fitnessDB2");
        console.log("3: fitnessDB3");
        

        dbChoice = await askQuestion("Select database (1, 2, 3, 4 to restore data or 0 to end): ");

        if (dbChoice === '0') {
            console.log("Exiting...");
            break;
        }

        if (dbChoice === '4') {
            await restoreData();
            console.log("Data restored.");
            continue;
        }

        let uri;
        switch (dbChoice) {
            case '1': 
                uri = DB1_URI; 
                break;
            case '2': 
                uri = DB2_URI; 
                break;
            case '3': 
                uri = DB3_URI; 
                break;
            default:
                console.log("Invalid choice");
                continue;
        }
    

        const client = new MongoClient(uri);

        try {
            await client.connect();
            let dbName;
            if (dbChoice === '1') {
                dbName = "fitnessDB1";
            } else if (dbChoice === '2') {
                dbName = "fitnessDB2";
            } else if (dbChoice === '3') {
                dbName = "fitnessDB3";
            }

            const db = client.db(dbName);
            console.log(`Connected to database: ${dbChoice}`);

            console.log("\nCollections:");

            dbCollections.forEach((col, index) => console.log(`${index + 1}. ${col}`));

            const colChoice = await askQuestion("Select collection (1-5): ");
            const colIndex = parseInt(colChoice) - 1;

            if (colIndex < 0 || colIndex >= dbCollections.length) {
                console.log("Invalid collection choice");
                await client.close();
                continue;
            }

            const selectedCollection = db.collection(dbCollections[colIndex]);

            const action = await askQuestion("Print (1) or Update (2) documents? ");
            if (action === '1') {
                const docs = await selectedCollection.find({}).toArray();
                console.table(docs);
                //https://developer.mozilla.org/en-US/docs/Web/API/console/table_statichttps://developer.mozilla.org/en-US/docs/Web/API/console/table_static
            } else if (action === '2') {
                const docId = await askQuestion("Enter document ID to update: ");
                const field = await askQuestion("Enter field to update: ");
                const newValue = await askQuestion("Enter new value: ");

                const query = { _id: new ObjectId(docId) };
                const update = { $set: { [field]: newValue } };
                await selectedCollection.updateOne(query, update);
                console.log("Document updated");
            } else {
                console.log("Invalid action.");
            }
        } catch (err) {
            console.error(err);
        } 

    }
    rl.close();
}
main();