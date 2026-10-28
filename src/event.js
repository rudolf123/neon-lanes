export const DAY = 86400000;
export function eventState(event, now, scores = {}) {
  const day = Math.max(0, Math.min(7, Math.floor((now - event.startsAt) / DAY) + 1));
  const expired = now >= event.endsAt;
  const rewardAvailable = now >= event.startsAt + 7 * DAY;
  return { day, expired, rewardAvailable, ended: expired || rewardAvailable, total: Object.values(scores).reduce((a,b)=>a+b,0), remaining: Math.max(0,event.endsAt-now) };
}
export function award(total, max) { return total >= max * .75 ? 'gold' : total >= max * .4 ? 'silver' : 'bronze'; }
export function saveScore(scores, day, score) { return {...scores, [day]: Math.max(scores[day] ?? 0, score)}; }
export function timingPoints(delta) { return delta <= .12 ? 3 : delta <= .23 ? 2 : delta <= .36 ? 1 : 0; }
