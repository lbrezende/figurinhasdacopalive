import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input, Textarea, Field } from "./input";

const meta = {
  title: "Primitivos/Input",
  component: Input,
  tags: ["autodocs"],
  args: { placeholder: "Seu nome" },
  argTypes: { className: { table: { disable: true } } },
  decorators: [(S) => <div className="w-80">{S()}</div>],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Texto: Story = {};
export const ComLabel: Story = {
  render: () => (
    <Field label="Cidade">
      <Input defaultValue="São Paulo" />
    </Field>
  ),
};
export const AreaDeTexto: Story = {
  render: () => (
    <Field label="Figurinhas identificadas">
      <Textarea rows={2} placeholder="ARG17, BRA10, FWC2…" />
    </Field>
  ),
};
