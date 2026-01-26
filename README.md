# README.md

🇬🇧 English | 🇹🇷 [Türkçe](README.tr.md)

# CSV Studio ⚡

> **A Modern, Blazing‑Fast CSV Editor**

CSV Studio is a next‑generation desktop application designed to view, edit, and analyze large CSV files with ease. Forget the slowness of traditional spreadsheet tools — powered by **Tauri v2** and **React 19**, CSV Studio delivers performance and elegance together.

---

## 🔥 Why CSV Studio?

### 🚀 Unmatched Performance
- **Smart Virtualization:** Opens and edits CSV files with 10,000+ rows in milliseconds by rendering only visible data.
- **Lightweight Cell Architecture:** Optimized spreadsheet‑like structure that stays fast and memory‑efficient.

### 🎨 Modern & Clean UI
- **Shadcn/UI & Tailwind CSS v4:** Minimalist, eye‑friendly design.
- **Dark / Light Mode:** Switch themes instantly or follow system preferences.

### 🛠 Powerful Editing Tools
- Advanced column‑based filtering
- Bulk operations (row deletion, column move, rename, add)
- Find & replace with case sensitivity
- Smart data detection (number, text, boolean)

### 🌍 Multi‑Language Support
- Turkish (TR)
- English (EN)
- German (DE)

---

## 🛠 Tech Stack

- **Core:** [Tauri v2](https://tauri.app/) (Rust‑powered backend)
- **Frontend:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Library:** [shadcn/ui](https://ui.shadcn.com/)
- **Table Engine:** [TanStack Table v8](https://tanstack.com/table) + Virtualizer

---

## 📥 Installation & Development

### Prerequisites
- Node.js (LTS)
- Rust & Cargo
- Visual Studio Build Tools (Windows – C++ workload)

### Steps

```bash
git clone https://github.com/berkyildizkaya/csv-studio.git
cd csv-studio
npm install
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

---

## ☕ Support the Project

If you find CSV Studio useful, you can support development by buying me a coffee ☺️

https://www.buymeacoffee.com/berkyildizkaya

---

## 📝 License

This project is licensed under the **MIT License**. You are free to use, modify, and distribute it.

---

<p align="center">
  <sub>❤️ Developed by <b>Berk YILDIZKAYA</b></sub>
</p>
