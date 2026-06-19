import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Modal, ActionSheet } from "./modal";
import { Button } from "./button";

const meta = {
  title: "Primitivos/Modal & ActionSheet",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const ModalBasico: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <div className="grid h-[480px] place-items-center">
        <Button onClick={() => setOpen(true)}>Abrir modal</Button>
        {open && (
          <Modal onClose={() => setOpen(false)}>
            <h2 className="text-xl font-bold text-ink">🎁 Você abriu um pacote!</h2>
            <p className="mt-2 text-sm text-muted">Cinco figurinhas novas pra acelerar o álbum.</p>
            <Button fullWidth size="lg" className="mt-5" onClick={() => setOpen(false)}>
              Boa!
            </Button>
          </Modal>
        )}
      </div>
    );
  },
};

export const FolhaDeAcao: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    const [last, setLast] = useState("—");
    return (
      <div className="grid h-[480px] place-items-center gap-3">
        <Button variant="soft" onClick={() => setOpen(true)}>
          📷 Enviar foto
        </Button>
        <p className="text-sm text-muted">Última escolha: {last}</p>
        <ActionSheet
          open={open}
          onClose={() => setOpen(false)}
          actions={[
            { icon: "📷", label: "Tirar foto", onSelect: () => setLast("Câmera") },
            { icon: "🖼️", label: "Escolher da galeria", onSelect: () => setLast("Galeria") },
          ]}
        />
      </div>
    );
  },
};
