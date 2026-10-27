import {decodeLeaderboard} from './event-api.js?v=4c0b585e0128';
// Swagger: https://swagger.dsu-academy.com/gsd.swagger.json
// Day IDs approved by the app/backend owner on 2026-10-07.
export const integrationConfig = {
 enabled: true,
 apiBaseUrl: 'https://admin.dsu-academy.com/api/v1',
 gameIds: Array.from({length:7},(_,i)=>`rythm_day_${i+1}`), // Approved leaderboard IDs.
 scoreField: 'score',
 bodyEncoding: 'json',
 authHeader: 'Authorization',
 authPrefix: '',
 dateOffsetMinutes: 0, // Calendar dates use UTC.
 endDateInclusive: true, // Include the entire last UTC calendar day.
 decodeLeaderboard,
};
