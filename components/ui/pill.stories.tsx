import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Pill } from "./pill";

const meta = {
  title: "Primitivos/FilterPill",
  component: Pill,
  tags: ["autodocs"],
  args: { children: "Faltam", tone: "ink", active: false },
  argTypes: {
    tone: { control: "inline-radio", options: ["ink", "brand"] },
    active: { control: "boolean" },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Pill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inativo: Story = {};
export const AtivoInk: Story = { args: { active: true, tone: "ink" } };
export const AtivoBrand: Story = { args: { active: true, tone: "brand", children: "#7" } };

// Grupo de filtros do álbum (toggle ink) — comportamento real de seleção única.
export const FiltrosAlbum: Story = {
  render: function Render() {
    const [f, setF] = useState("all");
    const opts = [
      ["all", "Todas"],
      ["miss", "Faltam"],
      ["have", "Tenho"],
      ["rep", "Repetidas"],
    ] as const;
    return (
      <div className="flex gap-2">
        {opts.map(([k, l]) => (
          <Pill key={k} tone="ink" active={f === k} onClick={() => setF(k)}>
            {l}
          </Pill>
        ))}
      </div>
    );
  },
};

// Filtros de figurinha do mapa (multi-seleção, tone brand).
export const FiltrosMapa: Story = {
  render: function Render() {
    const [sel, setSel] = useState<number[]>([7, 22]);
    return (
      <div className="flex flex-wrap gap-2">
        {[7, 9, 10, 18, 22, 27, 30, 100].map((n) => (
          <Pill
            key={n}
            tone="brand"
            active={sel.includes(n)}
            onClick={() => setSel((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]))}
          >
            #{n}
          </Pill>
        ))}
      </div>
    );
  },
};
