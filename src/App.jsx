import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'; // To generate unique session IDs

// --- Backend API Configuration ---
const API_BASE_URL = 'http://localhost:5001';

// --- Helper Icons ---
const BotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2"/><path d="M12 18v2"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
const MicIcon = ({ isListening }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 ${isListening ? 'text-red-500' : ''}`}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
const VolumeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>;

// --- Main App Component ---
export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isListening, setIsListening] = useState(false);
  
  const chatEndRef = useRef(null);

  const hiringServices = {
    "Tech Startup Hiring Pack": "Perfect for early-stage startups needing to build a core technical team quickly. Includes sourcing, screening, and coordinating interviews for up to 3 technical roles.",
    "Executive Search": "A dedicated search for C-level and leadership roles. We leverage our network to find the best talent to lead your company.",
    "Contract Staffing": "Ideal for temporary projects or filling skill gaps without long-term commitment. We provide vetted contractors for specific durations.",
    "General Recruitment": "Our standard package for individual hires across various non-technical domains like marketing, sales, and operations."
  };

  // Effect to manage session ID
  useEffect(() => {
    let currentSessionId = localStorage.getItem('chatSessionId');
    if (!currentSessionId) {
      currentSessionId = uuidv4();
      localStorage.setItem('chatSessionId', currentSessionId);
    }
    setSessionId(currentSessionId);
  }, []);

  // Effect to load initial data when session is ready
  useEffect(() => {
    if (sessionId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch chat history
          const historyRes = await fetch(`${API_BASE_URL}/history/${sessionId}`);
          const historyData = await historyRes.json();
          setMessages(historyData);

          // Fetch extracted data
          const dataRes = await fetch(`${API_BASE_URL}/data/${sessionId}`);
          const extractedInfo = await dataRes.json();
          setExtractedData(extractedInfo);

        } catch (error) {
          console.error("Failed to fetch initial data:", error);
          // Display an error message in the chat
          setMessages([{
            id: 'error-init',
            role: 'model',
            text: 'Could not connect to the backend. Please ensure it is running and try refreshing the page.'
          }]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [sessionId]);

  // Effect to scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || isLoading) return;

    const userInput = input;
    setInput('');
    
    // Optimistically update UI with user's message
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userInput }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId, message: userInput })
      });

      if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
      
      const result = await response.json();

      // Add the new model response to the chat
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'model', text: result.response }]);
      setExtractedData(result.extractedData);

    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'model',
        text: "I'm having trouble connecting to the server. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

    const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    if (!recognition) {
        alert("Speech recognition is not supported in your browser.");
        return;
    }
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
    };
    
    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setInput(speechResult);
    };

    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) {
        alert("Text-to-speech is not supported in your browser.");
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };
  
  const getRecommendedService = () => {
      if (!extractedData || !extractedData.roles || extractedData.roles.length === 0) {
          return null;
      }
      const roles = extractedData.roles.map(r => r.role.toLowerCase());
      const industry = extractedData.industry ? extractedData.industry.toLowerCase() : '';

      if (industry.includes('tech') || industry.includes('startup') || roles.some(r => r.includes('engineer') || r.includes('developer') || r.includes('designer'))) {
          return "Tech Startup Hiring Pack";
      }
      if (roles.some(r => r.includes('executive') || r.includes('manager') || r.includes('director') || r.includes('c-level'))) {
          return "Executive Search";
      }
      return "General Recruitment";
  }

  const recommendedService = getRecommendedService();

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-800 p-4 shadow-md z-10 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-100">AI Sales Agent - RecruitGenie</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {messages.map((msg, index) => (
              <div key={msg.id || index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && <div className="bg-blue-600 p-2 rounded-full"><BotIcon /></div>}
                <div className={`max-w-xl p-4 rounded-2xl shadow-lg ${msg.role === 'user' ? 'bg-gray-700 rounded-br-none' : 'bg-gray-800 rounded-bl-none'}`}>
                  <p className="text-md whitespace-pre-wrap">{msg.text}</p>
                   {msg.role === 'model' && msg.text && (
                    <button onClick={() => speakText(msg.text)} className="mt-2 text-gray-400 hover:text-white transition-colors">
                        <VolumeIcon />
                    </button>
                  )}
                </div>
                {msg.role === 'user' && <div className="bg-teal-600 p-2 rounded-full"><UserIcon /></div>}
              </div>
            ))}
            {isLoading && messages[messages.length-1]?.role === 'user' && (
              <div className="flex items-start gap-4">
                 <div className="bg-blue-600 p-2 rounded-full"><BotIcon /></div>
                <div className="max-w-xl p-4 rounded-2xl bg-gray-800 rounded-bl-none animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            )}
             <div ref={chatEndRef} />
          </div>
        </main>

        <footer className="bg-gray-800 border-t border-gray-700 p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
             <button type="button" onClick={handleVoiceInput} className="p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                <MicIcon isListening={isListening} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your hiring needs..."
              className="flex-1 bg-gray-700 text-white rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <SendIcon />
            </button>
          </form>
        </footer>
      </div>

      {/* Side Panel for Extracted Data */}
      <div className="w-1/3 bg-gray-900 border-l border-gray-700 flex flex-col p-6 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-200 border-b border-gray-700 pb-2">Hiring Profile</h2>
        {extractedData ? (
          <div className="space-y-4 text-gray-300 flex-1">
            <div>
              <h3 className="font-semibold text-lg text-blue-400">Industry</h3>
              <p className="mt-1 text-md bg-gray-800 p-2 rounded-md">{extractedData.industry || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-blue-400">Location</h3>
              <p className="mt-1 text-md bg-gray-800 p-2 rounded-md">{extractedData.location || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-blue-400">Roles</h3>
              {extractedData.roles && extractedData.roles.length > 0 ? (
                <ul className="space-y-2 mt-1">
                  {extractedData.roles.map((r, i) => (
                    <li key={i} className="bg-gray-800 p-2 rounded-md flex justify-between">
                      <span>{r.role}</span>
                      <span className="font-bold text-blue-400">{r.count}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-1 text-md bg-gray-800 p-2 rounded-md">No roles specified</p>}
            </div>
             <div>
              <h3 className="font-semibold text-lg text-blue-400">Urgency</h3>
              <p className="mt-1 text-md bg-gray-800 p-2 rounded-md capitalize">{extractedData.urgency || 'Not specified'}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Data will be extracted here as you chat.</p>
          </div>
        )}

        {recommendedService && (
            <div className="mt-6 border-t border-gray-700 pt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-200">Recommended Service</h2>
                <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-lg text-white">{recommendedService}</h3>
                    <p className="text-sm text-blue-100 mt-1">{hiringServices[recommendedService]}</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}