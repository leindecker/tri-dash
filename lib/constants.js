export const SPORTS = {
  swim: { label: 'Natação',    color: '#1D9E75', light: '#E1F5EE', mid: '#5DCAA5' },
  bike: { label: 'Ciclismo',   color: '#185FA5', light: '#E6F1FB', mid: '#85B7EB' },
  run:  { label: 'Corrida',    color: '#D85A30', light: '#FAECE7', mid: '#F0997B' },
  gym:  { label: 'Musculação', color: '#7F77DD', light: '#EEEDFE', mid: '#AFA9EC' },
};

export const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function fmtTime(mins) {
  if (!mins) return '—';
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m}min`;
}

export function getMondayOf(offsetWeeks = 0) {
  const now = new Date();
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offsetWeeks * 7);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

export function getWeekKey(offsetWeeks = 0) {
  return getMondayOf(offsetWeeks).toISOString().slice(0, 10);
}

export function fmtWeekRange(offsetWeeks = 0) {
  const mon = getMondayOf(offsetWeeks);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return `${fmt(mon)} – ${fmt(sun)}`;
}

export function fmtPaceOrSpeed(sport, avgSpeed) {
  if (!avgSpeed || avgSpeed <= 0) return null;
  if (sport === 'bike') return `${(avgSpeed * 3.6).toFixed(1)} km/h`;
  const paceMinKm = 1000 / avgSpeed / 60;
  if (sport === 'swim') {
    const p = paceMinKm / 10;
    const m = Math.floor(p), s = Math.round((p - m) * 60);
    return `${m}:${String(s).padStart(2, '0')} /100m`;
  }
  const m = Math.floor(paceMinKm), s = Math.round((paceMinKm - m) * 60);
  return `${m}:${String(s).padStart(2, '0')} /km`;
}

export function aggregateSessions(sessions) {
  const result = {};
  Object.keys(SPORTS).forEach(k => result[k] = { mins: 0, dist: 0, tss: 0, count: 0 });
  sessions.forEach(s => {
    if (!result[s.sport]) return;
    result[s.sport].mins  += s.mins;
    result[s.sport].dist  += s.dist;
    result[s.sport].tss   += s.tss;
    result[s.sport].count += 1;
  });
  return result;
}
