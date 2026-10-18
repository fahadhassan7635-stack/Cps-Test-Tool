"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Bot, Send, X, Newspaper, ArrowUpRight, RotateCcw } from 'lucide-react';

// Custom event to trigger AI assistant from anywhere (e.g. ContextPill)
export const OPEN_ASSISTANT_EVENT = 'fixedaim:open_assistant';

export interface AssistantOpenDetail {
  prompt: string;
  context?: string;
  badgeLabel?: string;
}

export function triggerAssistant(detail: AssistantOpenDetail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_ASSISTANT_EVENT, { detail }));
  }
}

// ─────────────────────────────────────────────
// CONTEXT PILL COMPONENT (Matching screenshot style)
// ─────────────────────────────────────────────
interface ContextPillProps {
  label: string;
  variant?: 'blue' | 'green' | 'cyan';
  icon?: 'newspaper' | 'sparkles' | 'none';
  href?: string;
  query?: string;
  context?: string;
  className?: string;
}

export const ContextPill = React.memo(({
  label,
  variant = 'blue',
  icon = 'newspaper',
  href,
  query,
  context,
}: ContextPillProps) => {
  const isBlue = variant === 'blue';
  const isGreen = variant === 'green';

  const bg = isBlue
    ? 'linear-gradient(135deg, #1d4ed8, #2563eb)'
    : isGreen
    ? 'linear-gradient(135deg, #059669, #10b981)'
    : 'linear-gradient(135deg, #0891b2, #06b6d4)';

  const border = isBlue
    ? 'rgba(147, 197, 253, 0.45)'
    : isGreen
    ? 'rgba(167, 243, 208, 0.45)'
    : 'rgba(165, 243, 252, 0.45)';

  const shadow = isBlue
    ? '0 2px 10px rgba(37, 99, 235, 0.35)'
    : isGreen
    ? '0 2px 10px rgba(16, 185, 129, 0.35)'
    : '0 2px 10px rgba(6, 182, 212, 0.35)';

  const handleClick = (e: React.MouseEvent) => {
    // If query provided, open contextual assistant
    if (query || label) {
      e.preventDefault();
      triggerAssistant({
        prompt: query || `Tell me more about ${label} and how it relates to CPS testing.`,
        context: context || `User clicked contextual badge "${label}" in CPS Test guide.`,
        badgeLabel: label,
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      title={`Ask AI Contextual Assistant about ${label}`}
      aria-label={`Contextual badge: ${label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2px 9px',
        borderRadius: '9999px',
        background: bg,
        border: `1px solid ${border}`,
        boxShadow: shadow,
        color: '#ffffff',
        fontSize: '0.78rem',
        fontWeight: 700,
        lineHeight: 1.4,
        cursor: 'pointer',
        verticalAlign: 'middle',
        margin: '0 4px',
        textDecoration: 'none',
        transition: 'all 0.18s ease-in-out',
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)';
        e.currentTarget.style.boxShadow = isBlue
          ? '0 4px 14px rgba(37, 99, 235, 0.55)'
          : '0 4px 14px rgba(16, 185, 129, 0.55)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = shadow;
      }}
    >
      {icon === 'newspaper' && (
        <Newspaper size={12} strokeWidth={2.4} style={{ opacity: 0.95 }} />
      )}
      {icon === 'sparkles' && (
        <Sparkles size={12} strokeWidth={2.4} style={{ opacity: 0.95 }} />
      )}
      <span>{label}</span>
    </button>
  );
});
ContextPill.displayName = 'ContextPill';


// ─────────────────────────────────────────────
// BUILT-IN KNOWLEDGE BASE (Instant zero-latency responses)
// ─────────────────────────────────────────────
interface KnowledgeEntry {
  keywords: string[];
  title: string;
  content: string;
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ['click speed tester', 'cps test', 'what is cps', 'measure cps', 'clicks per second'],
    title: 'What is a Click Speed Tester (CPS)?',
    content: `A **Click Speed Tester** (CPS Test) benchmarks how many times you can actuate a mouse button per second:
- **Casual Baseline:** 5 to 7 CPS (standard single-finger clicking).
- **Competitive Range:** 10 to 12 CPS (achieved via jitter clicking or butterfly clicking).
- **Elite Level:** 13 to 20+ CPS (mastered by PvP players using optical switches or tuned debounce times).

FixedAim's CPS tester uses browser sub-millisecond \`performance.now()\` timestamps to ensure zero input lag and genuine hardware timing.`,
  },
  {
    keywords: ['gaming', 'mouse', 'gaming mouse', 'debounce', 'switches', 'optical', 'razer', 'logitech', 'glorious'],
    title: 'Gaming Mouse Hardware for High CPS',
    content: `Your mouse hardware directly caps your maximum physical clicking throughput:
- **Debounce Delay:** Traditional mechanical switches have electrical contact bounce. Mice like the *Glorious Model O* and *Bloody A70* allow lowering debounce to 0–4ms, registering two hits per tap.
- **Optical Switches:** Mice like the *Razer Viper V3* or *Logitech G Pro X 2* use light beams instead of metal contacts. They eliminate switch bounce entirely and cannot double-click accidentally.
- **Weight & Ergonomics:** Lightweight mice (<70g) reduce forearm fatigue during extended PvP matches.`,
  },
  {
    keywords: ['jitter', 'jitter clicking', 'jitter click', 'vibration', 'strain'],
    title: 'Jitter Clicking Guide & Technique',
    content: `**Jitter Clicking** channels rapid forearm muscle tremors into your fingertip:
- **Average Output:** 10 to 14 CPS reliably on any standard mouse.
- **Aim Impact:** Moderate to difficult—your hand shakes, requiring a steady claw grip anchored by your thumb and pinky.
- **Health Warning:** Never tense your arm for more than 5–10 seconds at a time. Take frequent breaks and stretch your flexor tendons to avoid Repetitive Strain Injury (RSI).`,
  },
  {
    keywords: ['butterfly', 'butterfly clicking', 'two finger', 'flutter'],
    title: 'Butterfly Clicking Mechanics',
    content: `**Butterfly Clicking** alternates two fingers (index and middle) on the same mouse button in a see-saw motion:
- **Average Output:** 15 to 25+ CPS on mice with tunable debounce.
- **Aim Precision:** Excellent—your palm remains relaxed against the mouse body.
- **Server Rule Check:** Competitive Minecraft servers (Hypixel, Minemen) enforce click caps (often 15–20 CPS) or anti-cheat flags for excessive double clicks.`,
  },
  {
    keywords: ['drag', 'drag clicking', 'friction', 'god-bridging'],
    title: 'Drag Clicking Technique & Bridging',
    content: `**Drag Clicking** involves pulling your finger across a textured matte mouse button so skin friction creates rapid micro-bounces:
- **Average Output:** 25 to 60+ CPS (and 80+ CPS with grip tape).
- **Primary Use:** Minecraft god-bridging and breezily bridging.
- **Aim Control:** Very poor—dragging moves your hand position, making target tracking in combat impractical.
- **Anti-Cheat Warning:** Banned on almost all PvP servers; use only on bridging practice servers.`,
  },
  {
    keywords: ['improve', 'how to improve', 'faster', 'train', 'increase cps'],
    title: 'How to Improve Your Clicking Speed',
    content: `Follow this daily 5-minute training routine:
1. **Sprint Intervals:** Do 10 repetitions of 1-second max-effort sprint clicks, resting 20 seconds between sets.
2. **Endurance Sets:** Complete two 10-second tests to build finger stamina without tensing your wrist.
3. **Ergonomic Warm-up:** Gently stretch fingers and wrists before testing.
4. **Avoid Trackpads:** Always use a standalone optical or mechanical mouse on a stable surface.`,
  },
];

function findLocalAnswer(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some(k => lower.includes(k))) {
      return `### ${entry.title}\n\n${entry.content}`;
    }
  }
  return null;
}

// ─────────────────────────────────────────────
// AI CONTEXTUAL ASSISTANT WIDGET
// ─────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export function AIContextualAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `👋 **Hi! I'm your AI Contextual Assistant.**\n\nClick any **[📰 badge]** in the article or ask me anything about **CPS testing**, **gaming mice**, **jitter clicking**, or **aim mechanics**!`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeBadge, setActiveBadge] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Handle external open event
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<AssistantOpenDetail>;
      const detail = customEvent.detail;
      if (!detail) return;

      setIsOpen(true);
      setIsMinimized(false);
      setActiveBadge(detail.badgeLabel || null);

      if (detail.prompt) {
        handleSendQuestion(detail.prompt, detail.context);
      }
    };

    window.addEventListener(OPEN_ASSISTANT_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, handleOpen);
  }, []);

  const handleSendQuestion = useCallback(async (promptText: string, contextText?: string) => {
    if (!promptText.trim()) return;

    const userMsg: Message = {
      id: 'u_' + Date.now(),
      role: 'user',
      text: promptText,
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Step 1: Check if API route responds with live Gemini answer
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, context: contextText }),
      });

      const data = await res.json();

      if (data.success && data.response) {
        const assistantMsg: Message = {
          id: 'a_' + Date.now(),
          role: 'assistant',
          text: data.response,
          timestamp: 'Just now',
        };
        setMessages(prev => [...prev, assistantMsg]);
        return;
      }
    } catch {
      // network issue or route unavailable — proceed to local knowledge
    } finally {
      setLoading(false);
    }

    // Step 2: Fallback to smart local knowledge base
    const localAnswer = findLocalAnswer(promptText);
    const fallbackText = localAnswer || `### CPS Assistant Analysis\n\nRegarding **"${promptText}"**:\n\n- In CPS benchmarking, consistency and wrist posture are paramount.\n- Scores between **6–9 CPS** represent standard single-click proficiency.\n- Reaching **10–14+ CPS** requires technique training (Jitter or Butterfly) combined with a low-debounce gaming mouse.\n\n*(Tip: You can connect your live Gemini API key anytime by placing \`GEMINI_API_KEY=your_key\` in \`.env.local\`)*`;

    const assistantMsg: Message = {
      id: 'a_' + Date.now(),
      role: 'assistant',
      text: fallbackText,
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, assistantMsg]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      handleSendQuestion(input);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        role: 'assistant',
        text: `Chat cleared! Ask any question about **CPS**, **gaming mice**, or **clicking techniques**.`,
        timestamp: 'Just now',
      },
    ]);
    setActiveBadge(null);
  };

  return (
    <>
      {/* ── FLOATING TRIGGER PILL ── */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          aria-label="Open AI Contextual Assistant"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 998,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            boxShadow: '0 8px 30px rgba(0, 240, 255, 0.25), 0 0 1px rgba(255,255,255,0.2)',
            borderRadius: '9999px',
            padding: '10px 18px',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 240, 255, 0.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 240, 255, 0.25)';
          }}
        >
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00f0ff, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
          }}>
            <Sparkles size={14} />
          </div>
          <span style={{ letterSpacing: '0.2px' }}>AI Assistant</span>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#00ff88',
            boxShadow: '0 0 8px #00ff88',
          }} />
        </button>
      )}

      {/* ── ASSISTANT MODAL / DRAWER ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI Contextual Assistant"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: 'min(420px, calc(100vw - 32px))',
            height: isMinimized ? '60px' : '520px',
            maxHeight: 'calc(100vh - 48px)',
            background: '#0a0f1d',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 240, 255, 0.15)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
            overflow: 'hidden',
            transition: 'height 0.25s ease',
            fontFamily: 'inherit',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(90deg, rgba(0,240,255,0.08), rgba(168,85,247,0.08))',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00f0ff, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
              }}>
                <Bot size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                    Contextual Assistant
                  </span>
                  <span style={{
                    fontSize: '0.62rem',
                    background: 'rgba(0,255,136,0.12)',
                    border: '1px solid rgba(0,255,136,0.3)',
                    color: '#00ff88',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}>AI</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  {activeBadge ? `Context: ${activeBadge}` : 'Powered by Gemini & FixedAim'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handleClear}
                title="Clear chat"
                aria-label="Clear chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  padding: '6px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  padding: '6px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <ArrowUpRight size={15} style={{ transform: isMinimized ? 'rotate(180deg)' : 'none' }} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close assistant"
                aria-label="Close assistant"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  padding: '6px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body (when not minimized) */}
          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                }}
              >
                {messages.map(m => {
                  const isUser = m.role === 'user';
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        maxWidth: '88%',
                        background: isUser
                          ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                          : 'rgba(255,255,255,0.04)',
                        border: isUser
                          ? '1px solid rgba(147,197,253,0.3)'
                          : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        padding: '10px 14px',
                        color: isUser ? '#fff' : '#cbd5e1',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {m.text}
                    </div>
                  );
                })}

                {loading && (
                  <div
                    style={{
                      alignSelf: 'flex-start',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px 16px 16px 4px',
                      padding: '10px 14px',
                      color: '#00f0ff',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Sparkles size={14} className="animate-spin" />
                    <span>Analyzing CPS context...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div
                style={{
                  padding: '8px 14px',
                  background: 'rgba(0,0,0,0.2)',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                }}
              >
                {[
                  '⚡ How to reach 10+ CPS?',
                  '🦋 Butterfly vs Jitter?',
                  '🖱️ Best gaming mouse?',
                  '🧱 Minecraft bridging CPS?',
                ].map(chip => (
                  <button
                    key={chip}
                    onClick={() => handleSendQuestion(chip)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '9999px',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      flexShrink: 0,
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#00f0ff';
                      e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSubmit}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(2,6,18,0.7)',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about CPS, mice, techniques..."
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(0,240,255,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  style={{
                    background: input.trim() && !loading ? '#00f0ff' : 'rgba(255,255,255,0.08)',
                    color: input.trim() && !loading ? '#000' : '#64748b',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
