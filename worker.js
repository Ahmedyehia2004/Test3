addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    // استخراج الـ target من الرابط
    const url = new URL(request.url);
    let target = url.searchParams.get('target');

    // فحص إن الـ target موجود
    if (!target) {
      return new Response('Please provide a target URL. Example: ?target=http://example.com', {
        status: 400,
        headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // إضافة http:// أو https:// لو مش موجود
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    // فحص إن الـ target رابط صحيح
    if (!target.match(/^(http|https):\/\/[a-zA-Z0-9-\.:]+/)) {
      return new Response('Invalid target URL', {
        status: 400,
        headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // إعدادات الـ Headers
    const headers = {
      'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': request.headers.get('Accept') || '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
    };

    // إعدادات الـ fetch
    const fetchOptions = {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
      redirect: 'follow',
      signal: AbortSignal.timeout(60000) // Timeout بعد 60 ثانية
    };

    // تنفيذ الطلب
    const response = await fetch(target, fetchOptions);

    // إعدادات الرد
    const responseHeaders = {
      'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, HEAD',
      'Access-Control-Allow-Headers': '*'
    };

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    return new Response(`Error: ${error.message}\nTarget: ${target || 'unknown'}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
