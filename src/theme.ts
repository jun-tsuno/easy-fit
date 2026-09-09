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
        // プライマリ #FF7628（500） / セカンダリ #FFA66D（300）
        brand: {
          50: { value: "#fff3ec" },
          100: { value: "#ffe3d3" },
          200: { value: "#ffc7a5" },
          300: { value: "#ffa66d" },
          400: { value: "#ff8c45" },
          500: { value: "#ff7628" },
          600: { value: "#ea5c12" },
          700: { value: "#c2490c" },
          800: { value: "#9a3c12" },
          900: { value: "#7c3413" },
          950: { value: "#431807" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "white" },
          // 白背景に載せるアクセント文字は読める濃さに
          fg: { value: "{colors.brand.700}" },
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
