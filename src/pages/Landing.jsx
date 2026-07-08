import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UltraProLanding = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic image URLs with fallbacks
  const imageUrls = {
    hero: 'https://images.unsplash.com/photo-1540575467063-178f50902556?w=800&q=80',
    concert: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80',
    conference: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80',
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80',
    testimonial1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    testimonial2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    testimonial3: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
  };

  // Payment provider logos
  const paymentLogos = [
    { name: 'Paystack', color: '#0EA5E9', emoji: '💳' },
    { name: 'Flutterwave', color: '#8B5CF6', emoji: '🌊' },
    { name: 'Ercaspay', color: '#EC4899', emoji: '⚡' },
  ];

  const handleGetStarted = (type) => navigate('/register-as');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email) {
      alert(`✨ Welcome! Check your email at ${email}`);
      setEmail('');
    }
  };

  const styles = {
    // GLOBAL
    page: {
      background: '#ffffff',
      color: '#1f2937',
      overflow: 'hidden',
    },
    globalStyle: `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideInLeft {
        from { opacity: 0; transform: translateX(-50px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(50px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
        50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.6); }
      }

      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #f1f5f9; }
      ::-webkit-scrollbar-thumb { background: #667eea; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: #764ba2; }
    `,

    // NAVIGATION
    nav: {
      background: scrolled ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
      borderBottom: scrolled ? '1px solid #e5e7eb' : 'none',
      padding: '1rem 2rem',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.08)' : 'none',
    },
    navContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      cursor: 'pointer',
      transition: 'transform 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    navLinks: {
      display: 'flex',
      gap: 'clamp(1rem, 3vw, 2.5rem)',
      alignItems: 'center',
    },
    navLink: {
      color: '#6b7280',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      transition: 'color 0.3s',
      position: 'relative',
      cursor: 'pointer',
    },
    navLinkHover: {
      color: '#667eea',
    },
    ctaButton: {
      padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 2vw, 1.5rem)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
      fontWeight: '600',
      transition: 'all 0.3s',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    },
    hamburger: {
      display: 'none',
      flexDirection: 'column',
      cursor: 'pointer',
      gap: '0.35rem',
    },
    hamburgerLine: {
      width: '25px',
      height: '3px',
      background: '#667eea',
      borderRadius: '2px',
      transition: 'all 0.3s',
    },

    // HERO
    hero: {
      marginTop: '70px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e7ff 50%, #f0e7ff 100%)',
      padding: 'clamp(2rem, 8vw, 6rem) 2rem',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '3rem',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    heroBefore: {
      content: '""',
      position: 'absolute',
      top: '-50%',
      right: '-10%',
      width: '500px',
      height: '500px',
      background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
      borderRadius: '50%',
      pointerEvents: 'none',
    },
    heroContent: {
      position: 'relative',
      zIndex: 1,
    },
    heroTitle: {
      fontSize: 'clamp(2rem, 8vw, 4rem)',
      fontWeight: '900',
      lineHeight: 1.1,
      margin: '0 0 1.5rem 0',
      color: '#1f2937',
      animation: 'fadeInUp 0.8s ease-out',
    },
    heroHighlight: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    heroSubtitle: {
      fontSize: 'clamp(1rem, 3vw, 1.25rem)',
      color: '#6b7280',
      lineHeight: 1.6,
      margin: '0 0 2rem 0',
      animation: 'fadeInUp 0.8s ease-out 0.1s both',
    },
    heroCta: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '3rem',
      flexWrap: 'wrap',
      animation: 'fadeInUp 0.8s ease-out 0.2s both',
    },
    ctaPrimary: {
      padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2.5rem)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    ctaSecondary: {
      padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2.5rem)',
      background: '#fff',
      color: '#667eea',
      border: '2px solid #667eea',
      borderRadius: '10px',
      fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    heroStats: {
      display: 'flex',
      gap: 'clamp(2rem, 5vw, 3rem)',
      animation: 'fadeInUp 0.8s ease-out 0.3s both',
    },
    stat: {
      display: 'flex',
      flexDirection: 'column',
    },
    statNumber: {
      fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
      fontWeight: '900',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    statLabel: {
      fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
      color: '#9ca3af',
      fontWeight: '600',
    },
    heroImage: {
      position: 'relative',
      height: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroImageCard: {
      position: 'relative',
      width: '100%',
      height: '100%',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
      animation: 'slideInRight 0.8s ease-out',
    },
    heroImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    floatingCard: {
      position: 'absolute',
      background: '#fff',
      borderRadius: '15px',
      padding: '1rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      fontWeight: '600',
      fontSize: '0.9rem',
      animation: 'bounce 3s ease-in-out infinite',
      zIndex: 10,
    },

    // TRUST SECTION
    trust: {
      padding: 'clamp(2rem, 5vw, 4rem)',
      background: '#f9fafb',
      textAlign: 'center',
      borderTop: '1px solid #e5e7eb',
      borderBottom: '1px solid #e5e7eb',
    },
    trustTitle: {
      fontSize: 'clamp(1rem, 3vw, 1.2rem)',
      color: '#6b7280',
      fontWeight: '600',
      marginBottom: '1.5rem',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    trustGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    trustItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
    },
    trustLogo: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    trustName: {
      fontSize: '0.9rem',
      color: '#6b7280',
      fontWeight: '600',
    },

    // FEATURES
    features: {
      padding: 'clamp(3rem, 8vw, 5rem) 2rem',
      background: '#ffffff',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    featureCard: {
      padding: '2rem',
      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
      borderRadius: '15px',
      border: '1px solid #e5e7eb',
      transition: 'all 0.3s',
      cursor: 'pointer',
      animation: 'fadeInUp 0.6s ease-out',
    },
    featureIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
      display: 'block',
    },
    featureTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      margin: '0.5rem 0',
      color: '#1f2937',
    },
    featureDesc: {
      fontSize: '0.95rem',
      color: '#6b7280',
      lineHeight: 1.6,
      margin: 0,
    },

    // HOW IT WORKS
    howItWorks: {
      padding: 'clamp(3rem, 8vw, 5rem) 2rem',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e7ff 100%)',
    },
    stepCard: {
      background: '#fff',
      padding: '2rem',
      borderRadius: '15px',
      border: '2px solid #e5e7eb',
      transition: 'all 0.3s',
      position: 'relative',
    },
    stepNumber: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '50px',
      height: '50px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      borderRadius: '50%',
      fontWeight: '800',
      fontSize: '1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    },

    // TESTIMONIALS
    testimonials: {
      padding: 'clamp(3rem, 8vw, 5rem) 2rem',
      background: '#ffffff',
    },
    testimonialCard: {
      background: '#f9fafb',
      padding: '2rem',
      borderRadius: '15px',
      border: '1px solid #e5e7eb',
      textAlign: 'center',
      transition: 'all 0.3s',
    },
    testimonialText: {
      fontSize: '1.05rem',
      fontStyle: 'italic',
      color: '#4b5563',
      marginBottom: '1.5rem',
      lineHeight: 1.7,
    },
    testimonialAuthor: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
    },
    testimonialAvatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #667eea',
    },
    testimonialName: {
      fontWeight: '700',
      color: '#1f2937',
    },
    testimonialRole: {
      fontSize: '0.9rem',
      color: '#6b7280',
    },

    // PRICING
    pricing: {
      padding: 'clamp(3rem, 8vw, 5rem) 2rem',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e7ff 100%)',
    },
    pricingGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    priceCard: {
      padding: '2.5rem',
      background: '#fff',
      borderRadius: '15px',
      border: '2px solid #e5e7eb',
      transition: 'all 0.3s',
      position: 'relative',
    },
    priceCardFeatured: {
      transform: 'scale(1.05)',
      borderColor: '#667eea',
      boxShadow: '0 20px 50px rgba(102, 126, 234, 0.2)',
    },
    priceBadge: {
      position: 'absolute',
      top: '-15px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      padding: '0.5rem 1.5rem',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    price: {
      fontSize: '2.5rem',
      fontWeight: '900',
      color: '#667eea',
      margin: '1.5rem 0',
    },
    pricePer: {
      fontSize: '0.9rem',
      color: '#6b7280',
    },
    priceFeatures: {
      listStyle: 'none',
      padding: 0,
      margin: '1.5rem 0',
      textAlign: 'left',
    },
    priceFeature: {
      padding: '0.75rem 0',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },

    // CTA SECTION
    cta: {
      padding: 'clamp(3rem, 8vw, 5rem) 2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      textAlign: 'center',
    },
    ctaContent: {
      maxWidth: '800px',
      margin: '0 auto',
    },
    ctaTitle: {
      fontSize: 'clamp(2rem, 6vw, 3rem)',
      fontWeight: '900',
      marginBottom: '1rem',
    },
    ctaSubtitle: {
      fontSize: 'clamp(1rem, 3vw, 1.2rem)',
      opacity: 0.95,
      marginBottom: '2rem',
      lineHeight: 1.6,
    },
    ctaButtonWhite: {
      padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2.5rem)',
      background: '#fff',
      color: '#667eea',
      border: 'none',
      borderRadius: '10px',
      fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },

    // NEWSLETTER
    newsletter: {
      padding: 'clamp(3rem, 8vw, 5rem) 2rem',
      background: '#f9fafb',
      textAlign: 'center',
    },
    newsletterContent: {
      maxWidth: '600px',
      margin: '0 auto',
    },
    newsletterTitle: {
      fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
      fontWeight: '900',
      marginBottom: '1rem',
      color: '#1f2937',
    },
    newsletterDesc: {
      fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
      color: '#6b7280',
      marginBottom: '2rem',
      lineHeight: 1.6,
    },
    newsletterForm: {
      display: 'flex',
      gap: '0.75rem',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    newsletterInput: {
      flex: '1 1 250px',
      padding: '0.9rem 1.5rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.3s',
    },
    newsletterButton: {
      padding: '0.9rem 2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s',
      whiteSpace: 'nowrap',
    },

    // FOOTER
    footer: {
      background: '#1f2937',
      color: '#d1d5db',
      padding: '3rem 2rem 1rem',
    },
    footerContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto 2rem',
    },
    footerSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    footerTitle: {
      color: '#f3f4f6',
      fontWeight: '700',
      marginBottom: '0.5rem',
    },
    footerLink: {
      color: '#9ca3af',
      textDecoration: 'none',
      fontSize: '0.95rem',
      transition: 'color 0.3s',
      cursor: 'pointer',
    },
    footerBottom: {
      borderTop: '1px solid #374151',
      paddingTop: '2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    socialLinks: {
      display: 'flex',
      gap: '1.5rem',
    },
  };

  return (
    <div style={styles.page}>
      <style>{styles.globalStyle}</style>

      {/* NAVIGATION */}
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <div style={styles.logo} onClick={() => window.scrollTo(0, 0)}>
            🎫 Tictify
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={styles.navLinks}>
              <a href="#features" style={styles.navLink} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#6b7280'}>Features</a>
              <a href="#how-it-works" style={styles.navLink} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#6b7280'}>How It Works</a>
              <a href="#pricing" style={styles.navLink} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#6b7280'}>Pricing</a>
            </div>
            <button style={styles.ctaButton} onClick={() => navigate('/login')} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'none'}>
              Login
            </button>
          </div>
          <div style={styles.hamburger} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <div style={styles.hamburgerLine}></div>
            <div style={styles.hamburgerLine}></div>
            <div style={styles.hamburgerLine}></div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={styles.hero}>
        <div style={styles.heroBefore}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            The Modern Way to Sell
            <br />
            <span style={styles.heroHighlight}>Amazing Events</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Buy tickets to unforgettable experiences or create and manage your own events. Trusted by thousands of organizers and party enthusiasts.
          </p>
          <div style={styles.heroCta}>
            <button style={styles.ctaPrimary} onClick={() => handleGetStarted('user')} onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.target.style.transform = 'none'}>
              🎉 Browse Events
            </button>
            <button style={styles.ctaSecondary} onClick={() => handleGetStarted('organizer')} onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.target.style.transform = 'none'}>
              🎪 Start Organizing
            </button>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.stat}>
              <div style={styles.statNumber}>50K+</div>
              <div style={styles.statLabel}>Events Listed</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statNumber}>500K+</div>
              <div style={styles.statLabel}>Tickets Sold</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statNumber}>₦2B+</div>
              <div style={styles.statLabel}>Revenue</div>
            </div>
          </div>
        </div>
        <div style={styles.heroImage}>
          <div style={styles.heroImageCard}>
            <img src={imageUrls.hero} alt="Events" style={styles.heroImg} onError={(e) => e.target.src = 'https://via.placeholder.com/500x400?text=Events'} />
          </div>
          <div style={{...styles.floatingCard, top: '10%', left: '5%'}}>🎭 Concert</div>
          <div style={{...styles.floatingCard, top: '60%', right: '5%'}}>💼 Conference</div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section style={styles.trust}>
        <h3 style={styles.trustTitle}>Trusted Payment Partners</h3>
        <div style={styles.trustGrid}>
          {paymentLogos.map((provider, i) => (
            <div key={i} style={styles.trustItem}>
              <div style={{...styles.trustLogo, fontSize: '3rem'}}>{provider.emoji}</div>
              <div style={styles.trustName}>{provider.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={styles.features} id="features">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 6vw, 2.5rem)', fontWeight: '900', textAlign: 'center', marginBottom: '3rem', color: '#1f2937' }}>
            Why Choose <span style={styles.heroHighlight}>Tictify?</span>
          </h2>
          <div style={styles.featuresGrid}>
            {[
              { icon: '🔒', title: 'Secure Payments', desc: 'Bank-level security. Paystack, Ercaspay & Flutterwave integrated.' },
              { icon: '📊', title: 'Real-time Analytics', desc: 'Track sales, revenue & attendees. Data-driven decisions.' },
              { icon: '🎟️', title: 'Easy Ticketing', desc: 'Create tickets in minutes. Recurring events & templates.' },
              { icon: '📱', title: 'Mobile-First', desc: 'Fully responsive. Book anywhere, anytime.' },
              { icon: '🔔', title: 'Smart Notifications', desc: 'Email, SMS & push notifications. Auto updates.' },
              { icon: '💳', title: 'Instant Payouts', desc: 'Get paid fast. Low fees, high speed.' },
            ].map((feature, i) => (
              <div key={i} style={styles.featureCard} onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.15)';}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none';}}>
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={styles.howItWorks} id="how-it-works">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 6vw, 2.5rem)', fontWeight: '900', textAlign: 'center', marginBottom: '3rem', color: '#1f2937' }}>
            How It Works in <span style={styles.heroHighlight}>4 Steps</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {[
              { num: 1, title: 'Sign Up', desc: 'Create your free account in seconds' },
              { num: 2, title: 'Browse or Create', desc: 'Find events or list your own' },
              { num: 3, title: 'Checkout', desc: 'Secure payment processing' },
              { num: 4, title: 'Enjoy', desc: 'Show your QR code and have fun!' },
            ].map((step, i) => (
              <div key={i} style={styles.stepCard} onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.15)';}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none';}}>
                <div style={styles.stepNumber}>{step.num}</div>
                <h3 style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '0.5rem', color: '#1f2937' }}>{step.title}</h3>
                <p style={{ color: '#6b7280', margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={styles.testimonials}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 6vw, 2.5rem)', fontWeight: '900', textAlign: 'center', marginBottom: '3rem', color: '#1f2937' }}>
            Loved by <span style={styles.heroHighlight}>Thousands</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { text: '"Tictify made it so easy to organize our first event. The platform is intuitive and the support is incredible!"', name: 'Chioma A.', role: 'Event Organizer', avatar: imageUrls.testimonial1 },
              { text: '"Best ticket platform I\'ve used. The mobile experience is seamless and checkout is lightning fast!"', name: 'Tunde O.', role: 'Party Enthusiast', avatar: imageUrls.testimonial2 },
              { text: '"The analytics dashboard helped us understand our audience better. Highly recommended!"', name: 'Zainab M.', role: 'Concert Promoter', avatar: imageUrls.testimonial3 },
            ].map((testimonial, i) => (
              <div key={i} style={styles.testimonialCard} onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.1)';}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none';}}>
                <p style={styles.testimonialText}>{testimonial.text}</p>
                <div style={styles.testimonialAuthor}>
                  <img src={testimonial.avatar} alt={testimonial.name} style={styles.testimonialAvatar} onError={(e) => e.target.src = 'https://via.placeholder.com/60?text=Avatar'} />
                  <div>
                    <div style={styles.testimonialName}>{testimonial.name}</div>
                    <div style={styles.testimonialRole}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={styles.pricing} id="pricing">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 6vw, 2.5rem)', fontWeight: '900', textAlign: 'center', marginBottom: '3rem', color: '#1f2937' }}>
            Simple, Transparent <span style={styles.heroHighlight}>Pricing</span>
          </h2>
          <div style={styles.pricingGrid}>
            {[
              { title: 'For Party Freaks', price: 'FREE', features: ['Browse unlimited events', 'Buy tickets', 'Get notifications', 'Follow organizers', '24/7 support'], featured: false },
              { title: 'For Organizers', price: '2%', note: 'per ticket', features: ['Unlimited events', 'Recurring events', 'Real-time analytics', 'Team management', 'QR scanner', 'Instant payouts'], featured: true },
              { title: 'Enterprise', price: 'Custom', features: ['White-label', 'Custom branding', 'Dedicated support', 'Advanced analytics', 'API access', 'Priority support'], featured: false },
            ].map((plan, i) => (
              <div key={i} style={{...styles.priceCard, ...(plan.featured ? styles.priceCardFeatured : {})}}>
                {plan.featured && <div style={styles.priceBadge}>Most Popular</div>}
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: plan.featured ? '1rem' : '0' }}>{plan.title}</h3>
                <div style={styles.price}>
                  {plan.price} <span style={styles.pricePer}>{plan.note}</span>
                </div>
                <ul style={styles.priceFeatures}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={styles.priceFeature}>
                      <span style={{ color: '#667eea', fontWeight: '700' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button style={{...styles.ctaPrimary, width: '100%', marginTop: '1.5rem'}} onClick={() => handleGetStarted(i === 1 ? 'organizer' : 'user')}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={styles.newsletter}>
        <div style={styles.newsletterContent}>
          <h2 style={styles.newsletterTitle}>Stay In The Loop</h2>
          <p style={styles.newsletterDesc}>
            Get exclusive event releases, tips, and offers delivered to your inbox
          </p>
          <form style={styles.newsletterForm} onSubmit={handleNewsletter}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.newsletterInput}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              required
            />
            <button type="submit" style={styles.newsletterButton} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'none'}>
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={styles.cta}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
          <p style={styles.ctaSubtitle}>
            Join thousands of organizers and party enthusiasts. Create your account today and start your journey.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={styles.ctaButtonWhite} onClick={() => handleGetStarted('user')} onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.target.style.transform = 'none'}>
              Browse Events
            </button>
            <button style={{...styles.ctaButtonWhite, background: 'transparent', border: '2px solid #fff', color: '#fff'}} onClick={() => handleGetStarted('organizer')} onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.target.style.transform = 'none'}>
              Create Events
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <div style={styles.footerTitle}>Tictify</div>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              The modern platform for event ticketing. Buy tickets or create events easily.
            </p>
          </div>
          <div style={styles.footerSection}>
            <div style={styles.footerTitle}>Product</div>
            <a href="#features" style={styles.footerLink} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Features</a>
            <a href="#pricing" style={styles.footerLink} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Pricing</a>
            <a href="#how-it-works" style={styles.footerLink} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>How It Works</a>
          </div>
          <div style={styles.footerSection}>
            <div style={styles.footerTitle}>Company</div>
            <a href="/" style={styles.footerLink} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>About Us</a>
            <a href="/" style={styles.footerLink} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Blog</a>
            <a href="/" style={styles.footerLink} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Contact</a>
          </div>
          <div style={styles.footerSection}>
            <div style={styles.footerTitle}>Legal</div>
            <a href="/" style={styles.footerLink} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Privacy Policy</a>
            <a href="/" style={styles.footerLink} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Terms of Service</a>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={{ margin: 0, color: '#6b7280' }}>© 2026 Tictify. All rights reserved.</p>
          <div style={styles.socialLinks}>
            <a href="/" style={styles.footerLink} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Twitter</a>
            <a href="/" style={styles.footerLink} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Facebook</a>
            <a href="/" style={styles.footerLink} onMouseEnter={(e) => e.target.style.color = '#667eea'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UltraProLanding;