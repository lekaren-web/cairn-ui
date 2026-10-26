import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: { name: '@storybook/vue3-vite', options: {} },
  core: { disableTelemetry: true },
  // The root vite.config builds a library; Storybook needs a normal app build.
  viteFinal: (config) => {
    if (config.build) delete config.build.lib
    return config
  },
}
export default config
