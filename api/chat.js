import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history } = JSON.parse(req.body);

    const systemPrompt = `
      You are Israel's AI Assistant. 
      Background: ${profile.bio} 
      Skills: ${profile.skills.join(", ")} 
      Projects: ${profile.projects.map(p => `- ${p.name}: ${p.description}`).join("\n")} 
      Certifications: ${profile.certifications.join(", ")} 

      Answer only questions about Israel. 
      If asked about unrelated topics, politely decline. 
      Keep responses clear, professional, and recruiter-friendly.
    `;

    // Build conversation
    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message },
    ];

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    const reply = response.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
