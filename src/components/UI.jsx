export function Badge({ estado }) {
  const styles = {
    activo:  { bg: '#e8f5e9', color: '#2d7a1f' },
    vencido: { bg: '#fdecea', color: '#c0392b' },
    pagado:  { bg: '#E3F0FD', color: '#185FA5' },
  }
  const s = styles[estado] || styles.activo
  const labels = { activo: 'Activo', vencido: 'Vencido', pagado: 'Pagado' }
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: '11px', fontWeight: '700',
      padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em'
    }}>
      {labels[estado] || estado}
    </span>
  )
}

export function fmt(n) {
  return '$' + Math.round(n || 0).toLocaleString('es-CO')
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
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <div style={{
        width: '32px', height: '32px', border: '3px solid #e0e0e0',
        borderTop: '3px solid var(--blue)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{icon}</div>
      <p style={{ fontSize: '15px' }}>{text}</p>
    </div>
  )
}

export function Card({ children, onClick, style = {} }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)', padding: '14px 16px',
      marginBottom: '10px', cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 0.15s', ...style
    }}
    onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
    onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = 'none')}
    >
      {children}
    </div>
  )
}

export function Btn({ children, onClick, variant = 'primary', style = {}, disabled = false }) {
  const base = {
    padding: '11px 16px', borderRadius: 'var(--radius)', fontSize: '15px',
    fontWeight: '600', border: 'none', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '6px', transition: 'opacity 0.15s',
    opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer', ...style
  }
  const variants = {
    primary:   { background: 'var(--blue)', color: 'white' },
    secondary: { background: 'transparent', color: 'var(--blue)', border: '1.5px solid var(--blue)' },
    danger:    { background: 'var(--red-light)', color: 'var(--red)' },
    success:   { background: 'var(--green-light)', color: 'var(--green)' },
  }
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>{children}</button>
}

export function Input({ label, type = 'text', value, onChange, placeholder, min, step }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      {label && <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '5px' }}>{label}</label>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} step={step}
        style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '15px', outline: 'none', background: '#fff' }}
        onFocus={e => e.target.style.borderColor = 'var(--blue)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', borderRadius: '20px 20px 0 0',
        padding: '20px', width: '100%', maxWidth: '480px',
        maxHeight: '92vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
