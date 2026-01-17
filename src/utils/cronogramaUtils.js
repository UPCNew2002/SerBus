// src/utils/cronogramaUtils.js
// Utilidades para calcular el cronograma

export const calcularProximoMantenimiento = (ultimaOT, trabajo, kmActual) => {
  if (!trabajo.entraCronograma) {
    return null;
  }

  const fechaUltimaOT = new Date(ultimaOT.fecha);
  const kmUltimaOT = ultimaOT.kilometraje || 0;
  const hoy = new Date();

  // Calcular próximas fechas/km
  const proximaFechaPorDias = new Date(fechaUltimaOT);
  proximaFechaPorDias.setDate(proximaFechaPorDias.getDate() + trabajo.intervaloDias);

  const proximoKmPorKm = kmUltimaOT + trabajo.intervaloKm;

  // Calcular días y km restantes
  const diasRestantes = Math.floor((proximaFechaPorDias - hoy) / (1000 * 60 * 60 * 24));
  const kmRestantes = proximoKmPorKm - kmActual;

  // Determinar estado (el que esté más crítico)
  let estado = 'ok'; // ok, proximo, vencido

  // Por días
  if (diasRestantes < 7) {
    estado = 'vencido';
  } else if (diasRestantes < 30) {
    if (estado !== 'vencido') estado = 'proximo';
  }

  // Por km (solo si hay kilometraje registrado)
  if (kmUltimaOT > 0 && kmActual > 0) {
    if (kmRestantes < 1000) {
      estado = 'vencido';
    } else if (kmRestantes < 5000) {
      if (estado !== 'vencido') estado = 'proximo';
    }
  }

  return {
    trabajo: trabajo.nombre,
    trabajoId: trabajo.id,
    ultimaOTFecha: ultimaOT.fecha,
    ultimaOTKm: kmUltimaOT,
    proximaFechaPorDias: proximaFechaPorDias.toISOString().split('T')[0],
    proximoKmPorKm,
    diasRestantes,
    kmRestantes,
    estado,
    intervaloDias: trabajo.intervaloDias,
    intervaloKm: trabajo.intervaloKm,
  };
};

export const calcularCronogramaBus = (bus, ots, trabajos) => {
  const otsBus = ots.filter((ot) => ot.placa === bus.placa && ot.kilometraje);

  if (otsBus.length === 0) {
    return [];
  }

  // Ordenar OTs por fecha descendente
  otsBus.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const cronograma = [];

  // Para cada trabajo que entra en cronograma
  trabajos.forEach((trabajo) => {
    if (!trabajo.entraCronograma) return;

    // Buscar la última OT que incluyó este trabajo
    const ultimaOT = otsBus.find((ot) =>
      ot.trabajos.some((t) => t.id === trabajo.id)
    );

    if (ultimaOT) {
      const proximo = calcularProximoMantenimiento(
        ultimaOT,
        trabajo,
        bus.kilometrajeActual
      );
      if (proximo) {
        cronograma.push(proximo);
      }
    }
  });

  // Ordenar por criticidad: vencido > proximo > ok
  cronograma.sort((a, b) => {
    const orden = { vencido: 0, proximo: 1, ok: 2 };
    return orden[a.estado] - orden[b.estado];
  });

  return cronograma;
};

export const getEstadoColor = (estado) => {
  switch (estado) {
    case 'ok':
      return '#22c55e'; // Verde
    case 'proximo':
      return '#f59e0b'; // Amarillo
    case 'vencido':
      return '#dc2626'; // Rojo
    default:
      return '#6b7280'; // Gris
  }
};

export const getEstadoIcono = (estado) => {
  switch (estado) {
    case 'ok':
      return 'checkmark-circle';
    case 'proximo':
      return 'alert-circle';
    case 'vencido':
      return 'close-circle';
    default:
      return 'help-circle';
  }
};

export const getEstadoTexto = (estado) => {
  switch (estado) {
    case 'ok':
      return 'AL DÍA';
    case 'proximo':
      return 'PRÓXIMO';
    case 'vencido':
      return 'VENCIDO';
    default:
      return 'SIN DATOS';
  }
};