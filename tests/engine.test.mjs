import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,move,solve,DIRECTIONS} from '../engine.js';
import {levels} from '../levels.js';
test('six distinct original level layouts',()=>{assert.equal(levels.length,6);assert.equal(new Set(levels.map(l=>JSON.stringify([l.width,l.walls,l.start,l.rescues,l.exit]))).size,6);});
for(const level of levels){
 test(`sector ${level.id}: valid cells, solvable, optimal par ${level.par}`,()=>{
  assert.equal(new Set([level.start,level.exit,...level.rescues]).size,level.rescues.length+2);
  const solution=solve(level);assert.ok(solution);assert.equal(solution.length,level.par);
  let state=createState(level);for(const direction of solution){const before=structuredClone(state);const next=move(level,state,direction);assert.deepEqual(state,before);assert.ok(next.moves>state.moves);assert.ok(!level.walls.includes(next.ship));state=next;}
  assert.equal(state.won,true);assert.equal(state.ship,level.exit);assert.equal(state.rescued,2**level.rescues.length-1);
  assert.equal(state.moves,level.par);
 });
}
test('tutorial is solved with up, right, down',()=>{let s=createState(levels[0]);for(const d of ['up','right','down'])s=move(levels[0],s,d);assert.equal(s.won,true);});
test('blocked impulse does not count a move',()=>{const s=createState(levels[0]);assert.deepEqual(move(levels[0],s,'left'),s);});
test('unknown directions cannot change state',()=>{const s=createState(levels[0]);assert.deepEqual(move(levels[0],s,'sideways'),s);});
test('rescues crossed en route count, not just final position',()=>{let s=createState(levels[0]);s=move(levels[0],s,'up');s=move(levels[0],s,'right');assert.equal(s.rescued,1);assert.equal(s.ship,4);assert.ok(s.path.includes(2));});
test('dock is inactive before all rescues',()=>{const l={width:4,height:3,start:0,exit:1,rescues:[8],walls:[]};const s=move(l,createState(l),'right');assert.equal(s.ship,3);assert.equal(s.won,false);});
test('active dock stops the ship immediately',()=>{const l={width:4,height:3,start:0,exit:2,rescues:[1],walls:[]};const s=move(l,createState(l),'right');assert.equal(s.ship,2);assert.equal(s.won,true);});
test('inputs after victory never increase moves',()=>{const l=levels[0];let s=createState(l);for(const d of solve(l))s=move(l,s,d);for(const d of DIRECTIONS){assert.equal(move(l,s,d).moves,s.moves);assert.equal(move(l,s,d).ship,s.ship);}});
test('board boundaries do not wrap rows',()=>{const l={width:3,height:3,start:2,exit:8,rescues:[0],walls:[]};assert.equal(move(l,createState(l),'right').ship,2);});
test('malformed levels fail explicitly',()=>{assert.throws(()=>createState({...levels[0],start:500}),RangeError);assert.throws(()=>createState({...levels[0],walls:[20]}),RangeError);});
test('solver returns null when a rescue is unreachable',()=>{assert.equal(solve({width:3,height:3,start:0,exit:8,rescues:[4],walls:[1,3,5,7]}),null);});
