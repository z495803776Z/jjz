export async function fetchDeepReading(spreadName, question, cards) {
  try {
    const resp = await fetch('/api/deep-reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spreadName, question, cards })
    });
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();
    return data.content || '\u6682\u65f6\u65e0\u6cd5\u83b7\u53d6\u6df1\u5ea6\u89e3\u8bfb\u3002';
  } catch (e) {
    return '\u6df1\u5ea6\u89e3\u8bfb\u670d\u52a1\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002';
  }
}

export function createDeepReadingPanel(container) {
  let panel = container.querySelector('.deep-reading-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'deep-reading-panel';
    panel.innerHTML = '<div class="deep-reading-header"><span class="deep-reading-icon">\u2728</span><span class="deep-reading-title">\u6df1\u5ea6\u89e3\u8bfb</span><span class="deep-reading-tag">DeepSeek AI</span></div><div class="deep-reading-content"><div class="deep-reading-loading">\u2022\u2022\u2022 \u661f\u5149\u6b63\u5728\u6c47\u805a\uff0c\u8bf7\u7a0d\u5019 \u2022\u2022\u2022</div></div>';
    container.appendChild(panel);
  }
  const contentEl = panel.querySelector('.deep-reading-content');
  contentEl.innerHTML = '<div class="deep-reading-loading">\u2022\u2022\u2022 \u661f\u5149\u6b63\u5728\u6c47\u805a\uff0c\u8bf7\u7a0d\u5019 \u2022\u2022\u2022</div>';
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  return contentEl;
}