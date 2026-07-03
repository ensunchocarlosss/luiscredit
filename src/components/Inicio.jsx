import { Badge, fmt, calcDebt, calcTotal, Card, Empty, Spinner } from './UI'
import { TrendingUp, DollarSign, Users, AlertTriangle } from 'lucide-react'

function StatCard({ label, value, color, Icon, glow }) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      border: glow ? '1px solid rgba(212,175,55,0.4)' : '1px solid var(--border2)',
      padding: '14px',
      boxShadow: glow ? '0 0 20px rgba(212,175,55,0.08)' : 'none'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>{label}</p>
          <p style={{ fontSize: '20px', fontWeight: '800', color: color || 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{value}</p>
        </div>
        <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '9px', color: color || 'var(--text-secondary)', border: '1px solid var(--border2)' }}>
          <Icon size={19} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ pagado, total }) {
  const pct = total > 0 ? Math.min(100, (pagado / total) * 100) : 0
  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px' }}>
        <span>Progreso de pago</span>
        <span style={{ fontWeight: '700', color: pct >= 100 ? '#4fc44f' : 'var(--gold)' }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: '5px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: pct >= 100 ? 'linear-gradient(90deg, #2d6a2d, #4fc44f)' : 'linear-gradient(90deg, var(--gold-dark), var(--gold))',
          borderRadius: '3px', transition: 'width 0.5s ease'
        }} />
      </div>
    </div>
  )
}

export default function Inicio({ loans, loading, onSelect }) {
  const activos  = loans.filter(l => l.estado === 'activo')
  const vencidos = loans.filter(l => l.estado === 'vencido')
  const totalPrestado = loans.reduce((a, l) => a + (l.monto || 0), 0)
  const porCobrar     = loans.reduce((a, l) => a + calcDebt(l), 0)

  return (
    <div style={{ padding: '14px', paddingBottom: '80px' }}>
      {/* Banner dorado */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1200, #2a1e00)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(212,175,55,0.3)',
        padding: '16px', marginBottom: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
      }}>
        <p style={{ fontSize: '10px', color: 'rgba(212,175,55,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', fontFamily: 'Syne, sans-serif' }}>Capital en circulación</p>
        <p style={{ fontSize: '30px', fontWeight: '800', color: 'var(--gold)', fontFamily: 'Syne, sans-serif', letterSpacing: '-1px' }}>{fmt(totalPrestado)}</p>
        <p style={{ fontSize: '12px', color: 'rgba(212,175,55,0.5)', marginTop: '2px' }}>Por cobrar: <span style={{ color: 'var(--gold)', fontWeight: '700' }}>{fmt(porCobrar)}</span></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <StatCard label="Activos"  value={activos.length}  color="var(--green-bright)" Icon={Users} />
        <StatCard label="Vencidos" value={vencidos.length} color="var(--red)"          Icon={AlertTriangle} />
      </div>

      <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px', fontFamily: 'Syne, sans-serif' }}>
        Préstamos recientes
      </p>

      {loading ? <Spinner /> : loans.length === 0
        ? <Empty icon="📋" text="Aún no hay préstamos registrados" />
        : loans.slice(0, 6).map(l => {
            const deuda = calcDebt(l)
            const total = calcTotal(l)
            return (
              <Card key={l.id} onClick={() => onSelect(l)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>{l.nombre}</span>
                  <Badge estado={l.estado} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  <span>{l.interes}% mensual · {l.plazo} meses</span>
                  <span>{l.fecha}</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: deuda > 0 ? 'var(--gold)' : '#4fc44f' }}>
                  Por cobrar: {fmt(deuda)}
                </div>
                <ProgressBar pagado={l.pagado || 0} total={total} />
              </Card>
            )
          })
      }
    </div>
  )
}
