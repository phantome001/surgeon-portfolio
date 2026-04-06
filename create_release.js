const token = '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';
const repo = 'phantome001/surgeon-portfolio';

async function createRelease() {
  try {
    const body = {
      tag_name: 'v1.1.0',
      name: 'تحديث المميزات v1.1.0 (إشعار التثبيت)',
      body: '- إضافة خاصية إشعار التثبيت الذكي للمرضى (PWA Prompt).\n- إضافة ملف الحماية (License).\n- تحسينات وتعديلات برمجية للتهيئة للرفع على Vercel.',
      draft: false,
      prerelease: false
    };

    const res = await fetch('https://api.github.com/repos/' + repo + '/releases', {
      method: 'POST',
      headers: {
        'Authorization': 'token ' + token,
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'Node-Script'
      },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    console.log('Success! Created release:', data.name);
  } catch(e) {
    console.error(e);
  }
}
createRelease();
