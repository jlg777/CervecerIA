const horarios = {
  lunes: { apertura: "17:00", cierre: "23:00" },
  martes: { apertura: "17:00", cierre: "23:00" },
  miercoles: { apertura: "17:00", cierre: "23:00" },
  jueves: { apertura: "17:00", cierre: "23:00" },
  viernes: { apertura: "16:00", cierre: "00:00" },
  sabado: { apertura: "12:00", cierre: "01:00" },
  domingo: { apertura: "12:00", cierre: "23:00" },
};

export function obtenerHorarios() {
  return {
    establecimiento: "Cervecería Wengan",
    ubicacion: "Calle Tomba 98, Godoy Cruz, Mendoza",
    horarios,
    telefono: "+54 261 XXXXXXX",
    nota: "Horarios sujetos a cambios. Confirmar antes de visitar.",
  };
}

export function estaAbierto() {
  const ahora = new Date();
  const dia = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ][ahora.getDay()];
  const hora =
    String(ahora.getHours()).padStart(2, "0") +
    ":" +
    String(ahora.getMinutes()).padStart(2, "0");

  const horarioHoy = horarios[dia];
  const abierto = hora >= horarioHoy.apertura && hora <= horarioHoy.cierre;

  return {
    dia,
    hora,
    abierto,
    horarioHoy,
    message: abierto
      ? `Estamos abiertos hasta las ${horarioHoy.cierre}`
      : `Ahora estamos cerrados. Abrimos a las ${horarioHoy.apertura}`,
  };
}
