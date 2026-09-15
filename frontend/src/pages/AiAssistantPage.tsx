import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '../services/api';
import { ChatMessage, LanguageCode } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Bot, Send, Trash2, Globe, Sparkles,
  User, ShieldAlert, CornerDownLeft, RefreshCw
} from 'lucide-react';

export const AiAssistantPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { addToast } = useNotifications();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions: Record<LanguageCode, string[]> = {
    en: [
      "My wheat leaves are turning yellow. What should I do?",
      "When is the best time to irrigate my field?",
      "What does low soil pH mean and how to fix it?",
      "How can I improve soil fertility organically?",
      "Which crop should I grow in alluvial soil with moderate rainfall?"
    ],
    hi: [
      "मेरी गेहूं की पत्तियां पीली पड़ रही हैं, क्या उपाय करें?",
      "खेत में सिंचाई करने का सबसे सही समय कौन सा है?",
      "मिट्टी का पीएच (pH) कम होने का क्या मतलब है?",
      "जैविक खाद से खेत की उपजाऊ शक्ति कैसे बढ़ाएं?"
    ],
    pa: [
      "ਮੇਰੀ ਕਣਕ ਦੇ ਪੱਤੇ ਪੀਲੇ ਪੈ ਰਹੇ ਹਨ, ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?",
      "ਫਸਲ ਨੂੰ ਪਾਣੀ ਦੇਣ ਦਾ ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ ਕਿਹੜਾ ਹੈ?",
      "ਤੇਜ਼ਾਬੀ ਜਾਂ ਕੱਲਰ ਮਿੱਟੀ ਦਾ ਸੁਧਾਰ ਕਿਵੇਂ ਕਰੀਏ?",
      "ਜ਼ਮੀਨ ਦੀ ਉਪਜਾਊ ਸ਼ਕਤੀ ਵਧਾਉਣ ਲਈ ਦੇਸੀ ਨੁਕਤੇ ਦੱਸੋ।"
    ]
  };

  const fetchHistory = async () => {
    try {
      const history = await chatApi.getHistory();
      setMessages(history);
    } catch (err) {
      console.warn('Could not fetch chat history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      question: textToSend,
      answer: '',
      language: language
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!questionText) setInputText('');
    setLoading(true);

    try {
      const aiResponse = await chatApi.sendMessage(textToSend, language);
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = aiResponse;
        return next;
      });
    } catch (err: any) {
      addToast('error', 'Assistant query failed. Please retry.');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear your chat history?')) return;
    try {
      await chatApi.clearHistory();
      setMessages([]);
      addToast('info', 'Chat history cleared.');
    } catch (err) {
      addToast('error', 'Failed to clear chat history.');
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      
      {/* Top Chat Header */}
      <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-forest-700 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-forest-700/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              AgriSmart Assistant
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[11px] text-slate-400">
              Trilingual Agricultural Advisory System
            </p>
          </div>
        </div>

        {/* Controls: Language Selector & Clear Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-slate-200/60 p-1 text-xs font-semibold">
            {(['en', 'hi', 'pa'] as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg transition uppercase ${
                  language === lang
                    ? 'bg-white text-forest-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            onClick={handleClear}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        
        {messages.length === 0 && (
          <div className="text-center py-12 max-w-xl mx-auto space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mx-auto shadow-sm">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ask AgriSmart Anything</h3>
              <p className="text-xs text-slate-500 mt-1">
                Get quick, authoritative guidance on crop rotation, pest remedies, yellowing foliage, and irrigation windows.
              </p>
            </div>

            {/* Suggested Sample Prompts */}
            <div className="space-y-2 text-left pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                Suggested Questions ({language.toUpperCase()}):
              </span>
              {(sampleQuestions[language] || sampleQuestions.en).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-forest-50/70 border border-slate-200/60 text-xs font-medium text-slate-700 hover:text-forest-800 transition flex items-center justify-between group"
                >
                  <span>"{q}"</span>
                  <Sparkles className="w-3.5 h-3.5 text-slate-300 group-hover:text-forest-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className="space-y-4">
            
            {/* User Message */}
            <div className="flex justify-end gap-2.5">
              <div className="max-w-xl rounded-2xl rounded-tr-sm bg-forest-600 text-white p-3.5 text-xs shadow-sm">
                <p className="leading-relaxed">{m.question}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 font-bold text-slate-700 text-xs">
                <User className="w-4 h-4" />
              </div>
            </div>

            {/* AI Assistant Answer */}
            {m.answer ? (
              <div className="flex justify-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center shrink-0 font-bold text-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-2xl rounded-2xl rounded-tl-sm bg-slate-50 border border-slate-200/80 p-4 text-xs text-slate-800 space-y-3 shadow-sm">
                  <div className="leading-relaxed whitespace-pre-line font-medium">
                    {m.answer}
                  </div>
                  <div className="pt-2 border-t border-slate-200/50 flex items-center gap-1.5 text-[10px] text-amber-700 italic">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>AI Advisory — verify chemical treatments with your local agricultural officer.</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Loading Bubble */
              <div className="flex justify-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-500">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-forest-600" />
                  <span>AgriSmart Assistant is formulating advice...</span>
                </div>
              </div>
            )}

          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask in ${language === 'hi' ? 'हिन्दी' : language === 'pa' ? 'ਪੰਜਾਬੀ' : 'English'}...`}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-3 rounded-2xl bg-forest-600 hover:bg-forest-700 disabled:opacity-40 text-white font-bold transition shadow-md shadow-forest-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
