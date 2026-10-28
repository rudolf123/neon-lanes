import test from 'node:test';
import assert from 'node:assert/strict';
import {eventState, DAY} from '../src/event.js';
import {storyCalendar, createStoryHistory} from '../src/stories-state.js';
import {parseLaunchDate} from '../src/launch-context.js';
import {endUI} from '../src/psd-ui.js';

const event={startsAt:parseLaunchDate('20.10.2026'),endsAt:parseLaunchDate('29.10.2026',{endDateInclusive:true},true)};
const eighthDay=event.startsAt+7*DAY;

test('seven full days are playable, regardless of day-seven score',()=>{
 for(const scores of [{},{5:42},{7:0}]){
  const state=eventState(event,eighthDay-1,scores);
  assert.equal(state.day,7);assert.equal(state.ended,false);assert.equal(state.rewardAvailable,false);
  assert.equal(storyCalendar(event,eighthDay-1).active,true);
 }
});
test('day eight opens the diploma and completion story independently of scores and end date',()=>{
 for(const scores of [{},{5:42},{7:0}])for(const now of [eighthDay,event.endsAt-1,event.endsAt,event.endsAt+DAY]){
  const state=eventState(event,now,scores);
  assert.equal(state.ended,true);assert.equal(state.rewardAvailable,true);
  assert.equal(state.expired,now>=event.endsAt);
  assert.equal(state.total,Object.values(scores).reduce((a,b)=>a+b,0));
  const calendar=storyCalendar(event,now);
  assert.equal(calendar.active,false);assert.equal(calendar.rewardAvailable,true);
  const history=createStoryHistory('test',{getItem:()=>null,setItem:()=>{}});
  assert.deepEqual(history.plan(calendar),['completed']);
 }
});
test('an early deadline stops gameplay but the diploma still waits until day eight',()=>{
 const short={startsAt:event.startsAt,endsAt:event.startsAt+2*DAY+123};
 for(const now of [short.endsAt-1,short.endsAt,eighthDay-1,eighthDay]){
  const state=eventState(short,now);
  assert.equal(state.ended,now>=short.endsAt);
  assert.equal(state.rewardAvailable,now>=eighthDay);
  assert.equal(storyCalendar(short,now).rewardAvailable,state.rewardAvailable);
 }
 const t=key=>key;
 assert.match(endUI({t,s:eventState(short,short.endsAt),scores:{}}),/id="certificate"[^>]*disabled/);
 assert.doesNotMatch(endUI({t,s:eventState(short,eighthDay),scores:{}}),/id="certificate"[^>]*disabled/);
});
test('date-only end is inclusive and exact-time starts determine the eighth-day boundary',()=>{
 assert.equal(event.endsAt,Date.UTC(2026,9,30));
 const precise={startsAt:Date.UTC(2026,9,20,12),endsAt:Date.UTC(2026,10,2)};
 assert.equal(eventState(precise,precise.startsAt+7*DAY-1).rewardAvailable,false);
 assert.equal(eventState(precise,precise.startsAt+7*DAY).rewardAvailable,true);
});
