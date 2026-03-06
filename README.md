[README.md](https://github.com/user-attachments/files/25805702/README.md)
# 📡 Iran Internet Monitor

> ابزار مانیتورینگ اینترنت ایران و راهنمای ارتباط با خانواده در شرایط قطعی

**[🌐 مشاهده داشبورد زنده](https://iran.book-hub.org)** &nbsp;|&nbsp; ساخته‌شده برای: آلمان → ایران

---

## چیست؟

یک داشبورد وب که به‌صورت خودکار وضعیت اینترنت ایران را پایش می‌کند و بر اساس آن، بهترین روش ارتباطی را پیشنهاد می‌دهد:

| وضعیت | رنگ | روش توصیه‌شده |
|--------|-----|--------------|
| اینترنت نرمال | 🟢 سبز | واتساپ / تماس ویدیویی |
| اختلال جزئی | 🟡 زرد | واتساپ + VPN / Mytello |
| اختلال شدید | 🟠 نارنجی | تلفن ثابت از طریق Mytello |
| قطعی کامل | 🔴 قرمز | SMS بین‌المللی |

---

## منابع داده

داشبورد از این APIها برای تشخیص وضعیت استفاده می‌کند:

- **[Cloudflare Radar](https://radar.cloudflare.com/traffic/ir)** — ترافیک لحظه‌ای اینترنت ایران
- **[IODA (Georgia Tech)](https://ioda.inetintel.cc.gatech.edu/country/IR)** — سیگنال BGP و تشخیص قطعی
- **[OONI Explorer](https://explorer.ooni.org/chart/mat?probe_cc=IR)** — تست دسترسی به سایت‌ها از داخل ایران
- **[NetBlocks](https://netblocks.org/tag/iran)** — گزارش قطعی‌های هدفمند

---

## پلن ارتباطی چندلایه

### لایه ۱ — اینترنت معمولی یا VPN
برای خانواده داخل ایران: نصب **[Psiphon3](https://psiphon.ca)** یا **[Lantern](https://getlantern.org)** (رایگان، بدون نیاز به اکانت)

```
WhatsApp → Telegram → Signal → Google Meet → FaceTime
```

### لایه ۲ — تلفن از طریق شبکه ثابت (PSTN)
وقتی اینترنت ایران قطع است، این سرویس‌ها از شبکه تلفن سنتی استفاده می‌کنند و نیازی به اینترنت روی طرف ایران ندارند:

- **[Mytello](https://mytello.de)** — ارزان‌ترین گزینه از آلمان به ایران
- **[Yolla](https://yollacalls.com)** — بدون نیاز به ثبت‌نام
- **[Talk360](https://talk360.com)** — قابل اعتماد برای خطوط ثابت

### لایه ۳ — SMS بین‌المللی (آخرین راه)
حتی در بدترین قطعی‌ها، شبکه موبایل معمولاً برقرار است:

- **[Twilio](https://twilio.com)** — API رایگان برای آزمایش
- **[MessageBird](https://messagebird.com)**
- پیامک مستقیم از اپراتور آلمانی

---

## اسکریپت خودکار Python

برای مانیتورینگ خودکار و ارسال پیام در زمان قطعی:

### نصب

```bash
pip install requests schedule twilio
```

### تنظیمات

فایل `iran_monitor.py` را باز کن و این مقادیر را وارد کن:

```python
IRAN_PHONE    = "+989XXXXXXXXX"   # موبایل خانواده
IRAN_LANDLINE = "+9821XXXXXXXX"   # خط ثابت
TWILIO_SID    = "ACxxxxxxxx"      # از twilio.com
TWILIO_TOKEN  = "your_token"
TWILIO_FROM   = "+49XXXXXXXXX"    # شماره آلمانت
```

### اجرا

```bash
python iran_monitor.py
```

هر ۱۵ دقیقه وضعیت را بررسی می‌کند. در صورت تشخیص قطعی، به‌صورت خودکار SMS می‌فرستد.

---

## Deploy روی Vercel

این پروژه روی **[Vercel](https://vercel.com)** deploy شده با subdomain اختصاصی.

برای deploy شخصی:

```bash
# ۱. Fork این repo
# ۲. در Vercel: New Project → Import → Deploy
# ۳. Settings → Domains → اضافه کردن subdomain
```

در DNS پنل:
```
Type: CNAME
Name: iran
Value: cname.vercel-dns.com
```

---

## وضعیت اینترنت ایران (مارس ۲۰۲۶)

بر اساس داده‌های Cloudflare Radar و IODA، ایران در حال حاضر در وضعیت **اختلال مزمن** قرار دارد — اینترنت به‌صورت فیزیکی متصل است اما ناپایدار. در بحران‌ها قطعی کامل اتفاق می‌افتد.

منابع خبری: [NetBlocks](https://netblocks.org/tag/iran) · [Freedom House](https://freedomhouse.org/country/iran/freedom-net) · [ARTICLE 19](https://www.article19.org/iran)

---

## مجوز

MIT — آزاد برای استفاده و توسعه

---

<div align="center">
  <sub>ساخته‌شده با ❤️ برای ارتباط با خانواده در ایران</sub>
</div>
