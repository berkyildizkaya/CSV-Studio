import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground text-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to Tauri + React</h1>

      <div className="flex justify-center gap-8 mb-8">
        <a href="https://vite.dev" target="_blank" className="hover:scale-110 transition-transform duration-300">
          <img src="/vite.svg" className="h-24 p-4" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank" className="hover:scale-110 transition-transform duration-300">
          <img src="/tauri.svg" className="h-24 p-4" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank" className="hover:scale-110 transition-transform duration-300">
          <img src={reactLogo} className="h-24 p-4 animate-[spin_20s_linear_infinite]" alt="React logo" />
        </a>
      </div>
      
      <p className="mb-8">Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="flex justify-center gap-4 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button 
          type="submit"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Greet
        </button>
      </form>
      <p className="text-lg font-medium">{greetMsg}</p>
    </main>
  );
}

export default App;
