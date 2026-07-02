import { useState } from 'react'
import { Building2, LogIn, AlertCircle } from 'lucide-react'

const USUARIO = 'Luisensuncho'
const CLAVE = 'Luisensuncho123*'

export default function Login({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)

  const handleLogin = () => {
    if (user.trim() === USUARIO && pass === CLAVE) {
      setError(false)
      onLogin()
    } else {
      setError(true)
      setPass('')
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', padding: '24px',
      background: 'var(--bg)'
    }}>
      <div style={{ color: 'var(--blue)', marginBottom: '8px' }}>
        <Building2 size={56} strokeWidth={1.5} />
      </div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>
        Luis<span style={{ color: 'var(--blue)' }}>Crédit</span>
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
        Gestión profesional de préstamos
      </p>

      <div style={{
        width: '100%', background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: '24px'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            Usuario
          </label>
          <input
            type="text" value={user} onChange={e => setUser(e.target.value)}
            placeholder="Tu usuario" autoComplete="username"
            style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '15px', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = 'var(--blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            Contraseña
          </label>
          <input
            type="password" value={pass} onChange={e => setPass(e.target.value)}
            placeholder="Tu contraseña" autoComplete="current-password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '15px', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = 'var(--blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <button onClick={handleLogin} style={{
          width: '100%', padding: '13px', background: 'var(--blue)', color: 'white',
          border: 'none', borderRadius: 'var(--radius)', fontSize: '16px', fontWeight: '600',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}>
          <LogIn size={18} /> Entrar
        </button>
        {error && (
          <div style={{
            marginTop: '12px', background: 'var(--red-light)', borderRadius: 'var(--radius)',
            padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px',
            color: 'var(--red)', fontSize: '13px', fontWeight: '500'
          }}>
            <AlertCircle size={16} /> Usuario o contraseña incorrectos
          </div>
        )}
      </div>
    </div>
  )
}
