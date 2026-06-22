# PURA — Kurumsal Web Sitesi

Endüstriyel alkol (ENA) fabrikası için **açık & minimal premium** tek sayfa tanıtım sitesi.
Saf HTML/CSS/JS ile yazılmıştır; build adımı veya bağımlılık gerektirmez.

## Bölümler
- **Hero** — açılış, başlık ve çağrı butonları
- **İstatistikler** — animasyonlu sayaçlar
- **Üretim & Hizmetler** — ENA, distilasyon, lab, formülasyon, lojistik, sertifikasyon
- **Hakkımızda** — şirket hikayesi ve değerler
- **Ekip** — kadro tanıtımı
- **Referanslar** — müşteri yorumları ve marka logoları
- **İletişim** — form (demo doğrulama) + iletişim bilgileri
- **Footer** — bağlantılar, bülten, alt bilgi

## Çalıştırma
Sadece `index.html` dosyasını tarayıcıda açın. İsterseniz basit bir sunucu:

```bash
cd kurumsal-site
python3 -m http.server 8000
# http://localhost:8000
```

## Özelleştirme
- **Marka adı:** `index.html` içinde `PURA` ve `styles.css` renk değişkenleri (`:root`).
- **Renkler:** `styles.css` → `:root` (`--accent`, `--gold` vb.).
- **İçerik:** Tüm metinler `index.html` içindedir (Türkçe, kolayca düzenlenir).
- **İletişim formu:** Şu an demo doğrulama yapar. Gerçek gönderim için bir
  backend endpoint'ine (örn. Formspree, kendi API'niz) bağlanması gerekir.

> Not: Marka adı, iletişim bilgileri ve ekip isimleri örnek/placeholder'dır;
> kendi bilgilerinizle değiştirin.
