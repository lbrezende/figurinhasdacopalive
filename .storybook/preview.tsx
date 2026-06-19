import type { Preview, Decorator } from "@storybook/nextjs-vite";
import "../app/globals.css";

// Inter (substituto do Cereal VF). next/font não roda no preview do SB,
// então carregamos Inter via Google Fonts e apontamos a var --font-inter.
if (typeof document !== "undefined" && !document.getElementById("sb-inter")) {
  const link = document.createElement("link");
  link.id = "sb-inter";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
  document.head.appendChild(link);
  const style = document.createElement("style");
  style.textContent = ":root{--font-inter:'Inter';}";
  document.head.appendChild(style);
}

const withCanvas: Decorator = (Story) => (
  <div className="bg-canvas font-sans text-ink antialiased">
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withCanvas],
  parameters: {
    layout: "centered",
    backgrounds: { disable: true }, // canvas branco fixo (sem dark mode no DS)
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    a11y: { test: "todo" },
    options: {
      storySort: {
        order: [
          "Design System",
          ["Introdução", "Cores", "Tipografia", "Bordas & Raios", "Sombras", "Espaçamentos"],
          "Primitivos",
          "Domínio",
          ["Upload", "Álbum", "Mapa", "Pesquisa"],
        ],
      },
    },
  },
};

export default preview;
