export function Badge({ estado }) {
  const styles = {
    activo:  { bg: 'rgba(45,106,45,0.2)', color: '#4fc44f', border: '1px solid rgba(79,196,79,0.3)' },
    vencido: { bg: 'rgba(224,82,82,0.15)', color: '#e05252', border: '1px solid rgba(224,82,82,0.3)' },
    pagado:  { bg: 'rgba(212,175,55,0.12)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' },
  }
  const s = styles[estado] || styles.activo
  const labels = { activo: '● Activo', vencido: '⚠ Vencido', pagado: '✓ Pagado' }
  return (
    <span style={{
      background: s.bg, color: s.color, border: s.border,
      fontSize: '10px', fontWeight: '700',
      padding: '3px 10px', borderRadius: '20px',
      textTransform: 'uppercase', letterSpacing: '0.05em',
      fontFamily: 'Syne, sans-serif'
    }}>
      {labels[estado] || estado}
    </span>
  )
}

export function fmt(n) {
  return '$' + Math.round(n || 0).toLocaleString('es-CO')
}

export function formatMiles(valor) {
  const soloNumeros = String(valor).replace(/\D/g, '')
  if (!soloNumeros) return ''
  return soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function calcDebt(loan) {
  const total = loan.monto * (1 + (loan.interes / 100) * loan.plazo)
  return Math.max(0, total - (loan.pagado || 0))
}

export function calcTotal(loan) {
  return loan.monto * (1 + (loan.interes / 100) * loan.plazo)
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
      <div style={{
        width: '36px', height: '36px',
        border: '3px solid var(--border2)',
        borderTop: '3px solid var(--gold)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
    </div>
  )
}

export function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 16px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '52px', marginBottom: '14px', filter: 'grayscale(0.3)' }}>{icon}</div>
      <p style={{ fontSize: '15px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{text}</p>
    </div>
  )
}

export function Card({ children, onClick, style = {} }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border2)',
      padding: '14px 16px',
      marginBottom: '10px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      ...style
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.4)' } }}
    onMouseLeave={e => { if (onClick) { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.boxShadow = 'none' } }}
    >
      {children}
    </div>
  )
}

export function Btn({ children, onClick, variant = 'primary', style = {}, disabled = false }) {
  const base = {
    padding: '12px 16px', borderRadius: 'var(--radius)', fontSize: '15px',
    fontWeight: '700', fontFamily: 'Syne, sans-serif', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
    transition: 'opacity 0.15s, transform 0.1s',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    letterSpacing: '0.02em',
    ...style
  }
  const variants = {
    primary:   { background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#0a0a0a' },
    secondary: { background: 'transparent', color: 'var(--gold)', border: '1.5px solid var(--gold)' },
    danger:    { background: 'var(--red-light)', color: 'var(--red)', border: '1px solid rgba(224,82,82,0.3)' },
    success:   { background: 'var(--green-light)', color: '#4fc44f', border: '1px solid rgba(79,196,79,0.3)' },
    ghost:     { background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border2)' },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = disabled ? '0.5' : '1' }}
    >
      {children}
    </button>
  )
}

export function Input({ label, type = 'text', value, onChange, placeholder, min, step }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      {label && (
        <label style={{
          fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700',
          fontFamily: 'Syne, sans-serif', display: 'block', marginBottom: '6px',
          textTransform: 'uppercase', letterSpacing: '0.07em'
        }}>{label}</label>
      )}
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} min={min} step={step}
        style={{
          width: '100%', padding: '11px 14px',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)', fontSize: '15px',
          outline: 'none', background: 'var(--surface2)',
          color: 'var(--text)', transition: 'border-color 0.2s'
        }}
        export function InputMonto({ label, value, onChange, placeholder }) {
  const handleChange = (e) => {
    const crudo = e.target.value.replace(/\D/g, '')
    onChange(crudo)
  }
  return (
    <div style={{ marginBottom: '14px' }}>
      {label && (
        <label style={{
          fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700',
          fontFamily: 'Syne, sans-serif', display: 'block', marginBottom: '6px',
          textTransform: 'uppercase', letterSpacing: '0.07em'
        }}>{label}</label>
      )}
      <input
        type="text" inputMode="numeric" value={formatMiles(value)} onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '11px 14px',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)', fontSize: '15px',
          outline: 'none', background: 'var(--surface2)',
          color: 'var(--text)', transition: 'border-color 0.2s'
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
    </div>
  )
}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', borderRadius: '20px 20px 0 0',
        border: '1px solid var(--border2)', borderBottom: 'none',
        padding: '20px', width: '100%', maxWidth: '480px',
        maxHeight: '92vh', overflowY: 'auto'
      }}>
        <div style={{ width: '40px', height: '4px', background: 'var(--border2)', borderRadius: '2px', margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: 'var(--gold)' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '18px' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
