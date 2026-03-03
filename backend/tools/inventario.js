const inventario = [
  { nombre: "IPA", tipo: "IPA", stock: 45, ibu: 60, alcohol: 6.5, precio: 120 },
  {
    nombre: "NEIPA",
    tipo: "Amber Lager",
    stock: 38,
    ibu: 25,
    alcohol: 4.8,
    precio: 110,
  },
  {
    nombre: "Barley Wine",
    tipo: "Stout",
    stock: 12,
    ibu: 40,
    alcohol: 5.5,
    precio: 150,
  },
  {
    nombre: "Chocoporter",
    tipo: "Porter",
    stock: 25,
    ibu: 35,
    alcohol: 5.2,
    precio: 130,
  },
];

export function consultarInventario(tipo) {
  if (!tipo || tipo.trim() === "") {
    return {
      message: "Inventario completo",
      total: inventario.length,
      items: inventario,
    };
  }

  const producto = inventario.find((item) =>
    String(item.tipo).toLowerCase().includes(String(tipo).toLowerCase()),
  );

  if (!producto) {
    return {
      success: false,
      message: "Cerveza no encontrada en el inventario",
      similares: inventario.map((i) => i.nombre),
    };
  }

  return {
    success: true,
    disponible: producto.stock > 0,
    producto,
    message:
      producto.stock > 0
        ? `Tenemos ${producto.stock} unidades disponibles`
        : "Agotado temporalmente",
  };
}

export function obtenerInventarioCompleto() {
  return {
    total: inventario.reduce((sum, item) => sum + item.stock, 0),
    items: inventario,
  };
}

export function actualizarStock(nombre, cantidad) {
  const producto = inventario.find(
    (item) => item.nombre.toLowerCase() === String(nombre).toLowerCase(),
  );

  if (!producto) {
    return { error: "Producto no encontrado", success: false };
  }

  producto.stock = Math.max(0, producto.stock + cantidad);

  return {
    success: true,
    message: `Stock de ${nombre} actualizado a ${producto.stock}`,
    producto,
  };
}
