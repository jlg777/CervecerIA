const reservas = [];
const reservasPendientes = new Map();

const REQUIRED_FIELDS = ["fecha", "hora", "personas", "nombre", "telefono"];

const QUESTIONS = {
  fecha: "¿Para qué fecha querés la reserva? (YYYY-MM-DD)",
  hora: "¿A qué hora? (HH:MM)",
  personas: "¿Para cuántas personas? (1-20)",
  nombre: "¿A nombre de quién anoto la reserva?",
  telefono: "¿Me das un número de teléfono?",
};

/* =========================
   Helpers de Seguridad
========================= */

function cleanString(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function isValidDate(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const date = new Date(fecha);
  return !isNaN(date.getTime());
}

function isValidTime(hora) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora);
}

/* =========================
   Función Principal
========================= */

export function reservarMesa({
  sessionId = "default",
  fecha,
  hora,
  personas,
  nombre,
  telefono,
} = {}) {
  // 🔒 Bloquear llamada completamente vacía
  const noDataProvided =
    fecha === undefined &&
    hora === undefined &&
    personas === undefined &&
    nombre === undefined &&
    telefono === undefined;

  if (noDataProvided) {
    return {
      success: false,
      pending: true,
      error: "No se proporcionaron datos válidos",
    };
  }

  const borrador = reservasPendientes.get(sessionId) || {};
  const next = { ...borrador };

  // 🔒 Sanitizar strings
  if (fecha !== undefined) next.fecha = cleanString(fecha);
  if (hora !== undefined) next.hora = cleanString(hora);
  if (nombre !== undefined) next.nombre = cleanString(nombre);
  if (telefono !== undefined) next.telefono = cleanString(telefono);

  // 🔒 Validar personas
  if (personas !== undefined) {
    const cantidad = Number(personas);

    if (!Number.isInteger(cantidad)) {
      return {
        success: false,
        pending: true,
        error: "La cantidad de personas debe ser un número entero",
      };
    }

    if (cantidad < 1 || cantidad > 20) {
      return {
        success: false,
        pending: true,
        error: "Número de personas debe estar entre 1 y 20",
      };
    }

    next.personas = cantidad;
  }

  // 🔒 Validar fecha
  if (next.fecha && !isValidDate(next.fecha)) {
    return {
      success: false,
      pending: true,
      error: "Formato de fecha inválido. Usar YYYY-MM-DD",
    };
  }

  // 🔒 Validar hora
  if (next.hora && !isValidTime(next.hora)) {
    return {
      success: false,
      pending: true,
      error: "Formato de hora inválido. Usar HH:MM",
    };
  }

  // 🔒 Detectar faltantes
  const missing = REQUIRED_FIELDS.filter((field) => {
    return next[field] === undefined;
  });

  if (missing.length > 0) {
    const missingField = missing[0];
    reservasPendientes.set(sessionId, next);

    return {
      success: false,
      pending: true,
      missingField,
      message: QUESTIONS[missingField],
      partial: next,
    };
  }

  // ✅ Crear reserva confirmada
  const reserva = {
    id: crypto.randomUUID(), // mejor que Date.now()
    fecha: next.fecha,
    hora: next.hora,
    personas: next.personas,
    nombre: next.nombre,
    telefono: next.telefono,
    estado: "confirmada",
    createdAt: new Date().toISOString(),
  };

  reservas.push(reserva);
  reservasPendientes.delete(sessionId);

  return {
    success: true,
    pending: false,
    message: `Reserva confirmada para ${reserva.personas} personas el ${reserva.fecha} a las ${reserva.hora}`,
    reserva,
  };
}

/* =========================
   Otras funciones
========================= */

export function obtenerReservas() {
  return reservas;
}

export function cancelarReserva(id) {
  const index = reservas.findIndex((r) => r.id === id);

  if (index === -1) {
    return { error: "Reserva no encontrada", success: false };
  }

  const [reserva] = reservas.splice(index, 1);

  return { success: true, message: "Reserva cancelada", reserva };
}