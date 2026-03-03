const reservas = [];

export function reservarMesa(fecha, hora, personas, nombre, telefono) {
  // Validación básica
  if (!fecha || !hora || !personas) {
    return { error: "Faltan parámetros requeridos", success: false };
  }

  if (personas < 1 || personas > 20) {
    return {
      error: "Número de personas debe estar entre 1 y 20",
      success: false,
    };
  }

  const reserva = {
    id: Date.now(),
    fecha,
    hora,
    personas,
    nombre: nombre || "Sin nombre",
    telefono: telefono || "Sin teléfono",
    estado: "confirmada",
    createdAt: new Date().toISOString(),
  };

  reservas.push(reserva);

  return {
    success: true,
    message: `Reserva confirmada para ${personas} personas el ${fecha} a las ${hora}`,
    reserva,
  };
}

export function obtenerReservas() {
  return reservas;
}

export function cancelarReserva(id) {
  const index = reservas.findIndex((r) => r.id === parseInt(id));
  if (index === -1) {
    return { error: "Reserva no encontrada", success: false };
  }
  const [reserva] = reservas.splice(index, 1);
  return { success: true, message: "Reserva cancelada", reserva };
}
