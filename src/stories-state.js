// Story receipts are separate from scores and the API retry queue.
const DAY = 86400000;
// The completion story opens with the diploma after seven full days.
export function storyCalendar(event, now) {
  const day = Math.floor((now - event.startsAt) / DAY) + 1;
  return {day, active: day >= 1 && day <= 7 && now < event.endsAt, rewardAvailable: now >= event.startsAt + 7 * DAY};
}
export function storiesKey({accountUuid, eventId, startsAt, endsAt}) {
  return '321playsy:stories:v1:' + JSON.stringify([accountUuid || 'local', eventId, startsAt, endsAt]);
}

function normalize(value) {
  const days = Array.isArray(value?.days)
    ? [...new Set(value.days.filter(day => Number.isInteger(day) && day >= 1 && day <= 7))].sort((a, b) => a - b)
    : [];
  return {intro: value?.intro === true, days, ...(value?.completed === true ? {completed: true} : {})};
}

export function createStoryHistory(key, storage = {
  getItem: key => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
}) {
  let receipt = {intro: false, days: []};
  let firstDay = null;
  const entryKey = '321playsy:story-entry:v1:' + key;
  function read() {
    // Merge instead of replacing so an unavailable storage backend still works
    // for this session, and another tab cannot erase receipts already in memory.
    try {
      const saved = normalize(JSON.parse(storage.getItem(key) || '{}'));
      receipt = normalize({intro: receipt.intro || saved.intro, days: [...receipt.days, ...saved.days], completed: receipt.completed || saved.completed});
    } catch {}
    return receipt;
  }
  function enter({day, active}) {
    try {
      const saved = Number(storage.getItem(entryKey));
      if (Number.isInteger(saved) && saved >= 1 && saved <= 7) firstDay = saved;
    } catch {}
    if (firstDay === null && active && Number.isInteger(day) && day >= 1 && day <= 7) {
      const earlierDays = read().days;
      firstDay = Math.min(day, ...earlierDays);
      try { storage.setItem(entryKey, String(firstDay)); } catch {}
    }
    return firstDay;
  }
  return {
    enter,
    plan(calendar) {
      const {day, active, rewardAvailable} = calendar;
      const seen = read();
      if (rewardAvailable) return seen.completed ? [] : ['completed'];
      if (!active || !Number.isInteger(day) || day < 1 || day > 7) return [];
      const introDay = enter(calendar);
      return [
        ...(!seen.intro && day === introDay ? ['intro'] : []),
        ...(day > Math.max(0, ...seen.days) ? ['day-' + day] : []),
      ];
    },
    mark(id) {
      if (!['intro', 'completed'].includes(id) && !/^day-[1-7]$/.test(id)) return;
      read();
      if (id === 'intro') receipt.intro = true;
      else if (id === 'completed') receipt.completed = true;
      else receipt = normalize({...receipt, days: [...receipt.days, Number(id.slice(4))]});
      try { storage.setItem(key, JSON.stringify(receipt)); } catch {}
    },
  };
}
