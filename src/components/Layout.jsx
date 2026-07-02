import { Building2, Home, Users, PlusCircle, Bell, History, LogOut, BarChart2 } from 'lucide-react'

export function Topbar({ onLogout }) {
  return (
    <div style={{
      background: 'var(--surface)', padding: '14px 16px 10px',
      borderBottom: '1px solid var(--border)', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center',
      position: 'sticky', top: 0, zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Building2 size={22} color="var(--blue)" strokeWidth={2} />
        <div>
          <h1 style={{ fontSize: '19px', fontWeight: '700', lineHeight: 1 }}>
            Luis<span style={{ color: 'var(--blue)' }}>Crédit</span>
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>Gestión de préstamos</p>
        </div>
      </div>
      <button onClick={onLogout} style={{ background: 'var(--bg)', border: 'none', borderRadius: '8px', padding: '8px', color: 'var(--text-secondary)', display: 'flex' }}>
        <LogOut size={20} />
      </button>
    </div>
  )
}

const tabs = [
  { id: 'inicio',    label: 'Inicio',    Icon: Home },
  { id: 'clientes',  label: 'Clientes',  Icon: Users },
  { id: 'nuevo',     label: 'Nuevo',     Icon: PlusCircle },
  { id: 'alertas',   label: 'Alertas',   Icon: Bell },
  { id: 'resumen',   label: 'Resumen',   Icon: BarChart2 },
  { id: 'historial', label: 'Historial', Icon: History },
]

export function Nav({ active, onChange, alertCount }) {
  return (
    <div style={{
      display: 'flex', background: 'var(--surface)',
      borderBottom: '1px solid var(--border)', position: 'sticky', top: '58px', zIndex: 9, overflowX: 'auto'
    }}>
      {tabs.map(({ id, label, Icon }) => (
        <button key={id} onClick={() => onChange(id)} style={{
          flex: '1 0 auto', minWidth: '56px', padding: '9px 4px 7px', border: 'none',
          background: 'transparent', fontSize: '10px', fontWeight: '600',
          color: active === id ? 'var(--blue)' : 'var(--text-muted)',
          borderBottom: active === id ? '2px solid var(--blue)' : '2px solid transparent',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
          position: 'relative', cursor: 'pointer'
        }}>
          <Icon size={20} strokeWidth={active === id ? 2.5 : 1.8} />
          {label}
          {id === 'alertas' && alertCount > 0 && (
            <span style={{
              position: 'absolute', top: '6px', right: '8px',
              background: 'var(--red)', color: 'white', fontSize: '9px',
              fontWeight: '700', borderRadius: '10px', padding: '1px 5px', minWidth: '16px', textAlign: 'center'
            }}>{alertCount}</span>
          )}
        </button>
      ))}
    </div>
  )
}
