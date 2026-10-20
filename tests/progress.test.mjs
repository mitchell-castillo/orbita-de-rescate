import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyProgress,normalizeProgress,readProgress,writeProgress,firstUnfinished,completionCount} from '../assets/progress.js';
function memory(){const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};}
test('new players start at sector zero',()=>{assert.deepEqual(readProgress('test',memory()).progress,emptyProgress());});
test('progress round trip retains completion and replayable run',()=>{const store=memory(),p={...emptyProgress(),completed:{0:{bestMoves:3}},currentLevel:1,run:{level:1,directions:['down']}};assert.equal(writeProgress('test',p,store),true);const loaded=readProgress('test',store);assert.deepEqual(loaded.progress.completed,p.completed);assert.deepEqual(loaded.progress.run,p.run);assert.equal(loaded.progress.currentLevel,1);assert.equal(loaded.available,true);});
test('invalid JSON is recovered without reporting blocked storage',()=>{const store=memory();store.setItem('test','{oops');assert.deepEqual(readProgress('test',store),{progress:emptyProgress(),available:true});});
test('denied storage degrades to session-only mode',()=>{const denied={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};assert.equal(readProgress('test',denied).available,false);assert.equal(writeProgress('test',emptyProgress(),denied),false);});
test('unknown schema resets cleanly',()=>{assert.deepEqual(normalizeProgress({version:45,currentLevel:5}),emptyProgress());});
test('invalid completion records and locked selected levels are rejected',()=>{const p=normalizeProgress({version:1,currentLevel:99,completed:{0:{bestMoves:3},1:{bestMoves:-1},8:{bestMoves:4}}});assert.equal(p.currentLevel,1);assert.equal(completionCount(p),1);});
test('first gap controls unlock order',()=>{assert.equal(firstUnfinished({0:{bestMoves:3},2:{bestMoves:7}}),1);});
test('all completed selects last sector',()=>{const completed=Object.fromEntries(Array.from({length:6},(_,i)=>[i,{bestMoves:3}]));assert.equal(firstUnfinished(completed),5);});
