const TelegramBot = require("node-telegram-bot-api");

import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const token = process.env.telegram_token;
const uri = process.env.mongo_uri;
const databaseName = "production"; // Database name
let client = null; // Variable to hold the MongoDB client instance

const bot = new TelegramBot(token, { polling: true });

export const Transfer_Query = `
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
      let data = await client.query({ query: gql(Transfer_Query) });
      bot.sendMessage(
        `${element.actionValue}`,
        "Hello, this is a message from your Telegram bot."
      );
    });
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

// Call fetchData every 10 seconds
setInterval(fetchData, 10000);
