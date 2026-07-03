import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { fmt, Btn, Input, InputMonto } from './UI'
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
 
  const sectionStyle = {
    background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border2)', padding: '16px', marginBottom: '14px'
  }
  const sectionLabel = {
    fontSize: '11px', fontWeight: '700', color: 'var(--gold)',
    marginBottom: '14px', textTransform: 'uppercase',
    letterSpacing: '0.07em', fontFamily: 'Syne, sans-serif',
    display: 'flex', alignItems: 'center', gap: '6px'
  }
 
  return (
    <div style={{ padding: '14px', paddingBottom: '80px' }}>
      <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px', fontFamily: 'Syne, sans-serif' }}>
        Nuevo préstamo
      </p>
 
      <div style={sectionStyle}>
        <p style={sectionLabel}>👤 Datos del cliente</p>
        <Input label="Nombre completo *" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Juan García" />
        <Input label="Teléfono (opcional)" type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="Ej: 3001234567" />
      </div>
 
      <div style={sectionStyle}>
        <p style={sectionLabel}>💰 Condiciones del préstamo</p>
        <InputMonto label="Monto prestado ($) *" value={form.monto} onChange={v => set('monto', v)} placeholder="Ej: 500.000" />
        <Input label="Interés mensual (%) *" type="number" value={form.interes} onChange={e => set('interes', e.target.value)} placeholder="Ej: 5" min="0" step="0.1" />
        <Input label="Plazo (meses) *" type="number" value={form.plazo} onChange={e => set('plazo', e.target.value)} placeholder="Ej: 6" min="1" />
        <Input label="Fecha del préstamo" type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
      </div>
 
      {showPreview && (
        <div style={{
          background: 'linear-gradient(135deg, #1a1200, #231900)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(212,175,55,0.35)',
          padding: '16px', marginBottom: '14px',
          boxShadow: '0 0 20px rgba(212,175,55,0.06)'
        }}>
          <p style={{ ...sectionLabel, color: 'var(--gold)' }}>📊 Resumen del préstamo</p>
          {[['Capital', fmt(monto)], ['Interés total', fmt(intTotal)], ['Cuota aprox./mes', fmt(total / plazo)]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', color: 'rgba(212,175,55,0.6)', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
              <span>{k}</span>
              <span style={{ fontWeight: '700', color: 'var(--gold)' }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: '800', padding: '12px 0 0', color: 'var(--gold)', fontFamily: 'Syne, sans-serif' }}>
            <span>Total a cobrar</span><span>{fmt(total)}</span>
          </div>
        </div>
      )}
 
      <div style={sectionStyle}>
        <p style={sectionLabel}>📝 Notas adicionales</p>
        <textarea value={form.notas} onChange={e => set('notas', e.target.value)}
          placeholder="Ej: Garantía entregada, acuerdo especial, firmó pagaré..."
          rows={3}
          style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: 'var(--surface2)', color: 'var(--text)', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
          onBlur={e => e.target.style.borderColor = 'var(--border2)'}
        />
      </div>
 
      <Btn onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
        <Save size={18} /> {saving ? 'Guardando...' : 'Guardar préstamo'}
      </Btn>
    </div>
  )
}
 
