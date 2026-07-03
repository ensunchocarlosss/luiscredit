import { Home, Users, PlusCircle, Bell, History, LogOut, BarChart2 } from 'lucide-react'

export function Topbar({ onLogout }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #0d140d, #111811)',
      padding: '10px 16px',
      borderBottom: '1px solid var(--border2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky', top: 0, zIndex: 10,
      boxShadow: '0 2px 20px rgba(0,0,0,0.6)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src="/icon-192.png"
          alt="LuisCrédit"
          style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
        />
        <div>
          <h1 style={{ fontSize: '19px', fontWeight: '800', lineHeight: 1, fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px', color: 'var(--text)' }}>
            Luis<span style={{ color: 'var(--gold)' }}>Crédit</span>
          </h1>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Gestión de préstamos</p>
        </div>
      </div>
      <button onClick={onLogout} style={{
        background: 'var(--surface2)', border: '1px solid var(--border2)',
        borderRadius: '10px', padding: '8px', color: 'var(--text-secondary)',
        display: 'flex', cursor: 'pointer'
      }}>
        <LogOut size={18} />
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
      borderBottom: '1px solid var(--border2)',
      position: 'sticky', top: '60px', zIndex: 9, overflowX: 'auto'
    }}>
      {tabs.map(({ id, label, Icon }) => (
        <button key={id} onClick={() => onChange(id)} style={{
          flex: '1 0 auto', minWidth: '54px', padding: '9px 4px 7px', border: 'none',
          background: 'transparent', fontSize: '10px', fontWeight: '700',
          fontFamily: 'Syne, sans-serif',
          color: active === id ? 'var(--gold)' : 'var(--text-muted)',
          borderBottom: active === id ? '2px solid var(--gold)' : '2px solid transparent',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
          position: 'relative', cursor: 'pointer', letterSpacing: '0.03em',
          transition: 'color 0.2s'
        }}>
          <Icon size={19} strokeWidth={active === id ? 2.5 : 1.8} />
          {label}
          {id === 'alertas' && alertCount > 0 && (
            <span style={{
              position: 'absolute', top: '5px', right: '6px',
              background: 'var(--red)', color: 'white', fontSize: '9px',
              fontWeight: '700', borderRadius: '10px', padding: '1px 5px',
              minWidth: '16px', textAlign: 'center'
            }}>{alertCount}</span>
          )}
        </button>
      ))}
    </div>
  )
}
