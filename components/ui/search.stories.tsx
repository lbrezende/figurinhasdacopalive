import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { SearchOrb, StickerFilterBar, type AddressSuggestion } from "./search";

const SUGGESTIONS: AddressSuggestion[] = [
  { placeId: "1", description: "Avenida Paulista - Bela Vista, São Paulo - SP" },
  { placeId: "2", description: "Avenida Paulista - Jardins, São Paulo - SP" },
  { placeId: "3", description: "Shopping Cidade São Paulo - Av. Paulista" },
];

const meta: Meta = {
  title: "Domínio/Pesquisa",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

export const BuscaDeEndereco: Story = {
  render: function Render() {
    const [v, setV] = useState("Avenida Paulista");
    const [show, setShow] = useState(true);
    return (
      <div className="max-w-2xl">
        <SearchOrb
          value={v}
          onChange={setV}
          suggestions={SUGGESTIONS}
          showSuggestions={show}
          onFocus={() => setShow(true)}
          onPick={(s) => {
            setV(s.description);
            setShow(false);
          }}
          onSubmit={(e) => e?.preventDefault()}
          onNearMe={fn()}
        />
      </div>
    );
  },
};

export const FiltroDeFigurinhas: Story = {
  render: function Render() {
    const [wanted, setWanted] = useState<number[]>([7, 22]);
    const [custom, setCustom] = useState("");
    return (
      <div className="max-w-2xl">
        <StickerFilterBar
          wanted={wanted}
          onToggle={(n) => setWanted((w) => (w.includes(n) ? w.filter((x) => x !== n) : [...w, n]))}
          customNum={custom}
          onCustomChange={setCustom}
          onAddCustom={() => {
            const n = parseInt(custom, 10);
            if (n > 0 && !wanted.includes(n)) setWanted((w) => [...w, n]);
            setCustom("");
          }}
          onClear={() => setWanted([])}
        />
      </div>
    );
  },
};
