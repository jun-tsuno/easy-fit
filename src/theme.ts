import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    // アプリ全体のデフォルトテーマカラー（単色のターコイズ）
    html: {
      colorPalette: "brand",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: `"Geist Variable", sans-serif` },
        body: { value: `"Geist Variable", sans-serif` },
      },
      colors: {
        brand: {
          50: { value: "#e7fcf7" },
          100: { value: "#c5f6ec" },
          200: { value: "#8fecd9" },
          300: { value: "#50dcc3" },
          400: { value: "#22c3aa" },
          500: { value: "#10a894" },
          600: { value: "#0a8677" },
          700: { value: "#0c6a60" },
          800: { value: "#0e544d" },
          900: { value: "#0f453f" },
          950: { value: "#04241f" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: {
            value: { base: "{colors.brand.500}", _dark: "{colors.brand.400}" },
          },
          contrast: {
            value: { base: "white", _dark: "{colors.brand.950}" },
          },
          fg: {
            value: { base: "{colors.brand.700}", _dark: "{colors.brand.300}" },
          },
          muted: {
            value: { base: "{colors.brand.100}", _dark: "{colors.brand.900}" },
          },
          subtle: {
            value: { base: "{colors.brand.50}", _dark: "{colors.brand.950}" },
          },
          emphasized: {
            value: { base: "{colors.brand.200}", _dark: "{colors.brand.800}" },
          },
          focusRing: {
            value: { base: "{colors.brand.500}", _dark: "{colors.brand.400}" },
          },
          border: {
            value: { base: "{colors.brand.500}", _dark: "{colors.brand.400}" },
          },
        },
      },
    },
    recipes: {
      button: {
        // ボタンを少し大きめに（高さ・余白を増やす）
        variants: {
          size: {
            sm: { h: "10", minW: "10", px: "4" },
            md: { h: "11", minW: "11", px: "5" },
            lg: { h: "12", minW: "12", px: "6", textStyle: "md" },
            xl: { h: "14", minW: "14", px: "7" },
          },
        },
      },
      input: {
        // 枠ではなく下線に揃える
        defaultVariants: {
          variant: "flushed",
          size: "lg",
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
