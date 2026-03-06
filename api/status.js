// api/status.js — Vercel Serverless Function
// دریافت وضعیت واقعی اینترنت ایران از Cloudflare Radar و IODA

export default async function handler(req, res) {
  // CORS — اجازه دسترسی از دامنه خودت
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=300'); // کش ۵ دقیقه

  try {
    const [cloudflare, ioda] = await Promise.allSettled([
      fetchCloudflare(),
      fetchIODA()
    ]);

    const cf = cloudflare.status === 'fulfilled' ? cloudflare.value : null;
    const io = ioda.status === 'fulfilled' ? ioda.value : null;

    // تحلیل و تعیین سطح وضعیت
    const level = determineLevel(cf, io);

    res.status(200).json({
      level,          // 'normal' | 'partial' | 'bad' | 'down'
      timestamp: new Date().toISOString(),
      sources: {
        cloudflare: cf,
        ioda: io
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message, level: 'unknown' });
  }
}

// ── Cloudflare Radar ────────────────────────────────────
async function fetchCloudflare() {
  // Cloudflare Radar public endpoint — نیاز به API key ندارد
  const url = 'https://api.cloudflare.com/client/v4/radar/netflows/timeseries' +
    '?aggInterval=1h&dateRange=3h&location=IR&format=json';

  const r = await fetch(url, {
    headers: {
      'User-Agent': 'iran-monitor/1.0',
      // اگر API key داری اینجا اضافه کن — بدون key هم کار می‌کنه ولی محدودتره
      // 'Authorization': `Bearer ${process.env.CF_API_TOKEN}`
    },
    signal: AbortSignal.timeout(8000)
  });

  if (!r.ok) throw new Error(`Cloudflare API: ${r.status}`);
  const data = await r.json();

  const values = data?.result?.serie_0?.values || [];
  if (values.length < 2) return { available: false, drop: 0 };

  // محاسبه درصد افت ترافیک نسبت به ۳ ساعت پیش
  const recent = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const baseline = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const drop = baseline > 0 ? (baseline - recent) / baseline : 0;

  return {
    available: true,
    drop: Math.round(drop * 100), // درصد افت
    values: values.slice(-6)      // ۶ نقطه آخر برای نمودار
  };
}

// ── IODA (Georgia Tech) ─────────────────────────────────
async function fetchIODA() {
  // IODA API — سیگنال BGP ایران
  // BGP = Border Gateway Protocol — اگه ایران از اینترنت جهانی قطع بشه اینجا معلومه
  const now = Math.floor(Date.now() / 1000);
  const from = now - 3 * 3600; // ۳ ساعت پیش

  const url = `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw` +
    `?entityType=country&entityCode=IR&datasource=bgp&from=${from}&until=${now}`;

  const r = await fetch(url, {
    signal: AbortSignal.timeout(8000)
  });

  if (!r.ok) throw new Error(`IODA API: ${r.status}`);
  const data = await r.json();

  // بررسی وجود alert در BGP
  const alerts = data?.data?.IR?.bgp?.alerts || [];
  const hasAlert = alerts.length > 0;

  // میانگین مقدار BGP در ۳ ساعت اخیر
  const points = data?.data?.IR?.bgp?.values || [];
  const avg = points.length > 0
    ? points.reduce((a, b) => a + b, 0) / points.length
    : null;

  return {
    available: true,
    hasAlert,
    alertCount: alerts.length,
    bgpAvg: avg ? Math.round(avg) : null
  };
}

// ── تعیین سطح وضعیت ────────────────────────────────────
function determineLevel(cf, ioda) {
  // اگه هیچ‌کدام از APIها جواب ندادن
  if (!cf?.available && !ioda?.available) return 'unknown';

  const drop = cf?.drop || 0;
  const iodaAlert = ioda?.hasAlert || false;

  // قطعی کامل: افت بیش از ۷۰٪ + هشدار IODA
  if (drop > 70 || (drop > 50 && iodaAlert)) return 'down';

  // اختلال شدید: افت ۴۰-۷۰٪
  if (drop > 40 || (drop > 25 && iodaAlert)) return 'bad';

  // اختلال جزئی: افت ۱۵-۴۰٪
  // توجه: ایران به‌صورت پیش‌فرض فیلترینگ سنگین دارد
  // "نرمال" ایران یعنی اینترنت وجود داره ولی فیلتره
  if (drop > 15 || iodaAlert) return 'partial';

  // وضعیت پایه ایران: اینترنت هست ولی واتساپ و... همیشه فیلترن
  return 'normal';
}
