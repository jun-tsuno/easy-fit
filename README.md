# easy-fit

筋トレ管理アプリ。

## 技術スタック

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [shadcn/ui](https://ui.shadcn.com/)
- [AWS Amplify Gen2](https://docs.amplify.aws/react/) (Auth / Data)
- [Biome](https://biomejs.dev/) (Lint / Format)
- パッケージ管理: [pnpm](https://pnpm.io/)

## セットアップ

```bash
pnpm install
```

## 開発

```bash
pnpm dev
```

Amplifyバックエンド(認証・データ)をローカルで使う場合は、AWS認証情報を設定した上で以下を実行してください。`amplify_outputs.json` が生成されるまでフロントエンドはバックエンドに接続されません。

```bash
pnpm ampx sandbox
```

## その他コマンド

```bash
pnpm build      # 本番ビルド
pnpm lint       # Biomeでチェック
pnpm lint:fix   # Biomeで自動修正
pnpm format     # Biomeでフォーマット
```
