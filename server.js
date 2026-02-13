
import { fileURLToPath } from "url";
import express from "express";
import axios from "axios";
import xml2js from "xml2js";
import cors from "cors";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const BASE_URL = "https://demo.tradelocker.com/backend-api";
const EMAIL = "minthantnaing414@gmail.com";
const PASSWORD = "&/dYD3WtN|";
const SERVER = "HEROFX";

let cachedToken = null;
let cachedAccountId = null;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
const CACHE_FILE = path.join(__dirname, "usd_cache.json");
const TRADES_CACHE_FILE = path.join(__dirname, "orders_history.json");

async function login() {
    const res = await fetch(`${BASE_URL}/auth/jwt/token`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD, server: SERVER })
    });
    const data = await res.json();
    cachedToken = data.accessToken;
}

async function getAccount() {
    const res = await fetch(`${BASE_URL}/auth/jwt/all-accounts`, {
        headers: { 
            Authorization: `Bearer ${cachedToken}`,
            "accNum": "1",
            "accept": "application/json"
        }
    });
    const data = await res.json();
    // console.log(data);

    cachedAccountId = data.accounts[0].id;
}

app.get("/calendar", async (req, res) => {
  try {
    const rssUrl = "https://nfs.faireconomy.media/ff_calendar_thisweek.xml";
    const response = await axios.get(rssUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false });
    const events = parsed.weeklyevents?.event || [];
    const usdEvents = events.filter(ev => ev.country === "USD" || ev.country?.[0] === "USD");
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ weeklyevents: { event: usdEvents } }, null, 2));
    console.log("Now i am at try");
    return res.json(usdEvents);
  } catch (err) {
    if (fs.existsSync(CACHE_FILE)) {
      const fileData = fs.readFileSync(CACHE_FILE, "utf-8");
      const parsedFile = JSON.parse(fileData);
      const allEvents = parsedFile.weeklyevents?.event || [];
      console.log("Now i am at catch");
      return res.json(allEvents);
    } else {
      console.log("No cache file found");
      return res.json([]);
    }
  }
});

app.get("/trades", async (req, res) => {
    try {
        if (!cachedToken) await login();
        if (!cachedAccountId) await getAccount();

        const historyUrl = `${BASE_URL}/trade/accounts/${cachedAccountId}/ordersHistory`;
        const tradeRes = await fetch(historyUrl, {
            headers: {
                "accept": "application/json",
                Authorization: `Bearer ${cachedToken}`,
                "accNum": "1"
            }
        });

        const tradeData = await tradeRes.json();
        const ordersHistory = tradeData.d.ordersHistory;

        // Save to local file for future offline use
        fs.writeFileSync(TRADES_CACHE_FILE, JSON.stringify(ordersHistory, null, 2));
        
        console.log("Trades loaded from API and cached.");
        return res.json(ordersHistory);
        
    } catch (err) {
        console.error("API Error, attempting to load cache:", err.message);

        // Check if the backup file exists
        if (fs.existsSync(TRADES_CACHE_FILE)) {
            const fileData = fs.readFileSync(TRADES_CACHE_FILE, "utf-8");
            const cachedOrders = JSON.parse(fileData);
            
            console.log("Trades loaded from local cache (orders_history.json)");
            return res.json(cachedOrders);
        } else {
            console.log("No trades cache file found.");
            return res.status(500).json({ error: "API failed and no cache available." });
        }
    }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
