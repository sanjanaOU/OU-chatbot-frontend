# Ask OU Chat – Chatbot Frontend

A beautiful, interactive, and voice-enabled chatbot interface for the University of Oklahoma. This chatbot can answer questions about tuition, deadlines, housing, advising, and more – using both a local knowledge base and an LLM fallback (LLaMA 3 via Ollama).

![OU Chat UI](./preview.png)

##  Features

- 💬 Chat UI with assistant + user messages
- 📅 Chat history filtering by date
- 🔊 Voice-to-text input (🎤 mic)
- 🎶 Typing background music toggle
- 💡 Smart suggestions for FAQs
- 🧠 Uses local knowledge base first
- 🤖 Fallback to LLaMA 3 (via backend)
- 💾 Persistent local storage for chats
- ♻️ Chat history restore per date

## Project Structure
ou-chatbot-frontend/
├── public/
├── src/
│ ├── assets/ # Music and images
│ ├── components/
│ │ └── ChatBot.jsx # Main chatbot UI
│ ├── data/
│ │ └── KnowledgeBase.json
│ └── App.js # Entry point
├── .env
├── package.json
└── README.md

1. ## Setup Instructions
npm install

2. ## Backend Required
http://localhost:5000/chat

3. ## Run Locally
   npm run dev

Create a .env in root if needed : VITE_BACKEND_URL=http://localhost:5000
Then in frontend code:
const baseURL = import.meta.env.VITE_BACKEND_URL;

Frontend will be available at: http://localhost:5173


### Dependencies
React
Axios
Vite
Tailwind CSS (or your custom styles)
Web Speech API (voice input + speech synthesis)


