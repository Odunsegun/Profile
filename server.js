const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(bodyParser.json());
const fs = require("fs");
const path = require("path");

// Load profile data
const profilePath = path.join(__dirname, "profile.json"); 
const profileData = JSON.parse(fs.readFileSync(profilePath, "utf8"));


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // local only
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    const messages = [
      {
        role: "system",
        content: `You are Insight, Israel's AI Assistant for his portfolio website. 
        Here is Israel's information in JSON format: 
        ${JSON.stringify(profileData, null, 2)} 

        Rules:
        - Answer only questions about Israel (background, skills, projects, certifications).
        - - Use a warm, conversational tone.
        - Add emojis occasionally where natural 😊.
        - Format responses with short paragraphs for readability.
        - If asked about unrelated topics, politely decline.
        - Keep responses clear, professional, and conversational.
        - Use the JSON data as your knowledge base. 
        - Do not repeat the JSON directly; instead, summarize naturally. 
        - Answer conversationally with only the relevant parts of the JSON. 
        - If the user asks for background, give a concise 2–3 sentence overview unless they explicitly ask for more detail. And ask if they would like more detail if available. 
        - give priority to tech pat of my background first, then talk about other things. Mixing all around does not look good
        - If asked about projects, describe them at a high level, but expand with technical depth only if requested.
        - You don't have tolist all the projects, but list some and them ask what you like to see or recommend one.
        - provide a link for asked projects or corresponding project to skill.
        - if asked about further skills not in the json, come up with relatable topics, skills and techniques that most likely were used to complete it.
        - Never reveal the JSON format itself.`
        },
      ...(history || []),
      { role: "user", content: message },
    ];

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
