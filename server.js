import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
// import fetch from "node-fetch"; // not needed on Node 18+ / v22

dotenv.config();
const app = express();

app.get("/api/agg/:ticker", async (req, res) => {
  const { ticker } = req.params;
  const { start, end } = req.query;

  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${start}/${end}?apiKey=${process.env.POLYGON_API_KEY}`;
  try {
    const r = await fetch(url);
    const text = await r.text(); // or await r.json()
    res.status(r.status).send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = 3001;
app.listen(port, () => console.log(`API server on http://localhost:${port}`));


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/report", express.json(), async (req, res) => {
  try {
    const messages = req.body.messages;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 1.1
    });
    res.json(response.choices[0].message);
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: err.message });
  }
});
