const cervezas = [
  { nombre: "IPA", tipo: "IPA", ibu: 60, alcohol: 6.5 },
  { nombre: "NEIPA", tipo: "Amber Lager", ibu: 25, alcohol: 4.8 },
  { nombre: "barley wine", tipo: "Stout", ibu: 40, alcohol: 5.5 },
];

export function recomendarCerveza(tipo) {
  return cervezas.filter((c) =>
    c.tipo.toLowerCase().includes(String(tipo).toLowerCase()),
  );
}
