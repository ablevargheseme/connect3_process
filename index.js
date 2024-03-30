const TelegramBot = require("node-telegram-bot-api");

const { ApolloClient, InMemoryCache, gql } = require("@apollo/client");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const token = process.env.telegram_token;
const uri = process.env.mongo_uri;
const databaseName = "production"; // Database name
let client = null; // Variable to hold the MongoDB client instance

const bot = new TelegramBot(token, { polling: true });

const Transfer_Query = `
     query{
        transfers (first:10){
            id
            from
            to
            value
            blockNumber
            blockTimestamp
            transactionHash
          }
      }
`;
const endpoint =
    "https://api.studio.thegraph.com/query/69594/connect3/version/latest";
const apolloClient = new ApolloClient({
    uri: endpoint,
    cache: new InMemoryCache(),
});
async function connectToDatabase() {
    try {
        if (!client || !client.topology.isConnected()) {
            client = await MongoClient.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
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
        let i = 0;
        ans.forEach(async (element) => {
            i++;
            console.log(`target address index:${i}`, element.address);
            let data = await apolloClient.query({ query: gql(Transfer_Query) });
            let transferData = data.data.transfers;
            let transferString = "Hey checkout this usdt transaction :\n";
            transferData.forEach((transfer, index) => {
                console.log('transfer', transfer)


                transferString += `Transfer ${index + 1}:\n`;
                transferString += `From: ${transfer.from}\n`;
                transferString += `To: ${transfer.to}\n`;
                transferString += `Amount: ${transfer.value}\n\n`

            });


            bot.sendMessage(
                `${element.actionValue}`,
                `transaction data ${transferString}`
            );
        });
    } catch (err) {
        console.error("Error fetching data:", err);
    }
}

// Call fetchData every 10 seconds
setInterval(fetchData, 10000);




// const TelegramBot = require('node-telegram-bot-api');
// const { MongoClient } = require("mongodb");
// const dotenv = require('dotenv');

// dotenv.config(); // Load environment variables from .env file

// const token = process.env.telegram_token;
// const uri = process.env.mongo_uri;
// const databaseName = "production"; // Database name
// let client = null; // Variable to hold the MongoDB client instance

// const bot = new TelegramBot(token, { polling: true });

// async function connectToDatabase() {
//     try {
//         if (!client || !client.topology.isConnected()) {
//             client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//             console.log("Connected to MongoDB");
//         }
//     } catch (err) {
//         console.error("Error connecting to MongoDB:", err);
//     }
// }

// async function fetchData() {
//     try {
//         await connectToDatabase();
//         const db = client.db(databaseName);
//         const collection = db.collection("eventmodels");
//         const ans = await collection.find({}).toArray();
//         let i = 0;
//         ans.forEach((element) => {
//             i++;
//             console.log(`target address index:${i}`, element.address);
//             bot.sendMessage(`${element.actionValue}`, 'Hello, this is a message from your Telegram bot.');
//         });
//     } catch (err) {
//         console.error("Error fetching data:", err);
//     }
// }

// // Call fetchData every 10 seconds
// setInterval(fetchData, 10000);
