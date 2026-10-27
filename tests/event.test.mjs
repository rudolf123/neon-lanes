import test from 'node:test';
import assert from 'node:assert/strict';
import {eventState, DAY} from '../src/event.js';
import {storyCalendar, createStoryHistory} from '../src/stories-state.js';
import {parseLaunchDate} from '../src/launch-context.js';
const event={startsAt:parseLaunchDate('20.10.2026'),endsAt:parseLaunchDate('29.10.2026',{endDateInclusive:true},true)};
test('all players can play through October 29, including day eight and completed day seven',()=>{
 for(const scores of [{},{5:42},{7:0}])for(const now of [event.startsAt+7*DAY,event.endsAt-1]){
  const state=eventState(event,now,scores);
  assert.equal(state.day,7);assert.equal(state.ended,false);assert.equal(state.expired,false);
  assert.equal(state.remaining,event.endsAt-now);
  const calendar=storyCalendar(event,now);
  assert.equal(calendar.rewardAvailable,false);
  const history=createStoryHistory('test',{getItem:()=>null,setItem:()=>{}});
  assert.deepEqual(history.plan(calendar),[]);
 }
});
test('all players get the diploma from October 30 regardless of progress or repeat entry',()=>{
 assert.equal(event.endsAt,Date.UTC(2026,9,30));
 for(const scores of [{},{5:42},{7:0}])for(const now of [event.endsAt,event.endsAt+DAY]){
  const state=eventState(event,now,scores);
  assert.equal(state.ended,true);assert.equal(state.expired,true);assert.equal(state.remaining,0);
  assert.equal(storyCalendar(event,now).rewardAvailable,true);
  assert.equal(state.total,Object.values(scores).reduce((a,b)=>a+b,0));
 }
});
test('short and explicit timestamp deadlines also control stories and gameplay',()=>{
 const short={startsAt:event.startsAt,endsAt:event.startsAt+2*DAY+123};
 for(const now of [short.endsAt-1,short.endsAt]){
  assert.equal(eventState(short,now).ended,now>=short.endsAt);
  assert.equal(storyCalendar(short,now).rewardAvailable,now>=short.endsAt);
 }
});
