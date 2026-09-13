# easy-fit プロジェクト概要

個人用の筋トレ管理アプリ。日々のトレーニング内容（種目・重量・Rep数・Set数）と体重を記録し、後日カレンダーや履歴グラフで振り返ることを目的とする。AWS Amplify Gen2 をバックエンドに、React (Vite) で構築している。

このドキュメントはセッション間で開発状況を共有するためのもの。実装済みの画面構成・データモデルをまとめる。更新のたびに実態に合わせて書き直すこと。

## セットアップ

```bash
pnpm install
```

## 開発

```bash
pnpm dev
```

Amplifyバックエンド(認証・データ)をローカルで使う場合は、AWS認証情報を設定した上で以下を実行する。`amplify_outputs.json` が生成されるまでフロントエンドはバックエンドに接続されない。

```bash
pnpm ampx sandbox
```

## その他コマンド

```bash
pnpm build      # 本番ビルド（tsc -b + vite build）
pnpm lint       # Biomeでチェック
pnpm lint:fix   # Biomeで自動修正
pnpm format     # Biomeでフォーマット
```

## 技術スタック

| 領域             | 技術                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| フロントエンド   | React 19 + Vite, TypeScript (strict)                                                                                            |
| ルーティング     | React Router v8 (`createBrowserRouter`)                                                                                         |
| サーバー状態管理 | TanStack React Query v5                                                                                                         |
| バックエンド     | AWS Amplify Gen2 (`defineData`, `defineAuth`)                                                                                   |
| 認証             | Amazon Cognito（メール+パスワード、サインアップ導線なし、手動ユーザー登録）                                                     |
| UI               | Chakra UI v3 + CSS Modules（レイアウト・独自スタイルは CSS Modules、コンポーネントのバリアント等は Chakra のテーマ/レシピ API） |
| グラフ描画       | `@chakra-ui/charts` + `recharts`（履歴画面のみ。ルートを遅延読み込み）                                                          |
| アイコン         | react-icons（Lucide: `react-icons/lu`）                                                                                         |
| トースト通知     | Chakra UI の `Toaster`（`src/components/Toaster/Toaster.tsx`）                                                                  |
| Lint/Format      | Biome                                                                                                                           |

### デザイン方針

- ライトモードのみ（ダークモード・テーマ切替は廃止）
- 背景は全画面 `#FFF`。カード（白背面 + shadow）は使わず、要素はフラットに配置する
- セクション・リスト項目の区切りは余白（大きめ）と 1px の divider（`--color-divider`）で表現する
- プライマリカラー `#FF7628`（オレンジ。`--color-accent` / Chakra `brand` パレットの 500）。プライマリボタン・当日セル・記録アイコン・種目グラフ・アクティブタブに限定
- セカンダリカラー `#FFA66D`（淡いオレンジ。`--color-secondary` / `brand` パレットの 300）。体重グラフの折れ線などに使用
- プライマリ / セカンダリは**どちらもアクセント色**。キャンセルなど中立的なボタンには使わず `colorPalette="gray"` にする
- オレンジ面の上の文字は白（`--color-on-accent` / Chakra `brand.contrast`）。白背景に載せるアクセント文字は `brand.fg` = `brand.700`（読める濃さ）
- 破壊的操作（削除・ゴミ箱アイコン）は `--color-destructive` `#CE0000`（赤）。該当の `Button` / `IconButton` には `colorPalette="red"` を付ける
- 画面の戻るボタンは枠なし（Chakra `IconButton` の `ghost` バリアント）。トップレベルのタブ画面（ホーム / 履歴 / 種目）には戻るボタンを置かない
- フォントウェイトの基本は 500（`body { font-weight: 500 }`、見出しは 600）
- 画面左右の余白は 16px（`PageContainer` / 固定バーの `padding-inline: 16px`）
- ルートフォントサイズは 17px（`:root { font-size: 106.25% }`）。本文の基準は `0.9375rem`、補足テキストは `0.8125rem`
- 色・角丸は `src/index.css` の CSS 変数（`--color-*` / `--radius-card`）に集約。グレー文字は `--color-fg-muted`（`#545454`、コントラスト確保のため濃いめ）
- 認証済み画面は `AppLayout`（`src/routes/AppLayout/`）で画面下部にグローバルメニュー `BottomNav`（`src/components/BottomNav/`）を常時表示。タブは左から「ホーム」`/`、「履歴」`/history`、「種目」`/exercises`

## データモデル（`amplify/data/resource.ts`）

owner ベースの認可（`allow.owner().identityClaim('sub')`）により、ユーザーは自分のデータのみ操作できる。

- **Exercise**（種目マスタ）: `name`, `category`, `owner`。ユーザーが登録した種目を保持し、記録画面の種目選択に使う。
- **WorkoutSet**（トレーニング記録・1セット=1レコード）: `date`, `exerciseId`, `weight`, `reps`, `setNumber`, `owner`。セカンダリインデックス `owner + date`（`listWorkoutSetsByDate`）でカレンダー・日別表示に対応。
  - セカンダリインデックス `exerciseId + date`（`listWorkoutSetsByExerciseDate`）で履歴画面の種目別クエリに対応。
- **BodyWeight**（体重記録）: `date`, `weight`, `owner`。セカンダリインデックス `owner + date`（`listBodyWeightsByDate`）。

## 認証（`amplify/auth/resource.ts`）

- メール+パスワードでのログインのみ（サインアップ導線なし。ユーザーは Cognito コンソールから手動登録）
- 未ログイン時は `/login` にリダイレクト（`ProtectedRoute`）
- セッションは長期間（30日程度）保持し、都度の再ログインを不要にする

## 画面構成（実装済み）

### ログイン画面 `/login`

- メールアドレス・パスワードでログイン
- 認証済みの場合は `/` にリダイレクト

### ホーム画面 `/`

- ヘッダー: ロゴ画像、マイページ画面 `/mypage` への導線（アイコンボタン）
- カレンダーをメインコンテンツとして配置（`src/components/Calendar/Calendar.tsx`、日曜始まり・6週間固定表示）
  - 月送り（前月/次月）と「今月」ボタン（当月以外を表示中のみ）で移動
  - トレーニング記録がある日はダンベルアイコン、体重記録がある日は体重計アイコンをセル下部に表示（数値は出さない）
  - 本日のセルを強調表示
  - 日付タップでその日のトレーニング記録画面 `/record?date=<日付>` に遷移
  - 表示中の月を含む6週間ぶんの `WorkoutSet` / `BodyWeight` を日付範囲でまとめて取得（`useWorkoutSetsInRange` / `useBodyWeightsInRange`）
- 週の記録サマリー: 常に「今週」（本日を含む日〜土、カレンダーの表示月とは独立）の「トレーニング日数」「合計セット数」「総挙上量（Σ 重量×回数）」「体重（その週の最新記録）」。体重の値は `/body-weight?date=<本日>` へのリンク（色はアクセントではなく通常色）
  - 種目別の記録: 今週の `WorkoutSet` を `exerciseId` でグルーピングし、種目ごとに「セット数」「Rep数（合計）」「最大重量」を一覧表示。総挙上量（重量×回数の合計）が多い順に並ぶ。種目マスタが見つからない場合は「未設定の種目」として表示。読み込み中はスケルトン、その週の記録が0件の場合は空状態メッセージを表示
- 画面下部に固定表示の「本日のトレーニングを記録」ボタン → `/record?date=<本日>`

### 履歴画面 `/history`（`src/pages/History/`）

- 画面上部で振り返る期間を切替（週＝直近7日・日単位 / 月＝直近30日・日単位 / 年＝直近12ヶ月・月単位）。`SegmentGroup` で選択、既定は「週」
- 期間内をバケット（日 or 月）に区切って集計し、折れ線グラフ（`StatsLineChart` = `@chakra-ui/charts`）で推移を表示。カード背面なしのフラット表示で、2セクションの間は広めに空ける
- **種目別の記録推移**（上）: 種目セレクト＋指標切替（最大重量 / 総挙上量）。選択種目のセット記録をバケット集計して折れ線表示（プライマリ色）。見出し右に期間全体の平均値
  - 種目別クエリは `WorkoutSet` の `listWorkoutSetsByExerciseDate`（`exerciseId + date` GSI）を使用
- **体重の推移**（下）: バケットごとの体重の平均値を折れ線表示（セカンダリ色）。見出し右に期間全体の平均値
- バケット生成は `getStatsBuckets`（`src/utils/date.ts`）、集計は `src/utils/stats.ts`
- 記録のないバケットは点を打たず線でつなぐ。データ0件・種目未登録時はメッセージ表示
- ルート（recharts 込み）は `React.lazy` で遅延読み込み

### 種目管理画面 `/exercises`

- 種目名・カテゴリ（胸/背中/肩/腕/脚/有酸素/その他）を指定して種目を追加
- 登録済み種目をカテゴリごとにセクション分けして一覧表示（カテゴリカラーのドットで区別）
- 種目ごとに削除可能（確認ダイアログ表示）
- トップレベルのタブ画面のため戻るボタンは持たない（移動はグローバルメニュー）
- クエリパラメータ `?category=` で追加フォームのカテゴリを事前選択。`?from=` がある場合（記録画面の「種目を追加」導線）は種目追加成功後にその URL へ自動で戻る

### トレーニング記録一覧画面 `/record?date=YYYY-MM-DD`

- ページタイトルに対象日を表示（`9月8日(月)のトレーニング` 形式）。日付はカレンダーからの遷移で決まるため、画面内に日付ピッカーは持たない（デフォルトは当日）
- 指定日のトレーニング記録をカテゴリごとにセクション分けして表示
- 各種目は「60kg×10回 / 60kg×8回」のようにセット内容を要約表示、クリックでその種目のセット入力画面へ
- ヘッダーの「+」ボタン → 種目選択画面 `/record/new?date=...`
- 戻るボタンでホーム画面へ

### 種目選択画面 `/record/new?date=YYYY-MM-DD`

- カテゴリごとにセクション分けして、ユーザーが登録済みの種目を一覧表示
- 各カテゴリに常に「種目を追加」ボタンを表示し、押下すると `/exercises` にそのカテゴリが事前入力された状態で遷移（保存後は本画面に戻る）
- 種目をクリックするとセット入力画面 `/record/new/:exerciseId?date=...` へ
- 戻るボタンで記録一覧画面へ

### セット入力画面 `/record/new/:exerciseId?date=YYYY-MM-DD`

- 選択した種目・日付における記録を1セット=1行で表示（初期状態は1セット分の入力欄）
- 重量・回数は横並び、下線のみ（枠なし）の入力欄。行の編集では保存せず、下部の「保存」ボタン押下時に一括で反映（`useSaveExerciseSets`）
  - 未入力（重量・回数とも空）の行は無視。画面から消した既存セットは保存時に削除。setNumber は表示順で採番し直す
  - 保存成功でトースト通知し、記録一覧画面 `/record?date=...` へ戻る
- 「セットを追加」ボタンで2セット目以降を追加。セットごとに削除ボタンあり
- 戻るボタンで種目選択画面へ

### 体重記録画面 `/body-weight?date=YYYY-MM-DD`

- 指定日（デフォルト当日）の体重を入力・保存（保存済みの値があれば表示）
- 保存完了時にトースト通知
- 戻るボタンでホーム画面へ

### マイページ画面 `/mypage`

- ホーム画面ヘッダーのアイコンボタンから遷移
- ユーザー名（Cognitoのusername）を表示
- 月送り可能な「トレーニング実施日数」（表示中の月にトレーニング記録がある日数）を表示
- ログアウトボタン（アプリ内のログアウト導線はここのみ）

## エラーハンドリング

- `ErrorBoundary`（`src/components/ErrorBoundary/`）: アプリ全体（`main.tsx`）を包み、レンダリング時例外を捕捉して `ErrorFallback` を表示する
- `RouteErrorBoundary`（`src/routes/RouteErrorBoundary/`）: React Router のルート `errorElement` に設定。404（存在しないパス）は専用メッセージ、それ以外は汎用の `ErrorFallback` を表示する

## 画面遷移

```
/login ──(ログイン成功)──> /

グローバルメニュー（全認証済み画面の下部に常時表示。左から）
 ├─ ホーム ──> /
 ├─ 履歴 ───> /history
 └─ 種目 ───> /exercises

/ (ホーム / カレンダー)
 ├─ ヘッダーのアイコンボタン ──────> /mypage
 │                                        └─ ログアウト / 戻る ──> /login / /
 ├─ カレンダーの日付タップ ────────> /record?date=<日付>
 ├─ 「本日のトレーニングを記録」────> /record?date=<本日>
 ├─ 週サマリーの体重リンク ────────> /body-weight?date=<本日>
 │                                        └─ 戻る ──> /
 └─ /record
      ├─ 「+」 ──────────> /record/new
      │                      ├─ 種目クリック ──> /record/new/:exerciseId
      │                      │                     └─ 戻る ──> /record/new
      │                      ├─ 「種目を追加」（常時表示）──> /exercises?category=..&from=/record/new
      │                      │                                        └─ 保存後 ──> /record/new
      │                      └─ 戻る ──> /record
      └─ 種目クリック（記録済み） ──> /record/new/:exerciseId
```

## 開発ルール

- 機能ごとに feature ブランチを切り、PR を作成する。`main`, `dev` への直接 push は行わない
- ディレクトリ構成:
  - コンポーネントはファイル・ディレクトリ名をアッパーキャメルにし、`Xxx/Xxx.tsx` + `Xxx.module.css` の単位で配置する（`pages` 配下も同様）
  - `src/components` は UI コンポーネント専用。ルーティングは `src/routes`、Provider は `src/providers` に定義する
  - hooks のファイル名は `useXxx.ts` 形式にする
- 実データ（Cognito + AppSync）を用いた動作確認はサンドボックス環境では実施できないため、各PRのテスト計画に実機確認項目を明記する
