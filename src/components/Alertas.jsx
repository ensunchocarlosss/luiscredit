import { calcDebt, fmt, Empty, Spinner } from './UI'
import { AlertTriangle, Clock } from 'lucide-react'

export default function Alertas({ loans, loading, onSelect }) {
  const hoy = new Date()
  const vencidos = loans.filter(l => {
    if (calcDebt(l) <= 0) return false
    const inicio = new Date(l.fecha)
    return Math.floor((hoy - inicio) / 86400000) > l.plazo * 30
  })
  const proximos = loans.filter(l => {
    if (calcDebt(l) <= 0) return false
    const inicio = new Date(l.fecha)
    const dias = Math.floor((hoy - inicio) / 86400000)
    const diasLimite = l.plazo * 30
    return dias <= diasLimite && dias >= diasLimite - 7
  })

  if (loading) return <div style={{ padding: '14px' }}><Spinner /></div>

  return (
    <div style={{ padding: '14px', paddingBottom: '80px' }}>
      {vencidos.length > 0 && <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <AlertTriangle size={16} color="var(--red)" />
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pagos vencidos ({vencidos.length})</p>
        </div>
        {vencidos.map(l => (
          <div key={l.id} onClick={() => onSelect(l)} style={{
            background: 'var(--red-light)', border: '1px solid #f5c6c3', borderRadius: 'var(--radius-lg)',
            padding: '14px 16px', marginBottom: '10px', cursor: 'pointer'
          }}>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#7b1a1a', marginBottom: '4px' }}>{l.nombre}</p>
            <p style={{ fontSize: '13px', color: 'var(--red)' }}>Debe: {fmt(calcDebt(l))} — plazo vencido</p>
          </div>
        ))}
      </>}

      {proximos.length > 0 && <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '14px 0 10px' }}>
          <Clock size={16} color="var(--amber)" />
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vencen esta semana ({proximos.length})</p>
        </div>
        {proximos.map(l => (
          <div key={l.id} onClick={() => onSelect(l)} style={{
            background: 'var(--amber-light)', border: '1px solid #f5d99a', borderRadius: 'var(--radius-lg)',
            padding: '14px 16px', marginBottom: '10px', cursor: 'pointer'
          }}>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#7a4a00', marginBottom: '4px' }}>{l.nombre}</p>
            <p style={{ fontSize: '13px', color: 'var(--amber)' }}>Debe: {fmt(calcDebt(l))} — vence pronto</p>
          </div>
        ))}
      </>}

      {vencidos.length === 0 && proximos.length === 0 && (
        <Empty icon="✅" text="Sin alertas — todo al día" />
      )}
    </div>
  )
}
