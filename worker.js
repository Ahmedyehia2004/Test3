// worker.js
addEventListener('fetch', event => {
  event.passThroughOnException(); // منع التوقف عند الأخطاء
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    // استخراج الرابط المستهدف
    const url = new URL(request.url);
    const target = url.searchParams.get('target');
    
    // التحقق من الرابط
    if (!target) {
      return new Response(JSON.stringify({
        error: 'No target URL provided',
        worker_version: '2.0.0'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Powered-By': 'AhmedY332-SuperWorker'
        }
      });
    }

    // إعدادات الـ Headers للكفاءة والتجنب من 403
    const headers = new Headers();
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');
    headers.set('Accept', '*/*');
    headers.set('Accept-Encoding', 'gzip, deflate, br');
    headers.set('Accept-Language', 'en-US,en;q=0.9');
    headers.set('Connection', 'keep-alive');
    headers.set('Referer', target.split('/').slice(0, 3).join('/')); // Referer ديناميكي
    headers.set('Cache-Control', 'no-cache');
    headers.set('Pragma', 'no-cache');

    // دعم Range Requests لتحميل الملفات الكبيرة
    if (request.headers.get('Range')) {
      headers.set('Range', request.headers.get('Range'));
    }

    // إعداد الطلب
    const fetchOptions = {
      method: request.method,
      headers: headers,
      redirect: 'follow',
      signal: AbortSignal.timeout(120000), // 120 ثانية للملفات الكبيرة
      cf: {
        cacheEverything: false,
        cacheTtl: 0
      }
    };

    // جلب البيانات
    const response = await fetch(target, fetchOptions);

    // التحقق من الاستجابة
    if (!response.ok) {
      return new Response(JSON.stringify({
        error: `Failed to fetch: ${response.status} ${response.statusText}`,
        details: await response.text().slice(0, 500),
        worker_version: '2.0.0'
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Powered-By': 'AhmedY332-SuperWorker'
        }
      });
    }

    // إعداد الاستجابة
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('X-Worker-Version', '2.0.0');
    responseHeaders.set('Cache-Control', 'no-store');
    responseHeaders.set('X-Powered-By', 'AhmedY332-SuperWorker');

    // دعم Streaming للكفاءة
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Worker error',
      message: error.message,
      worker_version: '2.0.0'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Powered-By': 'AhmedY332-SuperWorker'
      }
    });
  }
}
