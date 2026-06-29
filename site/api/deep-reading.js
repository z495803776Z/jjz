const https = require('https');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-1e2b2ef42ab64c3d8271a74d2cb92990';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

function callDeepSeek(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const opts = {
      hostname: 'api.deepseek.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + DEEPSEEK_API_KEY,
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const r = https.request(opts, (apiRes) => {
      const chunks = [];
      apiRes.on('data', c => chunks.push(c));
      apiRes.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      apiRes.on('error', reject);
    });
    r.on('error', reject);
    r.write(body);
    r.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const raw = await readBody(req);
    const data = JSON.parse(raw);
    const cards = (data.cards || []).map((c, i) => {
      const pos = c.position || ('Position ' + (i + 1));
      return pos + ': ' + c.name + ' (' + c.keywords + ') - ' + c.reading;
    }).join('\n');

    const systemPrompt = '你是Night Oracle塔罗牌深度解读者，拥有20年塔罗解读经验。风格神秘、优雅、温暖，语言富有诗意和画面感。请用中文回答。\n\n你的解读必须做到：\n1. **紧扣用户的问题**：将每张牌的含义直接关联到用户的具体提问上，不要泛泛而谈\n2. **整体能量场**：用一段话描绘这次占卜的整体氛围和核心主题\n3. **逐张深度解读**：结合牌面在该位置的含义，分析它对用户问题的具体启示，说明这张牌如何回答了用户的疑惑\n4. **牌与牌的对话**：找出牌与牌之间的呼应、冲突或递进关系，拼出完整的故事线\n5. **直接回答问题**：明确回应用户的问题，给出具体的答案方向\n6. **行动指引**：给出2-3条具体可执行的建议\n\n字数400-600字。不要说空洞的套话，每一句都要有信息量。';

    const userPrompt = '【牌阵类型】' + (data.spreadName || '未知') + '\n【用户的核心问题】' + (data.question || '用户未提问，请进行通用指引') + '\n\n【抽到的牌与位置】\n' + cards + '\n\n请围绕用户的提问，对这次占卜进行深度解读。每张牌的分析都要关联到用户的问题，最后给出明确的答案方向和行动建议。';

    const payload = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1024,
      temperature: 0.8
    };

    const apiRes = await callDeepSeek(payload);
    const parsed = JSON.parse(apiRes);
    const content = parsed.choices && parsed.choices[0] && parsed.choices[0].message
      ? parsed.choices[0].message.content
      : '暂时无法获取深度解读，请稍后再试。';

    res.status(200).json({ content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};