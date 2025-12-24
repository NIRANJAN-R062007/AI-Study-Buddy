import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const navigation = [
  { name: 'AI Chat', href: '/ai-chat', icon: '🤖' },
  { name: 'Flashcards', href: '/flashcards', icon: '🎴' },
  { name: 'Quiz', href: '/quiz', icon: '🎯' },
  { name: 'Study Plan', href: '/study-plan', icon: '📅' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="sidebar" style={{
      width: '280px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid rgba(229, 231, 235, 0.5)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      padding: '2rem 1.5rem',
      backdropFilter: 'blur(10px)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="sidebar-header" style={{
        marginBottom: '3rem',
        padding: '0 0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--primary-gradient)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: 'var(--shadow-glow)'
          }}>
            🤖
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            MACAVA
          </span>
        </div>
      </div>

      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '1rem 1.25rem',
                textDecoration: 'none',
                color: isActive ? 'white' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary-gradient)' : 'transparent',
                borderRadius: 'var(--radius-lg)',
                transition: 'all var(--transition-fast)',
                fontWeight: isActive ? '600' : '500',
                boxShadow: isActive ? 'var(--shadow-glow)' : 'none'
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)'
                  e.currentTarget.style.color = 'var(--primary-color)'
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Need help?</p>
        <button style={{
          width: '100%',
          padding: '0.5rem',
          background: 'var(--primary-color)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          color: 'white',
          fontSize: '0.875rem',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'background 0.2s'
        }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary-color)'}
        >
          Contact Support
        </button>
      </div>
    </div>
  )
}
