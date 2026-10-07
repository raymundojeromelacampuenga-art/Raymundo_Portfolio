import React, { useState, useEffect, useRef } from "react";

const QUICK = ["Projects", "Skills", "Education", "Resume", "Contact"];

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

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

/* One bot message. Types itself out, then reveals its links. */
function BotMsg({ m, onTick }) {
  const [n, setN] = useState(m.anim && !reduced() ? 0 : m.text.length);
  const done = n >= m.text.length;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setN((v) => v + 2), 14);
    onTick?.();
    return () => clearTimeout(t);
  }, [n, done]);

  return (
    <div className="cb-m bot">
      <p className="cb-sr">{m.text}</p>
      <p aria-hidden="true">
        {m.text.slice(0, n)}
        {!done && <span className="cb-caret" />}
      </p>
      {m.links && done && (
        <div className="cb-links">
          {m.links.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              style={{ "--i": i }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Chatbot({ config, projects, skills }) {
  const first = config.name.split(" ")[0];
  const [open, setOpen] = useState(false);
  const [tease, setTease] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      from: "bot",
      text: `Hi, I'm here to help you look around. What would you like to know about ${first}?`,
    },
  ]);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  const toBottom = () => {
    const b = bodyRef.current;
    if (b) b.scrollTop = b.scrollHeight;
  };

  useEffect(toBottom, [msgs, typing, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Teaser bubble: appears once, hides itself */
  useEffect(() => {
    const a = setTimeout(() => setTease(true), 3500);
    const b = setTimeout(() => setTease(false), 12000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  const toggle = () => {
    setTease(false);
    setOpen((o) => !o);
  };

  const send = (raw) => {
    const text = raw.trim();
    if (!text || typing) return;
    setMsgs((m) => [...m, { from: "me", text }]);
    setInput("");
    setTyping(true);
    const reply = buildReply(text, { config, projects, skills });
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "bot", anim: true, ...reply }]);
      setTyping(false);
    }, 700);
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
          <span className="cb-av" aria-hidden="true">
            {first[0]}
          </span>
          <div className="cb-who">
            <b>{first}'s assistant</b>
            <small>
              <i /> Online
            </small>
          </div>
          <button
            className="cb-x"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            tabIndex={open ? 0 : -1}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="cb-body" ref={bodyRef} role="log" aria-live="polite">
          {msgs.map((m, i) =>
            m.from === "bot" ? (
              <BotMsg key={i} m={m} onTick={toBottom} />
            ) : (
              <div key={i} className="cb-m me">
                <p>{m.text}</p>
              </div>
            ),
          )}
          {typing && (
            <div className="cb-m bot cb-dots" aria-label="Typing">
              <i />
              <i />
              <i />
            </div>
          )}
        </div>

        <div className="cb-chips">
          {QUICK.map((c, i) => (
            <button
              key={c}
              style={{ "--i": i }}
              onClick={() => send(c)}
              tabIndex={open ? 0 : -1}
            >
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
            placeholder="Ask about my work"
            aria-label="Your question"
            tabIndex={open ? 0 : -1}
          />
          <button
            type="submit"
            aria-label="Send"
            tabIndex={open ? 0 : -1}
            disabled={!input.trim()}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </form>
      </section>

      {tease && !open && (
        <button className="cb-tease" onClick={toggle}>
          Curious about my projects? Ask me.
        </button>
      )}

      <button
        className={`cb-fab ${open ? "is-open" : ""}`}
        onClick={toggle}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
      >
        <span className="cb-core">
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
        </span>
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
.cb-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* launcher: sand core inside a slowly turning wine/sand ring */
.cb-fab{position:absolute;right:0;bottom:0;width:62px;height:62px;border-radius:50%;border:0;padding:0;overflow:hidden;background:var(--bg);
  box-shadow:0 0 0 0 rgba(224,185,160,.45),0 10px 30px rgba(0,0,0,.55);animation:cbPulse 2.6s ease-out infinite;transition:transform .25s}
.cb-fab::before{content:"";position:absolute;inset:-50%;background:conic-gradient(var(--sand),var(--wine),#3a0f18,var(--sand));animation:cbRot 5s linear infinite}
.cb-fab:hover{transform:scale(1.06) rotate(-4deg)}
.cb-core{position:absolute;inset:3px;border-radius:50%;display:grid;place-items:center;background:var(--sand);color:#1a0d0d;transition:background .3s,color .3s}
.cb-fab .ic-x{display:none}
.cb-fab.is-open{animation:none;box-shadow:0 10px 30px rgba(0,0,0,.55)}
.cb-fab.is-open .cb-core{background:var(--panel);color:var(--sand)}
.cb-fab.is-open .ic-chat{display:none}
.cb-fab.is-open .ic-x{display:inline}
.cb-fab.is-open svg{animation:cbSpinIn .35s cubic-bezier(.2,.7,.2,1)}
@keyframes cbRot{to{transform:rotate(360deg)}}
@keyframes cbPulse{to{box-shadow:0 0 0 20px rgba(224,185,160,0),0 10px 30px rgba(0,0,0,.55)}}
@keyframes cbSpinIn{from{transform:rotate(-90deg) scale(.6);opacity:0}}

/* teaser */
.cb-tease{position:absolute;right:76px;bottom:12px;white-space:nowrap;background:var(--panel);border:1px solid var(--line);border-radius:16px 16px 4px 16px;padding:11px 16px;font-size:13px;color:var(--txt);box-shadow:0 12px 30px rgba(0,0,0,.5);animation:cbTease .6s cubic-bezier(.2,.7,.2,1) both;transition:border-color .2s}
.cb-tease:hover{border-color:var(--sand)}
@keyframes cbTease{from{opacity:0;transform:translateX(16px) scale(.9)}}

/* window: frosted glass with a wine glow */
.cb-win{position:absolute;right:0;bottom:78px;width:min(380px,calc(100vw - 32px));height:min(560px,calc(100svh - 130px));display:flex;flex-direction:column;overflow:hidden;
  background:radial-gradient(ellipse at 100% 0%,rgba(138,42,58,.35),transparent 55%),rgba(14,10,10,.84);
  -webkit-backdrop-filter:blur(18px) saturate(1.2);backdrop-filter:blur(18px) saturate(1.2);
  border:1px solid rgba(224,185,160,.18);border-radius:22px;box-shadow:0 30px 80px rgba(0,0,0,.65),0 0 60px rgba(138,42,58,.18);
  opacity:0;visibility:hidden;transform:translateY(16px) scale(.96);transform-origin:bottom right;transition:opacity .3s,transform .35s cubic-bezier(.2,.7,.2,1),visibility .3s}
.cb-win.open{opacity:1;visibility:visible;transform:none}

.cb-head{position:relative;display:flex;align-items:center;gap:12px;padding:16px 16px 14px 18px}
.cb-head::after{content:"";position:absolute;left:18px;right:18px;bottom:0;height:1px;background:linear-gradient(90deg,transparent,rgba(224,185,160,.4),transparent)}
.cb-av{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;flex:none;font-family:'Pinyon Script',cursive;font-size:30px;line-height:1;padding-bottom:4px;color:var(--sand);
  background:radial-gradient(circle at 30% 25%,#b23a4d,#4a1420 75%);border:1px solid rgba(224,185,160,.35)}
.cb-who{flex:1;min-width:0}
.cb-who b{display:block;font-family:'Cormorant Garamond',serif;font-weight:400;font-size:22px;line-height:1.1;color:var(--sand)}
.cb-who small{display:flex;align-items:center;gap:6px;margin-top:3px;font-size:11px;letter-spacing:.08em;color:var(--mut)}
.cb-who small i{width:7px;height:7px;border-radius:50%;background:#7fbf8f;box-shadow:0 0 0 0 rgba(127,191,143,.6);animation:cbLive 2s infinite}
@keyframes cbLive{to{box-shadow:0 0 0 7px rgba(127,191,143,0)}}
.cb-x{background:none;border:0;border-radius:50%;width:34px;height:34px;display:grid;place-items:center;color:var(--mut);transition:color .2s,background .2s}
.cb-x:hover{color:var(--sand);background:rgba(224,185,160,.1)}

.cb-body{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:#3a2a2a transparent}
.cb-m{position:relative;max-width:84%;font-size:14px;line-height:1.55;padding:11px 15px;animation:cbIn .35s cubic-bezier(.2,.7,.2,1) both}
.cb-m p{white-space:pre-line}
.cb-m.bot{align-self:flex-start;background:rgba(255,255,255,.045);border:1px solid rgba(224,185,160,.12);color:#cfc3bb;border-radius:4px 16px 16px 16px}
.cb-m.me{align-self:flex-end;background:linear-gradient(135deg,#a8364a,#6a1d2b);color:#fbefe8;border-radius:16px 16px 4px 16px;box-shadow:0 6px 18px rgba(138,42,58,.3)}
@keyframes cbIn{from{opacity:0;transform:translateY(10px) scale(.97)}}
.cb-caret{display:inline-block;width:2px;height:1em;margin-left:2px;vertical-align:-2px;background:var(--sand);animation:cbBlink 0.8s steps(2) infinite}

.cb-links{display:flex;flex-direction:column;gap:6px;margin-top:12px}
.cb-links a{align-self:flex-start;font-size:12px;letter-spacing:.05em;color:var(--sand);text-decoration:none;border:1px solid rgba(224,185,160,.3);border-radius:99px;padding:6px 13px;
  animation:cbIn .4s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i)*.08s);transition:background .2s,border-color .2s,color .2s}
.cb-links a:hover{background:var(--sand);border-color:var(--sand);color:#1a0d0d}

.cb-dots{display:flex;gap:5px;padding:15px 16px}
.cb-dots i{width:6px;height:6px;border-radius:50%;background:var(--sand);animation:cbBlink 1s infinite ease-in-out}
.cb-dots i:nth-child(2){animation-delay:.15s}.cb-dots i:nth-child(3){animation-delay:.3s}
@keyframes cbBlink{0%,80%,100%{opacity:.2}40%{opacity:1}}

.cb-chips{display:flex;gap:6px;overflow-x:auto;padding:4px 18px 12px;scrollbar-width:none}
.cb-chips::-webkit-scrollbar{display:none}
.cb-chips button{flex:none;background:rgba(224,185,160,.06);border:1px solid rgba(224,185,160,.22);border-radius:99px;padding:7px 14px;font-size:12px;letter-spacing:.04em;
  opacity:0;animation:cbIn .4s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i)*.06s + .2s);transition:background .2s,color .2s,border-color .2s,transform .2s}
.cb-chips button:hover{background:var(--sand);border-color:var(--sand);color:#1a0d0d;transform:translateY(-2px)}

.cb-in{display:flex;align-items:center;gap:8px;margin:0 14px 14px;padding:5px 5px 5px 18px;border:1px solid rgba(224,185,160,.2);border-radius:99px;background:rgba(21,16,16,.8);transition:border-color .2s}
.cb-in:focus-within{border-color:var(--sand)}
.cb-in input{flex:1;min-width:0;background:none;border:0;outline:0;color:var(--txt);font:inherit;font-size:16px;padding:8px 0}
.cb-in input::placeholder{color:var(--mut)}
.cb-in button{flex:none;width:38px;height:38px;border-radius:50%;border:0;display:grid;place-items:center;background:var(--sand);color:#1a0d0d;transition:background .2s,transform .2s,opacity .2s}
.cb-in button:hover:not(:disabled){background:#efcdb8;transform:scale(1.06)}
.cb-in button:disabled{opacity:.3;cursor:default}

@media(max-width:480px){
  .cb-win{bottom:74px;border-radius:18px}
  .cb-tease{display:none}
}
@media(prefers-reduced-motion:reduce){
  .cb *,.cb *::before,.cb-win{transition:none!important;animation:none!important}
  .cb-chips button{opacity:1}
}
`;
