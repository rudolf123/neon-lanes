import test from 'node:test';
import assert from 'node:assert/strict';
import {eventState, DAY} from '../src/event.js';
import {storyCalendar} from '../src/stories-state.js';
const start=Date.UTC(2026,9,20);
const event={startsAt:start,endsAt:start+8*DAY};
test('day eight grants the final screen with only day five completed, including repeated entries',()=>{
 const scores={5:42};
 for(const now of [start+7*DAY,start+7*DAY+1000,start+8*DAY]){
  const state=eventState(event,now,scores);
  assert.equal(state.ended,true);assert.equal(state.expired,true);
  assert.equal(state.remaining,0);assert.equal(state.total,42);
  assert.equal(storyCalendar(event,now).rewardAvailable,true);
 }
 assert.deepEqual(scores,{5:42});
});
test('day seven stays playable until the exact day-eight boundary',()=>{
 const state=eventState(event,start+7*DAY-1,{5:42});
 assert.equal(state.day,7);assert.equal(state.ended,false);assert.equal(state.remaining,1);
});
test('an earlier configured deadline and a completed seventh song still end the event',()=>{
 assert.equal(eventState({...event,endsAt:start+6*DAY},start+6*DAY,{5:42}).expired,true);
 assert.equal(eventState(event,start+6*DAY,{7:0}).ended,true);
});
