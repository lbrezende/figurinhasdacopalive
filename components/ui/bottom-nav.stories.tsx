import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, within, userEvent } from "storybook/test";
import { BottomNav, type BottomNavItem } from "./bottom-nav";
import { AlbumIcon, TrocasIcon, EncontrosIcon, PerfilIcon } from "./nav-icons";

const ITEMS: readonly BottomNavItem[] = [
  { key: "album", icon: <AlbumIcon />, label: "Álbum" },
  { key: "trade", icon: <TrocasIcon />, label: "Trocas" },
  { key: "meets", icon: <EncontrosIcon />, label: "Encontros" },
  { key: "profile", icon: <PerfilIcon />, label: "Perfil" },
];

const meta: Meta<typeof BottomNav> = {
  title: "Primitivos/BottomNav",
  component: BottomNav,
  parameters: { layout: "fullscreen" },
  // posiciona relativo dentro do story em vez de fixed na viewport do preview
  decorators: [(S) => <div className="relative h-32 w-[420px] max-w-full">{S()}</div>],
};

export default meta;
type Story = StoryObj<typeof BottomNav>;

export const Default: Story = {
  render: function Render() {
    const [tab, setTab] = useState("album");
    return <BottomNav items={ITEMS} value={tab} onChange={setTab} className="absolute" />;
  },
};

export const TrocaDeAba: Story = {
  render: function Render() {
    const [tab, setTab] = useState("album");
    return <BottomNav items={ITEMS} value={tab} onChange={setTab} className="absolute" />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trocas = canvas.getByRole("button", { name: /Trocas/ });
    await userEvent.click(trocas);
    await expect(trocas).toHaveAttribute("aria-current", "page");
  },
};
