import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { fmt, calcDebt, calcTotal, Btn, Spinner, formatMiles } from './UI'
import { X, Camera, Trash2, Download, Phone, FileText, CheckCircle } from 'lucide-react'
import jsPDF from 'jspdf'
 
function ProgressBar({ pagado, total }) {
  const pct = total > 0 ? Math.min(100, (pagado / total) * 100) : 0
  return (
    <div style={{ margin: '12px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
        <span>Progreso de pago</span>
        <span style={{ fontWeight: '700', color: pct >= 100 ? '#4fc44f' : 'var(--gold)' }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: '7px', background: 'var(--surface2)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: pct >= 100 ? 'linear-gradient(90deg,#2d6a2d,#4fc44f)' : 'linear-gradient(90deg,var(--gold-dark),var(--gold))',
          borderRadius: '4px', transition: 'width 0.5s ease'
        }} />
      </div>
    </div>
  )
}
 
export default function DetallePrestamo({ loan, onClose, onUpdated, onDeleted }) {
  const [fotos, setFotos] = useState([])
  const [pagosHist, setPagosHist] = useState([])
  const [abono, setAbono] = useState('')
  const [notaAbono, setNotaAbono] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [tab, setTab] = useState('info')
  const fileRef = useRef()
  const [fotoAmpliada, setFotoAmpliada] = useState(null)
 
  useEffect(() => { if (loan) loadData() }, [loan])
 
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
 
  const comprimirImagen = (file) => new Promise((resolve) => {
    const maxWidth = 1280
    const maxHeight = 1280
    const calidad = 0.7
    const img = new Image()
    const reader = new FileReader()
    reader.onload = (ev) => { img.src = ev.target.result }
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (!blob) { resolve(file); return }
        const nuevoNombre = file.name.replace(/\.[^.]+$/, '') + '.jpg'
        resolve(new File([blob], nuevoNombre, { type: 'image/jpeg' }))
      }, 'image/jpeg', calidad)
    }
    img.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
    const handleFoto = async (e) => {
    const original = e.target.files[0]
    if (!original) return
    setUploading(true)
    const file = await comprimirImagen(original)
    const ext = file.name.split('.').pop()
    const path = `${loan.id}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('fotos-prestamos').upload(path, file)
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
 
  const handleDeleteCliente = async () => {
    const c1 = confirm(`¿Eliminar a "${loan.nombre}"?\n\nSe eliminarán también todos sus pagos y fotos. Esta acción no se puede deshacer.`)
    if (!c1) return
    const c2 = confirm(`Última confirmación: ¿Eliminar definitivamente a "${loan.nombre}"?`)
    if (!c2) return
    setDeleting(true)
    if (fotos.length > 0) {
      const paths = fotos.map(f => f.url.split('/fotos-prestamos/')[1]).filter(Boolean)
      if (paths.length > 0) await supabase.storage.from('fotos-prestamos').remove(paths)
    }
    await supabase.from('prestamos').delete().eq('id', loan.id)
    setDeleting(false)
    onDeleted()
  }
 
  const exportPDF = async () => {
    const doc = new jsPDF()
    const total = calcTotal(loan)
    const deuda = calcDebt(loan)
    const pctPagado = total > 0 ? Math.min(100, ((loan.pagado || 0) / total) * 100) : 0

    // Paleta de colores (coherente con la app)
    const negro = [10, 10, 10]
    const dorado = [212, 175, 55]
    const doradoOscuro = [140, 108, 26]
    const cremaClaro = [250, 246, 233]
    const bordeClaro = [230, 222, 195]
    const grisTexto = [110, 110, 110]
    const textoOscuro = [30, 30, 30]
    const verde = [40, 125, 60]
    const verdeClaro = [223, 244, 226]
    const rojo = [190, 45, 45]
    const rojoClaro = [253, 228, 228]
    const doradoClaroBg = [250, 240, 208]

    const margen = 18
    const anchoUtil = 210 - margen * 2

    // Intentar incrustar el logo real de la app
    let logoData = null
    try {
      const resp = await fetch('/icon-512.png')
      const blob = await resp.blob()
      logoData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (e) { /* si falla, se genera sin logo */ }

    // ===== ENCABEZADO =====
    doc.setFillColor(...negro)
    doc.rect(0, 0, 210, 44, 'F')
    doc.setFillColor(...dorado)
    doc.rect(0, 44, 210, 1.4, 'F')

    if (logoData) {
      try { doc.addImage(logoData, 'PNG', margen, 10, 22, 22) } catch (e) {}
    }
    const xTitulo = logoData ? margen + 28 : margen
    doc.setFont('helvetica', 'bold'); doc.setFontSize(24); doc.setTextColor(...dorado)
    doc.text('LuisCredit', xTitulo, 24)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(205, 205, 205)
    doc.text('Gestion profesional de prestamos', xTitulo, 31)

    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...dorado)
    doc.text('COMPROBANTE DE PRESTAMO', 210 - margen, 16, { align: 'right' })
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(180, 180, 180)
    const fechaHoy = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
    doc.text(fechaHoy, 210 - margen, 22, { align: 'right' })

    let y = 56

    // ===== TARJETA DEL CLIENTE =====
    const alturaCard = loan.telefono ? 28 : 22
    doc.setFillColor(...cremaClaro); doc.setDrawColor(...bordeClaro)
    doc.roundedRect(margen, y, anchoUtil, alturaCard, 3, 3, 'FD')
    doc.setFillColor(...dorado)
    doc.rect(margen, y, 2, alturaCard, 'F')

    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(...textoOscuro)
    doc.text(loan.nombre, margen + 8, y + 11)
    if (loan.telefono) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...grisTexto)
      doc.text('Tel: ' + loan.telefono, margen + 8, y + 19)
    }

    const estadoInfo = {
      activo:  { texto: 'ACTIVO',  bg: verdeClaro,     color: verde },
      vencido: { texto: 'VENCIDO', bg: rojoClaro,      color: rojo },
      pagado:  { texto: 'PAGADO',  bg: doradoClaroBg,  color: doradoOscuro },
    }
    const est = estadoInfo[loan.estado] || estadoInfo.activo
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
    const badgeAncho = doc.getTextWidth(est.texto) + 10
    const badgeX = margen + anchoUtil - badgeAncho - 6
    const badgeY = y + 6
    doc.setFillColor(...est.bg)
    doc.roundedRect(badgeX, badgeY, badgeAncho, 8, 4, 4, 'F')
    doc.setTextColor(...est.color)
    doc.text(est.texto, badgeX + badgeAncho / 2, badgeY + 5.5, { align: 'center' })

    y += alturaCard + 10

    // ===== CONDICIONES DEL PRESTAMO =====
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...doradoOscuro)
    doc.text('CONDICIONES DEL PRESTAMO', margen, y)
    y += 6

    const condiciones = [
      { label: 'Capital', valor: fmt(loan.monto) },
      { label: 'Interes mensual', valor: loan.interes + '%' },
      { label: 'Plazo', valor: loan.plazo + ' meses' },
    ]
    const anchoCard3 = (anchoUtil - 8) / 3
    condiciones.forEach((c, i) => {
      const cx = margen + i * (anchoCard3 + 4)
      doc.setFillColor(252, 252, 250); doc.setDrawColor(...bordeClaro)
      doc.roundedRect(cx, y, anchoCard3, 20, 2, 2, 'FD')
      doc.setFillColor(...dorado)
      doc.rect(cx, y, anchoCard3, 1, 'F')
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...grisTexto)
      doc.text(c.label.toUpperCase(), cx + 4, y + 8)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...textoOscuro)
      doc.text(c.valor, cx + 4, y + 16)
    })
    y += 28

    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...grisTexto)
    doc.text('Total a cobrar (capital + intereses): ' + fmt(total), margen, y)
    y += 10

    // ===== PROGRESO DE PAGO =====
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...doradoOscuro)
    doc.text('PROGRESO DE PAGO', margen, y)
    doc.setTextColor(...textoOscuro)
    doc.text(Math.round(pctPagado) + '%', margen + anchoUtil, y, { align: 'right' })
    y += 5

    doc.setFillColor(235, 232, 220)
    doc.roundedRect(margen, y, anchoUtil, 5, 2.5, 2.5, 'F')
    if (pctPagado > 0) {
      doc.setFillColor(...dorado)
      doc.roundedRect(margen, y, Math.max(5, anchoUtil * (pctPagado / 100)), 5, 2.5, 2.5, 'F')
    }
    y += 13

    const anchoCard2 = (anchoUtil - 4) / 2
    doc.setFillColor(...verdeClaro)
    doc.roundedRect(margen, y, anchoCard2, 20, 2, 2, 'F')
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...verde)
    doc.text('PAGADO', margen + 5, y + 8)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...verde)
    doc.text(fmt(loan.pagado || 0), margen + 5, y + 16)

    const cx2 = margen + anchoCard2 + 4
    doc.setFillColor(...rojoClaro)
    doc.roundedRect(cx2, y, anchoCard2, 20, 2, 2, 'F')
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...rojo)
    doc.text('SALDO PENDIENTE', cx2 + 5, y + 8)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...rojo)
    doc.text(fmt(deuda), cx2 + 5, y + 16)

    y += 30

    // Utilidades de paginacion
    const dibujarPiePagina = () => {
      doc.setDrawColor(...dorado); doc.setLineWidth(0.4)
      doc.line(margen, 283, 210 - margen, 283)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...grisTexto)
      doc.text('LuisCredit  -  Gestion profesional de prestamos', margen, 288)
    }
    const encabezadoTabla = () => {
      doc.setFillColor(...negro)
      doc.rect(margen, y, anchoUtil, 8, 'F')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...dorado)
      doc.text('FECHA', margen + 4, y + 5.5)
      doc.text('MONTO', margen + 55, y + 5.5)
      doc.text('NOTA', margen + 95, y + 5.5)
      y += 8
    }
    const nuevaPaginaSiHaceFalta = (alturaNecesaria) => {
      if (y + alturaNecesaria > 275) { doc.addPage(); y = 22; return true }
      return false
    }

    // ===== HISTORIAL DE PAGOS =====
    if (pagosHist.length > 0) {
      nuevaPaginaSiHaceFalta(24)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...doradoOscuro)
      doc.text('HISTORIAL DE PAGOS', margen, y)
      y += 7
      encabezadoTabla()

      pagosHist.forEach((p, i) => {
        if (nuevaPaginaSiHaceFalta(9)) encabezadoTabla()
        const filaAltura = 9
        if (i % 2 === 0) { doc.setFillColor(248, 246, 238); doc.rect(margen, y, anchoUtil, filaAltura, 'F') }
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...textoOscuro)
        doc.text(new Date(p.created_at).toLocaleDateString('es-CO'), margen + 4, y + 6)
        doc.setFont('helvetica', 'bold'); doc.setTextColor(...verde)
        doc.text(fmt(p.monto), margen + 55, y + 6)
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...grisTexto)
        const nota = p.nota ? (p.nota.length > 35 ? p.nota.slice(0, 35) + '...' : p.nota) : '-'
        doc.text(nota, margen + 95, y + 6)
        y += filaAltura
      })
      y += 8
    }

    // ===== NOTAS ADICIONALES =====
    if (loan.notas) {
      nuevaPaginaSiHaceFalta(30)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...doradoOscuro)
      doc.text('NOTAS ADICIONALES', margen, y)
      y += 6
      const lineasNotas = doc.splitTextToSize(loan.notas, anchoUtil - 10)
      const alturaNotas = lineasNotas.length * 5 + 8
      doc.setFillColor(...cremaClaro); doc.setDrawColor(...bordeClaro)
      doc.roundedRect(margen, y, anchoUtil, alturaNotas, 2, 2, 'FD')
      doc.setFont('helvetica', 'italic'); doc.setFontSize(9.5); doc.setTextColor(...textoOscuro)
      doc.text(lineasNotas, margen + 5, y + 7)
    }

    // Pie de pagina y numeracion en todas las paginas
    const totalPaginas = doc.internal.getNumberOfPages()
    for (let p = 1; p <= totalPaginas; p++) {
      doc.setPage(p)
      dibujarPiePagina()
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...grisTexto)
      doc.text('Pagina ' + p + ' de ' + totalPaginas, 210 - margen, 288, { align: 'right' })
    }

    doc.save('LuisCredit-' + loan.nombre + '.pdf')
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
    { id: 'info',  label: '📋 Detalle' },
    { id: 'pagos', label: `💵 Pagos (${pagosHist.length})` },
    { id: 'fotos', label: `📷 Fotos (${fotos.length})` },
  ]
 
  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1px solid var(--border2)',
    borderRadius: 'var(--radius)', fontSize: '15px', outline: 'none',
    background: 'var(--surface2)', color: 'var(--text)', marginBottom: '8px',
    transition: 'border-color 0.2s'
  }
 
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', borderRadius: '20px 20px 0 0',
        border: '1px solid var(--border2)', borderBottom: 'none',
        width: '100%', maxWidth: '480px', maxHeight: '94vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.7)'
      }}>
 
        {/* Handle */}
        <div style={{ width: '40px', height: '4px', background: 'var(--border2)', borderRadius: '2px', margin: '12px auto 0' }} />
 
        {/* Header */}
        <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>{loan.nombre}</h2>
              {loan.telefono && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>📞 {loan.telefono}</p>}
            </div>
            <button onClick={onClose} style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={16} />
            </button>
          </div>
 
          {/* Quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', margin: '12px 0' }}>
            <button onClick={openWhatsApp} style={{ padding: '8px 4px', background: 'rgba(45,106,45,0.2)', color: '#4fc44f', border: '1px solid rgba(79,196,79,0.25)', borderRadius: 'var(--radius)', fontSize: '11px', fontWeight: '700', fontFamily: 'Syne, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}>
              <Phone size={13} /> WhatsApp
            </button>
            <button onClick={exportPDF} style={{ padding: '8px 4px', background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 'var(--radius)', fontSize: '11px', fontWeight: '700', fontFamily: 'Syne, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}>
              <FileText size={13} /> PDF
            </button>
            <button onClick={handleDeleteCliente} disabled={deleting} style={{ padding: '8px 4px', background: 'var(--red-light)', color: 'var(--red)', border: '1px solid rgba(224,82,82,0.25)', borderRadius: 'var(--radius)', fontSize: '11px', fontWeight: '700', fontFamily: 'Syne, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}>
              <Trash2 size={13} /> {deleting ? '...' : 'Eliminar'}
            </button>
          </div>
 
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border2)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: '9px 4px', border: 'none', background: 'none',
                fontSize: '12px', fontWeight: '700', fontFamily: 'Syne, sans-serif',
                color: tab === t.id ? 'var(--gold)' : 'var(--text-muted)',
                borderBottom: tab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
                cursor: 'pointer', transition: 'color 0.2s'
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
 
        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>
          {loading ? <Spinner /> : <>
 
            {/* TAB DETALLE */}
            {tab === 'info' && <>
              <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border2)', padding: '14px', marginBottom: '14px' }}>
                {[
                  ['Capital prestado', fmt(loan.monto), 'var(--text)'],
                  [`Interés (${loan.interes}%/mes · ${loan.plazo} meses)`, fmt(total - loan.monto), 'var(--gold)'],
                  ['Total con intereses', fmt(total), 'var(--text)'],
                  ['Ya pagó', fmt(loan.pagado || 0), '#4fc44f'],
                ].map(([k, v, c]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                    <span style={{ fontWeight: '700', color: c }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', padding: '10px 0 0', color: deuda > 0 ? 'var(--red)' : '#4fc44f', fontFamily: 'Syne, sans-serif' }}>
                  <span>Saldo pendiente</span><span>{fmt(deuda)}</span>
                </div>
                <ProgressBar pagado={loan.pagado || 0} total={total} />
              </div>
 
              {loan.notas && (
                <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 'var(--radius)', padding: '12px', marginBottom: '14px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gold)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Syne, sans-serif' }}>📝 Notas</p>
                  <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.5 }}>{loan.notas}</p>
                </div>
              )}
 
              {/* Registrar abono */}
              <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border2)', padding: '14px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px', fontFamily: 'Syne, sans-serif' }}>💵 Registrar abono</p>
                <input
                  type="text" inputMode="numeric" placeholder="Monto del pago ($)"
                  value={formatMiles(abono)}
                  onChange={e => setAbono(e.target.value.replace(/\D/g, ''))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                />
                <input
                  type="text" placeholder="Nota del pago (opcional)" value={notaAbono}
                  onChange={e => setNotaAbono(e.target.value)}
                  style={{ ...inputStyle, marginBottom: '10px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                />
                <Btn onClick={handleAbono} disabled={saving} style={{ width: '100%' }}>
                  <CheckCircle size={17} /> {saving ? 'Guardando...' : 'Registrar pago'}
                </Btn>
              </div>
            </>}
 
            {/* TAB PAGOS */}
            {tab === 'pagos' && <>
              {pagosHist.length === 0
                ? <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>Sin pagos registrados aún</div>
                : pagosHist.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: i < pagosHist.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: 'rgba(45,106,45,0.15)', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={18} color="#4fc44f" />
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#4fc44f', fontFamily: 'Syne, sans-serif' }}>{fmt(p.monto)}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString('es-CO')}</p>
                        {p.nota && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{p.nota}</p>}
                      </div>
                    </div>
                  </div>
                ))
              }
            </>}
 
            {/* TAB FOTOS */}
            {tab === 'fotos' && <>
             <input ref={fileRef} type="file" accept="image/*" onChange={handleFoto} style={{ display: 'none' }} />
              <Btn onClick={() => fileRef.current.click()} disabled={uploading} style={{ width: '100%', marginBottom: '14px' }} variant="secondary">
                <Camera size={17} /> {uploading ? 'Subiendo...' : 'Agregar foto / comprobante'}
              </Btn>
              {fotos.length === 0
                ? <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    <Camera size={44} style={{ opacity: 0.2, marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '14px' }}>Sin fotos aún.<br />Agrega comprobantes, cédulas o facturas.</p>
                  </div>
                : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {fotos.map(f => (
                      <div key={f.id} style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border2)', aspectRatio: '1', background: 'var(--surface2)' }}>
                        <img src={f.url} alt={f.nombre} onClick={() => setFotoAmpliada(f)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
                        <button onClick={() => handleDeleteFoto(f)} style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Trash2 size={13} color="white" />
                        </button>
                        <a href={f.url} target="_blank" rel="noopener" style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <Download size={13} color="white" />
                        </a>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '20px 8px 6px' }}>
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

      {/* Vista previa ampliada de foto */}
      {fotoAmpliada && (
        <div
          onClick={() => setFotoAmpliada(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
            zIndex: 300, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
        >
          <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '10px' }}>
            <a
              href={fotoAmpliada.url} target="_blank" rel="noopener" download
              onClick={e => e.stopPropagation()}
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Download size={18} color="white" />
            </a>
            <button
              onClick={() => setFotoAmpliada(null)}
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={18} color="white" />
            </button>
          </div>
          <img
            src={fotoAmpliada.url} alt={fotoAmpliada.nombre}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '10px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
          />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '14px', textAlign: 'center' }}>{fotoAmpliada.nombre}</p>
        </div>
      )}
    </div>
  )
}
