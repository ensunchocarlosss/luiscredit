import { calcDebt, fmt, Empty, Spinner } from './UI'
import { AlertTriangle, Clock, CalendarDays, MessageCircle } from 'lucide-react'
import { calcularCobro } from '../lib/cobros'

export default function Alertas({ loans, loading, onSelect }) {
  const hoy = new Date()
  const cobros = loans
    .map(loan => ({ loan, info: calcularCobro(loan, hoy) }))
    .filter(item => item.info)
  const cobrosHoyYAtrasados = cobros.filter(({ info }) => info.diasHastaVencimiento <= 0)
  const cobrosProximos = cobros.filter(({ info }) => info.diasHastaVencimiento > 0 && info.diasHastaVencimiento <= 3)

  const abrirWhatsApp = (event, loan, info) => {
    event.stopPropagation()
    const telefono = String(loan.telefono || '').replace(/\D/g, '')
    if (!telefono) return
    const mensaje = `Hola ${loan.nombre}, le recuerdo que tiene un saldo pendiente de ${fmt(info.saldo)} con LuisCrédit. Gracias.`
    window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer')
  }

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
      {(cobrosHoyYAtrasados.length > 0 || cobrosProximos.length > 0) && <>
        {cobrosHoyYAtrasados.length > 0 && <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
            <CalendarDays size={15} color="var(--gold)" />
            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Syne, sans-serif' }}>
              Cobros de hoy y atrasados ({cobrosHoyYAtrasados.length})
            </p>
          </div>
          {cobrosHoyYAtrasados.map(({ loan, info }) => (
            <div key={`cobro-${loan.id}`} onClick={() => onSelect(loan)} style={{
              background: 'var(--surface)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: '10px', cursor: 'pointer'
            }}>
              <p style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: 'var(--text)', marginBottom: '4px' }}>{loan.nombre}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {info.diasAtraso === 0 ? 'Hoy' : `${info.diasAtraso} ${info.diasAtraso === 1 ? 'día' : 'días'} de atraso`}
                {' · Cuota aprox.: '}{fmt(info.cuota)}{' · Saldo pendiente: '}{fmt(info.saldo)}
              </p>
              {String(loan.telefono || '').replace(/\D/g, '') && <button
                onClick={event => abrirWhatsApp(event, loan, info)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 11px', borderRadius: 'var(--radius)', border: '1px solid rgba(79,196,79,0.35)', background: 'var(--green-light)', color: '#4fc44f', fontWeight: '700', cursor: 'pointer' }}
              >
                <MessageCircle size={15} /> WhatsApp
              </button>}
            </div>
          ))}
        </>}

        {cobrosProximos.length > 0 && <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', margin: '14px 0 10px' }}>
            <Clock size={15} color="var(--amber)" />
            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Syne, sans-serif' }}>
              Vencen en los próximos 3 días ({cobrosProximos.length})
            </p>
          </div>
          {cobrosProximos.map(({ loan, info }) => (
            <div key={`cobro-proximo-${loan.id}`} onClick={() => onSelect(loan)} style={{
              background: 'var(--surface)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: '10px', cursor: 'pointer'
            }}>
              <p style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: 'var(--text)', marginBottom: '4px' }}>{loan.nombre}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Vence en {info.diasHastaVencimiento} {info.diasHastaVencimiento === 1 ? 'día' : 'días'}
                {' · Cuota aprox.: '}{fmt(info.cuota)}{' · Saldo pendiente: '}{fmt(info.saldo)}
              </p>
              {String(loan.telefono || '').replace(/\D/g, '') && <button
                onClick={event => abrirWhatsApp(event, loan, info)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 11px', borderRadius: 'var(--radius)', border: '1px solid rgba(79,196,79,0.35)', background: 'var(--green-light)', color: '#4fc44f', fontWeight: '700', cursor: 'pointer' }}
              >
                <MessageCircle size={15} /> WhatsApp
              </button>}
            </div>
          ))}
        </>}
      </>}

      {vencidos.length > 0 && <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
          <AlertTriangle size={15} color="var(--red)" />
          <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Syne, sans-serif' }}>
            Pagos vencidos ({vencidos.length})
          </p>
        </div>
        {vencidos.map(l => (
          <div key={l.id} onClick={() => onSelect(l)} style={{
            background: 'var(--red-light)', border: '1px solid rgba(224,82,82,0.3)',
            borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: '10px', cursor: 'pointer',
            transition: 'border-color 0.2s'
          }}>
            <p style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: 'var(--text)', marginBottom: '4px' }}>{l.nombre}</p>
            <p style={{ fontSize: '13px', color: 'var(--red)' }}>Debe: {fmt(calcDebt(l))} — plazo vencido</p>
          </div>
        ))}
      </>}

      {proximos.length > 0 && <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', margin: '14px 0 10px' }}>
          <Clock size={15} color="var(--amber)" />
          <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Syne, sans-serif' }}>
            Vencen esta semana ({proximos.length})
          </p>
        </div>
        {proximos.map(l => (
          <div key={l.id} onClick={() => onSelect(l)} style={{
            background: 'var(--amber-light)', border: '1px solid rgba(224,160,32,0.3)',
            borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: '10px', cursor: 'pointer'
          }}>
            <p style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: 'var(--text)', marginBottom: '4px' }}>{l.nombre}</p>
            <p style={{ fontSize: '13px', color: 'var(--amber)' }}>Debe: {fmt(calcDebt(l))} — vence pronto</p>
          </div>
        ))}
      </>}

      {cobrosHoyYAtrasados.length === 0 && cobrosProximos.length === 0 && vencidos.length === 0 && proximos.length === 0 && (
        <Empty icon="✅" text="Sin alertas — todo al día" />
      )}
    </div>
  )
}
