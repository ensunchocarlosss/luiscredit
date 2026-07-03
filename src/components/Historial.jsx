import { fmt, Empty, Spinner } from './UI'
import { ArrowUpCircle } from 'lucide-react'

export default function Historial({ pagos, loans, loading }) {
  const loansMap = Object.fromEntries(loans.map(l => [l.id, l.nombre]))

  const items = pagos.map(p => ({
    ...p,
    clienteNombre: loansMap[p.prestamo_id] || 'Cliente',
    fecha: new Date(p.created_at).toLocaleDateString('es-CO')
  })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  if (loading) return <div style={{ padding: '14px' }}><Spinner /></div>
  if (items.length === 0) return <div style={{ padding: '14px' }}><Empty icon="📜" text="Sin movimientos aún" /></div>

  return (
    <div style={{ padding: '14px', paddingBottom: '80px' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border2)', overflow: 'hidden' }}>
        {items.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '13px 16px',
            borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(45,106,45,0.15)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ArrowUpCircle size={20} color="#4fc44f" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>{p.clienteNombre}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Abono · {p.fecha}</p>
                {p.nota && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{p.nota}</p>}
              </div>
            </div>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#4fc44f', fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>+{fmt(p.monto)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
