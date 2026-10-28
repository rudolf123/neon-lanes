import test from 'node:test';
import assert from 'node:assert/strict';
import {createEventApi,createProgressSync,decodeLeaderboard} from '../src/event-api.js';
function fixture(saved={}){
 const values=new Map([['test',JSON.stringify(saved)]]),calls=[];
 const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 const api={saveDay:async(d,s)=>calls.push([d,s]),complete:async()=>calls.push('complete')};
 const create=()=>createProgressSync({api,storage,key:'test',maxScores:Array(7).fill(150)});
 return {calls,api,create};
}
test('each completed song sends statistics, including zero and replays; restored scores do not',async()=>{
 const {create,calls}=fixture({completionSent:true,completionPending:true});let sync=create();
 sync.merge(7,0);await sync.flush();assert.deepEqual(calls,[]);
 sync.record(1,0);await sync.flush();sync.record(1,0);await sync.flush();
 sync.record(7,15);await sync.flush();
 assert.deepEqual(calls,[[1,0],'complete',[1,0],'complete',[7,15],'complete']);
 sync=create();await sync.flush();assert.equal(calls.length,6);
});
test('failed statistics remain queued after reload',async()=>{
 const {create,calls,api}=fixture();let sync=create();
 api.complete=async()=>{throw Error('api-http-401');};
 sync.record(7,42);await assert.rejects(sync.flush(),/401/);
 assert.deepEqual(calls,[[7,42]]);assert.equal(sync.state.pendingCompletions,1);
 sync=create();api.complete=async()=>calls.push('complete');await sync.flush();
 assert.deepEqual(calls,[[7,42],'complete']);assert.equal(sync.state.pendingCompletions,0);
});
test('leaderboard failure does not prevent statistics and only the score is retried',async()=>{
 const {create,calls,api}=fixture();let sync=create();
 api.saveDay=async()=>{throw Error('offline');};sync.record(1,12);
 await assert.rejects(sync.flush(),/offline/);assert.deepEqual(calls,['complete']);
 sync=create();api.saveDay=async(d,s)=>calls.push([d,s]);await sync.flush();
 assert.deepEqual(calls,['complete',[1,12]]);
});
test('completion during an in-flight request is not lost',async()=>{
 const {create,calls,api}=fixture();let release;const gate=new Promise(resolve=>release=resolve);
 api.complete=async()=>{calls.push('complete');if(calls.filter(x=>x==='complete').length===1)await gate;};
 const sync=create();sync.record(1,10);const flushing=sync.flush();
 await new Promise(resolve=>setImmediate(resolve));sync.record(2,20);release();await flushing;
 assert.deepEqual(calls,[[1,10],'complete','complete',[2,20]]);
 assert.deepEqual(sync.state.pending,{});assert.equal(sync.state.pendingCompletions,0);
});
test('statistics request uses JSON and the provided authorization',async()=>{
 let call;const config={apiBaseUrl:'https://example.test/api/v1',gameIds:[1,2,3,4,5,6,7],scoreField:'score',authHeader:'Authorization',bodyEncoding:'form',decodeLeaderboard};
 const api=createEventApi(config,{authToken:'test-token'},async(url,options)=>{call={url,options};return new Response(JSON.stringify({success:true}),{headers:{'Content-Type':'application/json'}});});
 await api.complete();assert.equal(new URL(call.url).pathname,'/api/v1/statistics/rythm-event/add');
 assert.equal(call.options.method,'POST');assert.equal(call.options.headers.Authorization,'test-token');
 assert.equal(call.options.headers['Content-Type'],'application/json');assert.deepEqual(JSON.parse(call.options.body),{event_type:'rhythm_complete'});
});
