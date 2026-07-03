import { useState } from 'react'
import { LogIn, AlertCircle } from 'lucide-react'

const USUARIO = 'Luisensuncho'
const CLAVE = 'Luisensuncho123*'

export default function Login({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    if (user.trim() === USUARIO && pass === CLAVE) {
      setLoading(true)
      setError(false)
      setTimeout(() => { setLoading(false); onLogin() }, 600)
    } else {
      setError(true)
      setPass('')
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', padding: '24px',
      background: 'radial-gradient(ellipse at top, #0d1a0d 0%, #080c08 60%)'
    }}>
      {/* Logo real */}
      <img
        src="/icon-512.png"
        alt="LuisCrédit"
        style={{
          width: '110px', height: '110px',
          borderRadius: '26px', objectFit: 'cover',
          marginBottom: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 30px rgba(74,180,74,0.15)'
        }}
      />

      <h1 style={{
        fontSize: '32px', fontWeight: '800', fontFamily: 'Syne, sans-serif',
        letterSpacing: '-1px', marginBottom: '5px'
      }}>
        Luis<span style={{ color: 'var(--gold)' }}>Crédit</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Gestión profesional de préstamos
      </p>

      <div style={{
        width: '100%', background: 'var(--surface)',
        borderRadius: '20px', border: '1px solid var(--border2)',
        padding: '26px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', fontFamily: 'Syne, sans-serif', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Usuario
          </label>
          <input
            type="text" value={user} onChange={e => setUser(e.target.value)}
            placeholder="Tu usuario" autoComplete="username"
            style={{ width: '100%', padding: '13px 16px', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', fontSize: '15px', outline: 'none', background: 'var(--surface2)', color: 'var(--text)', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'}
          />
        </div>
        <div style={{ marginBottom: '22px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', fontFamily: 'Syne, sans-serif', display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Contraseña
          </label>
          <input
            type="password" value={pass} onChange={e => setPass(e.target.value)}
            placeholder="Tu contraseña" autoComplete="current-password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '13px 16px', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', fontSize: '15px', outline: 'none', background: 'var(--surface2)', color: 'var(--text)', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'}
          />
        </div>
        <button onClick={handleLogin} disabled={loading} style={{
          width: '100%', padding: '14px',
          background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
          color: '#0a0a0a', border: 'none', borderRadius: 'var(--radius)',
          fontSize: '16px', fontWeight: '800', fontFamily: 'Syne, sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          cursor: loading ? 'default' : 'pointer', letterSpacing: '0.03em',
          boxShadow: '0 4px 16px rgba(212,175,55,0.25)',
          opacity: loading ? 0.8 : 1, transition: 'opacity 0.2s'
        }}>
          <LogIn size={18} /> {loading ? 'Entrando...' : 'Entrar'}
        </button>
        {error && (
          <div style={{
            marginTop: '14px', background: 'var(--red-light)',
            border: '1px solid rgba(224,82,82,0.3)',
            borderRadius: 'var(--radius)', padding: '11px 14px',
            display: 'flex', alignItems: 'center', gap: '8px',
            color: 'var(--red)', fontSize: '13px', fontWeight: '600'
          }}>
            <AlertCircle size={16} /> Usuario o contraseña incorrectos
          </div>
        )}
      </div>
    </div>
  )
}
