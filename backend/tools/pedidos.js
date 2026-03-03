const pedidos = [];

export function crearPedido(items, direccion, nombre, telefono) {
  // Validación
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      error: "El pedido debe incluir al menos un item",
      success: false,
    };
  }

  if (!direccion || !nombre) {
    return {
      error: "Direccion y nombre son requeridos",
      success: false,
    };
  }

  // Calcular total (ejemplo básico)
  const total = items.reduce((sum, item) => sum + (item.precio || 0), 0);

  const pedido = {
    id: `PED-${Date.now()}`,
    items,
    direccion,
    nombre,
    telefono: telefono || "Sin teléfono",
    total,
    estado: "confirmado",
    fechaCreacion: new Date().toISOString(),
    tiempoEstimado: "30-45 minutos",
  };

  pedidos.push(pedido);

  return {
    success: true,
    message: `Pedido ${pedido.id} creado exitosamente. Total: $${total}`,
    pedido,
  };
}

export function obtenerPedidos() {
  return {
    total: pedidos.length,
    pedidos,
  };
}

export function actualizarEstadoPedido(idPedido, estado) {
  const pedido = pedidos.find((p) => p.id === idPedido);

  if (!pedido) {
    return { error: "Pedido no encontrado", success: false };
  }

  const estadosValidos = ["confirmado", "preparando", "en-camino", "entregado"];

  if (!estadosValidos.includes(estado)) {
    return {
      error: `Estado inválido. Válidos: ${estadosValidos.join(", ")}`,
      success: false,
    };
  }

  pedido.estado = estado;

  return {
    success: true,
    message: `Pedido ${idPedido} actualizado a estado: ${estado}`,
    pedido,
  };
}

export function cancelarPedido(idPedido) {
  const index = pedidos.findIndex((p) => p.id === idPedido);

  if (index === -1) {
    return { error: "Pedido no encontrado", success: false };
  }

  const pedido = pedidos[index];

  if (pedido.estado !== "confirmado") {
    return {
      error: `No se puede cancelar un pedido en estado: ${pedido.estado}`,
      success: false,
    };
  }

  pedidos.splice(index, 1);

  return {
    success: true,
    message: `Pedido ${idPedido} cancelado`,
  };
}
