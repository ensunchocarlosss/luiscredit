import { useState, useEffect } from 'react'

const DURACION = 3000 // milisegundos

export default function WelcomeScreen({ onFinish }) {
  const [progreso, setProgreso] = useState(0)
  const particulas = Array.from({ length: 18 })

  useEffect(() => {
    const inicio = Date.now()
    const intervalo = setInterval(() => {
      const transcurrido = Date.now() - inicio
      const pct = Math.min(100, (transcurrido / DURACION) * 100)
      setProgreso(pct)
      if (transcurrido >= DURACION) {
        clearInterval(intervalo)
        onFinish()
      }
    }, 30)
    return () => clearInterval(intervalo)
  }, [onFinish])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #0d1a0d 0%, #080c08 65%)',
      overflow: 'hidden'
    }}>
      {/* Partículas doradas y verdes flotando */}
      {particulas.map((_, i) => {
        const left = (i * 5.6) % 100
        const size = 2 + (i % 5) * 2
        const duration = 4 + (i % 6)
        const delay = (i * 0.3) % 5
        const dorada = i % 2 === 0
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              bottom: '-20px',
              left: `${left}%`,
              width: `${size}px`, height: `${size}px`,
              borderRadius: '50%',
              background: dorada
                ? 'radial-gradient(circle, #f0d878, #d4af37)'
                : 'radial-gradient(circle, #6fd66f, #2d6a2d)',
              opacity: 0.7,
              boxShadow: dorada ? '0 0 8px rgba(212,175,55,0.6)' : '0 0 8px rgba(79,196,79,0.5)',
              animation: `flotarBienvenida ${duration}s ease-in-out ${delay}s infinite`
            }}
          />
        )
      })}

      {/* Destello de fondo expandiéndose */}
      <div style={{
        position: 'absolute',
        width: '340px', height: '340px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.18), transparent 70%)',
        animation: 'expandirDestello 3s ease-in-out infinite'
      }} />

      {/* Logo entrando con rebote */}
      <div style={{ position: 'relative', marginBottom: '22px', animation: 'entradaLogo 0.9s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div style={{
          position: 'absolute', inset: '-14px',
          borderRadius: '50%',
          border: '1.5px solid rgba(212,175,55,0.25)',
          animation: 'girarBienvenida 8s linear infinite'
        }} />
        <img
          src="/icon-512.png"
          alt="LuisCrédit"
          style={{
            width: '110px', height: '110px',
            borderRadius: '26px', objectFit: 'cover',
            boxShadow: '0 10px 36px rgba(0,0,0,0.6), 0 0 34px rgba(212,175,55,0.3)',
            animation: 'latirBienvenida 2.4s ease-in-out 0.9s infinite'
          }}
        />
      </div>

      {/* Texto de bienvenida con aparición secuencial */}
      <p style={{
        fontSize: '12px', color: 'var(--gold)', fontWeight: '700',
        letterSpacing: '0.15em', textTransform: 'uppercase',
        marginBottom: '6px', fontFamily: 'Syne, sans-serif',
        opacity: 0, animation: 'aparecer 0.6s ease-out 0.5s forwards'
      }}>
        Bienvenido a
      </p>

      <h1 style={{
        fontSize: '34px', fontWeight: '800', fontFamily: 'Syne, sans-serif',
        letterSpacing: '-0.5px', marginBottom: '10px',
        display: 'flex', opacity: 0,
        animation: 'aparecer 0.6s ease-out 0.75s forwards'
      }}>
        <span style={{ color: 'var(--text)' }}>Luis</span>
        <span style={{
          background: 'linear-gradient(90deg, #a6841f, #f0d878, #d4af37, #a6841f)',
          backgroundSize: '300% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'brilloBienvenida 2.5s linear infinite'
        }}>Crédit</span>
      </h1>

      <p style={{
        color: 'var(--text-muted)', fontSize: '12px',
        letterSpacing: '0.08em', marginBottom: '34px',
        fontFamily: 'Nunito, sans-serif',
        opacity: 0, animation: 'aparecer 0.6s ease-out 1s forwards'
      }}>
        Gestión profesional de préstamos
      </p>

      {/* Barra de progreso real de 5 segundos */}
      <div style={{
        width: '180px', height: '5px',
        borderRadius: '4px', overflow: 'hidden',
        background: 'var(--surface2)',
        border: '1px solid var(--border2)',
        opacity: 0, animation: 'aparecer 0.6s ease-out 1.2s forwards'
      }}>
        <div style={{
          height: '100%', width: `${progreso}%`,
          borderRadius: '4px',
          background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))',
          boxShadow: '0 0 10px rgba(212,175,55,0.5)',
          transition: 'width 0.05s linear'
        }} />
      </div>

      <style>{`
        @keyframes entradaLogo {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes latirBienvenida {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes girarBienvenida {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes expandirDestello {
          0%, 100% { transform: scale(0.85); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes brilloBienvenida {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes aparecer {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes flotarBienvenida {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(15px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
