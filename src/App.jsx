import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import { Topbar, Nav } from './components/Layout'
import Inicio from './components/Inicio'
import Clientes from './components/Clientes'
import NuevoPrestamo from './components/NuevoPrestamo'
import Alertas from './components/Alertas'
import Resumen from './components/Resumen'
import Historial from './components/Historial'
import DetallePrestamo from './components/DetallePrestamo'
import { calcDebt } from './components/UI'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [tab, setTab] = useState('inicio')
  const [loans, setLoans] = useState([])
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => { if (loggedIn) loadAll() }, [loggedIn])

  const loadAll = async () => {
    setLoading(true)
    const [{ data: l }, { data: p }] = await Promise.all([
      supabase.from('prestamos').select('*').order('created_at', { ascending: false }),
      supabase.from('pagos').select('*').order('created_at', { ascending: false })
    ])
    // auto-mark vencidos
    const hoy = new Date()
    const updated = (l || []).map(loan => {
      if (loan.estado === 'activo' && calcDebt(loan) > 0) {
        const dias = Math.floor((hoy - new Date(loan.fecha)) / 86400000)
        if (dias > loan.plazo * 30) return { ...loan, estado: 'vencido' }
      }
      return loan
    })
    setLoans(updated)
    setPagos(p || [])
    setLoading(false)
  }

  const alertCount = loans.filter(l => {
    if (calcDebt(l) <= 0) return false
    const hoy = new Date()
    const dias = Math.floor((hoy - new Date(l.fecha)) / 86400000)
    return dias > l.plazo * 30
  }).length

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />

  return (
    <div className="app">
      <Topbar onLogout={() => { setLoggedIn(false); setLoans([]); setPagos([]) }} />
      <Nav active={tab} onChange={t => { setTab(t); if (t !== 'nuevo') loadAll() }} alertCount={alertCount} />

      <div style={{ flex: 1 }}>
        {tab === 'inicio'    && <Inicio    loans={loans} loading={loading} onSelect={setSelected} />}
        {tab === 'clientes'  && <Clientes  loans={loans} loading={loading} onSelect={setSelected} />}
        {tab === 'nuevo'     && <NuevoPrestamo onSaved={() => { loadAll(); setTab('inicio') }} />}
        {tab === 'alertas'   && <Alertas   loans={loans} loading={loading} onSelect={setSelected} />}
        {tab === 'resumen'   && <Resumen   loans={loans} pagos={pagos} />}
        {tab === 'historial' && <Historial pagos={pagos} loans={loans} loading={loading} />}
      </div>

      {selected && (
        <DetallePrestamo
          loan={loans.find(l => l.id === selected.id) || selected}
          onClose={() => setSelected(null)}
          onUpdated={() => { loadAll() }}
        />
      )}
    </div>
  )
}
