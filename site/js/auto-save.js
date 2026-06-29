// Auto-save reading to history — call from showResults()
export function autoSaveReading(spreadName, question, drawnCards, positions, getReadingFn) {
  try {
    const cards = drawnCards.map((card, i) => ({
      name: card.n,
      keywords: card.k,
      position: positions[i] || ('Position ' + (i+1)),
      reading: getReadingFn(card, i)
    }));
    const readings = JSON.parse(localStorage.getItem('night_oracle_readings') || '[]');
    readings.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      spreadName: spreadName,
      question: question || '',
      cards: cards,
      timestamp: Date.now()
    });
    if (readings.length > 50) readings.length = 50;
    localStorage.setItem('night_oracle_readings', JSON.stringify(readings));
  } catch(e) {}
}