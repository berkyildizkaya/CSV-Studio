# CSV Studio ⚡

> **Modern, Işık Hızında ve Güçlü CSV Düzenleyici**

CSV Studio, büyük veri dosyalarını (CSV) zahmetsizce görüntülemeniz, düzenlemeniz ve analiz etmeniz için tasarlanmış yeni nesil bir masaüstü uygulamasıdır. Geleneksel elektronik tablolardaki hantallığı unutun; **Tauri v2** ve **React 19**'un gücüyle donatılmış bu araç, performans ve estetiği bir araya getiriyor.

---

## 🔥 Neden CSV Studio?

### 🚀 **Rakipsiz Performans**
*   **Akıllı Sanallaştırma (Virtualization):** 10.000+ satırlık dosyaları bile milisaniyeler içinde açar. Sadece ekranda gördüğünüz veriyi işler (render eder), bu sayede bellek dostudur ve asla donmaz.
*   **Hafif Hücre Mimarisi:** "Spreadsheet" mantığıyla optimize edilmiş hücre yapısı sayesinde yağ gibi kayan bir deneyim sunar.

### 🎨 **Modern ve Şık Arayüz**
*   **Shadcn/UI & Tailwind CSS v4:** Göz yormayan, modern ve minimalist tasarım.
*   **Karanlık/Aydınlık Mod:** Sistem temanıza uyum sağlayan veya tek tıkla değiştirebileceğiniz tema desteği.

### 🛠️ **Güçlü Düzenleme Araçları**
*   **Gelişmiş Filtreleme:** Sütun bazlı çoklu seçim filtreleri ile veriyi saniyeler içinde analiz edin.
*   **Toplu İşlemler:** Çoklu satır silme, sütun taşıma, yeniden adlandırma ve yeni sütun ekleme.
*   **Bul ve Değiştir:** Büyük/küçük harf duyarlı arama ve toplu değiştirme özelliği.
*   **Akıllı Veri Tespiti:** Sayı, metin veya boolean değerlerini otomatik tanır ve ona göre düzenleme arayüzü sunar.

### 🌍 **Çoklu Dil Desteği**
*   Türkçe (TR), İngilizce (EN) ve Almanca (DE) dil seçenekleri ile global kullanıma hazır.

---

## 🛠️ Kullanılan Teknolojiler

Bu proje, en güncel ve güçlü teknolojiler kullanılarak geliştirilmiştir:

*   **Çekirdek:** [Tauri v2](https://tauri.app/) (Rust tabanlı, ultra hafif backend)
*   **Frontend:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Dil:** [TypeScript](https://www.typescriptlang.org/)
*   **Stil:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **UI Kütüphanesi:** [shadcn/ui](https://ui.shadcn.com/)
*   **Tablo Altyapısı:** [TanStack Table v8](https://tanstack.com/table) + Virtualizer

---

## 📥 Kurulum ve Çalıştırma

Projeyi bilgisayarınızda çalıştırmak veya geliştirmek isterseniz:

### Ön Gereksinimler
*   **Node.js** (LTS sürümü)
*   **Rust & Cargo** (Tauri için gereklidir)
*   **Visual Studio Build Tools** (Windows kullanıcıları için C++ workload ile)

### Adımlar

1.  **Projeyi Klonlayın:**
    ```bash
    git clone https://github.com/berkyildizkaya/csv-studio.git
    cd csv-studio
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Geliştirme Modunda Başlatın:**
    ```bash
    npm run tauri dev
    ```

4.  **Paketleyin (Build):**
    ```bash
    npm run tauri build
    ```

---

## ☕ Destek Olun

Eğer bu proje işinize yaradıysa veya geliştirmemi desteklemek isterseniz, bana bir kahve ısmarlayabilirsiniz! Desteğiniz, projenin sürekliliği ve yeni özellikler için büyük motivasyon kaynağıdır.

<a href="https://www.buymeacoffee.com/berkyildizkaya" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
</a>

---

## 📝 Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Özgürce kullanabilir, değiştirebilir ve dağıtabilirsiniz.

---

<p align="center">
  <sub>❤️ <b>Berk YILDIZKAYA</b> tarafından geliştirilmiştir.</sub>
</p>
