import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ShieldCheck, Sparkles } from 'lucide-react'
import './App.css'

function playAwakeningSound() {
  try {
    const audio = new AudioContext()
    const now = audio.currentTime

    const master = audio.createGain()
    const compressor = audio.createDynamicsCompressor()

    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.18, now + 0.45)
    master.gain.setValueAtTime(0.18, now + 1.1)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 4.5)

    compressor.threshold.value = -24
    compressor.knee.value = 24
    compressor.ratio.value = 3
    compressor.attack.value = 0.02
    compressor.release.value = 0.5

    master.connect(compressor)
    compressor.connect(audio.destination)

    // Warm, deep arrival tone.
    const bass = audio.createOscillator()
    const bassGain = audio.createGain()

    bass.type = 'sine'
    bass.frequency.setValueAtTime(72, now)
    bass.frequency.exponentialRampToValueAtTime(43, now + 2.2)

    bassGain.gain.setValueAtTime(0.0001, now)
    bassGain.gain.exponentialRampToValueAtTime(0.5, now + 0.35)
    bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8)

    bass.connect(bassGain)
    bassGain.connect(master)
    bass.start(now)
    bass.stop(now + 2.9)

    // Smooth atmospheric portal sweep.
    const buffer = audio.createBuffer(
      1,
      Math.floor(audio.sampleRate * 3.4),
      audio.sampleRate
    )
    const samples = buffer.getChannelData(0)

    for (let i = 0; i < samples.length; i++) {
      const progress = i / samples.length
      samples[i] = (Math.random() * 2 - 1) *
        Math.sin(Math.PI * progress) *
        (0.35 + progress * 0.65)
    }

    const atmosphere = audio.createBufferSource()
    const filter = audio.createBiquadFilter()
    const atmosphereGain = audio.createGain()

    atmosphere.buffer = buffer
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(180, now)
    filter.frequency.exponentialRampToValueAtTime(1800, now + 1.8)
    filter.frequency.exponentialRampToValueAtTime(700, now + 3.3)
    filter.Q.value = 0.65

    atmosphereGain.gain.setValueAtTime(0.0001, now)
    atmosphereGain.gain.exponentialRampToValueAtTime(0.2, now + 1.1)
    atmosphereGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4)

    atmosphere.connect(filter)
    filter.connect(atmosphereGain)
    atmosphereGain.connect(master)
    atmosphere.start(now)
    atmosphere.stop(now + 3.4)

    // Gentle harmonic tones.
    ;[
      { frequency: 220, start: 0.55, volume: 0.045 },
      { frequency: 330, start: 0.9, volume: 0.035 },
      { frequency: 440, start: 1.25, volume: 0.025 },
    ].forEach((tone) => {
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(tone.frequency, now + tone.start)

      gain.gain.setValueAtTime(0.0001, now + tone.start)
      gain.gain.exponentialRampToValueAtTime(
        tone.volume,
        now + tone.start + 0.3
      )
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 4.2
      )

      oscillator.connect(gain)
      gain.connect(master)
      oscillator.start(now + tone.start)
      oscillator.stop(now + 4.3)
    })

    // A soft, glass-like arrival chime.
    const chime = audio.createOscillator()
    const chimeGain = audio.createGain()

    chime.type = 'sine'
    chime.frequency.setValueAtTime(660, now + 1.55)
    chime.frequency.exponentialRampToValueAtTime(990, now + 2.1)

    chimeGain.gain.setValueAtTime(0.0001, now + 1.55)
    chimeGain.gain.exponentialRampToValueAtTime(0.055, now + 1.8)
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2)

    chime.connect(chimeGain)
    chimeGain.connect(master)
    chime.start(now + 1.55)
    chime.stop(now + 4.3)

    window.setTimeout(() => {
      void audio.close()
    }, 5000)
  } catch {
    // Audio is optional; the visual experience remains available.
  }
}

function AuthGateway() {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [notice, setNotice] = useState("")

  const providers = [
    { name: "Google", mark: "G" },
    { name: "Apple", mark: "●" },
    { name: "GitHub", mark: "GH" },
    { name: "Microsoft", mark: "▦" },
    { name: "Discord", mark: "D" },
    { name: "Facebook", mark: "f" },
  ]

  const handleProvider = (provider: string) => {
    setNotice(
      `${provider} sign-in will be activated after its free OAuth application is configured.`
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice(
      "Account authentication is not connected yet. Your details have not been sent or stored."
    )
  }

  return (
    <motion.div
      className="auth-layout"
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.1 }}
    >
      <div className="auth-intro">
        <div className="auth-orb">
          <div className="auth-orb-core">G</div>
        </div>
        <span className="eyebrow">
          <Sparkles size={14} /> YOUR INTELLIGENCE. YOUR SPACE.
        </span>
        <h1>Welcome to GEDION.</h1>
        <p>
          A personal intelligence for discovery, creation, learning,
          and everything you're ready to explore.
        </p>
        <div className="auth-trust">
          <ShieldCheck size={16} />
          <span>Designed around privacy and user control</span>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-heading">
          <span className="auth-overline">GEDION IDENTITY</span>
          <h2>{mode === "signin" ? "Sign in" : "Create your account"}</h2>
          <p>
            {mode === "signin"
              ? "Continue your journey with GEDION."
              : "Create your personal GEDION identity."}
          </p>
        </div>

        <div className="auth-providers">
          {providers.map((provider) => (
            <button
              className="provider-button"
              type="button"
              key={provider.name}
              onClick={() => handleProvider(provider.name)}
              aria-label={`Continue with ${provider.name}`}
            >
              <span className={`provider-mark provider-${provider.name.toLowerCase()}`}>
                {provider.mark}
              </span>
              <span>{provider.name}</span>
            </button>
          ))}
        </div>

        <div className="auth-divider">
          <span />
          <small>OR USE YOUR EMAIL</small>
          <span />
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              Display name
              <input
                type="text"
                name="displayName"
                placeholder="What should GEDION call you?"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={8}
              required
            />
          </label>

          {mode === "signin" && (
            <button
              className="forgot-password"
              type="button"
              onClick={() => setNotice("Password recovery will be available when account services are connected.")}
            >
              Forgot password?
            </button>
          )}

          <button className="auth-submit" type="submit">
            {mode === "signin" ? "Continue" : "Create GEDION account"}
            <span>→</span>
          </button>
        </form>

        {notice && (
          <p className="auth-notice" role="status">
            {notice}
          </p>
        )}

        <div className="auth-switch">
          <span>
            {mode === "signin"
              ? "New to GEDION?"
              : "Already have an account?"}
          </span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin")
              setNotice("")
            }}
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </div>

        <p className="auth-legal">
          By continuing, you agree to use GEDION responsibly.
          Your account data will be protected by its authentication system.
        </p>
      </div>
    </motion.div>
  )
}

function App() {
  const [entered, setEntered] = useState(false)

  const handleEnter = () => {
    playAwakeningSound()
    setEntered(true)
  }

  return (
    <main className="gedion-shell">
      <motion.div
        className="arrival-shroud"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2.8, ease: [0.7, 0, 0.2, 1] }}
      />

      <div className="reality-field" aria-hidden="true">
        {Array.from({ length: 32 }, (_, index) => (
          <span
            className="reality-particle"
            key={index}
            style={{
              left: `${(index * 37 + 11) % 100}%`,
              top: `${(index * 61 + 7) % 100}%`,
              animationDelay: `${(index % 9) * -0.7}s`,
              animationDuration: `${7 + (index % 6) * 1.5}s`,
            }}
          />
        ))}
      </div>

      <div className="dimensional-rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <motion.header
        className="topbar"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 1.1 }}
      >
        <a className="brand" href="/" aria-label="GEDION home">
          <span className="brand-mark">G</span>
          <span className="brand-name">GEDION</span>
        </a>
        <span className="system-status">
          <span className="status-dot" />
          SYSTEM STANDBY
        </span>
      </motion.header>

      <section className="welcome-stage">
        <AnimatePresence mode="wait">
          {!entered ? (
            <motion.div
              className="welcome-content"
              key="welcome"
              role="button"
              tabIndex={0}
              aria-label="Awaken GEDION"
              onClick={handleEnter}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  handleEnter()
                }
              }}
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }}
              transition={{ delay: 0.35, duration: 1.4, ease: "easeOut" }}
            >
              <motion.div
                className="orb-wrap"
                initial={{ opacity: 0, scale: 0.25, filter: "blur(25px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.65, duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="orb-aura" />
                <div className="lightning-field" aria-hidden="true">
                  <span className="lightning-bolt bolt-one" />
                  <span className="lightning-bolt bolt-two" />
                  <span className="lightning-bolt bolt-three" />
                </div>
                <div className="orb-orbit orbit-one" />
                <div className="orb-orbit orbit-two" />
                <motion.div
                  className="gedion-orb"
                  animate={{
                    scale: [1, 1.035, 1],
                    filter: ["brightness(0.92)", "brightness(1.12)", "brightness(0.92)"],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="orb-core">
                    <span className="orb-g">G</span>
                  </div>
                </motion.div>
                <div className="orb-reflection" />
              </motion.div>

              <motion.div
                className="identity"
                initial={{ opacity: 0, letterSpacing: "0.8em", filter: "blur(8px)" }}
                animate={{ opacity: 1, letterSpacing: "0.32em", filter: "blur(0px)" }}
                transition={{ delay: 1.65, duration: 1.5 }}
              >
                GEDION
              </motion.div>

              <motion.p
                className="welcome-kicker"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.15, duration: 1.2 }}
              >
                INTELLIGENCE. PRESENCE. POSSIBILITY.
              </motion.p>

              <motion.p
                className="welcome-copy"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.35, duration: 1.2 }}
              >
                An intelligence designed to understand, create, and explore
                alongside you.
              </motion.p>

              <motion.p
                className="awakening-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.25, 0.75, 0.25] }}
                transition={{ delay: 2.8, duration: 2.8, repeat: Infinity }}
              >
                TOUCH ANYWHERE TO AWAKEN
              </motion.p>

              <motion.div
                className="privacy-note"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.7, duration: 1 }}
              >
                <ShieldCheck size={14} />
                <span>Your space. Your control.</span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="account"
              className="account-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              <AuthGateway />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <motion.footer
        className="bottom-bar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.2 }}
      >
        <span>GEDION AI</span>
        <span className="footer-center">AN INTELLIGENCE BY SOIN TECH</span>
        <span>FOUNDATION 01</span>
      </motion.footer>
    </main>
  )
}

export default App
