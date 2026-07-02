import { fmt, calcDebt, calcTotal } from './UI'
import { TrendingUp, DollarSign, CheckCircle, AlertTriangle, BarChart2 } from 'lucide-react'

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

  const Card = ({ icon: Icon, label, value, color, bg }) => (
    <div style={{ background: bg || 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '14px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '10px', color: color || 'var(--blue)' }}>
          <Icon size={22} />
        </div>
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
          <p style={{ fontSize: '22px', fontWeight: '800', color: color || 'var(--text)' }}>{value}</p>
        </div>
      </div>
    </div>
  )

  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

  return (
    <div style={{ padding: '14px', paddingBottom: '80px' }}>
      <div style={{ background: 'var(--blue)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '14px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <BarChart2 size={18} />
          <p style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mes actual — {meses[mesActual]} {anioActual}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><p style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>Cobrado este mes</p><p style={{ fontSize: '22px', fontWeight: '800' }}>{fmt(cobradoMes)}</p></div>
          <div><p style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>Prestado este mes</p><p style={{ fontSize: '22px', fontWeight: '800' }}>{fmt(prestadoMes)}</p></div>
        </div>
      </div>

      <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Resumen general</p>
      <Card icon={DollarSign}    label="Total prestado"     value={fmt(totalPrestado)} color="var(--blue)" />
      <Card icon={TrendingUp}    label="Total cobrado"      value={fmt(totalGanado)}   color="var(--green)" />
      <Card icon={AlertTriangle} label="Pendiente por cobrar" value={fmt(totalCobrar)} color="var(--red)" />

      <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '14px 0 10px' }}>Estado de préstamos</p>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px' }}>
        {[
          { label: 'Total de clientes', value: loans.length, color: 'var(--text)' },
          { label: 'Activos', value: loans.filter(l=>l.estado==='activo').length, color: 'var(--blue)' },
          { label: 'Pagados completos', value: pagados, color: 'var(--green)' },
          { label: 'Vencidos', value: vencidos, color: 'var(--red)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--bg)' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
