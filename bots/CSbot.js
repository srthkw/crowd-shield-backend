// No fetch import needed — Node 18+ has fetch built in

const SYSTEM_RULES = `
Respond ONLY in maximum 10 lines, start with small description and then numbered points.
When giving numbered points, ALWAYS put each number on a new line. Example:
1. Do this
2. Do that
3. Next point
Never write "1. do this 2. do that" on the same line.
`;

const KEYS = [
  process.env.API_KEY_1,
  process.env.API_KEY_2,
  process.env.API_KEY_3
];

let index = 0;

function getKey() {
  const key = KEYS[index];
  index = (index + 1) % KEYS.length;
  return key;
}

function cleanText(text) {
  return text
    // Remove AI disclaimers
    .replace(/I am an AI[\s\S]*$/i, "")

    // Remove bold/italic markdown
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/__/g, "")
    .replace(/_/g, "")
    .replace(/`/g, "")

    // Convert markdown headings to uppercase
    .replace(/^### (.*)$/gm, (_, t) => t.toUpperCase())
    .replace(/^## (.*)$/gm, (_, t) => t.toUpperCase())
    .replace(/^# (.*)$/gm, (_, t) => t.toUpperCase())

    // Ensure numbered points always start on a new line
    .replace(/(\d+)\.\s+/g, "\n$1. ")


    // Replace markdown bullets with nice dots
    .replace(/^\s*-\s+/gm, "• ")
    .replace(/^\s*\*\s+/gm, "• ")
    .replace(/^\s*\+\s+/gm, "• ")

    // Fix multiple line breaks
    .replace(/\n{3,}/g, "\n\n")

    // Trim ugly spaces
    .trim();
}

async function ask(question) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${getKey()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: [
          { role: "system", content: SYSTEM_RULES },
          { role: "user", content: question || "" }
        ]
      })
    });

    const data = await response.json();

    // 🔍 If API returned an error object
    if (data.error) {
      console.error("OpenRouter API Error:", data.error);
      return "Bot error: " + data.error.message;
    }

    // 🔍 If choices doesn't exist
    if (!data.choices || !data.choices[0]) {
      console.error("Invalid LLM response:", data);
      return "Bot error: Invalid model response.";
    }

    // 🔍 SAFE return now
    const raw = data.choices[0].message.content;
    return cleanText(raw);

  } catch (err) {
    console.error("CSbot error:", err);
    return "Server error.";
  }
}

module.exports = { ask };