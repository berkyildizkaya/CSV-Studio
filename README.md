# CSV Studio 📊

CSV Studio, **Tauri**, **React** ve **TypeScript** kullanılarak geliştirilmiş modern, hızlı ve hafif bir masaüstü uygulamasıdır. Kullanıcı dostu arayüzü **shadcn/ui** ve **Tailwind CSS** ile tasarlanmıştır.

## 🚀 Başlangıç

Bu projeyi bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz.

### Ön Gereksinimler

Geliştirmeye başlamadan önce bilgisayarınızda aşağıdaki araçların kurulu olduğundan emin olun:

1.  **Node.js**: (LTS sürümü önerilir)
    *   [İndirmek için tıklayın](https://nodejs.org/)
2.  **Rust & Cargo**:
    *   [Rustup yükleyicisini indirin](https://rustup.rs/) ve kurun.
3.  **C++ Build Tools (Sadece Windows için)**:
    *   [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) indirin.
    *   Kurulum sırasında **"C++ ile Masaüstü Geliştirme" (Desktop development with C++)** seçeneğini işaretlemeyi unutmayın.

### 📥 Kurulum

1.  Projeyi bilgisayarınıza klonlayın (veya indirin):
    ```bash
    git clone https://github.com/kullaniciadi/csv-studio.git
    cd csv-studio
    ```

2.  Frontend bağımlılıklarını yükleyin:
    ```bash
    npm install
    ```

### 💻 Geliştirme Modu (Dev)

Uygulamayı geliştirme modunda çalıştırmak için:

```bash
npm run tauri dev
```
*Bu komut hem React sunucusunu hem de Tauri masaüstü penceresini açacaktır.*

### 📦 Derleme (Build)

Uygulamanın dağıtılabilir `.exe` veya `.msi` paketini oluşturmak için:

```bash
npm run tauri build
```
*Çıktılar `src-tauri/target/release/bundle` klasöründe oluşturulacaktır.*

## 🛠️ Teknolojiler

-   **Core:** [Tauri v2](https://tauri.app/) (Rust)
-   **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Dil:** TypeScript
-   **Stil:** [Tailwind CSS v4](https://tailwindcss.com/)
-   **UI Bileşenleri:** [shadcn/ui](https://ui.shadcn.com/)

## 📝 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.