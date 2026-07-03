import { fmt, calcDebt, calcTotal } from './UI'
import { TrendingUp, DollarSign, AlertTriangle, BarChart2 } from 'lucide-react'

export default function Resumen({ loans, pagos }) {
  const hoy = new Date()
  const mesActual = hoy.getMonth()
  const anioActual = hoy.getFullYear()

  const pagosMes = pagos.filter(p => {
    const d = new Date(p.created_at)
    return d.getMonth() === mesActual && d.getFullYear() === anioActual
  })
  const cobradoMes = pagosMes.reduce((a, p) => a + (p.monto || 0), 0)
  const prestadoMes = loans.filter(l => {
    const d = new Date(l.fecha)
    return d.getMonth() === mesActual && d.getFullYear() === anioActual
  }).reduce((a, l) => a + l.monto, 0)

  const totalPrestado = loans.reduce((a, l) => a + l.monto, 0)
  const totalCobrar   = loans.reduce((a, l) => a + calcDebt(l), 0)
  const totalGanado   = loans.reduce((a, l) => a + (l.pagado || 0), 0)
  const pagados       = loans.filter(l => l.estado === 'pagado').length
  const vencidos      = loans.filter(l => l.estado === 'vencido').length

  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

  const StatRow = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '18px', fontWeight: '800', color: color || 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{value}</span>
    </div>
  )

  return (
    <div style={{ padding: '14px', paddingBottom: '80px' }}>
      {/* Banner mes actual */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1200, #231900)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(212,175,55,0.4)',
        padding: '18px', marginBottom: '14px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <BarChart2 size={16} color="var(--gold)" />
          <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(212,175,55,0.7)', fontFamily: 'Syne, sans-serif' }}>
            {meses[mesActual]} {anioActual}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.5)', marginBottom: '5px' }}>Cobrado</p>
            <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--gold)', fontFamily: 'Syne, sans-serif' }}>{fmt(cobradoMes)}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'rgba(212,175,55,0.5)', marginBottom: '5px' }}>Prestado</p>
            <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--gold)', fontFamily: 'Syne, sans-serif' }}>{fmt(prestadoMes)}</p>
          </div>
        </div>
      </div>

      <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px', fontFamily: 'Syne, sans-serif' }}>Resumen general</p>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border2)', padding: '16px', marginBottom: '12px' }}>
        <StatRow label="Total prestado"       value={fmt(totalPrestado)} color="var(--gold)" />
        <StatRow label="Total cobrado"        value={fmt(totalGanado)}   color="#4fc44f" />
        <StatRow label="Pendiente por cobrar" value={fmt(totalCobrar)}   color="var(--red)" />
      </div>

      <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '14px 0 10px', fontFamily: 'Syne, sans-serif' }}>Estado de préstamos</p>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border2)', padding: '16px' }}>
        <StatRow label="Total de clientes"   value={loans.length}                                  color="var(--text)" />
        <StatRow label="Activos"             value={loans.filter(l=>l.estado==='activo').length}   color="var(--gold)" />
        <StatRow label="Pagados completos"   value={pagados}                                        color="#4fc44f" />
        <StatRow label="Vencidos"            value={vencidos}                                       color="var(--red)" />
      </div>
    </div>
  )
}
