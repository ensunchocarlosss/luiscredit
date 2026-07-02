import { Badge, fmt, calcDebt, calcTotal, Card, Empty, Spinner } from './UI'
import { TrendingUp, DollarSign, Users, AlertTriangle } from 'lucide-react'

function StatCard({ label, value, color, Icon }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</p>
          <p style={{ fontSize: '20px', fontWeight: '800', color: color || 'var(--text)' }}>{value}</p>
        </div>
        <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '8px', color: color || 'var(--text-secondary)' }}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ pagado, total }) {
  const pct = total > 0 ? Math.min(100, (pagado / total) * 100) : 0
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
        <span>Progreso de pago</span>
        <span style={{ fontWeight: '600' }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? 'var(--green)' : 'var(--blue)', borderRadius: '3px', transition: 'width 0.4s' }} />
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <StatCard label="Total prestado" value={fmt(totalPrestado)} color="var(--blue)" Icon={DollarSign} />
        <StatCard label="Por cobrar"     value={fmt(porCobrar)}     color="var(--green)" Icon={TrendingUp} />
        <StatCard label="Activos"        value={activos.length}     color="var(--text)"  Icon={Users} />
        <StatCard label="Vencidos"       value={vencidos.length}    color="var(--red)"   Icon={AlertTriangle} />
      </div>

      <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
        Préstamos recientes
      </p>

      {loading ? <Spinner /> : loans.length === 0
        ? <Empty icon="📋" text="Aún no hay préstamos registrados" />
        : loans.slice(0, 6).map(l => {
            const deuda = calcDebt(l)
            const total = calcTotal(l)
            return (
              <Card key={l.id} onClick={() => onSelect(l)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700' }}>{l.nombre}</span>
                  <Badge estado={l.estado} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>{l.interes}% mensual · {l.plazo} meses</span>
                  <span>{l.fecha}</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: deuda > 0 ? 'var(--text)' : 'var(--green)' }}>
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
