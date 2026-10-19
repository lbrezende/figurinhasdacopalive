import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ProgressRing, StatChip, StickerCell, StickerCard } from "./album";
import { teamStyle } from "@/lib/teams";

const meta: Meta = {
  title: "Domínio/Álbum/Componentes",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

export const Progresso: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <ProgressRing pct={38} />
      <ProgressRing pct={72} />
      <ProgressRing pct={100} />
    </div>
  ),
};

export const Estatisticas: Story = {
  render: () => (
    <div className="grid w-80 grid-cols-3 gap-2 text-center">
      <StatChip n={312} label="Tenho" className="text-emerald-600" />
      <StatChip n={358} label="Faltam" className="text-rose-500" />
      <StatChip n={41} label="Repetidas" className="text-violet-600" />
    </div>
  ),
};

export const GridDeCelulas: Story = {
  render: () => (
    <div className="grid w-80 grid-cols-6 gap-1.5">
      {Array.from({ length: 24 }, (_, i) => {
        const n = i + 1;
        const state = n % 5 === 0 ? "rep" : n % 3 === 0 ? "have" : "miss";
        return (
          <StickerCell
            key={n}
            number={n}
            state={state as "have" | "miss" | "rep"}
            rarity={n % 11 === 0 ? "LENDARIO" : "COMUM"}
            repeated={state === "rep" ? 2 : 0}
            onClick={fn()}
          />
        );
      })}
    </div>
  ),
};

export const CardPanini: Story = {
  render: () => {
    const ts = teamStyle("BRA");
    const noop = fn();
    return (
      <div className="grid w-[360px] grid-cols-3 gap-2.5">
        <StickerCard
          cell={{ number: 110, name: "Vinícius Jr.", have: true, repeated: 0, code: "BRA10", teamCode: "BRA", kind: "PLAYER", displayNo: 10 }}
          colors={ts.colors}
          onDown={noop} onUp={noop} onCancel={noop} onDetail={noop}
        />
        <StickerCard
          cell={{ number: 111, name: "Escudo", have: true, repeated: 2, code: "BRA01", teamCode: "BRA", kind: "BADGE", displayNo: 1 }}
          colors={ts.colors}
          onDown={noop} onUp={noop} onCancel={noop} onDetail={noop}
        />
        <StickerCard
          cell={{ number: 112, name: "Neymar", have: false, repeated: 0, code: "BRA11", teamCode: "BRA", kind: "PLAYER", displayNo: 11 }}
          colors={ts.colors}
          onDown={noop} onUp={noop} onCancel={noop} onDetail={noop}
        />
      </div>
    );
  },
};
