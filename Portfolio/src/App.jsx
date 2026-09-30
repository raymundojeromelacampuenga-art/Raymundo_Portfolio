import React, { useState, useEffect, useRef } from "react";
const CONFIG = {
  name: "Jerome Raymundo",
  email: "raymundojeromelacampuenga@gmail.com",
  github: "https://github.com/raymundojeromelacampuenga-art",
  linkedin: "https://linkedin.com/in/yourname",
  resumeUrl: "/resume.pdf",
  heroImg: "https://cdn.corenexis.com/f/7OYj5KDiieZ.png",
  headline: "3rd-year student designing and building clean, usable websites.",
  school: "Pamantasan ng Cabuyao (UcPNC)",
  degree: "BS in Your Degree Program",
  year: "3rd year, expected graduation 2027",
  coursework: ["Web Development", "Human-Computer Interaction", "Game Concept and Design", "Databases"],
  about: [
    "I'm a third-year student who enjoys turning ideas into interfaces people can actually use.",
    "I'm looking for an internship where I can learn from a team and contribute to real products.",
  ],
};

const projects = [
{ title: "Digilaya", kind: "Course project", desc: "A digital platform developed to empower local users with accessible online tools and resources.", tags: ["React", "JavaScript"], link: "https://digi-laya-landing-page.vercel.app" }
  { title: "Project two", kind: "Group project", desc: "Say your role clearly, for example: designed the screens and wrote the front end.", tags: ["UI/UX", "Prototype"], link: "#" },
  { title: "Project three", kind: "Personal project", desc: "Something you made for fun or to learn a new skill.", tags: ["JavaScript", "CSS"], link: "#" },
];

const skills = {
  Design: ["Figma", "Photoshop", "Illustrator", "Wireframing"],
  Code: ["HTML & CSS", "JavaScript", "React", "Git"],
};

function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const body = `${f.message}\n\nFrom: ${f.name} (${f.email})`;
    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Hello from " + f.name)}&body=${encodeURIComponent(body)}`;
  };
  return (
    <form onSubmit={submit} className="form">
      <label>Name<input required value={f.name} onChange={set("name")} /></label>
      <label>Email<input required type="email" value={f.email} onChange={set("email")} /></label>
      <label>Message<textarea required rows={4} value={f.message} onChange={set("message")} /></label>
      <button className="btn solid">Send message</button>
    </form>
  );
}

export default function PortfolioSite() {
  const root = useRef(null);
  useEffect(() => {
    const el = root.current;
    el.classList.add("js");
    const items = el.querySelectorAll(".rv");
    if (!("IntersectionObserver" in window)) { items.forEach((n) => n.classList.add("in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
    items.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <div className="ps" ref={root}>
      <style>{css}</style>

      <nav className="nav">
        <a href="#top" className="logo">{CONFIG.name.split(" ")[0]}</a>
        <ul>
          <li><a href="#work">Projects</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#about">About</a></li>
        </ul>
        <a className="btn" href="#contact">Contact me</a>
      </nav>

      <header id="top" className="hero">
        <h1 className="giant" aria-hidden="true">{"PORTFOLIO".split("").map((c, i) => <span key={i} style={{ "--i": i }}>{c}</span>)}</h1>
        <div className={CONFIG.heroImg ? "photo" : "photo empty"} style={CONFIG.heroImg ? { backgroundImage: `url(${CONFIG.heroImg})` } : undefined}>{!CONFIG.heroImg && <span>Your photo here</span>}</div>
        <div className="hl">
          {CONFIG.status && <span className="status"><i /> {CONFIG.status}</span>}
          <h2>{CONFIG.headline}</h2>
          <div className="ctas">
            <a className="btn solid" href="#work">View my projects</a>
            <a className="btn" href="#contact">Get in touch</a>
          </div>
        </div>
      </header>

      <div className="marquee" aria-hidden="true">
        <div>
          {[0, 1].map((k) => (
            <span key={k}>{["UI/UX", "Web Design", "React", "Figma", "Wireframing", "Prototyping"].map((t) => <b key={t}>{t} ✦</b>)}</span>
          ))}
        </div>
      </div>

      <section id="work" className="sec">
        <h3 className="sh rv">Projects</h3>
        <div className="cards">
          {projects.map((p, i) => (
            <a key={p.title} href={p.link} className="card rv" style={{ "--i": i }}>
              <small>{p.kind}</small>
              <h4>{p.title}</h4>
              <p>{p.desc}</p>
              <div className="tags">{p.tags.map((t) => <i key={t}>{t}</i>)}</div>
            </a>
          ))}
        </div>
      </section>

      <section id="skills" className="sec">
        <h3 className="sh rv">Skills</h3>
        <div className="skills">
          {Object.entries(skills).map(([group, list]) => (
            <div key={group} className="rv">
              <h4>{group}</h4>
              <div className="tags">{list.map((s) => <i key={s}>{s}</i>)}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="sec two">
        <div className="rv">
          <h3 className="sh">About me</h3>
          {CONFIG.about.map((p) => <p key={p} className="lead">{p}</p>)}
          <a className="btn" href={CONFIG.resumeUrl}>Download resume</a>
        </div>
        <div className="edu rv" style={{ "--i": 1 }}>
          <h3 className="sh">Education</h3>
          <h4>{CONFIG.school}</h4>
          <p>{CONFIG.degree}</p>
          <small>{CONFIG.year}</small>
          <div className="tags">{CONFIG.coursework.map((c) => <i key={c}>{c}</i>)}</div>
        </div>
      </section>

      <section id="contact" className="sec two">
        <div className="rv">
          <h3 className="sh">Contact</h3>
          <h2 className="big">Let's work together.</h2>
          <p className="lead">Message me about an internship, a collaboration, or just to say hi.</p>
          <p className="links">
            <a href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a>
            <a href={CONFIG.github}>GitHub</a>
            <a href={CONFIG.linkedin}>LinkedIn</a>
          </p>
        </div>
        <div className="rv" style={{ "--i": 1 }}><ContactForm /></div>
      </section>

      <footer className="foot">© {new Date().getFullYear()} {CONFIG.name}</footer>
    </div>
  );
}

const css = `
html{scroll-behavior:smooth}
body{margin:0!important;display:block!important;min-width:0!important}
html,body{background:#0e0a0a!important}
#root{width:100%!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important;display:block!important;min-height:0!important;text-align:left!important}
.ps{--bg:#0e0a0a;--panel:#151010;--line:#2a1f1f;--sand:#e0b9a0;--wine:#8a2a3a;--txt:#d8cfc8;--mut:#8f827b;
  background:var(--bg);color:var(--txt);font-family:'Jost',sans-serif;font-weight:300;min-height:100vh;overflow-x:hidden}
.ps *{box-sizing:border-box;margin:0}
.ps a{color:inherit;text-decoration:none}
.ps a:focus-visible,.ps button:focus-visible,.ps input:focus-visible,.ps textarea:focus-visible{outline:2px solid var(--sand);outline-offset:2px}
.ps small{color:var(--mut);font-size:12px;display:block}
.nav{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:14px 5vw;background:rgba(14,10,10,.88);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.logo{font-family:'Pinyon Script',cursive;font-size:26px;color:var(--wine)}
.nav ul{list-style:none;padding:0;display:flex;gap:32px;font-size:12px;letter-spacing:.1em;text-transform:uppercase}
.nav li a:hover{color:var(--sand)}
.btn{display:inline-block;border:1px solid #4a3a3a;border-radius:99px;padding:11px 22px;font:inherit;font-size:12px;letter-spacing:.08em;text-transform:uppercase;background:transparent;color:var(--txt);cursor:pointer;transition:border-color .2s,background .2s}
.btn:hover{border-color:var(--sand)}
.btn.solid{background:var(--sand);border-color:var(--sand);color:#1a0d0d}
.btn.solid:hover{background:#efcdb8}
.hero{container-type:inline-size;position:relative;min-height:680px;padding:40px 5vw;background:radial-gradient(ellipse at 60% 40%,#3a0f18 0%,#0e0a0a 70%);overflow:hidden}
.giant{position:absolute;left:0;right:0;top:20px;text-align:center;white-space:nowrap;font-family:'Bodoni Moda',serif;font-weight:400;font-size:14.5cqw;line-height:1;letter-spacing:-.03em;color:var(--sand);transform:scaleY(1.25);transform-origin:top}
.photo{position:absolute;right:10vw;top:60px;width:min(460px,42vw);height:620px;background:transparent center bottom/contain no-repeat;-webkit-mask-image:linear-gradient(#000 85%,transparent);mask-image:linear-gradient(#000 85%,transparent)}
.photo.empty{background:rgba(224,185,160,.06);border:1px dashed #6b4a4a;-webkit-mask-image:none;mask-image:none;display:grid;place-items:center;color:var(--mut);font-size:12px;letter-spacing:.14em;text-transform:uppercase}
.hl{position:absolute;left:5vw;bottom:60px;width:min(400px,36vw);z-index:2}
.status{display:inline-flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;border:1px solid var(--line);border-radius:99px;padding:7px 14px;margin-bottom:18px}
.status i{width:7px;height:7px;border-radius:50%;background:#7fbf8f}
.hl h2{font-weight:300;font-size:clamp(20px,2.3vw,30px);line-height:1.35;letter-spacing:.04em;margin-bottom:24px}
.ctas{display:flex;gap:10px;flex-wrap:wrap}
.sec{padding:80px 5vw;border-top:1px solid var(--line)}
.sh{font-weight:400;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--mut);margin-bottom:28px}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.card{display:block;background:var(--panel);border:1px solid var(--line);padding:24px;transition:border-color .2s}
.card:hover{border-color:var(--wine)}
.card h4{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:26px;margin:6px 0 10px}
.card p{font-size:14px;color:#b5a9a2;line-height:1.6;margin-bottom:18px}
.tags{display:flex;gap:6px;flex-wrap:wrap}
.tags i{font-style:normal;font-size:11px;letter-spacing:.06em;padding:5px 10px;background:#1d1616;border:1px solid var(--line)}
.skills{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.skills h4,.edu h4{font-weight:400;font-size:14px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px}
.edu h4{font-family:'Cormorant Garamond',serif;font-size:24px;letter-spacing:0;text-transform:none;margin-bottom:6px}
.edu p{margin-bottom:4px}.edu .tags{margin-top:18px}
.two{display:grid;grid-template-columns:1.2fr 1fr;gap:60px}
.lead{font-family:'Cormorant Garamond',serif;font-size:21px;line-height:1.55;color:#c9beb7;margin-bottom:18px;max-width:52ch}
.big{font-family:'Bodoni Moda',serif;font-weight:400;font-size:clamp(32px,4vw,52px);line-height:1.1;color:var(--sand);margin-bottom:20px}
.links{display:flex;gap:24px;flex-wrap:wrap;font-size:13px;letter-spacing:.08em}
.links a{border-bottom:1px solid var(--wine)}
.form{display:grid;gap:16px;align-content:start}
.form label{display:grid;gap:6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.form input,.form textarea{font:inherit;font-size:15px;letter-spacing:0;text-transform:none;color:var(--txt);background:var(--panel);border:1px solid var(--line);padding:12px;border-radius:0}
.form input:focus,.form textarea:focus{border-color:var(--sand)}
.form .btn{justify-self:start}
.foot{padding:24px 5vw;background:#2a0f14;font-size:12px;letter-spacing:.1em;text-transform:uppercase;text-align:center}
.nav li a{position:relative}
.nav li a::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:1px;background:var(--sand);transform:scaleX(0);transform-origin:left;transition:transform .3s}
.nav li a:hover::after{transform:scaleX(1)}
.ps .btn{transition:border-color .2s,background .2s,transform .2s}
.ps .btn:hover{transform:translateY(-2px)}
.hero::before{content:"";position:absolute;inset:-20%;background:radial-gradient(circle at 30% 60%,rgba(138,42,58,.35),transparent 45%),radial-gradient(circle at 75% 30%,rgba(224,185,160,.12),transparent 40%);animation:drift 16s ease-in-out infinite alternate;pointer-events:none}
@keyframes drift{to{transform:translate(6%,-4%) scale(1.1)}}
.giant span{display:inline-block;animation:rise 1.1s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i)*.07s)}
@keyframes rise{from{opacity:0;transform:translateY(60%);filter:blur(8px)}to{opacity:1;transform:none;filter:none}}
.photo{animation:enter 1.2s cubic-bezier(.2,.7,.2,1) .5s both,float 7s ease-in-out 1.8s infinite}
@keyframes enter{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
@keyframes float{50%{transform:translateY(-10px)}}
.hl>*{animation:up .9s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(.9s + var(--k,0)*.12s)}
.hl>:nth-child(2){--k:1}.hl>:nth-child(3){--k:2}
@keyframes up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
.marquee{overflow:hidden;border-bottom:1px solid var(--line);background:var(--panel);padding:18px 0}
.marquee>div{display:flex;width:max-content;animation:mq 30s linear infinite}
.marquee span{display:flex;gap:44px;padding-right:44px}
.marquee b{font:400 24px 'Cormorant Garamond',serif;letter-spacing:.12em;text-transform:uppercase;color:var(--sand);white-space:nowrap}
@keyframes mq{to{transform:translateX(-50%)}}
.ps.js .rv{opacity:0;transform:translateY(28px);transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1);transition-delay:calc(var(--i,0)*.12s)}
.ps.js .rv.in{opacity:1;transform:none}
.ps.js .card.in:hover{transform:translateY(-6px);border-color:var(--wine);transition-delay:0s}
@media(max-width:820px){
  .nav{padding:12px 5vw}.nav ul{display:none}
  .hero{display:flex;flex-direction:column;min-height:0;padding:24px 5vw 48px}
  .giant{position:relative;left:auto;right:auto;top:auto;margin-bottom:4cqw}
  .photo{position:relative;right:auto;top:auto;width:100%;height:min(105vw,460px);margin:-2cqw 0 0}
  .photo.empty{height:320px}
  .hl{position:relative;left:auto;bottom:auto;width:auto;margin-top:-24px}
  .hl h2{font-size:clamp(20px,6vw,26px)}
  .sec{padding:56px 5vw}
  .lead{font-size:19px}
  .cards,.two,.skills{grid-template-columns:1fr}.two{gap:40px}
  .ps .btn{padding:10px 18px}
  .form input,.form textarea{font-size:16px}
}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.ps *,.ps *::after{transition:none!important}.hero::before,.giant span,.photo,.hl>*,.marquee>div{animation:none!important}.ps.js .rv{opacity:1!important;transform:none!important}}
`;