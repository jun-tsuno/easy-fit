import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    // アプリ全体のデフォルトテーマカラー（アクセント: レッド）
    html: {
      colorPalette: "brand",
    },
    body: {
      // フォントウェイトの基本は 500
      fontWeight: "medium",
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
          50: { value: "#fff0f0" },
          100: { value: "#ffdcdc" },
          200: { value: "#ffbfbf" },
          300: { value: "#ff9292" },
          400: { value: "#ff5555" },
          500: { value: "#ec0000" },
          600: { value: "#cf0000" },
          700: { value: "#ab0505" },
          800: { value: "#8d0a0a" },
          900: { value: "#750f0f" },
          950: { value: "#400202" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "white" },
          fg: { value: "{colors.brand.600}" },
          muted: { value: "{colors.brand.100}" },
          subtle: { value: "{colors.brand.50}" },
          emphasized: { value: "{colors.brand.200}" },
          focusRing: { value: "{colors.brand.500}" },
          border: { value: "{colors.brand.500}" },
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
