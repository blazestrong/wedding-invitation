"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Draggable } from "gsap/Draggable";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, Draggable);

const COUPLE = { a: "Isla", b: "Theo", date: "June 14, 2027", iso: "2027-06-14", venue: "The Garden House, Tagaytay" };
const PROPOSAL = `Dear Isla,

You said yes before I finished the question,
and I have been catching up ever since.

Every road we took led back to this porch light,
this ring, this ordinary Tuesday that became
the best day of my life.

Come celebrate with us.

Always,
Theo`;

const SHOW_GIFTS = true;
const CHAPTERS = [["Story", "#ch-story"], ["Gallery", "#ch-gallery"], ["Dress code", "#ch-dress"], ["Reply", "#rsvp"]];
const SWATCHES = [["Dusty Blue", "#9DB0C4"], ["Faded Rose", "#D8B4B0"], ["Sage", "#B5C2A8"], ["Champagne", "#E3D3B8"], ["Slate", "#6F7C8C"]];
const AVOID = [["White or ivory", "#FFFFFF"], ["Neon", "#E4FF3C"], ["All black", "#222222"]];
const REMINDERS = [
  "Keep the aisle clear. Phones down during the ceremony so our photographer can work.",
  "Wear the palette above. Garden formal, soft colors.",
  "Arrive by 3:30 PM so we can begin on time.",
  "Reply by May 1, 2027, using the card below.",
  "Parking is on site. Little guests are welcome with a grown-up.",
];
const PHOTOS = [["Our first picture together", "Aug 2019"], ["The rooftop dinner", "Oct 2019"], ["First trip, first sunburn", "Mar 2021"], ["Meeting each other's families", "Dec 2022"], ["The night he asked", "Feb 2026"], ["Practicing our first dance", "Sep 2026"]];

function Mark({ kind }) {
  return (
    <svg className={`mark ${kind}`} viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
      {kind === "circle"
        ? <path pathLength="1" d="M8 22 C4 6 60 -2 92 10 C106 20 80 38 40 36 C12 34 2 26 14 12" />
        : <path pathLength="1" d="M2 30 C30 22 60 36 98 24" />}
    </svg>
  );
}

const Eph = ({ m, ...r }) => <div className={`eph estamp ${m ? "" : "hide-m"}`} aria-hidden="true" {...r} />;
const Postmark = ({ m, ...r }) => (
  <svg className={`eph ${m ? "" : "hide-m"}`} viewBox="0 0 100 100" aria-hidden="true" {...r}>
    <circle cx="50" cy="50" r="30" /><circle cx="50" cy="50" r="22" /><path d="M2 42q8-8 16 0t16 0M2 52q8-8 16 0t16 0M2 62q8-8 16 0t16 0" />
  </svg>
);
const Doodle = ({ d, vb = "0 0 60 60", m, ...r }) => (
  <svg className={`doodle ${m ? "" : "hide-m"}`} viewBox={vb} aria-hidden="true" {...r}><path pathLength="1" d={d} /></svg>
);

export default function Page() {
  const [opened, setOpened] = useState(false);
  const [sent, setSent] = useState(false);
  const [sound, setSound] = useState(false);
  const [guest, setGuest] = useState(null);
  const [days, setDays] = useState(null);
  const [giftOpen, setGiftOpen] = useState(false);
  const audio = useRef(null);
  const root = useRef(null);
  const ac = useRef(null);
  const soundOn = useRef(false);
  const lenisRef = useRef(null);

  useEffect(() => {
    setGuest(new URLSearchParams(window.location.search).get("guest"));
    setDays(Math.max(0, Math.ceil((new Date(COUPLE.iso) - new Date()) / 864e5)));
  }, []);

  const sfx = (kind) => {
    const c = ac.current;
    if (!c || !soundOn.current) return;
    const t = c.currentTime, g = c.createGain();
    g.connect(c.destination);
    if (kind === "thud") {
      const o = c.createOscillator();
      o.frequency.setValueAtTime(140, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.16);
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g); o.start(t); o.stop(t + 0.2);
    } else {
      const b = c.createBuffer(1, c.sampleRate * 0.35, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const s = c.createBufferSource(), f = c.createBiquadFilter();
      s.buffer = b; f.type = "bandpass"; f.frequency.value = 2500; g.gain.value = 0.08;
      s.connect(f); f.connect(g); s.start(t);
    }
  };

  const setSoundState = (on) => {
    soundOn.current = on;
    setSound(on);
    const a = audio.current;
    if (!a) return;
    if (on) a.play().catch(() => {}); else a.pause();
  };

  const openLetter = () => {
    if (opened) return;
    ac.current = new (window.AudioContext || window.webkitAudioContext)();
    setSoundState(true);
    sfx("rustle");
    setOpened(true);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tl = gsap.timeline({ onComplete: () => { document.body.classList.remove("locked"); document.querySelector(".intro").style.display = "none"; } });
    if (still) return tl.set(".intro", { autoAlpha: 0 });
    tl.to(".seal", { scale: 0.2, autoAlpha: 0, rotate: 40, duration: 0.5, ease: "back.in(2)" })
      .to(".flap", { rotateX: 180, duration: 0.8, ease: "power2.inOut" }, "-=0.1")
      .to(".env", { y: 140, scale: 1.08, duration: 0.7, ease: "power2.in" })
      .to(".intro", { autoAlpha: 0, duration: 0.6 }, "-=0.2");
  };

  useEffect(() => {
    if (!opened) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const typedEl = document.querySelector(".typed");
    if (still) { typedEl.textContent = PROPOSAL; gsap.set(".mark path, .doodle path, .tick path", { strokeDashoffset: 0 }); return; }

    const lenis = new Lenis({ lerp: 0.14, wheelMultiplier: 1.25 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // cursor ink trail (desktop only)
    let off = () => {};
    if (window.matchMedia("(pointer: fine)").matches) {
      let last = 0;
      const move = (e) => {
        const n = performance.now();
        if (n - last < 45) return;
        last = n;
        const d = document.createElement("i");
        d.className = "ink"; d.style.left = e.clientX + "px"; d.style.top = e.clientY + "px";
        document.body.appendChild(d);
        gsap.to(d, { autoAlpha: 0, scale: 0.2, y: 8, duration: 1.1, onComplete: () => d.remove() });
      };
      window.addEventListener("pointermove", move);
      off = () => window.removeEventListener("pointermove", move);
    }

    const ctx = gsap.context(() => {
      // hero: names write themselves, then the day count is stamped
      gsap.timeline({ delay: 1.8 })
        .fromTo(".hero-name", { strokeDasharray: 900, strokeDashoffset: 900, fillOpacity: 0 }, { strokeDashoffset: 0, duration: 2.6, ease: "power1.inOut" })
        .to(".hero-name", { fillOpacity: 1, duration: 0.8 }, "-=0.6")
        .from(".rubber", { scale: 2.4, rotate: -20, autoAlpha: 0, duration: 0.4, ease: "back.out(2)", onStart: () => sfx("thud") });

      // letters land on each other like mail on a desk
      const papers = gsap.utils.toArray(".paper");
      papers.forEach((p, i) => {
        gsap.set(p, { rotation: i % 2 ? 1.2 : -1.2 });
        gsap.from(p, { y: 140, rotation: i % 2 ? -5 : 5, autoAlpha: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: p.parentElement, start: "top 85%", onEnter: () => sfx("rustle") } });
        if (papers[i + 1] && papers[i + 1].closest(".stack") === p.closest(".stack")) gsap.to(p, { scale: 0.94, ease: "none", scrollTrigger: { trigger: papers[i + 1].parentElement, start: "top 90%", end: "top 25%", scrub: true } });
      });

      gsap.utils.toArray(".stamp").forEach((el) => {
        gsap.from(el, { scale: 2.2, rotate: -25, autoAlpha: 0, duration: 0.45, ease: "back.out(2.2)", scrollTrigger: { trigger: el, start: "top 85%", onEnter: () => sfx("thud") } });
      });
      gsap.utils.toArray(".dash").forEach((el) => {
        gsap.from(el, { scaleX: 0, duration: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%" } });
      });

      // photos develop
      gsap.fromTo(".photo", { filter: "blur(14px) sepia(1) saturate(.4)" }, { filter: "blur(0px) sepia(0) saturate(1)", ease: "none", scrollTrigger: { trigger: ".photo", start: "top 90%", end: "top 40%", scrub: true } });

      // hand-drawn circle and underline
      gsap.utils.toArray(".mark path, .doodle path, .tick path").forEach((p) => {
        gsap.to(p, { strokeDashoffset: 0, duration: 1, ease: "power2.out", scrollTrigger: { trigger: p, start: "top 85%" } });
      });

      // route draws and the plane flies along it
      const mask = document.querySelector("#reveal path");
      const mlen = mask.getTotalLength();
      gsap.set(mask, { strokeDasharray: mlen, strokeDashoffset: mlen });
      const mtl = gsap.timeline({ scrollTrigger: { trigger: ".map", start: "top 75%", end: "bottom 50%", scrub: 0.6 } });
      mtl.to(mask, { strokeDashoffset: 0, ease: "none", duration: 3 }, 0);
      mtl.to(".plane", { motionPath: { path: ".route", align: ".route", alignOrigin: [0.5, 0.5], autoRotate: true }, ease: "none", duration: 3 }, 0);
      gsap.utils.toArray(".stop").forEach((s, i) => mtl.from(s, { scale: 0, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(2)" }, i * 1.4));

      // background: washes shift cool to warm, drift slowly; margins move at different speeds
      const full = { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true };
      gsap.to(".wash-cool", { opacity: 0.12, ease: "none", scrollTrigger: full });
      gsap.to(".wash-warm", { opacity: 0.75, ease: "none", scrollTrigger: full });
      gsap.to(".wash", { x: "+=70", y: "+=50", duration: 20, yoyo: true, repeat: -1, ease: "sine.inOut" });
      gsap.utils.toArray(".eph, .doodle").forEach((el) => {
        gsap.to(el, { y: -600 * parseFloat(el.dataset.speed || "0.3"), ease: "none", scrollTrigger: full });
      });

      // gallery: pinned sideways run of postcards hanging on twine
      const track = document.querySelector(".track");
      gsap.to(track, { x: () => -(track.scrollWidth - window.innerWidth), ease: "none", scrollTrigger: { trigger: ".gallery", pin: true, scrub: 0.4, onUpdate: (self) => { gsap.set(".gfill", { scaleX: self.progress }); document.querySelector(".gcue").style.opacity = self.progress > 0.12 ? 0 : 1; }, end: () => "+=" + track.scrollWidth * 0.75, invalidateOnRefresh: true } });
      gsap.utils.toArray(".pc").forEach((c, i) => {
        const a = i % 2 ? -2.2 : 2.2;
        gsap.set(c, { rotation: a, transformOrigin: "50% 0" });
        gsap.to(c, { rotation: -a, duration: 2.6 + i * 0.25, yoyo: true, repeat: -1, ease: "sine.inOut" });
      });

      // scroll cues: hero hint fades once, thread plane tracks progress, ticks sit at chapter positions
      gsap.to(".cue", { autoAlpha: 0, duration: 0.5, scrollTrigger: { trigger: ".hero", start: "top -5%", toggleActions: "play none none none" } });
      gsap.to(".plane2", { top: "100%", ease: "none", scrollTrigger: full });
      const ticks = gsap.utils.toArray(".tk");
      const sts = ticks.map((b) => ScrollTrigger.create({ trigger: document.querySelector(b.dataset.t), start: "top 60%" }));
      const place = () => { const m = ScrollTrigger.maxScroll(window); ticks.forEach((b, i) => { b.style.top = (sts[i].start / m) * 100 + "%"; }); };
      const mark = () => { const y = window.scrollY; let k = -1; sts.forEach((st, i) => { if (y >= st.start) k = i; }); ticks.forEach((b, i) => b.classList.toggle("on", i === k)); };
      ScrollTrigger.addEventListener("refresh", place);
      place();
      ScrollTrigger.create({ trigger: root.current, start: "top top", end: "bottom bottom", onUpdate: mark });

      // typewriter
      const o = { n: 0 };
      gsap.to(o, { n: PROPOSAL.length, ease: "none", onUpdate: () => { typedEl.textContent = PROPOSAL.slice(0, Math.round(o.n)); }, scrollTrigger: { trigger: typedEl, start: "top 70%", end: "+=420", scrub: true } });

      // tear-off stub
      Draggable.create(".stub", {
        type: "x", bounds: { minX: 0, maxX: 240 },
        onDragEnd() {
          if (this.x > 170) {
            sfx("rustle");
            gsap.to(this.target, { x: 520, rotate: 18, autoAlpha: 0, duration: 0.5, onComplete: () => lenis.scrollTo("#rsvp") });
          } else gsap.to(this.target, { x: 0, duration: 0.4, ease: "back.out(2)" });
        },
      });
    }, root);

    return () => { ctx.revert(); off(); lenis.destroy(); gsap.ticker.remove(tick); };
  }, [opened]);

  useEffect(() => {
    if (!sent || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.timeline()
      .from(".mini", { scale: 0.3, y: 50, autoAlpha: 0, duration: 0.6, ease: "back.out(1.6)" })
      .from(".sentstamp", { scale: 2.6, rotate: -25, autoAlpha: 0, duration: 0.35, ease: "back.out(2)", onStart: () => sfx("thud") })
      .to(".mini", { x: 700, y: -240, rotate: 14, autoAlpha: 0, duration: 0.9, ease: "power2.in", delay: 1.1 });
  }, [sent]);

  const addr = guest ? `for ${guest}` : "for our dear friends & family";

  return (
    <>
      <audio ref={audio} src="/music.mp3" loop preload="none" />
      {opened && <button className="sound" onClick={() => setSoundState(!sound)}>{sound ? "sound on" : "sound off"}</button>}

      <div className="intro">
        <div className="stage">
          <div className="env">
            <div className="addr">{addr}</div>
            <div className="flap" />
            <button className="seal" onClick={openLetter} aria-label="Break the seal and open the letter">{COUPLE.a[0]}&amp;{COUPLE.b[0]}</button>
          </div>
          <p className="hint">you&rsquo;ve received a letter. break the seal.</p>
        </div>
      </div>

      <main ref={root}>
        <div className="bg" aria-hidden="true"><div className="wash wash-cool" /><div className="wash wash-warm" /><div className="tint" /></div>
        <nav className={`thread ${opened ? "show" : ""}`} aria-label="Page progress">
          <div className="line"><i className="plane2" /></div>
          {CHAPTERS.map(([label, sel]) => (
            <button key={sel} className="tk" data-t={sel} aria-label={`Jump to ${label}`} onClick={() => (lenisRef.current ? lenisRef.current.scrollTo(sel) : document.querySelector(sel)?.scrollIntoView())}><span>{label}</span></button>
          ))}
        </nav>
        <div className="ephemera" aria-hidden="true">
          <Postmark m data-speed="0.25" style={{ top: "11%", right: "3%" }} />
          <Eph m data-speed="0.4" style={{ top: "25%", left: "2%", transform: "rotate(-8deg)" }}>air mail</Eph>
          <svg className="eph clip" data-speed="0.15" viewBox="0 0 60 90" style={{ top: "37%", right: "4%" }}><path d="M18 70V24a12 12 0 0 1 24 0V76a8 8 0 0 1-16 0V30" /></svg>
          <svg className="eph twine hide-m" data-speed="0.5" viewBox="0 0 120 200" style={{ top: "52%", left: "1%" }}><path d="M60 0C10 40 110 80 60 120S10 180 60 200" /></svg>
          <Eph data-speed="0.35" style={{ top: "68%", right: "2%", transform: "rotate(7deg)" }}>with love</Eph>
          <Postmark data-speed="0.2" style={{ top: "85%", left: "3%" }} />
          <Doodle m data-speed="0.3" style={{ top: "17%", left: "5%", width: 46 }} d="M30 50C8 34 6 14 20 12C26 11 30 16 30 20C30 16 34 11 40 12C54 14 52 34 30 50Z" />
          <Doodle data-speed="0.45" style={{ top: "33%", right: "6%", width: 44 }} d="M30 6L36 24L55 24L40 35L46 54L30 42L14 54L20 35L5 24L24 24Z" />
          <Doodle m data-speed="0.2" vb="0 0 80 50" style={{ top: "47%", left: "4%", width: 70 }} d="M4 40C20 4 52 4 74 28M74 28L62 26M74 28L72 14" />
          <Doodle data-speed="0.4" vb="0 0 100 30" style={{ top: "62%", right: "7%", width: 90 }} d="M2 20C12 2 22 2 30 16S48 30 58 14S78 2 98 16" />
          <Doodle m data-speed="0.3" style={{ top: "78%", left: "6%", width: 40 }} d="M30 50C8 34 6 14 20 12C26 11 30 16 30 20C30 16 34 11 40 12C54 14 52 34 30 50Z" />
        </div>
        <section className="hero">
          <div className="postmark" aria-hidden="true">
            <svg className="waves" viewBox="0 0 100 40"><path d="M0 8q10-10 20 0t20 0t20 0t20 0t20 0M0 20q10-10 20 0t20 0t20 0t20 0t20 0M0 32q10-10 20 0t20 0t20 0t20 0t20 0" /></svg>
            <svg viewBox="0 0 120 120">
              <defs><path id="pm" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" /></defs>
              <g className="pm-spin"><text><textPath href="#pm">JUNE 14 2027   TAGAYTAY   POSTED WITH LOVE   </textPath></text></g>
              <circle cx="60" cy="60" r="30" /><path d="M38 54h44M38 62h44" />
            </svg>
          </div>
          <svg className="name" viewBox="0 0 700 190" role="img" aria-label={`${COUPLE.a} and ${COUPLE.b}`}>
            <text className="hero-name" x="350" y="140" textAnchor="middle">{COUPLE.a} &amp; {COUPLE.b}</text>
          </svg>
          <p>We are getting married, and we wrote this letter so you would hear it from us first.</p>
          {days !== null && <div className="rubber"><b>{days}</b> days to go</div>}
          <div className="dash" style={{ marginTop: "2rem" }} />
          <div className="cue" aria-hidden="true">keep scrolling<svg viewBox="0 0 24 40"><path d="M12 2C8 14 16 22 12 36M12 36L6 29M12 36L18 29" /></svg></div>
        </section>

        <div className="stack">
          <div className="slot" id="ch-story"><article className="paper" style={{ "--i": 0 }}>
            <div className="stamp">First hello</div>
            {guest && <p className="sig" style={{ marginTop: 0 }}>Dear {guest},</p>}
            <h2>How we met</h2>
            <p>We met at a friend&rsquo;s rooftop dinner, both of us holding the same borrowed <span className="mark-wrap">umbrella<Mark kind="under" /></span>. It rained for three hours, and neither of us wanted it to stop.</p>
            {/* <div className="photo" /> */}
            <div className="photo">
  <img
    src="/photos/Primary.jpg"
    alt="Our first photo together"
  />
</div>
            <p className="cap">our first photo together (replace me)</p>
          </article></div>

          <div className="slot"><article className="paper" style={{ "--i": 1, textAlign: "center" }}>
            <h2>Where we&rsquo;ve been</h2>
            <p style={{ margin: "0 auto" }}>Three places taught us who we are together.</p>
            <div className="map">
              <svg viewBox="0 0 700 340" role="img" aria-label="A route across three places: where we met, our first trip, and the proposal">
                <defs><mask id="reveal" maskUnits="userSpaceOnUse"><path d="M60 270 C 190 60, 300 330, 360 170 S 560 20, 640 120" stroke="#fff" strokeWidth="16" fill="none" /></mask></defs>
                <g mask="url(#reveal)"><path className="route" d="M60 270 C 190 60, 300 330, 360 170 S 560 20, 640 120" /></g>
                <g className="stop"><circle className="pin" cx="60" cy="270" r="9" /><text className="place" x="40" y="305">where we met</text></g>
                <g className="stop"><circle className="pin" cx="360" cy="170" r="9" /><text className="place" x="318" y="210">first trip together</text></g>
                <g className="stop"><circle className="pin" cx="640" cy="120" r="9" /><text className="place" x="560" y="98">the proposal</text></g>
                <path className="plane" d="M14 0 L-10 -8 L-5 0 L-10 8 Z" />
              </svg>
            </div>
          </article></div>

          <div className="slot"><article className="paper" style={{ "--i": 2 }}>
            <div className="stamp">Yes!</div>
            <h2>The proposal</h2>
            <p className="typed" style={{ maxWidth: "none" }} aria-label={PROPOSAL} />
          </article></div>

          <div className="slot"><article className="paper ticket" style={{ "--i": 3 }}>
            <h2>Save the date</h2>
            <dl style={{ display: "grid", gap: "1rem" }}>
              <div><dt>when</dt><dd><span className="mark-wrap">{COUPLE.date}<Mark kind="circle" /></span>, 4:00 PM</dd></div>
              <div><dt>where</dt><dd>{COUPLE.venue}</dd></div>
              <div><dt>what to wear</dt><dd>Garden formal, soft pastels welcome</dd></div>
            </dl>
            <ul className="list" style={{ textAlign: "left", justifySelf: "center" }}>
              <li>Ceremony at 4:00 PM</li><li>Dinner and dancing from 6:00 PM</li><li>Parking is available on site</li>
            </ul>
            <div className="stubrow">
              <div className="stub" role="button" tabIndex={0} aria-label="Go to the reply form" onKeyDown={(e) => e.key === "Enter" && lenisRef.current?.scrollTo("#rsvp")}>tear here to reply</div>
            </div>
          </article></div>

        </div>

        <section className="gallery" id="ch-gallery">
          <div className="gal-head"><h2>Our favorite postcards</h2><p className="cap">tap a card to flip it</p></div>
          <div className="gal-inner"><div className="track">
            {PHOTOS.map(([note, when], i) => (
              <button key={i} className="pc" style={{ marginTop: i % 2 ? 70 : 40 }} onClick={(e) => e.currentTarget.classList.toggle("flip")} aria-label={`Flip postcard: ${note}`}>
                <i className="peg" />
                <span className="face front" style={{ backgroundImage: `url(/photos/${i + 1}.jpg), linear-gradient(135deg, rgba(157,176,196,.75), rgba(216,180,176,.75))` }} />
                <span className="face back"><span className="estamp">{when}</span><span className="note">{note}</span></span>
              </button>
            ))}
          </div></div>
          <p className="cap gcue">keep scrolling, we&rsquo;re moving sideways</p>
          <div className="gbar"><i className="gfill" /></div>
        </section>

        <div className="stack">
          <div className="slot" id="ch-dress"><article className="paper" style={{ "--i": 0 }}>
            <h2>What to wear</h2>
            <p>Garden formal. Soft, muted colors look lovely in the late light. Tap a swatch to see it.</p>
            <div className="swatches">{SWATCHES.map(([n, c]) => (
              <button key={n} className="sw" onClick={() => gsap.fromTo(".tint", { backgroundColor: c, opacity: 0.3 }, { opacity: 0, duration: 1.4 })}><span style={{ background: c }} /><em>{n}</em></button>
            ))}</div>
            <p className="cap" style={{ marginTop: "1.2rem" }}>please skip</p>
            <div className="swatches">{AVOID.map(([n, c]) => <div key={n} className="sw no"><span style={{ background: c }} /><em>{n}</em></div>)}</div>
            <div className="outfits">
              <svg viewBox="0 0 68 90" role="img" aria-label="Dress sketch"><path d="M28 4 L40 4 L38 24 L58 84 L10 84 L30 24 Z" fill={SWATCHES[1][1]} /></svg>
              <svg viewBox="0 0 68 90" role="img" aria-label="Suit sketch"><path d="M20 4 L48 4 L56 20 L50 84 L18 84 L12 20 Z M34 10 L34 84 M28 4 L34 20 L40 4" fill={SWATCHES[4][1]} /></svg>
            </div>
          </article></div>

          <div className="slot"><article className="paper" style={{ "--i": 1 }}>
            <div className="rsvpstamp">kindly reply by May 1</div>
            <h2>Before you arrive</h2>
            <ul className="checks">{REMINDERS.map((t) => (
              <li key={t}><svg className="tick" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M4 13 L10 19 L21 5" /></svg><span>{t}</span></li>
            ))}</ul>
          </article></div>

          {SHOW_GIFTS && (
            <div className="slot"><article className="paper" style={{ "--i": 2 }}>
              <h2>A note about gifts</h2>
              <p>Your presence is the only gift we need. If you would still like to give something, the details are tucked in an envelope.</p>
              <button className="gift" aria-expanded={giftOpen} onClick={() => setGiftOpen(!giftOpen)}>{giftOpen ? "close the envelope" : "open the envelope"}</button>
              {giftOpen && <ul className="list gift-opts">{["Honeymoon fund", "Cash gift", "Registry link"].map((g) => <li key={g}>{g}<span className="qr">QR</span></li>)}</ul>}
            </article></div>
          )}

          <div className="slot" id="rsvp"><article className="paper" style={{ "--i": 3 }}>
            <div className="rsvpstamp">kindly reply by May 1</div>
            <h2>Write back to us</h2>
            {sent ? (
              <div className="sentwrap">
                <div className="mini"><i className="flap2" /><span className="sentstamp">SENT</span></div>
                <p role="status">Thank you. Your reply is on its way, and we can&rsquo;t wait to see you.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <label>Your name<input required name="name" defaultValue={guest || ""} /></label>
                <label>Will you join us?<select name="attending"><option>Yes, with joy</option><option>Sadly, no</option></select></label>
                <label>Number of guests<input type="number" min="1" max="6" defaultValue="1" name="guests" /></label>
                <label>Meal choice<select name="meal"><option>Chicken</option><option>Fish</option><option>Vegetarian</option></select></label>
                <label>Dietary notes<input name="diet" /></label>
                <label>A song that gets you dancing<input name="song" /></label>
                <label>A message for the couple<textarea name="message" /></label>
                <button className="btn" type="submit">Send reply</button>
              </form>
            )}
          </article></div>
        </div>

        <section style={{ minHeight: "60vh" }}>
          <p className="sig" style={{ fontSize: "2.4rem", textAlign: "center" }}>P.S. Bring an umbrella. Just in case.</p>
          <div className="dash" />
        </section>
      </main>
    </>
  );
}
