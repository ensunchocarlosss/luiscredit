import { useState } from 'react'
import { Badge, fmt, calcDebt, calcTotal, Card, Empty, Spinner } from './UI'
import { Search } from 'lucide-react'

function ProgressBar({ pagado, total }) {
  const pct = total > 0 ? Math.min(100, (pagado / total) * 100) : 0
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
        <span>Progreso</span><span style={{ fontWeight: '600' }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? 'var(--green)' : 'var(--blue)', borderRadius: '3px' }} />
      </div>
    </div>
  )
}

export default function Clientes({ loans, loading, onSelect }) {
  const [q, setQ] = useState('')
  const filtered = loans.filter(l => l.nombre.toLowerCase().includes(q.toLowerCase()))

  return (
    <div style={{ padding: '14px', paddingBottom: '80px' }}>
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text" placeholder="Buscar cliente..." value={q} onChange={e => setQ(e.target.value)}
          style={{ width: '100%', padding: '11px 14px 11px 36px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '15px', outline: 'none', background: 'var(--surface)' }}
          onFocus={e => e.target.style.borderColor = 'var(--blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>
      {loading ? <Spinner /> : filtered.length === 0
        ? <Empty icon="👤" text="No se encontraron clientes" />
        : filtered.map(l => {
            const deuda = calcDebt(l)
            const total = calcTotal(l)
            return (
              <Card key={l.id} onClick={() => onSelect(l)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700' }}>{l.nombre}</span>
                  <Badge estado={l.estado} />
                </div>
                {l.telefono && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>📞 {l.telefono}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>{l.interes}%/mes · {l.plazo} meses</span>
                  <span>{l.fecha}</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700' }}>Por cobrar: {fmt(deuda)}</div>
                <ProgressBar pagado={l.pagado || 0} total={total} />
              </Card>
            )
          })
      }
    </div>
  )
}
