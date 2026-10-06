import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import LoadingScreen from './components/LoadingScreen'
import WelcomeScreen from './components/WelcomeScreen'
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
  const [showWelcome, setShowWelcome] = useState(true)
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [tab, setTab] = useState('inicio')
  const [loans, setLoans] = useState([])
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [firstLoad, setFirstLoad] = useState(true)
  const [selected, setSelected] = useState(null)
  const authSessionRef = useRef(null)
  const loadRequestRef = useRef(0)
  const firstLoadRef = useRef(true)

  useEffect(() => {
    let active = true
    let authEventReceived = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authEventReceived = true
      authSessionRef.current = nextSession
      setSession(nextSession)
      setAuthReady(true)
      if (!nextSession) {
        loadRequestRef.current += 1
        setLoans([])
        setPagos([])
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active || authEventReceived) return
      const nextSession = error ? null : data.session
      authSessionRef.current = nextSession
      setSession(nextSession)
      setAuthReady(true)
    }).catch(() => {
      if (!active || authEventReceived) return
      authSessionRef.current = null
      setSession(null)
      setAuthReady(true)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const loadAll = useCallback(async () => {
    const currentSession = session
    if (!currentSession) return
    const requestId = ++loadRequestRef.current
    setLoading(true)
    const inicio = Date.now()
    try {
      const [loansResult, pagosResult] = await Promise.all([
        supabase.from('prestamos').select('*').order('created_at', { ascending: false }),
        supabase.from('pagos').select('*').order('created_at', { ascending: false })
      ])
      if (requestId !== loadRequestRef.current || authSessionRef.current?.access_token !== currentSession.access_token) return

      // auto-mark vencidos
      const hoy = new Date()
      const updated = (loansResult.data || []).map(loan => {
        if (loan.estado === 'activo' && calcDebt(loan) > 0) {
          const dias = Math.floor((hoy - new Date(loan.fecha)) / 86400000)
          if (dias > loan.plazo * 30) return { ...loan, estado: 'vencido' }
        }
        return loan
      })
      setLoans(updated)
      setPagos(pagosResult.data || [])
    } catch {
      if (requestId === loadRequestRef.current) {
        setLoans([])
        setPagos([])
      }
    } finally {
      if (requestId === loadRequestRef.current && authSessionRef.current?.access_token === currentSession.access_token) {
        setLoading(false)
      }
    }

    // La pantalla de carga inicial dura mínimo 5 segundos, aunque los datos lleguen antes
    if (firstLoadRef.current && requestId === loadRequestRef.current) {
      firstLoadRef.current = false
      const transcurrido = Date.now() - inicio
      const restante = Math.max(0, 3000 - transcurrido)
      setTimeout(() => setFirstLoad(false), restante)
    }
  }, [session])

  useEffect(() => {
    if (session) loadAll()
    else {
      loadRequestRef.current += 1
      setLoading(false)
    }
    return () => { loadRequestRef.current += 1 }
  }, [session, loadAll])

  const handleLogin = nextSession => {
    authSessionRef.current = nextSession
    setSession(nextSession)
    setAuthReady(true)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // También se limpia la sesión local si la conexión falla durante el cierre.
    } finally {
      authSessionRef.current = null
      setSession(null)
      setLoans([])
      setPagos([])
      setSelected(null)
    }
  }

  const alertCount = loans.filter(l => {
    if (calcDebt(l) <= 0) return false
    const hoy = new Date()
    const dias = Math.floor((hoy - new Date(l.fecha)) / 86400000)
    return dias > l.plazo * 30
  }).length

  if (showWelcome) return <WelcomeScreen onFinish={() => setShowWelcome(false)} />
  if (!authReady) return <LoadingScreen />
  if (!session) return <Login onLogin={handleLogin} />
  if (firstLoad) return <LoadingScreen />

  return (
    <div className="app">
      <Topbar onLogout={handleLogout} />
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
          onDeleted={() => { setSelected(null); loadAll() }}
        />
      )}
    </div>
  )
}
