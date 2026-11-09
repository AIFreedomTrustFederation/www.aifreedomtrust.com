import test from 'node:test';
import assert from 'node:assert/strict';
import {buildMissionBoard} from '../mission-board.mjs';
const root={id:'r',kind:'root',label:'Source',url:'https://github.com/example/source'};
const leaf={id:'l',kind:'leaf',label:'Capability'};
const fruit={id:'f',kind:'fruit',label:'Candidate',url:'https://example.org/product'};
const edge=(from,to)=>({from,to,evidenceUrl:'https://github.com/example/source/blob/main/README.md'});
test('directed evidence produces coverage, never verified achievements',()=>{
 const missions=buildMissionBoard({nodes:[root,leaf,fruit],edges:[edge('r','l'),edge('l','f')]});
 assert.deepEqual(missions.map(m=>[m.ready,m.total]),[[1,1],[1,1],[1,1]]);
 assert.match(missions[2].status,/no achievement or live verification/);
});
test('missing roots, forged URLs, and reversed edges do not count as outcome coverage',()=>{
 const missions=buildMissionBoard({nodes:[root,leaf,fruit],edges:[edge('f','l'),{...edge('l','r'),evidenceUrl:'javascript:alert(1)'}]});
 assert.equal(missions[2].ready,0);
});
test('empty and incomplete packets stay honest',()=>{
 assert.deepEqual(buildMissionBoard(null).map(m=>m.ready),[0,0,0]);
 assert.equal(buildMissionBoard({nodes:[fruit],edges:[]})[2].ready,0);
});
