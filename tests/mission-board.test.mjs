import test from 'node:test';
import assert from 'node:assert/strict';
import {buildMissionBoard} from '../mission-board.mjs';
const root={id:'r',kind:'root',label:'Source',url:'https://github.com/example/source'};
const leaf={id:'l',kind:'leaf',label:'Capability'};
const fruit={id:'f',kind:'fruit',label:'Candidate',url:'https://example.org/product'};
const edge=(from,to)=>({from,to,evidenceUrl:'https://github.com/example/source/blob/main/README.md'});
const counts=packet=>buildMissionBoard(packet).map(m=>[m.ready,m.total]);
test('complete directed source-to-outcome chain counts coverage, never certification',()=>{
 const missions=buildMissionBoard({nodes:[root,leaf,fruit],edges:[edge('r','l'),edge('l','f')]});
 assert.deepEqual(missions.map(m=>[m.ready,m.total]),[[1,1],[1,1],[1,1]]);
 assert.match(missions[2].status,/no achievement or live verification/);
});
test('one valid unrelated edge cannot launder a broken route',()=>{
 assert.deepEqual(counts({nodes:[root,leaf,fruit],edges:[{...edge('r','l'),evidenceUrl:'javascript:alert(1)'},edge('l','f')]}),[[1,1],[0,1],[0,1]]);
});
test('reversed edges and cycles without a root do not count',()=>{
 assert.deepEqual(counts({nodes:[root,leaf,fruit],edges:[edge('f','l'),edge('l','f')]}),[[1,1],[0,1],[0,1]]);
});
test('destination and provenance must both be safe HTTPS',()=>{
 assert.equal(counts({nodes:[root,leaf,{...fruit,url:'https://user:secret@example.org'}],edges:[edge('r','l'),edge('l','f')]})[2][0],0);
});
test('repository root is not an outcome even when it has a URL',()=>{
 assert.equal(counts({nodes:[root],edges:[]})[2][1],0);
});
test('empty and incomplete packets remain evidence gaps',()=>{
 assert.deepEqual(buildMissionBoard(null).map(m=>m.ready),[0,0,0]);
 assert.equal(counts({nodes:[fruit],edges:[]})[2][0],0);
});
