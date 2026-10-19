import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { pillMarkerHtml, poiMarkerHtml } from "./map-markers";
import { TradePointCard } from "./trade-point-card";
import { TRADE_POINTS } from "@/lib/map-points";

const meta: Meta = {
  title: "Domínio/Mapa",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

export const Marcadores: Story = {
  render: () => (
    <div className="flex items-center gap-12 rounded-2xl bg-[#e8efe6] p-12">
      <div className="relative" dangerouslySetInnerHTML={{ __html: pillMarkerHtml("📍 Você", false) }} />
      <div className="relative" dangerouslySetInnerHTML={{ __html: poiMarkerHtml("3", false) }} />
      <div className="relative" dangerouslySetInnerHTML={{ __html: poiMarkerHtml("5", true) }} />
    </div>
  ),
};

export const PontoDeTroca_Deslogado: Story = {
  name: "TradePointCard · deslogado",
  render: () => (
    <div className="max-w-sm">
      <TradePointCard point={TRADE_POINTS[0]} isLoggedIn={false} wanted={[7, 22]} onClose={fn()} />
    </div>
  ),
};

export const PontoDeTroca_Logado: Story = {
  name: "TradePointCard · logado",
  render: () => (
    <div className="max-w-sm">
      <TradePointCard point={TRADE_POINTS[0]} isLoggedIn wanted={[7, 22]} onClose={fn()} />
    </div>
  ),
};
