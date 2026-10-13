import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { askGemini } from '../services/gemini';
import { Restaurant } from '../types';
import { renderMarkdown } from '../utils/renderMarkdown';

interface GeminiInsightsTabProps {
  restaurants: Restaurant[];
}

export const GeminiInsightsTab: React.FC<GeminiInsightsTabProps> = ({ restaurants }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const autoFired = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'gemini'; text: string }>>([
    {
      role: 'gemini',
      text: "👋 I am your **Gemini 2.5 Flash DVSMA Analytics Assistant** — loaded with your **Mumbai restaurant dataset**.\n\nGenerating your **automatic sentiment overview** now...",
    },
  ]);

  const quickPrompts = [
    "Which Mumbai areas have the highest negative sentiment?",
    "Compare customer sentiment: South Indian vs Seafood cuisines.",
    "What key phrases most strongly predict 5-star ratings?",
    "Summarize overall customer satisfaction across all restaurants.",
    "Which cuisine type has the best food quality scores?",
    "What are the most common complaints in expensive restaurants?",
  ];

  // Build system context from live dataset stats
  const buildSystemPrompt = () => {
    const total = restaurants.length || 1;
    const posPct = ((restaurants.filter(r => r.sentiment_label === 'Positive').length / total) * 100).toFixed(1);
    const negPct = ((restaurants.filter(r => r.sentiment_label === 'Negative').length / total) * 100).toFixed(1);
    const neuPct = ((restaurants.filter(r => r.sentiment_label === 'Neutral').length / total) * 100).toFixed(1);
    const avgRating = (restaurants.reduce((s, r) => s + (Number(r.rating) || 0), 0) / total).toFixed(2);
    const areas = new Set(restaurants.map(r => r.area)).size;
    const cuisines = new Set(restaurants.map(r => r.cuisine_type)).size;
    return `You are an expert Data Visualization & Sentiment Media Analytics (DVSMA) analyst for a Mumbai restaurant research project.
Dataset: ${total} Mumbai restaurants across ${areas} neighborhoods, ${cuisines} cuisine types.
Sentiment distribution: ${posPct}% Positive, ${neuPct}% Neutral, ${negPct}% Negative.
Average rating: ${avgRating}/5.
Key positive drivers: delicious taste, courteous staff, quick service, clean ambience, authentic flavors.
Key negative drivers: cold food, rude behavior, dirty utensils, overpriced, long wait time.
Always respond with structured, insightful markdown answers relevant to restaurant sentiment analysis and DVSMA.`;
  };

  // Auto-fire a DVSMA overview the first time this tab mounts with data
  useEffect(() => {
    if (autoFired.current || restaurants.length === 0) return;
    autoFired.current = true;
    const autoPrompt = `Give me a comprehensive DVSMA (Data Visualization & Sentiment Media Analytics) overview of this Mumbai restaurant dataset. Include:
1. Overall sentiment distribution and what it means
2. Top performing cuisine types by average rating
3. Key positive and negative comment drivers (XAI token attribution)
4. Areas with highest vs lowest customer satisfaction
5. 3 actionable insights for restaurant owners based on this data

Format with clear markdown headings and bullet points.`;

    setLoading(true);
    askGemini(autoPrompt, buildSystemPrompt())
      .then(response => {
        setConversation(prev => [...prev, { role: 'gemini', text: response }]);
      })
      .catch(err => {
        setConversation(prev => [...prev, { role: 'gemini', text: `Auto-analysis error: ${err.message}` }]);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurants.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, loading]);

  const handleSend = async (userPrompt?: string) => {
    const textToSend = userPrompt || query;
    if (!textToSend.trim() || loading) return;

    setConversation(prev => [...prev, { role: 'user', text: textToSend }]);
    setQuery('');
    setLoading(true);

    try {
      const response = await askGemini(textToSend, buildSystemPrompt());
      setConversation(prev => [...prev, { role: 'gemini', text: response }]);
    } catch (err: any) {
      setConversation(prev => [...prev, { role: 'gemini', text: `Error calling Gemini: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '0 20px 24px 20px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)' }}>
              <Bot size={22} color="#ffffff" />
            </div>
            <div>
              <h2 className="font-heading" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                Gemini 2.5 Flash <span className="gradient-text">DVSMA AI Copilot</span>
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Auto-analysis on open · Natural language Q&A over Mumbai restaurant records
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
            Gemini API Connected
          </div>
        </div>

        {/* Quick prompt pills */}
        <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '7px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <Lightbulb size={13} color="#fbbf24" /> Ask more:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '0.73rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation View */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '620px' }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '6px', marginBottom: '14px' }}>
          {conversation.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '10px',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
              }}
            >
              {msg.role === 'gemini' && (
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <Sparkles size={14} color="#fff" />
                </div>
              )}

              <div
                style={{
                  background: msg.role === 'user' ? '#4f46e5' : 'rgba(15, 23, 42, 0.8)',
                  color: '#fff',
                  padding: '13px 16px',
                  borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                }}
              >
                {msg.role === 'user' ? msg.text : renderMarkdown(msg.text)}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={14} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.83rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Gemini 2.5 Flash is analyzing your Mumbai restaurant data</span>
                <span style={{ display: 'flex', gap: '3px' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6366f1', animation: `pulse 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
          <input
            type="text"
            placeholder="Ask anything about Mumbai restaurant sentiment, XAI drivers, cuisine trends..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            disabled={loading}
            style={{
              flex: 1,
              background: '#090d16',
              color: '#fff',
              border: '1px solid #334155',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.87rem',
              outline: 'none',
            }}
          />

          <button
            onClick={() => handleSend()}
            disabled={loading || !query.trim()}
            className="gradient-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '0 20px',
              cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !query.trim() ? 0.6 : 1,
            }}
          >
            {loading ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={17} />}
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
};
