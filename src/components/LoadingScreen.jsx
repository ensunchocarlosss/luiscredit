export default function LoadingScreen() {
  const particulas = Array.from({ length: 14 })

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #0d1a0d 0%, #080c08 60%)',
      overflow: 'hidden'
    }}>
      {/* Partículas doradas flotando */}
      {particulas.map((_, i) => {
        const left = (i * 7.3) % 100
        const size = 3 + (i % 4) * 2
        const duration = 5 + (i % 5)
        const delay = (i * 0.4) % 4
        const dorada = i % 3 !== 0
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
              animation: `flotar ${duration}s ease-in-out ${delay}s infinite`
            }}
          />
        )
      })}

      {/* Anillo de brillo pulsante detrás del logo */}
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '28px'
      }}>
        <div style={{
          position: 'absolute',
          width: '150px', height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.35), transparent 70%)',
          animation: 'pulsoAnillo 2.2s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          width: '150px', height: '150px',
          borderRadius: '50%',
          border: '1.5px solid rgba(212,175,55,0.3)',
          animation: 'girar 6s linear infinite'
        }} />
        <img
          src="/icon-512.png"
          alt="LuisCrédit"
          style={{
            width: '92px', height: '92px',
            borderRadius: '22px', objectFit: 'cover',
            position: 'relative', zIndex: 2,
            boxShadow: '0 8px 30px rgba(0,0,0,0.6), 0 0 25px rgba(212,175,55,0.25)',
            animation: 'latir 1.8s ease-in-out infinite'
          }}
        />
      </div>

      {/* Nombre con brillo dorado en movimiento */}
      <h1 style={{
        fontSize: '30px', fontWeight: '800', fontFamily: 'Syne, sans-serif',
        letterSpacing: '-0.5px', marginBottom: '8px',
        display: 'flex'
      }}>
        <span style={{ color: 'var(--text)' }}>Luis</span>
        <span style={{
          background: 'linear-gradient(90deg, #a6841f, #f0d878, #d4af37, #a6841f)',
          backgroundSize: '300% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'brilloDorado 2.5s linear infinite'
        }}>Crédit</span>
      </h1>

      <p style={{
        color: 'var(--text-muted)', fontSize: '12px',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: '30px', fontFamily: 'Nunito, sans-serif'
      }}>
        Cargando tus datos<span style={{ animation: 'puntos 1.4s steps(4) infinite' }}>...</span>
      </p>

      {/* Barra de progreso indeterminada */}
      <div style={{
        width: '160px', height: '5px',
        borderRadius: '4px', overflow: 'hidden',
        background: 'var(--surface2)',
        border: '1px solid var(--border2)'
      }}>
        <div style={{
          height: '100%', width: '45%', borderRadius: '4px',
          background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))',
          animation: 'deslizar 1.3s ease-in-out infinite'
        }} />
      </div>

      <style>{`
        @keyframes latir {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.07); }
        }
        @keyframes pulsoAnillo {
          0%, 100% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes girar {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes brilloDorado {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes flotar {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        @keyframes puntos {
          0% { opacity: 0; }
          25% { opacity: 0.3; }
          50% { opacity: 0.6; }
          75%, 100% { opacity: 1; }
        }
        @keyframes deslizar {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
      `}</style>
    </div>
  )
}
