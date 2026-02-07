import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* ================= MAIN ================= */

export default function Home() {
  return (
    <div className="home-wrapper">
      <Navbar />
      <Hero />
      <FeaturedEvents />
      <Footer />

      <style>{css}</style>
    </div>
  );
}

/* ================= NAVBAR ================= */

function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="nav">
      <div className="nav-inner">
        <img src="/logo.png" className="logo" />

        <div className="nav-links">
          <button onClick={() => navigate("/events")}>Discover</button>
          <button onClick={() => navigate("/login")}>Login</button>
          <button className="signup" onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}

/* ================= HERO ================= */

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-inner">
        <h1>
          Discover Amazing <br /> Events Near You
        </h1>

        <p>
          Find concerts, tech events and campus experiences happening around you.
        </p>

        <div className="hero-btns">
          <button onClick={() => navigate("/events")} className="primary">
            Explore Events
          </button>

          <button onClick={() => navigate("/register")} className="outline">
            Host Event
          </button>
        </div>
      </div>
    </section>
  );
}

/* ================= FEATURED ================= */

function FeaturedEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
        const data = await res.json();

        const live = data.filter(e => e.status === "LIVE");

        // only 3 max
        setEvents(live.slice(0, 3));
      } catch {
        setEvents([]);
      }
    })();
  }, []);

  if (!events.length) return null;

  return (
    <section className="featured">
      <div className="featured-top">
        <h2>Live Events</h2>
        <button onClick={() => navigate("/events")}>View all →</button>
      </div>

      <div className="events-grid">
        {events.map(e => (
          <div
            key={e._id}
            className="event-card"
            onClick={() => navigate(`/events/${e._id}`)}
          >
            <img src={e.banner} />
            <div className="event-body">
              <h4>{e.title}</h4>
              <p>{new Date(e.date).toDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================= FOOTER ================= */

function Footer() {
  return (
    <footer className="footer">
      <img src="/logo.png" />
      <p>© {new Date().getFullYear()} Tictify</p>
    </footer>
  );
}

/* ================= CSS (ISOLATED) ================= */

const css = `

.home-wrapper{
  background:#0F0618;
  color:white;
  font-family:Inter, sans-serif;
}

/* NAV */
.nav{
  position:sticky;
  top:0;
  backdrop-filter:blur(10px);
  background:rgba(15,6,24,0.85);
}
.nav-inner{
  max-width:1200px;
  margin:auto;
  padding:14px 20px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}
.logo{height:34px}

.nav-links{display:flex;gap:18px}
.nav-links button{
  background:none;border:none;color:white;cursor:pointer
}
.signup{
  background:#22F2A6;
  border:none;
  padding:10px 18px;
  border-radius:999px;
  color:black;
}

/* HERO */
.hero{
  padding:80px 20px;
  text-align:center;
}
.hero-inner{
  max-width:800px;
  margin:auto;
}
.hero h1{
  font-size:clamp(28px,5vw,56px);
}
.hero p{
  color:#bbb;
  margin:18px 0 28px;
}
.hero-btns{
  display:flex;
  gap:14px;
  justify-content:center;
  flex-wrap:wrap;
}
.primary{
  background:#22F2A6;border:none;
  padding:14px 26px;border-radius:999px;
}
.outline{
  background:none;border:1px solid #22F2A6;
  color:#22F2A6;padding:14px 26px;border-radius:999px;
}

/* FEATURED */
.featured{
  max-width:1200px;
  margin:60px auto;
  padding:0 20px;
}
.featured-top{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:20px;
}
.featured-top button{
  background:none;border:none;color:#22F2A6;cursor:pointer
}

.events-grid{
  display:grid;
  gap:20px;
}

/* EVENT CARD */
.event-card{
  background:#170A25;
  border-radius:18px;
  overflow:hidden;
  cursor:pointer;
}
.event-card img{
  width:100%;
  height:180px;
  object-fit:cover;
}
.event-body{padding:14px}

/* FOOTER */
.footer{
  margin-top:80px;
  padding:40px;
  text-align:center;
  border-top:1px solid rgba(255,255,255,0.1)
}

/* ================= REAL RESPONSIVE ================= */

/* phones */
@media (max-width:600px){
  .events-grid{grid-template-columns:1fr}
}

/* tablet */
@media (min-width:601px) and (max-width:1023px){
  .events-grid{grid-template-columns:repeat(2,1fr)}
}

/* laptop */
@media (min-width:1024px){
  .events-grid{grid-template-columns:repeat(3,1fr)}
}

/* large desktop */
@media (min-width:1400px){
  .events-grid{grid-template-columns:repeat(4,1fr)}
}

`;
