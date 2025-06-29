import React, { useState, useEffect, useRef } from 'react';
import knowledgeBase from '../data/KnowledgeBase.json'; 
import axios from 'axios';
import music from '../assets/ou_music.mp3';

const suggestions = [
  "What is the Fall 2025 deadline?",
  "How much is OU tuition?",
  "Where is the advising office?",
  "Tell me about OU housing options"
];

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [playing, setPlaying] = useState(false);
  const [deletedHistory, setDeletedHistory] = useState({});
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('chat_history')) || [];
    setMessages(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  const formatDate = (date) => new Date(date).toISOString().split('T')[0];

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.timestamp || new Date());
    acc[date] = acc[date] || [];
    acc[date].push(msg);
    return acc;
  }, {});

  const dates = Object.keys(groupedMessages).sort().reverse();
  const selectedMessages = selectedDate && groupedMessages[selectedDate] ? groupedMessages[selectedDate] : [];

  const sendMessage = async (msg = input) => {
    if (typeof msg !== 'string' || !msg.trim()) return;

    const timestamp = new Date();
    const userMessage = { sender: 'user', text: msg, timestamp };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    playMusic();

    const replyText = getAnswerFromKB(msg) || await getGPTFallback(msg);
    const botMessage = { sender: 'bot', text: replyText, timestamp: new Date() };
    setMessages(prev => [...prev, botMessage]);
    speakText(replyText);
    stopMusic();
    setLoading(false);
  };

  const getAnswerFromKB = (msg) => {
    for (const category in knowledgeBase) {
      if (category !== "GPT_Fallback") {
        const questions = knowledgeBase[category];
        for (const key in questions) {
          if (msg.toLowerCase().includes(key.toLowerCase())) {
            return questions[key];
          }
        }
      }
    }
    return null;
  };

  const getGPTFallback = async (msg) => {
  try {
    const res = await axios.post(' https://ouchatbot-backend.onrender.com', {
      message: msg
    });
    return res.data.reply;
  } catch (err) {
    console.error('❌ GPT Fallback Error:', err);
    return "Sorry, I’m having trouble reaching GPT.";
  }
};

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported!');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const playMusic = () => {
    if (audioRef.current && !playing) {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) stopMusic();
    else playMusic();
  };

  const clearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      const grouped = messages.reduce((acc, msg) => {
        const date = formatDate(msg.timestamp || new Date());
        acc[date] = acc[date] || [];
        acc[date].push(msg);
        return acc;
      }, {});
      setDeletedHistory(prev => ({ ...prev, ...grouped }));
      setMessages([]);
      localStorage.removeItem('chat_history');
    }
  };

  const restoreSelectedDateHistory = () => {
    if (deletedHistory[selectedDate]) {
      setMessages(prev => [...prev, ...deletedHistory[selectedDate]]);
      localStorage.setItem('chat_history', JSON.stringify([...messages, ...deletedHistory[selectedDate]]));
      setDeletedHistory(prev => {
        const updated = { ...prev };
        delete updated[selectedDate];
        return updated;
      });
    }
  };

  return (
    <div className="chat-wrapper">
      <audio ref={audioRef} src={music} loop />

      <div className="top-bar">
        <button onClick={() => setHistoryVisible(!historyVisible)}>📜 View Past Chats</button>
        <button onClick={clearChatHistory}>🧹 Clear Chat History</button>
        <button onClick={toggleAudio}>
          {playing ? '🔊 Music ON' : '🔇 Music OFF'}
        </button>
      </div>

      {historyVisible && (
        <div className="chat-box history">
          <label style={{ fontWeight: 'bold' }}>📅 Select Chat Date: </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          {selectedDate && deletedHistory[selectedDate] && (
            <div style={{ marginTop: 10 }}>
              <button onClick={restoreSelectedDateHistory}>♻️ Restore</button>
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            {selectedMessages.length === 0 ? (
              <p>No chat history for selected date.</p>
            ) : (
              selectedMessages.map((msg, i) => (
                <div key={i} className={msg.sender === 'user' ? 'user-msg' : 'bot-msg'}>
                  {msg.text}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={msg.sender === 'user' ? 'user-msg' : 'bot-msg'}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="bot-msg">Typing...</div>}
      </div>

      <div className="suggestions">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => sendMessage(s)}>{s}</button>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          placeholder="Ask me anything about OU..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={() => sendMessage(input)}>Send</button>
        <button onClick={startListening} style={{ backgroundColor: '#007acc' }}>🎤</button>
      </div>
    </div>
  );
};

export default ChatBot;
