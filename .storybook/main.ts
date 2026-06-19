import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  // Docs do design system (tokens) + stories dos componentes em components/ui
  stories: [
    "../design-system/**/*.mdx",
    "../components/ui/**/*.mdx",
    "../components/ui/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
  ],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
};
export default config;
