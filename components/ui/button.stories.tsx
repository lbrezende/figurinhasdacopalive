import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within, userEvent } from "storybook/test";
import { Button } from "./button";

const meta = {
  title: "Primitivos/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Adicionar ao álbum", onClick: fn() },
  argTypes: {
    variant: { control: "select", options: ["primary", "soft", "outline", "danger", "link"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    fullWidth: { control: "boolean" },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Soft: Story = { args: { variant: "soft", children: "💬 Copiar lista" } };
export const Outline: Story = { args: { variant: "outline", children: "Sair" } };
export const Danger: Story = { args: { variant: "danger", children: "Apagar coleção" } };
export const Link: Story = { args: { variant: "link", children: "Pular cooldown (demo)", size: "sm" } };
export const Disabled: Story = { args: { variant: "primary", disabled: true, children: "Abrindo…" } };

export const Galeria: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primário</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="link" size="sm">Link</Button>
    </div>
  ),
};

export const Tamanhos: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">sm</Button>
      <Button size="md">md</Button>
      <Button size="lg">lg</Button>
    </div>
  ),
};

// Teste de interação: clique dispara o handler.
export const Clicavel: Story = {
  args: { variant: "primary", children: "Clique" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Clique" }));
    await expect(args.onClick).toHaveBeenCalled();
  },
};
