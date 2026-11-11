import test from 'node:test';
import assert from 'node:assert/strict';
import {compareEvidenceRoutes} from '../route-observatory.mjs';
const e = (from,to,evidenceUrl='https://example.org/evidence')=>({from,to,evidenceUrl});
test('compares independent directed routes without claiming certification',()=>{
 const p={nodes:[{id:'r1',kind:'root',label:'Source A'},{id:'r2',kind:'root',label:'Source B'},{id:'b',kind:'branch',label:'Service'},{id:'f',kind:'fruit',label:'Candidate',url:'https://example.org/product'}],edges:[e('r1','b'),e('r2','b'),e('b','f')]};
 const x=compareEvidenceRoutes(p,'f');
 assert.equal(x.routes.length,2);assert.ok(x.routes.every(r=>r.complete&&r.ids.at(-1)==='f'));assert.equal(x.gap,null);
});
test('invalid evidence remains visible but never complete',()=>{
 const p={nodes:[{id:'r',kind:'root',label:'Root'},{id:'f',kind:'fruit',label:'Candidate'}],edges:[e('r','f','javascript:alert(1)')]};
 const x=compareEvidenceRoutes(p,'f');assert.equal(x.routes.length,1);assert.equal(x.routes[0].complete,false);
});
test('cycles and missing roots cannot fabricate a route',()=>{
 const p={nodes:[{id:'a',kind:'branch',label:'A'},{id:'b',kind:'leaf',label:'B'}],edges:[e('a','b'),e('b','a')]};
 assert.equal(compareEvidenceRoutes(p,'b').routes.length,0);
 assert.match(compareEvidenceRoutes(p,'missing').gap,/absent/);
});
