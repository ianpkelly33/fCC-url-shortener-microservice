require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://ianpk33:3665ipk1077TERRA!@cluster0.rmpgpos.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dns = require("dns");
const urlParser = require("url");
const client = new MongoClient(uri);
const db = client.db("urlShortener");
const urls = db.collection("urls");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  const dnsLookup = dns.lookup(urlParser.parse(url).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: "Invalid URL" });
    } else {
      const urlCount = await urls.countDocuments({});
      const urlDoc = {
        url,
        short_url: urlCount
      };
      const result = await urls.insertOne(urlDoc);
      res.json({
        original_url: url,
        short_url: urlCount
      });
    };
  });
});

app.get("/api/shortUrl/:short_url", async (req, res) => {
  const shortUrl = req.params.short_url;
  const urlDoc = await urls.findOne({ short_url: +shortUrl });
  res.redirect(urlDoc.url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
