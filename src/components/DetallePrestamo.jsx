import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { fmt, calcDebt, calcTotal, Btn, Spinner } from './UI'
import { X, Camera, Trash2, Download, Phone, FileText, Plus, CheckCircle } from 'lucide-react'
import jsPDF from 'jspdf'

function ProgressBar({ pagado, total }) {
  const pct = total > 0 ? Math.min(100, (pagado / total) * 100) : 0
  return (
    <div style={{ margin: '12px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>
        <span>Progreso de pago</span>
        <span style={{ fontWeight: '700' }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? 'var(--green)' : 'var(--blue)', borderRadius: '4px', transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

export default function DetallePrestamo({ loan, onClose, onUpdated }) {
  const [fotos, setFotos] = useState([])
  const [pagosHist, setPagosHist] = useState([])
  const [abono, setAbono] = useState('')
  const [notaAbono, setNotaAbono] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('info')
  const fileRef = useRef()

  useEffect(() => {
    if (!loan) return
    loadData()
  }, [loan])

  const loadData = async () => {
    setLoading(true)
    const [{ data: f }, { data: p }] = await Promise.all([
      supabase.from('fotos').select('*').eq('prestamo_id', loan.id).order('created_at', { ascending: false }),
      supabase.from('pagos').select('*').eq('prestamo_id', loan.id).order('created_at', { ascending: false })
    ])
    setFotos(f || [])
    setPagosHist(p || [])
    setLoading(false)
  }

  const handleAbono = async () => {
    const monto = parseFloat(abono)
    if (!monto || monto <= 0) { alert('Ingresa un monto válido.'); return }
    setSaving(true)
    const nuevoPagado = (loan.pagado || 0) + monto
    const deuda = calcDebt(loan)
    const nuevoEstado = nuevoPagado >= calcTotal(loan) ? 'pagado' : loan.estado === 'vencido' ? 'activo' : loan.estado
    await supabase.from('pagos').insert([{ prestamo_id: loan.id, monto, nota: notaAbono.trim() || null }])
    await supabase.from('prestamos').update({ pagado: nuevoPagado, estado: nuevoEstado }).eq('id', loan.id)
    setSaving(false)
    setAbono('')
    setNotaAbono('')
    alert('Pago de ' + fmt(monto) + ' registrado.')
    onUpdated()
    loadData()
  }

  const handleFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${loan.id}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('fotos-prestamos').upload(path, file)
    if (upErr) { alert('Error subiendo foto: ' + upErr.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('fotos-prestamos').getPublicUrl(path)
    await supabase.from('fotos').insert([{ prestamo_id: loan.id, url: publicUrl, nombre: file.name }])
    setUploading(false)
    loadData()
  }

  const handleDeleteFoto = async (foto) => {
    if (!confirm('¿Eliminar esta foto?')) return
    const path = foto.url.split('/fotos-prestamos/')[1]
    await supabase.storage.from('fotos-prestamos').remove([path])
    await supabase.from('fotos').delete().eq('id', foto.id)
    loadData()
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    const total = calcTotal(loan)
    const deuda = calcDebt(loan)
    doc.setFontSize(18); doc.setTextColor(24, 95, 165)
    doc.text('LuisCredit - Resumen de Prestamo', 20, 20)
    doc.setFontSize(12); doc.setTextColor(0, 0, 0)
    doc.text(`Cliente: ${loan.nombre}`, 20, 35)
    if (loan.telefono) doc.text(`Telefono: ${loan.telefono}`, 20, 43)
    doc.text(`Fecha: ${loan.fecha}`, 20, loan.telefono ? 51 : 43)
    let y = loan.telefono ? 63 : 55
    doc.setFontSize(11); doc.setTextColor(100, 100, 100)
    doc.text('CONDICIONES', 20, y); y += 8
    doc.setTextColor(0,0,0)
    doc.text(`Capital: ${fmt(loan.monto)}`, 20, y); y += 7
    doc.text(`Interes mensual: ${loan.interes}%`, 20, y); y += 7
    doc.text(`Plazo: ${loan.plazo} meses`, 20, y); y += 7
    doc.text(`Interes total: ${fmt(total - loan.monto)}`, 20, y); y += 7
    doc.text(`Total a cobrar: ${fmt(total)}`, 20, y); y += 12
    doc.setFontSize(11); doc.setTextColor(100,100,100)
    doc.text('ESTADO ACTUAL', 20, y); y += 8
    doc.setTextColor(0,0,0)
    doc.text(`Pagado: ${fmt(loan.pagado || 0)}`, 20, y); y += 7
    doc.setTextColor(192, 57, 43)
    doc.text(`Saldo pendiente: ${fmt(deuda)}`, 20, y); y += 12
    if (pagosHist.length > 0) {
      doc.setTextColor(100,100,100); doc.setFontSize(11)
      doc.text('HISTORIAL DE PAGOS', 20, y); y += 8
      doc.setTextColor(0,0,0); doc.setFontSize(10)
      pagosHist.forEach(p => {
        doc.text(`${new Date(p.created_at).toLocaleDateString('es-CO')} — ${fmt(p.monto)}${p.nota ? ' (' + p.nota + ')' : ''}`, 20, y)
        y += 6
      })
    }
    if (loan.notas) {
      y += 4; doc.setFontSize(11); doc.setTextColor(100,100,100)
      doc.text('NOTAS', 20, y); y += 8
      doc.setTextColor(0,0,0); doc.setFontSize(10)
      doc.text(loan.notas, 20, y)
    }
    doc.save(`LuisCredit-${loan.nombre}.pdf`)
  }

  const openWhatsApp = () => {
    if (!loan.telefono) { alert('Este cliente no tiene teléfono registrado.'); return }
    const deuda = calcDebt(loan)
    const msg = `Hola ${loan.nombre}, le recuerdo que tiene un saldo pendiente de ${fmt(deuda)} con LuisCrédit. Gracias.`
    window.open(`https://wa.me/57${loan.telefono.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (!loan) return null
  const deuda = calcDebt(loan)
  const total = calcTotal(loan)

  const TABS = [
    { id: 'info',    label: 'Detalle' },
    { id: 'pagos',   label: 'Pagos' },
    { id: 'fotos',   label: `Fotos (${fotos.length})` },
  ]

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '480px', maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '18px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{loan.nombre}</h2>
              {loan.telefono && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📞 {loan.telefono}</p>}
            </div>
            <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: '8px', margin: '12px 0' }}>
            <button onClick={openWhatsApp} style={{ flex: 1, padding: '8px', background: '#e8f5e9', color: '#2d7a1f', border: 'none', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer' }}>
              <Phone size={14} /> WhatsApp
            </button>
            <button onClick={exportPDF} style={{ flex: 1, padding: '8px', background: 'var(--blue-light)', color: 'var(--blue)', border: 'none', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer' }}>
              <FileText size={14} /> Exportar PDF
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginLeft: '-0px' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '9px 4px', border: 'none', background: 'none', fontSize: '13px', fontWeight: '700', color: tab === t.id ? 'var(--blue)' : 'var(--text-muted)', borderBottom: tab === t.id ? '2px solid var(--blue)' : '2px solid transparent', cursor: 'pointer' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>
          {loading ? <Spinner /> : <>

            {/* TAB INFO */}
            {tab === 'info' && <>
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '14px', marginBottom: '14px' }}>
                {[
                  ['Capital prestado', fmt(loan.monto)],
                  [`Interés (${loan.interes}%/mes · ${loan.plazo} meses)`, fmt(total - loan.monto)],
                  ['Total con intereses', fmt(total)],
                  ['Ya pagó', fmt(loan.pagado || 0)],
                ].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                    <span style={{ fontWeight: '700' }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', padding: '10px 0 0', color: deuda > 0 ? 'var(--red)' : 'var(--green)' }}>
                  <span>Saldo pendiente</span><span>{fmt(deuda)}</span>
                </div>
                <ProgressBar pagado={loan.pagado || 0} total={total} />
              </div>
              {loan.notas && (
                <div style={{ background: '#fffbea', border: '1px solid #f5e397', borderRadius: 'var(--radius)', padding: '12px', marginBottom: '14px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#7a6000', marginBottom: '4px', textTransform: 'uppercase' }}>Notas</p>
                  <p style={{ fontSize: '14px', color: '#555' }}>{loan.notas}</p>
                </div>
              )}
              {/* Registrar abono */}
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '14px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Registrar abono</p>
                <input type="number" placeholder="Monto del pago ($)" value={abono} onChange={e => setAbono(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '15px', outline: 'none', marginBottom: '8px' }}
                  onFocus={e => e.target.style.borderColor='var(--blue)'} onBlur={e => e.target.style.borderColor='var(--border)'}
                />
                <input type="text" placeholder="Nota del pago (opcional)" value={notaAbono} onChange={e => setNotaAbono(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none', marginBottom: '10px' }}
                  onFocus={e => e.target.style.borderColor='var(--blue)'} onBlur={e => e.target.style.borderColor='var(--border)'}
                />
                <Btn onClick={handleAbono} disabled={saving} style={{ width: '100%' }}>
                  <CheckCircle size={18} /> {saving ? 'Guardando...' : 'Registrar pago'}
                </Btn>
              </div>
            </>}

            {/* TAB PAGOS */}
            {tab === 'pagos' && <>
              {pagosHist.length === 0
                ? <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Sin pagos registrados aún</div>
                : pagosHist.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < pagosHist.length-1 ? '1px solid var(--bg)' : 'none' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--green)' }}>{fmt(p.monto)}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString('es-CO')}</p>
                      {p.nota && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{p.nota}</p>}
                    </div>
                    <CheckCircle size={20} color="var(--green)" />
                  </div>
                ))
              }
            </>}

            {/* TAB FOTOS */}
            {tab === 'fotos' && <>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFoto} style={{ display: 'none' }} />
              <Btn onClick={() => fileRef.current.click()} disabled={uploading} style={{ width: '100%', marginBottom: '14px' }} variant="secondary">
                <Camera size={18} /> {uploading ? 'Subiendo...' : 'Agregar foto / comprobante'}
              </Btn>
              {fotos.length === 0
                ? <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    <Camera size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                    <p>Sin fotos aún. Agrega comprobantes, cédulas o facturas.</p>
                  </div>
                : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {fotos.map(f => (
                      <div key={f.id} style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '1' }}>
                        <img src={f.url} alt={f.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => handleDeleteFoto(f)} style={{
                          position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)',
                          border: 'none', borderRadius: '50%', width: '28px', height: '28px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}>
                          <Trash2 size={14} color="white" />
                        </button>
                        <a href={f.url} target="_blank" rel="noopener" style={{
                          position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.6)',
                          borderRadius: '50%', width: '28px', height: '28px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Download size={14} color="white" />
                        </a>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', padding: '20px 8px 6px' }}>
                          <p style={{ fontSize: '10px', color: 'white', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.nombre}</p>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </>}
          </>}
        </div>
      </div>
    </div>
  )
}
