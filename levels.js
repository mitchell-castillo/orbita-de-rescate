// Six original layouts. Par is verified by breadth-first search in tests.
export const levels = [
  {
    "id": 1,
    "name": "Primer impulso",
    "briefing": "La inercia es tu aliada. Recoge al astronauta y vuelve al portal.",
    "hint": "Primero busca un camino hasta la fila de arriba.",
    "width": 5,
    "height": 5,
    "walls": [
      11,
      12,
      13
    ],
    "start": 20,
    "exit": 24,
    "rescues": [
      2
    ],
    "par": 3
  },
  {
    "width": 5,
    "height": 5,
    "walls": [
      13,
      15,
      22,
      24
    ],
    "start": 2,
    "exit": 10,
    "rescues": [
      19,
      12
    ],
    "par": 5,
    "id": 2,
    "name": "Eco entre rocas",
    "briefing": "Dos señales, una sola nave. Elige bien dónde cambiar de dirección.",
    "hint": "Una ruta óptima comienza hacia abajo. Piensa dónde terminará ese impulso."
  },
  {
    "width": 6,
    "height": 6,
    "walls": [
      2,
      3,
      12,
      16,
      26,
      28
    ],
    "start": 0,
    "exit": 9,
    "rescues": [
      7,
      34
    ],
    "par": 7,
    "id": 3,
    "name": "Cruce estelar",
    "briefing": "No siempre la ruta más directa es la que te lleva a casa.",
    "hint": "Una ruta óptima comienza hacia la derecha. Piensa dónde terminará ese impulso."
  },
  {
    "width": 6,
    "height": 6,
    "walls": [
      1,
      7,
      10,
      22,
      28,
      29
    ],
    "start": 14,
    "exit": 31,
    "rescues": [
      23,
      24,
      12
    ],
    "par": 9,
    "id": 4,
    "name": "Señales lejanas",
    "briefing": "Tres astronautas esperan. Usa las rocas como puntos de frenado.",
    "hint": "Una ruta óptima comienza hacia la derecha. Piensa dónde terminará ese impulso."
  },
  {
    "width": 7,
    "height": 7,
    "walls": [
      3,
      11,
      15,
      16,
      30,
      38,
      41,
      47
    ],
    "start": 29,
    "exit": 21,
    "rescues": [
      13,
      24,
      2
    ],
    "par": 11,
    "id": 5,
    "name": "Cinturón perdido",
    "briefing": "Un campo más grande, nuevas rutas. Cada impulso tiene su momento.",
    "hint": "Una ruta óptima comienza hacia arriba. Piensa dónde terminará ese impulso."
  },
  {
    "width": 7,
    "height": 7,
    "walls": [
      1,
      13,
      17,
      20,
      30,
      34,
      36,
      38
    ],
    "start": 42,
    "exit": 32,
    "rescues": [
      28,
      39,
      5,
      22
    ],
    "par": 13,
    "id": 6,
    "name": "El último regreso",
    "briefing": "Toda la tripulación cuenta contigo. Conecta los cuatro rescates y vuelve.",
    "hint": "Una ruta óptima comienza hacia la derecha. Piensa dónde terminará ese impulso."
  }
];
export default levels;
