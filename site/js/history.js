// Reading History — localStorage-based reading recorder
const STORAGE_KEY = 'night_oracle_readings';
const MAX_READINGS = 50;

export function saveReading(data) {
  // data: { type, spreadName, question, cards: [{name, keywords, position, reading}], timestamp }
  const readings = getReadings();
  readings.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ...data,
    timestamp: data.timestamp || Date.now()
  });
  if (readings.length > MAX_READINGS) readings.length = MAX_READINGS;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(readings)); } catch(e) {}
  return readings[0];
}

export function getReadings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e) { return []; }
}

export function deleteReading(id) {
  const readings = getReadings().filter(r => r.id !== id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(readings)); } catch(e) {}
  return readings;
}

export function clearReadings() {
  try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
}

export function renderHistoryPage() {
  const readings = getReadings();
  const container = document.getElementById('history-list');
  const emptyEl = document.getElementById('history-empty');
  const countEl = document.getElementById('history-count');
  
  if (countEl) countEl.textContent = readings.length;
  
  if (readings.length === 0) {
    if (container) container.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  
  if (emptyEl) emptyEl.style.display = 'none';
  if (container) {
    container.style.display = 'grid';
    container.innerHTML = readings.map(r => {
      const date = new Date(r.timestamp);
      const dateStr = date.toLocaleDateString('zh-CN', {year:'numeric',month:'long',day:'numeric'});
      const timeStr = date.toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'});
      const cardsSummary = r.cards.map(c => c.name.split(' ')[0]).join(' · ');
      return '<div class="history-card" data-id="'+r.id+'">' +
        '<div class="history-header">' +
          '<span class="history-spread">'+r.spreadName+'</span>' +
          '<span class="history-date">'+dateStr+' '+timeStr+'</span>' +
        '</div>' +
        (r.question ? '<p class="history-question">「'+r.question+'」</p>' : '') +
        '<p class="history-cards">'+cardsSummary+'</p>' +
        '<button class="history-detail-btn" onclick="showHistoryDetail(\''+r.id+'\')">查看完整解读</button>' +
        '<button class="history-delete-btn" onclick="deleteHistoryItem(\''+r.id+'\')">×</button>' +
      '</div>';
    }).join('');
  }
}