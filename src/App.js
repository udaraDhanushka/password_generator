import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, ShieldCheck, Settings, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [password, setPassword] = useState('');
  const [saltRounds, setSaltRounds] = useState(10);
  const [hashedPassword, setHashedPassword] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [copied, setCopied] = useState(false);
  const workerRef = useRef();

  useEffect(() => {
    // Webpack 5 Native Worker Support
    workerRef.current = new Worker(new URL('./hash.worker.js', import.meta.url));
    
    workerRef.current.onmessage = (event) => {
      const { hash } = event.data;
      if (hash) {
        setHashedPassword(hash);
      }
      setIsHashing(false);
    };

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  useEffect(() => {
    const generateHash = () => {
      if (!password) {
        setHashedPassword('');
        return;
      }

      setIsHashing(true);
      // Debounce slightly to avoid flooding worker
      const timer = setTimeout(() => {
        workerRef.current.postMessage({ password, saltRounds });
      }, 300);

      return () => clearTimeout(timer);
    };

    generateHash();
  }, [password, saltRounds]);

  const handleCopy = () => {
    if (hashedPassword) {
      navigator.clipboard.writeText(hashedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container" style={{ width: '100%', maxWidth: '600px', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
        style={{ padding: '2rem' }}
      >
        <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', marginBottom: '1rem' }}>
            <ShieldCheck size={48} color="var(--accent-primary)" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Secure Hash Generator</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Generate secure bcrypt hashes instantly in your browser.</p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Password Input */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to hash..."
              autoFocus
            />
          </div>

          {/* Settings */}
          <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={18} color="var(--text-secondary)" />
                <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>Complexity (Salt Rounds)</span>
              </div>
              <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>{saltRounds}</span>
            </div>
            <input
              type="range"
              min="4"
              max="16"
              value={saltRounds}
              onChange={(e) => setSaltRounds(parseInt(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              <span>Faster</span>
              <span>More Secure</span>
            </div>
          </div>

          {/* Result */}
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
              <span>Bcrypt Hash</span>
              {isHashing && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                  <Loader2 size={14} className="spin" /> Generating...
                </span>
              )}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={hashedPassword}
                readOnly
                placeholder="Hash will appear here..."
                style={{ 
                  paddingRight: '3.5rem', 
                  backgroundColor: 'var(--bg-secondary)',
                  fontFamily: 'monospace',
                  color: hashedPassword ? 'var(--success)' : 'var(--text-secondary)'
                }}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCopy}
                disabled={!hashedPassword}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '6px',
                  bottom: '6px',
                  width: '40px',
                  background: copied ? 'var(--success)' : 'var(--bg-primary)',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  cursor: hashedPassword ? 'pointer' : 'default',
                  color: copied ? 'white' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s, color 0.2s'
                }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </motion.button>
            </div>
          </div>

        </div>

        <footer style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <p>Client-side hashing. Your password marks remain on this device.</p>
        </footer>
      </motion.div>
    </div>
  );
}

export default App;
