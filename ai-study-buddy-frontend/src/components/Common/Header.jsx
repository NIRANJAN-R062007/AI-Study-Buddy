import React from 'react'

export default function Header() {
  return (
    <header className="header" style={{
      background: 'var(--bg-sidebar)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '1.25rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div>
        <h2 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--text-primary)'
        }}>
          Welcome back, Student! 👋
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          padding: '0.5rem 1rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span>Ready to learn?</span>
          <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></span>
        </div>

        <div style={{
          width: '40px',
          height: '40px',
          background: 'var(--secondary-gradient)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(236, 72, 153, 0.3)'
        }}>
          S
        </div>
      </div>
    </header>
  )
}
