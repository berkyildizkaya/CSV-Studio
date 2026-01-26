# README.tr.md

🇹🇷 Türkçe | 🇬🇧 [English](README.md)

# CSV Studio ⚡

> **Modern, Işık Hızında ve Güçlü CSV Düzenleyici**

CSV Studio, büyük CSV dosyalarını zahmetsizce görüntülemek, düzenlemek ve analiz etmek için tasarlanmış yeni nesil bir masaüstü uygulamasıdır. Geleneksel elektronik tablolardaki hantallığı unutun; **Tauri v2** ve **React 19** gücüyle performans ve estetik bir araya geliyor.

---

## 🔥 Neden CSV Studio?

### 🚀 Rakipsiz Performans
- **Akıllı Sanallaştırma (Virtualization):** 10.000+ satırlık CSV dosyalarını yalnızca görünen veriyi render ederek milisaniyeler içinde açar.
- **Hafif Hücre Mimarisi:** Spreadsheet mantığıyla optimize edilmiş, donmayan ve bellek dostu yapı.

### 🎨 Modern ve Şık Arayüz
- **Shadcn/UI & Tailwind CSS v4:** Göz yormayan, sade ve modern tasarım.
- **Karanlık / Aydınlık Mod:** Sistem temasına uyumlu veya manuel geçiş.

### 🛠 Güçlü Düzenleme Araçları
- Sütun bazlı gelişmiş filtreleme
- Toplu işlemler (satır silme, sütun taşıma, yeniden adlandırma, ekleme)
- Büyük/küçük harf duyarlı bul & değiştir
- Akıllı veri tipi algılama (sayı, metin, boolean)

### 🌍 Çoklu Dil Desteği
- Türkçe (TR)
- İngilizce (EN)
- Almanca (DE)

---

## 🛠 Kullanılan Teknolojiler

- **Çekirdek:** [Tauri v2](https://tauri.app/) (Rust tabanlı backend)
- **Frontend:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Dil:** [TypeScript](https://www.typescriptlang.org/)
- **Stil:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Kütüphanesi:** [shadcn/ui](https://ui.shadcn.com/)
- **Tablo Altyapısı:** [TanStack Table v8](https://tanstack.com/table) + Virtualizer

---

## 📥 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (LTS)
- Rust & Cargo
- Visual Studio Build Tools (Windows – C++ workload)

### Adımlar

```bash
git clone https://github.com/berkyildizkaya/csv-studio.git
cd csv-studio
npm install
npm run tauri dev
```

### Build Alma

```bash
npm run tauri build
```

---

## ☕ Destek Olun

CSV Studio işinize yaradıysa bana bir kahve ısmarlayarak projeyi destekleyebilirsiniz ☺️

https://www.buymeacoffee.com/berkyildizkaya

---

## 📝 Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Özgürce kullanabilir, değiştirebilir ve dağıtabilirsiniz.

---

<p align="center">
  <sub>❤️ <b>Berk YILDIZKAYA</b> tarafından geliştirilmiştir</sub>
</p>
