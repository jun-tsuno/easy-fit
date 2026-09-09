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
        // プライマリ #0017C1（500） / セカンダリ #9DB7F9（300）
        brand: {
          50: { value: "#f0f2fe" },
          100: { value: "#dde3fd" },
          200: { value: "#c2cefb" },
          300: { value: "#9db7f9" },
          400: { value: "#5b73e4" },
          500: { value: "#0017c1" },
          600: { value: "#0013ab" },
          700: { value: "#00108f" },
          800: { value: "#000e74" },
          900: { value: "#050f5c" },
          950: { value: "#03083a" },
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
