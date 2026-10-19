import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { PhotoPreview } from "./photo-preview";

// Imagem de exemplo (figurinha azul) embutida como data URL.
const SAMPLE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='420'><rect width='300' height='420' fill='#1d4ed8'/><circle cx='150' cy='150' r='60' fill='#ffd23f'/><text x='150' y='320' font-size='44' fill='#fff' text-anchor='middle' font-family='Inter'>BRA 10</text></svg>`,
  );

const meta: Meta<typeof PhotoPreview> = {
  title: "Domínio/Upload/PhotoPreview",
  component: PhotoPreview,
  parameters: { layout: "fullscreen" },
  decorators: [(S) => <div className="relative min-h-[520px] bg-surface-soft p-6">{S()}</div>],
};

export default meta;
type Story = StoryObj<typeof PhotoPreview>;

export const Interativo: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <div className="max-w-md rounded-2xl border border-hairline bg-canvas p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Figurinhas identificadas</p>
        <div className="mt-2 h-16 rounded-xl bg-surface-soft" />
        <PhotoPreview src={SAMPLE} open={open} onExpand={() => setOpen(true)} onMinimize={() => setOpen(false)} />
      </div>
    );
  },
};

export const Processando: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <div className="max-w-md rounded-2xl border border-hairline bg-canvas p-5">
        <div className="h-16 rounded-xl bg-surface-soft" />
        <PhotoPreview src={SAMPLE} open={open} busy onExpand={() => setOpen(true)} onMinimize={() => setOpen(false)} />
      </div>
    );
  },
};
