import { calcDebt } from '../components/UI'

const MILISEGUNDOS_POR_DIA = 86400000

function fechaLocal(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null
  const [anio, mes, dia] = fecha.split('-').map(Number)
  const resultado = new Date(anio, mes - 1, dia)
  if (resultado.getFullYear() !== anio || resultado.getMonth() !== mes - 1 || resultado.getDate() !== dia) return null
  return resultado
}

function sumarMeses(fecha, cantidad) {
  const indiceMes = fecha.getMonth() + cantidad
  const anio = fecha.getFullYear() + Math.floor(indiceMes / 12)
  const mes = indiceMes % 12
  const ultimoDia = new Date(anio, mes + 1, 0).getDate()
  return new Date(anio, mes, Math.min(fecha.getDate(), ultimoDia))
}

function diaCalendario(fecha) {
  return Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) / MILISEGUNDOS_POR_DIA
}

export function calcularCobro(loan, hoy = new Date()) {
  const monto = Number(loan?.monto)
  const interes = Number(loan?.interes)
  const plazo = Number(loan?.plazo)
  const pagado = Number(loan?.pagado) || 0
  const inicio = fechaLocal(loan?.fecha)

  if (!inicio || !Number.isFinite(monto) || !Number.isFinite(interes) || !Number.isFinite(plazo) || plazo <= 0) return null

  const cuota = (monto + monto * (interes / 100) * plazo) / plazo
  const saldo = calcDebt(loan)
  if (!Number.isFinite(cuota) || cuota <= 0 || saldo <= 0) return null

  const toleranciaRedondeo = Math.max(0.01, cuota * 1e-9)
  const cuotasPagadas = Math.max(0, Math.floor((pagado + toleranciaRedondeo) / cuota))
  const proximaFecha = sumarMeses(inicio, cuotasPagadas >= plazo ? plazo : cuotasPagadas + 1)
  const diasHastaVencimiento = diaCalendario(proximaFecha) - diaCalendario(hoy)

  return {
    cuota,
    saldo,
    cuotasPagadas,
    proximaFecha,
    diasHastaVencimiento,
    diasAtraso: Math.max(0, -diasHastaVencimiento)
  }
}
