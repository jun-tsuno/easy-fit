import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: `"Geist Variable", sans-serif` },
        body: { value: `"Geist Variable", sans-serif` },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
