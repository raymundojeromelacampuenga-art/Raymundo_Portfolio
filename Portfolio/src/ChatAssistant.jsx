import React, { useEffect, useRef, useState } from "react";
import PixelAvatar from "./PixelAvatar";

/**
 * Custom chat panel (replaces the Chatbase widget UI) with the live pixel avatar in the header.
 * Answers still come from your Chatbase agent, through the /api/chat proxy (keeps the API key secret).
 */
const STORE_KEY = "assistant-chat-v1";
const PHRASES = [
  "Ask me, ask me!",
  "Psst, got questions?",
  "Curious about Jerome?",
  "Let's chat!",
];
const SUGGESTIONS = [
  "What has Jerome built?",
  "What are his skills?",
  "Is he open to internships?",
  "How can I contact him?",
];

/* tiny markdown-ish renderer: **bold**, [text](url), bare urls, line breaks. React escapes everything else. */
function renderText(text) {
  const out = [];
  const re =
    /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|(https?:\/\/[^\s)]+)/g;
  text.split("\n").forEach((line, li) => {
    if (li) out.push(<br key={"br" + li} />);
    let last = 0,
      m,
      k = 0;
    while ((m = re.exec(line))) {
      if (m.index > last) out.push(line.slice(last, m.index));
      if (m[1]) out.push(<strong key={li + "-" + k++}>{m[1]}</strong>);
      else {
        const href = m[3] || m[4],
          label = m[2] || m[4];
        out.push(
          <a
            key={li + "-" + k++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>,
        );
      }
      last = m.index + m[0].length;
    }
    if (last < line.length) out.push(line.slice(last));
  });
  return out;
}

const moodFor = (t) =>
  /haha|lol|😂|🤣/i.test(t)
    ? "laugh"
    : /!/.test(t)
      ? "grin"
      : /sorry|unfortunately|can't|cannot/i.test(t)
        ? "shy"
        : "smile";

export default function ChatAssistant({
  name = "Jerome",
  endpoint = "/api/chat",
  suggestions = SUGGESTIONS,
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORE_KEY)) || [];
    } catch (e) {
      return [];
    }
  });
  const [pi, setPi] = useState(0);
  const launchRef = useRef(null),
    headRef = useRef(null),
    listRef = useRef(null),
    inputRef = useRef(null),
    abortRef = useRef(null);

  const fire = (mood) => headRef.current && headRef.current.react(mood);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-40)));
    } catch (e) {}
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      inputRef.current && inputRef.current.focus();
      fire("grin");
    }, 120);
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    // rotate the speech bubble while the panel is closed
    if (open) return;
    const t = setInterval(() => setPi((i) => (i + 1) % PHRASES.length), 5500);
    return () => clearInterval(t);
  }, [open]);

  async function send(raw) {
    const text = (raw ?? input).trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    fire("oh");
    setTimeout(() => fire("smirk"), 900); // "oh!" then a thinking look
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const timer = setTimeout(() => ctrl.abort(), 35000);
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-12) }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.text)
        throw new Error(data.message || "Request failed");
      setMessages((m) => [...m, { role: "assistant", content: data.text }]);
      fire(moodFor(data.text));
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          error: true,
          content:
            "Sorry, I couldn't reach my brain just now. Please try again in a moment.",
        },
      ]);
      fire("shy");
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }

  const clear = () => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setLoading(false);
    fire("wink");
  };

  return (
    <>
      <style>{css}</style>

      {!open && (
        <div className="as-launch">
          <div className="as-char">
            <button
              type="button"
              className="as-bubble"
              key={pi}
              onClick={() => setOpen(true)}
              tabIndex={-1}
              aria-hidden="true"
            >
              {PHRASES[pi]}
            </button>
            <button
              type="button"
              className="as-figure"
              aria-label="Open chat with my assistant"
              onClick={() => setOpen(true)}
              onMouseEnter={() =>
                launchRef.current && launchRef.current.react("grin")
              }
            >
              <PixelAvatar ref={launchRef} className="as-cv" />
            </button>
          </div>
          <button
            type="button"
            className="as-ask"
            aria-label="Ask my assistant"
            onClick={() => setOpen(true)}
          >
            <span aria-hidden="true">✦</span>ASK
          </button>
        </div>
      )}

      {open && (
        <section
          className="as-panel"
          role="dialog"
          aria-label={name + "'s assistant"}
        >
          <header className="as-head">
            <div className="as-av">
              <PixelAvatar ref={headRef} className="as-cv" />
              <span className="as-dot" aria-hidden="true" />
            </div>
            <div className="as-title">
              <small>Portfolio assistant</small>
              <h2>Ask {name}</h2>
            </div>
            <button
              type="button"
              className="as-x"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>

          <div className="as-list" ref={listRef} role="log" aria-live="polite">
            <div className="as-msg bot">
              Hey, I'm {name}'s assistant! Ask me about his projects, skills,
              education, or how to get in touch.
            </div>
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  "as-msg " +
                  (m.role === "user" ? "me" : "bot") +
                  (m.error ? " err" : "")
                }
              >
                {m.role === "user" ? m.content : renderText(m.content)}
              </div>
            ))}
            {loading && (
              <div className="as-msg bot as-typing" aria-label="Typing">
                <i />
                <i />
                <i />
              </div>
            )}
          </div>

          {messages.length === 0 && (
            <div className="as-chips">
              {suggestions.map((s) => (
                <button key={s} type="button" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            className="as-form"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"Ask about " + name + "..."}
              maxLength={500}
              aria-label="Your message"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              →
            </button>
          </form>
          <p className="as-note">
            AI assistant, so answers may be incomplete.{" "}
            {messages.length > 0 && (
              <button type="button" onClick={clear}>
                Clear chat
              </button>
            )}
          </p>
        </section>
      )}
    </>
  );
}

const css = `
.as-launch,.as-panel{font-family:'Jost',sans-serif;font-weight:300;color:#d8cfc8}
.as-launch *,.as-panel *{box-sizing:border-box}
.as-launch{position:fixed;right:22px;bottom:22px;z-index:2147483000;display:flex;align-items:flex-end;gap:6px}
.as-launch button{font-family:inherit;cursor:pointer}
.as-char{position:relative;display:flex;flex-direction:column;align-items:flex-end}
.as-bubble{position:relative;margin:0 6px 14px 0;padding:10px 18px;border-radius:14px;background:#151010;color:#e0b9a0;border:2px solid #e0b9a0;
  font-family:'Bodoni Moda',serif;font-size:18px;font-weight:500;white-space:nowrap;box-shadow:4px 4px 0 #8a2a3a;animation:as-pop .45s cubic-bezier(.2,.9,.3,1.3) both}
.as-bubble::after{content:"";position:absolute;bottom:-9px;right:34px;width:14px;height:14px;background:#151010;border:solid #e0b9a0;border-width:0 2px 2px 0;transform:rotate(45deg)}
.as-figure{position:relative;width:118px;height:118px;padding:0;border-radius:50%;border:3px solid #e0b9a0;background:#24392a;overflow:hidden;
  box-shadow:0 10px 30px rgba(0,0,0,.55);animation:as-bob 3.6s ease-in-out infinite;transition:box-shadow .2s}
.as-figure:hover{box-shadow:0 14px 36px rgba(0,0,0,.65),0 0 0 4px rgba(138,42,58,.6)}
.as-ask{flex:none;width:84px;height:84px;margin-bottom:6px;border-radius:50%;border:3px solid #e0b9a0;background:#0e0a0a;color:#e0b9a0;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:13px;font-weight:500;letter-spacing:.14em;
  box-shadow:0 0 0 4px #8a2a3a,0 10px 28px rgba(0,0,0,.55);transition:transform .2s}
.as-ask span{font-size:26px;line-height:1;letter-spacing:0}
.as-ask:hover{transform:translateY(-3px) scale(1.05)}
.as-launch button:focus-visible,.as-x:focus-visible,.as-chips button:focus-visible,.as-form button:focus-visible,.as-note button:focus-visible{outline:2px solid #e0b9a0;outline-offset:3px}
.as-cv{display:block;width:100%;height:100%;border-radius:50%}
.as-dot{position:absolute;right:3px;bottom:3px;width:13px;height:13px;border-radius:50%;background:#7fbf8f;border:2px solid #0e0a0a}
@keyframes as-pop{from{opacity:0;transform:translateY(8px) scale(.9)}to{opacity:1;transform:none}}
@keyframes as-bob{50%{transform:translateY(-6px)}}

/* side panel: docked to the right edge, full height */
.as-panel{position:fixed;top:0;right:0;bottom:0;z-index:2147483000;width:min(430px,100vw);
  display:flex;flex-direction:column;background:#0e0a0a;border-left:1px solid #e0b9a0;
  box-shadow:-24px 0 70px rgba(0,0,0,.65);animation:as-slide .4s cubic-bezier(.2,.8,.2,1) both}
@keyframes as-slide{from{transform:translateX(100%)}to{transform:none}}
.as-head{display:flex;align-items:center;gap:14px;padding:22px 20px;background:linear-gradient(135deg,#5c1020,#8a2a3a);border-bottom:1px solid #e0b9a0}
.as-av{position:relative;flex:none;width:84px;height:84px;border-radius:50%;border:2px solid #e0b9a0;background:#24392a;box-shadow:0 4px 16px rgba(0,0,0,.45)}
.as-title{flex:1;min-width:0}
.as-title small{display:block;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#e0b9a0;margin-bottom:2px}
.as-title h2{margin:0;font-family:'Bodoni Moda',serif;font-weight:400;font-size:26px;line-height:1.1;color:#fff}
.as-x{flex:none;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.5);background:transparent;color:#fff;font-size:22px;line-height:1;cursor:pointer}
.as-x:hover{background:rgba(255,255,255,.15)}
.as-list{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
.as-msg{max-width:86%;padding:11px 14px;border-radius:16px;font-size:14.5px;line-height:1.5;overflow-wrap:anywhere}
.as-msg.bot{align-self:flex-start;background:#1d1616;border:1px solid #2a1f1f;border-bottom-left-radius:4px}
.as-msg.me{align-self:flex-end;background:#e0b9a0;color:#1a0d0d;font-weight:400;border-bottom-right-radius:4px}
.as-msg.err{border-color:#8a2a3a;color:#e8a0aa}
.as-msg a{color:#e0b9a0;text-decoration:underline;text-underline-offset:2px}
.as-msg strong{font-weight:500;color:#f1d9c8}
.as-typing{display:flex;gap:5px;padding:14px 16px}
.as-typing i{width:7px;height:7px;border-radius:50%;background:#8f827b;animation:as-b 1.2s ease-in-out infinite}
.as-typing i:nth-child(2){animation-delay:.15s}.as-typing i:nth-child(3){animation-delay:.3s}
@keyframes as-b{0%,60%,100%{opacity:.35;transform:none}30%{opacity:1;transform:translateY(-4px)}}
.as-chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 18px 12px}
.as-chips button{font:inherit;font-size:12.5px;color:#d8cfc8;background:transparent;border:1px solid #4a3a3a;border-radius:99px;padding:7px 12px;cursor:pointer;transition:border-color .2s,background .2s}
.as-chips button:hover{border-color:#e0b9a0;background:#1d1616}
.as-form{display:flex;margin:0 18px;border:1px solid #4a3a3a;border-radius:14px;overflow:hidden;background:#151010}
.as-form:focus-within{border-color:#e0b9a0}
.as-form input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:#d8cfc8;font:inherit;font-size:15px;padding:14px}
.as-form input::placeholder{color:#8f827b}
.as-form button{width:56px;border:0;background:#e0b9a0;color:#1a0d0d;font-size:22px;cursor:pointer;transition:background .2s}
.as-form button:hover:not(:disabled){background:#efcdb8}
.as-form button:disabled{opacity:.4;cursor:default}
.as-note{margin:0;padding:10px 18px 14px;font-size:11px;line-height:1.4;color:#8f827b;text-align:center}
.as-note button{border:0;background:none;color:#e0b9a0;font:inherit;text-decoration:underline;cursor:pointer;padding:0}
@media(max-width:640px){
  .as-launch{right:12px;bottom:12px}.as-figure{width:92px;height:92px}.as-ask{width:68px;height:68px;font-size:11px}.as-ask span{font-size:22px}
  .as-bubble{font-size:15px;padding:8px 14px}
  .as-panel{border-left:0}
  .as-form input{font-size:16px}
}
@media(prefers-reduced-motion:reduce){.as-panel,.as-bubble,.as-figure{animation:none}.as-ask{transition:none}.as-list{scroll-behavior:auto}.as-typing i{animation:none}}
`;
