import React, { useEffect, useRef, useState } from "react";

const LOCAL_USERS_KEY = "emt_local_users";

const GOOGLE_CLIENT_ID =
  "784857874574-oibifjsulhc6fqsdlrinnegloi98oj2t.apps.googleusercontent.com";

const API_BASE = import.meta.env.VITE_API_URL;

const LoginPage = ({ onLogin }) => {
  const googleBtnRef = useRef(null);
  const cardRef = useRef(null);
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const [googleApiError, setGoogleApiError] = useState(false);

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async (response) => {
    setIsLoading(true);
    try {
      console.log("Google login callback triggered");
      
      // Decode the JWT token
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      console.log("Google user payload:", payload);

      // Validate required fields
      if (!payload.email) {
        throw new Error("No email found in Google response");
      }

      // 🔑 CALL BACKEND TO GET JWT
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: payload.email,
          name: payload.name || payload.given_name + " " + payload.family_name,
          picture: payload.picture,
        }),
      });

      console.log("Backend response status:", res.status);
      
      const data = await res.json();
      console.log("Backend response data:", data);

      if (!res.ok) {
        throw new Error(data.message || `Login failed: ${res.status}`);
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      // ✅ STORE TOKEN & USER (VERY IMPORTANT)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("emt_user", JSON.stringify(data.user));

      console.log("Login successful, calling onLogin callback");
      onLogin(data.user);
      
    } catch (err) {
      console.error("Google login error:", err);
      alert(`Login failed: ${err.message || "Please try again"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeGoogleAuth = () => {
    /* global google */
    if (!window.google || !GOOGLE_CLIENT_ID) {
      console.warn("Google API not loaded yet, retrying in 500ms...");
      setTimeout(initializeGoogleAuth, 500);
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 320,
          type: "standard",
          logo_alignment: "center",
        });
      }
      
      setGoogleApiLoaded(true);
      console.log("Google Auth initialized successfully");
    } catch (err) {
      console.error("Failed to initialize Google Auth:", err);
      // Retry after a short delay
      setTimeout(initializeGoogleAuth, 1000);
    }
  };

  useEffect(() => {
    // Initialize Google Auth when component mounts
    initializeGoogleAuth();

    // Also listen for Google API load events
    const handleGoogleApiLoad = () => {
      if (window.google && !window.google.accounts?.id?.initialized) {
        initializeGoogleAuth();
      }
    };

    // Add event listener for Google API load
    if (window.google && typeof window.google.accounts !== 'undefined') {
      handleGoogleApiLoad();
    } else {
      window.addEventListener('google-loaded', handleGoogleApiLoad);
    }

    // Handle page visibility changes (e.g., when user switches tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden && window.google && googleBtnRef.current) {
        // Re-render button when page becomes visible
        try {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill",
            width: 320,
          });
        } catch (err) {
          console.warn("Failed to re-render Google button on visibility change:", err);
        }
      }
    };

    // Handle window focus events for better mobile support
    const handleWindowFocus = () => {
      if (window.google && googleBtnRef.current && !googleApiLoaded) {
        try {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill",
            width: 320,
          });
        } catch (err) {
          console.warn("Failed to render Google button on window focus:", err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    // Retry initialization if Google API is still not loaded after 3 seconds
    const retryTimer = setTimeout(() => {
      if (!googleApiLoaded && !window.google) {
        console.warn("Google API still not loaded after 3 seconds, retrying...");
        initializeGoogleAuth();
      }
    }, 3000);

    // Mark as failed if Google API still not available after 8 seconds
    const failTimer = setTimeout(() => {
      if (!googleApiLoaded && !window.google) {
        console.error("Google API failed to load after 8 seconds");
        setGoogleApiError(true);
      }
    }, 8000);

    return () => {
      window.removeEventListener('google-loaded', handleGoogleApiLoad);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      clearTimeout(retryTimer);
      clearTimeout(failTimer);
    };
  }, [onLogin, googleApiLoaded]);

  /* ================= PARTICLE BACKGROUND (DESKTOP) ================= */
  useEffect(() => {
    if (window.innerWidth < 768) return;

    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.4,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
    }));

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 186, 0, 0.58)";

      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x <= 0 || p.x >= canvas.width) p.dx *= -1;
        if (p.y <= 0 || p.y >= canvas.height) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ================= CARD TILT (FINE POINTER) ================= */
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const card = cardRef.current;
    if (!card) return;

    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (y - 0.5) * 8;
      const rotateY = (x - 0.5) * -8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const reset = () => {
      card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
    };

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", reset);

    return () => {
      card.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", reset);
    };
  }, []);

  /* ================= LOCAL LOGIN / SIGNUP ================= */
  const handleFakeSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    const email = form.get("email");
    const password = form.get("password");
    const name = form.get("name");

    const endpoint =
      activeTab === "signup"
        ? `${API_BASE}/api/auth/register`
        : `${API_BASE}/api/auth/login`;

    const body =
      activeTab === "signup"
        ? { name, email, password }
        : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Auth failed");
        return;
      }

      // ✅ STORE TOKEN & USER
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("emt_user", JSON.stringify(data.user));

      onLogin(data.user);
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="auth-wrapper">
      <canvas id="particle-canvas" />

      <div className="auth-container">
        <div className="identity-panel">
          <div className="auth-brand">
            <div className="brand-row">
              <div className="brand-circle">₹</div>
              <h1>Expense Tool</h1>
            </div>
            <p>
              {activeTab === "signup"
                ? "Build better money habits with one smart dashboard."
                : "Track. Control. Save."}
            </p>
          </div>

          <div className="stats">
            <div>
              <h3>50K+</h3>
              <span>Users</span>
            </div>
            <div>
              <h3>₹5Cr+</h3>
              <span>Tracked</span>
            </div>
            <div>
              <h3>99%</h3>
              <span>Uptime</span>
            </div>
          </div>

          <button
            type="button"
            className="switch-btn"
            onClick={() =>
              setActiveTab((prev) => (prev === "login" ? "signup" : "login"))
            }
          >
            {activeTab === "login" ? "Create Account" : "Login Instead"}
          </button>
        </div>

        <div className="form-panel">
          <div className="auth-card glow-card" ref={cardRef}>
            <div className="pill-toggle">
              <div
                className={`pill-slider ${
                  activeTab === "signup" ? "right" : ""
                }`}
              />
              <button
                type="button"
                className={activeTab === "login" ? "active" : ""}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={activeTab === "signup" ? "active" : ""}
                onClick={() => setActiveTab("signup")}
              >
                Signup
              </button>
            </div>

            <form className="auth-form" onSubmit={handleFakeSubmit}>
              {activeTab === "signup" && (
                <div className="field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              )}

              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="field password-field">
                <label>Password</label>
                <div className="password-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-pass"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <button type="submit" className="primary-btn submit-btn full-width">
                {activeTab === "login" ? "Login" : "Create Account"}
              </button>
            </form>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="google-login-container">
              {isLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Signing you in...</p>
                </div>
              ) : googleApiError ? (
                <div className="google-error-state">
                  <div className="error-icon">⚠️</div>
                  <p>Google Sign-In is temporarily unavailable</p>
                  <p className="error-subtext">Please use email/password login or try again later</p>
                  <button 
                    className="retry-btn"
                    onClick={() => {
                      setGoogleApiError(false);
                      setGoogleApiLoaded(false);
                      initializeGoogleAuth();
                    }}
                  >
                    Try Google Sign-In Again
                  </button>
                </div>
              ) : (
                <div ref={googleBtnRef} className="google-btn-wrapper" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
