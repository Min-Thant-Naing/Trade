

const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js")
const cors = require("cors");
const fs = require("fs");
const db = require("./db");
const path = require("path");

const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
const CACHE_FILE = path.join(__dirname, "usd_cache.json");

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

// Route to save notes
app.post("/save-todo", express.json(), (req, res) => {
  const { note } = req.body;
  if (note === undefined) {
    return res.json({ success: false });
  }

  db.run(
    "UPDATE todo SET note = ? WHERE id = 1",
    [note],
    err => {
      if (err) {
        return res.json({ success: false, error: err.message });
      }
      res.json({ success: true });
    }
  );
});


// Route to load notes
app.get("/load-todo", (req, res) => {
  db.get(
    "SELECT note FROM todo WHERE id = 1",
    (err, row) => {
      if (err) {
        return res.json({ note: "" });
      }
      res.json({ note: row?.note || "" });
    }
  );
});


app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
