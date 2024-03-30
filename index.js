const TelegramBot = require('node-telegram-bot-api');
const token = '';
const bot = new TelegramBot(token, { polling: true });



const { MongoClient } = require("mongodb");

const uri = '';
const databaseName = "production";  // Database name 
let client = null; // Variable to hold the MongoDB client instance

async function connectToDatabase() {
    try {
        if (!client || !client.topology.isConnected()) {
            client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log("Connected to MongoDB");
        }
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}

async function fetchData() {
    try {
        await connectToDatabase();
        const db = client.db(databaseName);
        const collection = db.collection("eventmodels");
        const ans = await collection.find({}).toArray();
        let i = 0
        ans.forEach((element) => {
            i++;
            console.log(`target address index:${i}`, element.address);

            bot.sendMessage(`${element.actionValue}`, 'Hello, this is a message from your Telegram bot.');
        });
        //send message


    } catch (err) {
        console.error("Error fetching data:", err);
    }
}

// Call fetchData every 10 seconds
setInterval(fetchData, 10000);
