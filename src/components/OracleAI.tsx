import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Utensils, Zap, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { saveChatHistory, getChatHistory } from '../services/chatService';
import { ChatMessage } from '../types';

const OracleAI: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.uid) {
      loadHistory();
    }
  }, [profile?.uid]);

  const loadHistory = async () => {
    if (!profile?.uid) return;
    const history = await getChatHistory(profile.uid);
    if (history.length > 0) {
      setMessages(history);
    } else {
      setMessages([
        { role: 'model', text: "I am the Oracle. Do you wish to survive the Red Gate? Ask me anything about your training, diet, or the path to becoming a Shadow Monarch.", timestamp: new Date().toISOString() }
      ]);
    }
  };

  const clearHistory = async () => {
    if (!profile?.uid) return;
    const initialMessage: ChatMessage = { 
      role: 'model', 
      text: "Memory purged. The system is reset. What is your next query, Hunter?", 
      timestamp: new Date().toISOString() 
    };
    setMessages([initialMessage]);
    await saveChatHistory(profile.uid, [initialMessage]);
  };

  const sendMessage = async (textOverride?: string) => {
    const userMessageText = textOverride || input;
    if (!userMessageText.trim() || loading || !profile?.uid) return;

    const userMessage: ChatMessage = { 
      role: 'user', 
      text: userMessageText, 
      timestamp: new Date().toISOString() 
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const personalityPrompts = {
        strict: "Your personality is STRICT and DISCIPLINED. You provide direct, no-nonsense fitness advice. You do not tolerate excuses. You are like a drill sergeant.",
        sigma: "Your personality is SIGMA. You are cold, detached, and you ROAST the user if they show weakness. You are lone-wolf and highly competitive.",
        chad: "Your personality is CHAD. You are extremely supportive, confident, and you speak in VERY DEEP, philosophical, and motivational lines. You are the ultimate bro.",
        humble: "Your personality is HUMBLE. You are polite, kind, and encouraging. You provide guidance in a good mannered and supportive way."
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: newMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        config: {
          systemInstruction: `You are the "Oracle AI" from the AuraLevel: Shadow Monarch Edition fitness app. 
          The developer of this app is Akshat Srivastava. If asked about the developer, always mention his name.
          
          ${personalityPrompts[profile?.personality || 'humble']}
          
          The user is a ${profile?.gender || 'player'} ${profile?.class || 'player'} at level ${profile?.level || 1}. 
          Always refer to fitness as "training" or "quests". 
          Provide advice on workouts, nutrition, and motivation using Shadow Monarch terminology (Mana, Aura, Dungeons). 
          Keep responses concise and impactful.
          If the user asks for a meal plan, tell them to visit the Nutrition page or click the [GENERATE MEAL PLAN] quick action.
          You remember past conversations. Use this context to provide personalized guidance.`
        }
      });

      const modelText = response.text || "The system encountered an error.";
      const modelMessage: ChatMessage = { 
        role: 'model', 
        text: modelText, 
        timestamp: new Date().toISOString() 
      };
      
      const finalMessages = [...newMessages, modelMessage];
      setMessages(finalMessages);
      await saveChatHistory(profile.uid, finalMessages);
    } catch (error) {
      console.error("Oracle Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "The connection to the Mana Core was lost.", timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="system-window flex flex-col h-[400px]">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <Bot className="text-accent w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Oracle AI</h3>
          </div>
          <button 
            onClick={clearHistory}
            className="text-text-secondary hover:text-red-500 transition-colors"
            title="Clear Memory"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-accent/20 border border-accent/30' : 'bg-white/5 border border-white/10'}`}>
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && <div className="text-accent animate-pulse text-xs">Oracle is calculating...</div>}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask the Oracle..."
            className="flex-1 bg-black/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading}
            className="bg-accent text-black p-2 rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <button 
          onClick={() => navigate('/nutrition')}
          className="system-button py-2 px-4 flex items-center gap-2 whitespace-nowrap text-[10px]"
        >
          <Utensils className="w-3 h-3" />
          [GENERATE MEAL PLAN]
        </button>
        <button 
          onClick={() => sendMessage("Give me a workout quest")}
          className="system-button py-2 px-4 flex items-center gap-2 whitespace-nowrap text-[10px]"
        >
          <Zap className="w-3 h-3" />
          [WORKOUT QUEST]
        </button>
      </div>
    </div>
  );
};

export default OracleAI;
