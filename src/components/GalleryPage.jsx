import GalleryGrid from './GalleryGrid'

const TESTIMONIALS = [
  {
    quote: "They captured every emotion, every stolen glance — moments we didn't even know were happening. Pure magic.",
    author: "Priya & Arjun",
    detail: "Mumbai · Feb 2024"
  },
  {
    quote: "We cried looking at the photos. Not because we were sad — because they were so perfectly, heartbreakingly beautiful.",
    author: "Sophie & Marcus",
    detail: "Goa · December 2023"
  },
  {
    quote: "Candid storytelling at its finest. Our entire family couldn't stop talking about these images for weeks.",
    author: "Rhea & Karthik",
    detail: "Udaipur · March 2024"
  }
]

export default function GalleryPage({ images, username, onImageLoad, onReset, visible }) {
  return (
    <div className={`gallery-page ${visible ? 'visible' : ''}`} id="gallery-page">

      {/* Hero */}
      <section className="hero" id="hero">
        <div className="grain-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow">@{username}</p>
          <h1 className="hero-title">
            Your Story,<br />
            <em>Told in Every Frame</em>
          </h1>
          <p className="hero-sub">
            Candid wedding photography that lives in the in-between moments
          </p>
          <a href="#gallery" className="hero-cta">View the Gallery ↓</a>
        </div>
        <button className="reset-btn" onClick={onReset} id="reset-btn" title="Start over">
          ✕ New Session
        </button>
      </section>

      {/* About */}
      <section className="about" id="about">
        <div className="about-inner">
          <div className="about-text">
            <span className="section-label">Our Philosophy</span>
            <h2 className="about-title">We Don't Pose. We Observe.</h2>
            <p className="about-body">
              The best wedding photographs are never planned — they are felt.
              We move through your day like shadows, watching for the laugh that escapes before the vows, 
              the grandmother's tear, the quiet exhale after the first dance.
            </p>
            <p className="about-body">
              Our style is rooted in documentary filmmaking and fine art portraiture. 
              No forced smiles. No awkward lineups. Just truth, beautifully light.
            </p>
            <div className="about-stats">
              <div className="stat"><span className="stat-num">500+</span><span className="stat-label">Weddings</span></div>
              <div className="stat"><span className="stat-num">12</span><span className="stat-label">Years</span></div>
              <div className="stat"><span className="stat-num">8</span><span className="stat-label">Awards</span></div>
            </div>
          </div>
          <div className="about-quote">
            <blockquote>
              "Photography is the art of frozen time — the ability to store emotion and feelings within a frame."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="gallery-section" id="gallery">
        <div className="section-header">
          <span className="section-label">The Work</span>
          <h2 className="section-title">Captured Moments</h2>
          <p className="section-desc">{images.length} frames from real love stories</p>
        </div>
        <GalleryGrid images={images} onImageLoad={onImageLoad} />
      </section>

      {/* Testimonials */}
      <section className="testimonials" id="testimonials">
        <div className="section-header">
          <span className="section-label">Kind Words</span>
          <h2 className="section-title">What Couples Say</h2>
        </div>
        <div className="testimonial-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-mark">"</div>
              <p className="testimonial-quote">{t.quote}</p>
              <div className="testimonial-author">
                <strong>{t.author}</strong>
                <span>{t.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="contact" id="contact">
        <div className="contact-inner">
          <span className="section-label">Let's Connect</span>
          <h2 className="contact-title">Begin Your Story</h2>
          <p className="contact-sub">Tell us about your wedding day and let's create something extraordinary together.</p>
          <form className="contact-form" onSubmit={e => e.preventDefault()}>
            <div className="form-row">
              <input type="text" placeholder="Your Names" className="form-input" id="contact-names" />
              <input type="email" placeholder="Email Address" className="form-input" id="contact-email" />
            </div>
            <input type="text" placeholder="Wedding Date & Venue" className="form-input" id="contact-venue" />
            <textarea placeholder="Tell us your story..." className="form-textarea" rows={4} id="contact-message" />
            <button type="submit" className="contact-btn" id="contact-submit">Send Enquiry →</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">✦ Candid Stories</div>
          <p className="footer-tagline">Photographing love in its most honest form.</p>
          <p className="footer-copy">© {new Date().getFullYear()} · All rights reserved</p>
        </div>
      </footer>
    </div>
  )
}
