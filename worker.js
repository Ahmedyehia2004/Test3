// worker.js
addEventListener('fetch', event => {
  event.passThroughOnException();
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    // استخراج الرابط المستهدف
    const url = new URL(request.url);
    const target = url.searchParams.get('target');
    
    // التحقق من الرابط
    if (!target) {
      return new Response('{"error":"No target URL provided","worker_version":"2.2.0"}', {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Powered-By': 'AhmedY332-CosmicWorker'
        }
      });
    }

    // إعدادات الـ Headers المضغوطة
    const headers = new Headers();
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0');
    headers.set('Accept', '*/*');
    headers.set('Accept-Encoding', 'gzip, deflate');
    headers.set('Connection', 'keep-alive');
    headers.set('Cache-Control', 'no-cache');

    // دعم Range Requests
    if (request.headers.get('Range')) {
      headers.set('Range', request.headers.get('Range'));
    }

    // إعداد الطلب
    const fetchOptions = {
      method: request.method,
      headers: headers,
      redirect: 'follow'
    };

    // جلب البيانات
    const response = await fetch(target, fetchOptions);

    // التحقق من الاستجابة
    if (!response.ok) {
      let errorDetails = '';
      try {
        errorDetails = await response.text();
        errorDetails = errorDetails.substring(0, 500); // تقطيع آمن
      } catch {
        errorDetails = 'No error details available';
      }
      return new Response(
        JSON.stringify({
          error: `Failed to fetch: ${response.status} ${response.statusText}`,
          details: errorDetails,
          worker_version: '2.2.0'
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-Powered-By': 'AhmedY332-CosmicWorker'
          }
        }
      );
    }

    // إعداد الاستجابة
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('X-Worker-Version', '2.2.0');
    responseHeaders.set('Cache-Control', 'no-store');
    responseHeaders.set('X-Powered-By', 'AhmedY332-CosmicWorker');

    // Streaming للكفاءة
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Worker error',
        message: error.message,
        worker_version: '2.2.0'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Powered-By': 'AhmedY332-CosmicWorker'
        }
      }
    );
  }
}
