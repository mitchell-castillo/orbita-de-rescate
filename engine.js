/**
 * Órbita de Rescate's deterministic, UI-independent rules.
 * A grid cell is row * level.width + column; the outside of the grid is solid.
 * `rescued` is a bit mask in the same order as level.rescues.
 * `path` contains the cells crossed by the last successful move, excluding its
 * departure cell. Every call returns a new state and never mutates its inputs.
 */
export const DIRECTIONS = Object.freeze(['up', 'right', 'down', 'left']);

const vectors = Object.freeze({
  up: [0, -1],
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
});

function validateLevel(level) {
  if (!Number.isInteger(level.width) || !Number.isInteger(level.height)
      || level.width < 1 || level.height < 1) {
    throw new RangeError('El tablero necesita dimensiones enteras positivas.');
  }
  const size = level.width * level.height;
  const validCell = (cell) => Number.isInteger(cell) && cell >= 0 && cell < size;
  if (!Array.isArray(level.walls) || !Array.isArray(level.rescues)
      || !validCell(level.start) || !validCell(level.exit)
      || !level.walls.every(validCell) || !level.rescues.every(validCell)) {
    throw new RangeError('Todas las posiciones deben pertenecer al tablero.');
  }
  if (level.rescues.length > 30
      || new Set(level.rescues).size !== level.rescues.length) {
    throw new RangeError('El tablero admite hasta 30 astronautas únicos.');
  }
  const walls = new Set(level.walls);
  if (walls.has(level.start) || walls.has(level.exit)
      || level.rescues.some((cell) => walls.has(cell))) {
    throw new RangeError('Una nave, astronauta o muelle no puede ocupar un asteroide.');
  }
}

function collectAt(level, cell, mask) {
  const index = level.rescues.indexOf(cell);
  return index === -1 ? mask : mask | (1 << index);
}

export function createState(level) {
  validateLevel(level);
  const rescued = collectAt(level, level.start, 0);
  return {
    ship: level.start,
    rescued,
    moves: 0,
    won: level.start === level.exit && rescued === 2 ** level.rescues.length - 1,
    path: [],
  };
}

/**
 * Slide until the next cell is an asteroid or out of bounds. The dock is inert
 * until every astronaut is aboard; then entering it stops the ship and wins.
 * Blocked, unknown-direction, and post-victory inputs do not count as moves.
 */
export function move(level, state, direction) {
  const next = { ...state, path: [] };
  if (state.won || !Object.hasOwn(vectors, direction)) return next;

  const [dx, dy] = vectors[direction];
  const walls = new Set(level.walls);
  const allRescued = 2 ** level.rescues.length - 1;
  let x = state.ship % level.width;
  let y = Math.floor(state.ship / level.width);

  while (true) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || nx >= level.width || ny < 0 || ny >= level.height) break;
    const cell = ny * level.width + nx;
    if (walls.has(cell)) break;
    x = nx;
    y = ny;
    next.ship = cell;
    next.path.push(cell);
    next.rescued = collectAt(level, cell, next.rescued);
    if (cell === level.exit && next.rescued === allRescued) {
      next.won = true;
      break;
    }
  }

  if (next.path.length > 0) next.moves += 1;
  return next;
}

/** Return one shortest direction sequence, or null for an unsolvable level. */
export function solve(level) {
  const initial = createState(level);
  if (initial.won) return [];
  const key = (state) => `${state.ship}:${state.rescued}`;
  const queue = [{ state: initial, previous: -1, direction: null }];
  const visited = new Set([key(initial)]);

  for (let head = 0; head < queue.length; head += 1) {
    for (const direction of DIRECTIONS) {
      const state = move(level, queue[head].state, direction);
      const stateKey = key(state);
      if (visited.has(stateKey)) continue;
      visited.add(stateKey);
      const index = queue.length;
      queue.push({ state, previous: head, direction });
      if (state.won) {
        const result = [];
        for (let cursor = index; queue[cursor].previous !== -1;
          cursor = queue[cursor].previous) {
          result.push(queue[cursor].direction);
        }
        return result.reverse();
      }
    }
  }
  return null;
}
