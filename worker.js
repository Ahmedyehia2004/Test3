// worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    // استخراج الرابط المستهدف من المعامل target
    const url = new URL(request.url);
    const target = url.searchParams.get('target');
    
    // التحقق من وجود الرابط
    if (!target) {
      return new Response(JSON.stringify({
        error: 'No target URL provided'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // إعدادات الـ Headers لتجنب 403 Forbidden
    const headers = new Headers(request.headers);
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');
    headers.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8');
    headers.set('Accept-Encoding', 'gzip, deflate, br');
    headers.set('Accept-Language', 'en-US,en;q=0.9');
    headers.set('Connection', 'keep-alive');
    headers.set('Referer', 'https://www.google.com/');
    headers.set('Cache-Control', 'no-cache');
    headers.set('Pragma', 'no-cache');

    // إعداد الطلب للرابط المستهدف
    const fetchOptions = {
      method: request.method,
      headers: headers,
      redirect: 'follow',
      // دعم Streaming لتحميل الملفات الكبيرة
      signal: AbortSignal.timeout(60000) // 60 ثانية مهلة
    };

    // جلب البيانات من الرابط المستهدف
    const response = await fetch(target, fetchOptions);

    // التحقق من حالة الاستجابة
    if (!response.ok) {
      return new Response(JSON.stringify({
        error: `Failed to fetch target: ${response.status} ${response.statusText}`,
        details: await response.text().slice(0, 500)
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // إعداد الاستجابة مع Streaming
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*'); // دعم CORS
    responseHeaders.set('X-Worker-Version', '1.0.0'); // للتوثيق
    responseHeaders.set('Cache-Control', 'no-store'); // تجنب التخزين المؤقت

    // إرجاع الاستجابة مع دعم Streaming
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    // معالجة الأخطاء
    return new Response(JSON.stringify({
      error: 'Worker error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
