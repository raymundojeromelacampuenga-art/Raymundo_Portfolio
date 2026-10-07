import React, { useState, useEffect, useRef } from "react";

const QUICK = ["Projects", "Skills", "Education", "Resume", "Contact"];

function buildReply(text, { config, projects, skills }) {
  const q = text.toLowerCase();
  const has = (...w) => w.some((k) => q.includes(k));

  if (has("hi", "hello", "hey", "kumusta"))
    return {
      text: `Hi! I'm a small assistant for ${config.name.split(" ")[0]}'s portfolio. Ask about projects, skills, education or how to get in touch.`,
    };
  if (has("project", "work", "built", "made", "portfolio"))
    return {
      text: `Here are ${projects.length} projects:`,
      links: projects.map((p) => ({
        label: `${p.title} · ${p.kind}`,
        href: p.link,
      })),
    };
  if (has("skill", "tech", "stack", "tool", "know", "figma", "react"))
    return {
      text: Object.entries(skills)
        .map(([g, l]) => `${g}: ${l.join(", ")}`)
        .join("\n"),
    };
  if (has("school", "educ", "study", "degree", "course", "graduat", "year"))
    return {
      text: `${config.school}\n${config.degree}\n${config.year}\nCoursework: ${config.coursework.join(", ")}`,
    };
  if (has("resume", "cv"))
    return {
      text: "You can download the resume here:",
      links: [{ label: "Download resume", href: config.resumeUrl }],
    };
  if (has("intern", "hire", "available", "looking"))
    return {
      text: `${config.name.split(" ")[0]} is looking for an internship where he can learn from a team and work on real products. Send a message if you'd like to talk.`,
      links: [{ label: "Email", href: `mailto:${config.email}` }],
    };
  if (has("contact", "email", "reach", "message", "github", "linkedin"))
    return {
      text: "You can reach him here:",
      links: [
        { label: config.email, href: `mailto:${config.email}` },
        { label: "GitHub", href: config.github },
        { label: "LinkedIn", href: config.linkedin },
      ],
    };
  if (has("who", "about", "yourself", "name"))
    return { text: `${config.name}. ${config.headline}` };

  return {
    text: "I can only answer questions about this portfolio. Try one of the topics below, or use the contact form to write directly.",
  };
}

export default function Chatbot({ config, projects, skills }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      from: "bot",
      text: `Hi, I'm here to help you look around. What would you like to know about ${config.name.split(" ")[0]}?`,
    },
  ]);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [msgs, typing, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = (raw) => {
    const text = raw.trim();
    if (!text || typing) return;
    setMsgs((m) => [...m, { from: "me", text }]);
    setInput("");
    setTyping(true);
    const reply = buildReply(text, { config, projects, skills });
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "bot", ...reply }]);
      setTyping(false);
    }, 600);
  };

  return (
    <div className="cb">
      <style>{cbCss}</style>

      <section
        className={`cb-win ${open ? "open" : ""}`}
        role="dialog"
        aria-label="Portfolio assistant"
        aria-hidden={!open}
      >
        <header className="cb-head">
          <div>
            <b>Ask me</b>
            <small>About this portfolio</small>
          </div>
          <button
            className="cb-x"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            tabIndex={open ? 0 : -1}
          >
            ×
          </button>
        </header>

        <div className="cb-body" aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={`cb-m ${m.from}`}>
              <p>{m.text}</p>
              {m.links && (
                <div className="cb-links">
                  {m.links.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target={l.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div className="cb-m bot cb-dots" aria-label="Typing">
              <i />
              <i />
              <i />
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="cb-chips">
          {QUICK.map((c) => (
            <button key={c} onClick={() => send(c)} tabIndex={open ? 0 : -1}>
              {c}
            </button>
          ))}
        </div>

        <form
          className="cb-in"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a question"
            aria-label="Your question"
            tabIndex={open ? 0 : -1}
          />
          <button type="submit" aria-label="Send" tabIndex={open ? 0 : -1}>
            Send
          </button>
        </form>
      </section>

      <button
        className={`cb-fab ${open ? "is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path className="ic-chat" d="M4 5h16v11H9l-5 4z" />
          <path className="ic-x" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}

const cbCss = `
.cb{--bg:#0e0a0a;--panel:#151010;--line:#2a1f1f;--sand:#e0b9a0;--wine:#8a2a3a;--txt:#d8cfc8;--mut:#8f827b;
  position:fixed;right:max(16px,2.5vw);bottom:max(16px,2.5vw);z-index:50;font-family:'Jost',sans-serif;font-weight:300;color:var(--txt)}
.cb *{box-sizing:border-box;margin:0}
.cb button{font:inherit;color:inherit;cursor:pointer}
.cb button:focus-visible,.cb input:focus-visible,.cb a:focus-visible{outline:2px solid var(--sand);outline-offset:2px}

.cb-fab{position:absolute;right:0;bottom:0;width:56px;height:56px;border-radius:50%;border:1px solid var(--sand);background:var(--sand);color:#1a0d0d;display:grid;place-items:center;box-shadow:0 8px 28px rgba(0,0,0,.5);transition:background .2s,transform .2s}
.cb-fab:hover{background:#efcdb8;transform:translateY(-2px)}
.cb-fab .ic-x{display:none}
.cb-fab.is-open{background:var(--panel);color:var(--sand)}
.cb-fab.is-open .ic-chat{display:none}
.cb-fab.is-open .ic-x{display:inline}

.cb-win{position:absolute;right:0;bottom:70px;width:min(360px,calc(100vw - 32px));height:min(520px,calc(100svh - 120px));display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--line);box-shadow:0 20px 60px rgba(0,0,0,.6);
  opacity:0;visibility:hidden;transform:translateY(12px) scale(.98);transform-origin:bottom right;transition:opacity .25s,transform .25s cubic-bezier(.2,.7,.2,1),visibility .25s}
.cb-win.open{opacity:1;visibility:visible;transform:none}

.cb-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:radial-gradient(ellipse at 80% 0%,#3a0f18 0%,var(--panel) 80%);border-bottom:1px solid var(--line)}
.cb-head b{display:block;font-family:'Cormorant Garamond',serif;font-weight:400;font-size:24px;color:var(--sand);line-height:1.1}
.cb-head small{font-size:11px;color:var(--mut);letter-spacing:.06em}
.cb-x{background:none;border:0;font-size:26px;line-height:1;color:var(--mut);padding:4px 8px;transition:color .2s}
.cb-x:hover{color:var(--sand)}

.cb-body{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:var(--line) transparent}
.cb-m{max-width:86%;font-size:14px;line-height:1.55;padding:10px 14px;border:1px solid var(--line);animation:cbIn .3s cubic-bezier(.2,.7,.2,1) both}
.cb-m p{white-space:pre-line}
.cb-m.bot{align-self:flex-start;background:var(--panel);color:#c9beb7}
.cb-m.me{align-self:flex-end;background:var(--wine);border-color:var(--wine);color:#f6ece6}
.cb-links{display:flex;flex-direction:column;gap:6px;margin-top:10px}
.cb-links a{font-size:12px;letter-spacing:.06em;color:var(--sand);text-decoration:none;border-bottom:1px solid var(--wine);padding-bottom:2px;align-self:flex-start;transition:border-color .2s}
.cb-links a:hover{border-color:var(--sand)}
@keyframes cbIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

.cb-dots{display:flex;gap:5px;padding:14px}
.cb-dots i{width:6px;height:6px;border-radius:50%;background:var(--sand);animation:cbBlink 1s infinite ease-in-out}
.cb-dots i:nth-child(2){animation-delay:.15s}.cb-dots i:nth-child(3){animation-delay:.3s}
@keyframes cbBlink{0%,80%,100%{opacity:.25}40%{opacity:1}}

.cb-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 18px 12px}
.cb-chips button{background:transparent;border:1px solid #4a3a3a;border-radius:99px;padding:6px 12px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;transition:border-color .2s,color .2s}
.cb-chips button:hover{border-color:var(--sand);color:var(--sand)}

.cb-in{display:flex;border-top:1px solid var(--line)}
.cb-in input{flex:1;min-width:0;background:var(--panel);border:0;border-radius:0;color:var(--txt);font:inherit;font-size:16px;padding:14px 16px}
.cb-in input::placeholder{color:var(--mut)}
.cb-in button{background:var(--sand);border:0;color:#1a0d0d;padding:0 20px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;transition:background .2s}
.cb-in button:hover{background:#efcdb8}

@media(max-width:480px){
  .cb-win{bottom:68px}
}
@media(prefers-reduced-motion:reduce){
  .cb *,.cb-win{transition:none!important;animation:none!important}
}
`;
