import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { fmt, Btn, Input } from './UI'
import { Save } from 'lucide-react'

export default function NuevoPrestamo({ onSaved }) {
  const [form, setForm] = useState({ nombre: '', telefono: '', monto: '', interes: '5', plazo: '6', fecha: new Date().toISOString().split('T')[0], notas: '' })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const monto   = parseFloat(form.monto)   || 0
  const interes = parseFloat(form.interes) || 0
  const plazo   = parseInt(form.plazo)     || 0
  const intTotal = monto * (interes / 100) * plazo
  const total    = monto + intTotal
  const showPreview = monto > 0 && interes > 0 && plazo > 0

  const handleSave = async () => {
    if (!form.nombre || !monto || !interes || !plazo) { alert('Completa todos los campos obligatorios.'); return }
    setSaving(true)
    const { error } = await supabase.from('prestamos').insert([{
      nombre: form.nombre.trim(), telefono: form.telefono.trim() || null,
      monto, interes, plazo, fecha: form.fecha, pagado: 0, estado: 'activo',
      notas: form.notas.trim() || null
    }])
    setSaving(false)
    if (error) { alert('Error al guardar: ' + error.message); return }
    alert('¡Préstamo registrado para ' + form.nombre + '!')
    setForm({ nombre: '', telefono: '', monto: '', interes: '5', plazo: '6', fecha: new Date().toISOString().split('T')[0], notas: '' })
    onSaved()
  }

  return (
    <div style={{ padding: '14px', paddingBottom: '80px' }}>
      <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
        Nuevo préstamo
      </p>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px', marginBottom: '14px' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--blue)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Datos del cliente</p>
        <Input label="Nombre completo *" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Juan García" />
        <Input label="Teléfono (opcional)" type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="Ej: 3001234567" />
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px', marginBottom: '14px' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--blue)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Condiciones del préstamo</p>
        <Input label="Monto prestado ($) *" type="number" value={form.monto} onChange={e => set('monto', e.target.value)} placeholder="Ej: 500000" min="0" />
        <Input label="Interés mensual (%) *" type="number" value={form.interes} onChange={e => set('interes', e.target.value)} placeholder="Ej: 5" min="0" step="0.1" />
        <Input label="Plazo (meses) *" type="number" value={form.plazo} onChange={e => set('plazo', e.target.value)} placeholder="Ej: 6" min="1" />
        <Input label="Fecha del préstamo" type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
      </div>

      {showPreview && (
        <div style={{ background: '#f0f7ff', borderRadius: 'var(--radius-lg)', border: '1px solid #c8e0f8', padding: '16px', marginBottom: '14px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--blue)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resumen del préstamo</p>
          {[['Capital', fmt(monto)], ['Interés total', fmt(intTotal)], ['Cuota mensual', fmt(total / plazo) + '/mes']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: 'var(--text-secondary)' }}>
              <span>{k}</span><span style={{ fontWeight: '600', color: 'var(--text)' }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', padding: '10px 0 0', marginTop: '6px', borderTop: '1px solid #c8e0f8', color: 'var(--blue)' }}>
            <span>Total a cobrar</span><span>{fmt(total)}</span>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '16px', marginBottom: '14px' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--blue)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notas adicionales</p>
        <textarea value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Ej: Garantía entregada, acuerdo especial, etc." rows={3}
          style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
          onFocus={e => e.target.style.borderColor = 'var(--blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      <Btn onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
        <Save size={18} /> {saving ? 'Guardando...' : 'Guardar préstamo'}
      </Btn>
    </div>
  )
}
