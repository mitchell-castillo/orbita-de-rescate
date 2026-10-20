import { levels } from './levels.js';
import { createState, move, DIRECTIONS } from './engine.js';
import { readProgress, writeProgress, firstUnfinished, completionCount } from './assets/progress.js';
const STORAGE_KEY = 'daily-games:orbita-de-rescate:v1';
const $ = (id) => document.getElementById(id);
const loaded = readProgress(STORAGE_KEY, undefined, levels.length);
let progress = loaded.progress;
let storageAvailable = loaded.available;
let levelIndex = progress.currentLevel;
let state, history = [], directions = [], facing = 'up';
const rotation = { up: 0, right: 90, down: 180, left: 270 };
const words = { up:'arriba', right:'la derecha', down:'abajo', left:'la izquierda' };
const shipSVG = '<svg viewBox="0 0 50 50" aria-hidden="true"><path d="M25 3 43 43 25 35 7 43Z" fill="#dcfa94"/><path d="m25 12 7 19-7-3-7 3Z" fill="#5d7146"/><path d="M21 40v6m8-6v6" stroke="#dcfa94" stroke-width="3" stroke-linecap="round" opacity=".7"/></svg>';
const rescueCount = () => state.rescued.toString(2).replace(/0/g, '').length;
function persist() {
  progress.currentLevel = levelIndex;
  progress.run = { level: levelIndex, directions: directions.slice() };
  storageAvailable = writeProgress(STORAGE_KEY, progress);
  $('save-status').textContent = storageAvailable ? '◈ Progreso guardado en este navegador.' : '⚠ No se puede guardar aquí. El avance durará solo esta sesión.';
}
function renderPicker() {
  $('sector-progress').textContent = `${completionCount(progress)} / ${levels.length}`;
  $('mission-fill').style.width = `${completionCount(progress) / levels.length * 100}%`;
  const unlocked = firstUnfinished(progress.completed, levels.length);
  $('level-picker').replaceChildren(...levels.map((level, i) => {
    const button = document.createElement('button');
    button.className = `level-button${progress.completed[i] ? ' completed' : ''}`;
    button.textContent = String(i + 1).padStart(2, '0');
    button.disabled = i > unlocked;
    button.dataset.level = i;
    button.setAttribute('aria-label', `Sector ${i+1}: ${level.name}${button.disabled ? ', bloqueado' : progress.completed[i] ? ', completado' : ''}`);
    if (i === levelIndex) button.setAttribute('aria-current', 'true');
    button.onclick = () => selectLevel(i);
    return button;
  }));
}
function renderBoard() {
  const level = levels[levelIndex], all = rescueCount() === level.rescues.length;
  $('board').style.setProperty('--columns', level.width);
  $('board').setAttribute('aria-rowcount', level.height);
  $('board').setAttribute('aria-colcount', level.width);
  const walls = new Set(level.walls), trail = new Set(state.path);
  const rows = [];
  for (let y = 0; y < level.height; y++) {
    const row = document.createElement('div'); row.className = 'board-row'; row.setAttribute('role','row');
    for (let x = 0; x < level.width; x++) {
      const index = y * level.width + x;
      const cell = document.createElement('div'); cell.className = 'cell'; cell.setAttribute('role','gridcell');
      cell.setAttribute('aria-rowindex', y + 1); cell.setAttribute('aria-colindex', x + 1);
      let label = `Fila ${y+1}, columna ${x+1}: espacio libre`;
      if (walls.has(index)) { cell.classList.add('wall'); const rock=document.createElement('span'); rock.className='asteroid'; rock.setAttribute('aria-hidden','true');cell.append(rock); label=`Fila ${y+1}, columna ${x+1}: asteroide`; }
      else if (index === level.exit) { const portal=document.createElement('span');portal.className=`portal${all?' active':''}`;portal.setAttribute('aria-hidden','true');cell.append(portal);label=`Fila ${y+1}, columna ${x+1}: portal ${all?'activo':'inactivo'}`; }
      else if (trail.has(index)) cell.classList.add('trail');
      const r=level.rescues.indexOf(index);
      if (r>=0 && !(state.rescued & (1 << r))) {const astronaut=document.createElement('span');astronaut.className='astronaut';astronaut.setAttribute('aria-hidden','true');cell.append(astronaut);label=`Fila ${y+1}, columna ${x+1}: astronauta por rescatar`;}
      if (index===state.ship) { const ship=document.createElement('span');ship.className='ship';ship.innerHTML=shipSVG;ship.style.setProperty('--rotation',`${rotation[facing]}deg`);cell.append(ship);label+=', tu nave'; }
      cell.setAttribute('aria-label',label);row.append(cell);
    }
    rows.push(row);
  }
  $('board').replaceChildren(...rows);
  $('rescued-count').textContent=`${rescueCount()} / ${level.rescues.length}`;
  $('move-count').textContent=state.moves;
  $('undo').disabled=history.length===0;
  document.querySelectorAll('[data-direction]').forEach(b=>b.disabled=state.won);
  $('win-panel').hidden=!state.won;
  if (state.won) renderWin();
}
function renderWin() {
  const level=levels[levelIndex];
  const stars=state.moves<=level.par ? 3 : state.moves<=level.par+3 ? 2 : 1;
  const final=levelIndex===levels.length-1;
  $('win-label').textContent=final?'EXPEDICIÓN COMPLETADA':'MISIÓN CUMPLIDA';
  $('win-title').textContent=final?'Todos volvieron a casa.':'Tripulación a salvo.';
  $('win-summary').textContent=`${level.rescues.length} ${level.rescues.length===1?'astronauta rescatado':'astronautas rescatados'} en ${state.moves} impulsos. ${stars===3?'¡Ruta óptima!':`La ruta óptima usa ${level.par}.`}`;
  $('win-stars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);
  $('win-stars').setAttribute('aria-label',`${stars} de 3 estrellas`);
  $('next-level').textContent=final?'Volver a la colección ↗':'Siguiente sector →';
}
function finish() {
  const previous=progress.completed[levelIndex]?.bestMoves;
  if (!previous || state.moves<previous) progress.completed[levelIndex]={bestMoves:state.moves};
  renderPicker();
}
function selectLevel(index, restore=false) {
  if (index<0 || index>firstUnfinished(progress.completed,levels.length)) return;
  levelIndex=index;state=createState(levels[index]);history=[];directions=[];facing='up';
  if (restore && progress.run?.level===index && Array.isArray(progress.run.directions) && progress.run.directions.length<=5000) {
    for (const direction of progress.run.directions) {
      if (!DIRECTIONS.includes(direction) || state.won) {state=createState(levels[index]);history=[];directions=[];break;}
      const next=move(levels[index],state,direction);
      if (next.moves===state.moves) {state=createState(levels[index]);history=[];directions=[];break;}
      history.push(state);directions.push(direction);state=next;facing=direction;
    }
  }
  $('level-number').textContent=`SECTOR ${String(index+1).padStart(2,'0')} / ${String(levels.length).padStart(2,'0')}`;
  $('level-name').textContent=levels[index].name;
  $('briefing').textContent=levels[index].briefing;
  $('hint-text').textContent=levels[index].hint;
  $('hint-text').hidden=true;$('hint').setAttribute('aria-expanded','false');
  $('board-message').textContent=restore&&state.moves?'Misión recuperada. Continúa donde la dejaste.':'Prepara tu primer impulso.';
  if (state.won) finish();
  renderPicker();renderBoard();persist();
}
function impulse(direction) {
  if (state.won || $('help-dialog').open) return;
  const before=rescueCount(), next=move(levels[levelIndex],state,direction);
  if (next.moves===state.moves) {$('board-message').textContent='Ese camino está bloqueado. Prueba otra dirección.';return;}
  history.push(state);directions.push(direction);state=next;facing=direction;
  const count=rescueCount(), level=levels[levelIndex];
  const position=`Fila ${Math.floor(state.ship/level.width)+1}, columna ${state.ship%level.width+1}.`;
  $('board-message').textContent=state.won?'¡Rescate completado! La tripulación está a salvo.':count>before?`¡${count-before} a bordo! ${count===level.rescues.length?'Portal activado. Vuelve a casa.':`${count} de ${level.rescues.length} rescatados.`} ${position}`:`Impulso hacia ${words[direction]}. ${position}`;
  if (state.won) finish();
  renderBoard();persist();
  if (state.won) $('next-level').focus({preventScroll:true});
}
function undo() {
  if (!history.length) return;
  state=history.pop();directions.pop();facing=directions.at(-1)||'up';
  $('board-message').textContent='Último impulso deshecho. Prueba otra ruta.';renderBoard();persist();
}
$('undo').onclick=undo;
$('restart').onclick=()=>selectLevel(levelIndex);
$('replay-level').onclick=()=>{selectLevel(levelIndex);$('board').focus({preventScroll:true});};
$('next-level').onclick=()=>{if(levelIndex<levels.length-1){selectLevel(levelIndex+1);$('board').focus({preventScroll:true});}else{location.href='https://mitchell-castillo.github.io/daily-games/';}};
$('hint').onclick=()=>{const open=$('hint-text').hidden;$('hint-text').hidden=!open;$('hint').setAttribute('aria-expanded',String(open));};
document.querySelectorAll('[data-direction]').forEach(button=>button.onclick=()=>impulse(button.dataset.direction));
const keys={ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left',w:'up',d:'right',s:'down',a:'left'};
document.addEventListener('keydown',event=>{
  if ($('help-dialog').open || event.ctrlKey || event.metaKey || event.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
  const key=event.key.length===1?event.key.toLowerCase():event.key;
  if(keys[key]){event.preventDefault();if(!event.repeat)impulse(keys[key]);}
  else if(key==='z'){event.preventDefault();if(!event.repeat)undo();}
  else if(key==='r'){event.preventDefault();if(!event.repeat)selectLevel(levelIndex);}
});
let touch=null;
$('board').addEventListener('pointerdown',event=>{touch={x:event.clientX,y:event.clientY,id:event.pointerId};$('board').setPointerCapture(event.pointerId);});
$('board').addEventListener('pointerup',event=>{if(!touch||touch.id!==event.pointerId)return;const dx=event.clientX-touch.x,dy=event.clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;impulse(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));});
$('board').addEventListener('pointercancel',()=>{touch=null;});
$('help-button').onclick=()=>$('help-dialog').showModal();
$('close-help').onclick=()=>$('help-dialog').close();
$('start-playing').onclick=()=>{$('help-dialog').close();$('board').focus({preventScroll:true});};
$('help-dialog').addEventListener('click',event=>{if(event.target!==event.currentTarget)return;const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.currentTarget.close();});
selectLevel(levelIndex,true);
