# easy-fit プロジェクト概要

個人用の筋トレ管理アプリ。日々のトレーニング内容（種目・重量・Rep数・Set数）と体重を記録し、後日カレンダーやグラフで振り返ることを目的とする。AWS Amplify Gen2 をバックエンドに、React (Vite) で構築している。

このドキュメントはセッション間で開発状況を共有するためのもの。実装済みの画面構成・データモデルをまとめる。更新のたびに実態に合わせて書き直すこと。

## 技術スタック

| 領域 | 技術 |
| --- | --- |
| フロントエンド | React 19 + Vite, TypeScript (strict) |
| ルーティング | React Router v8 (`createBrowserRouter`) |
| サーバー状態管理 | TanStack React Query v5 |
| バックエンド | AWS Amplify Gen2 (`defineData`, `defineAuth`) |
| 認証 | Amazon Cognito（メール+パスワード、サインアップ導線なし、手動ユーザー登録） |
| UI | Chakra UI v3 + CSS Modules（レイアウト・独自スタイルは CSS Modules、コンポーネントのバリアント等は Chakra のテーマ/レシピ API） |
| グラフ | `@chakra-ui/charts` + `recharts`（グラフ画面のみ。ルートを遅延読み込み） |
| アイコン | react-icons（Lucide: `react-icons/lu`） |
| トースト通知 | Chakra UI の `Toaster`（`src/components/Toaster/Toaster.tsx`） |
| Lint/Format | Biome |

### デザイン方針

- ライトモードのみ（ダークモード・テーマ切替は廃止）
- ベース背景 `#F2F2F2` / カード背面 `#FFF` + うっすらとした shadow（`--shadow-card`）
- アクセントカラー `#CE0000`（Chakra の `brand` パレット = レッド）
- 画面の戻るボタンは枠なし（Chakra `IconButton` の `ghost` バリアント）
- フォントウェイトの基本は 500（`body { font-weight: 500 }`、見出しは 600）
- 画面左右の余白は 16px（`PageContainer` / 固定バーの `padding-inline: 1rem`）
- 本文の基準サイズは 15px（`0.9375rem`）、補足テキストは 13px（`0.8125rem`）
- 色・shadow・角丸は `src/index.css` の CSS 変数（`--color-*` / `--shadow-card` / `--radius-card`）に集約。グレー文字は `--color-fg-muted`（`#545454`、コントラスト確保のため濃いめ）
- 認証済み画面は `AppLayout`（`src/routes/AppLayout/`）で画面下部にグローバルメニュー `BottomNav`（`src/components/BottomNav/`）を常時表示。タブは「ホーム」`/`、「種目」`/exercises`、「グラフ」`/stats`

## データモデル（`amplify/data/resource.ts`）

owner ベースの認可（`allow.owner().identityClaim('sub')`）により、ユーザーは自分のデータのみ操作できる。

- **Exercise**（種目マスタ）: `name`, `category`, `owner`。ユーザーが登録した種目を保持し、記録画面の種目選択に使う。
- **WorkoutSet**（トレーニング記録・1セット=1レコード）: `date`, `exerciseId`, `weight`, `reps`, `setNumber`, `owner`。セカンダリインデックス `owner + date`（`listWorkoutSetsByDate`）でカレンダー・日別表示に対応。
  - セカンダリインデックス `exerciseId + date`（`listWorkoutSetsByExerciseDate`）で種目別グラフのクエリに対応。
    - **⚠ サンドボックス/本番のスキーマ再デプロイ（`ampx sandbox` など）が必要。** 反映前はグラフ画面の種目別セクションでクエリエラーになる。
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
- ヘッダー: アプリタイトル、ログアウトボタン（種目への導線は下部のグローバルメニューに移動）
- カレンダーをメインコンテンツとして配置（`src/components/Calendar/Calendar.tsx`、日曜始まり・6週間固定表示）
  - 月送り（前月/次月）と「今月」ボタン（当月以外を表示中のみ）で移動
  - トレーニング記録がある日にはアクセントカラーの丸い点（ドット）を表示
  - 体重記録がある日にはセル下部に体重値（`62.5kg` 形式）を表示
  - 本日のセルを強調表示
  - 日付タップでその日のトレーニング記録画面 `/record?date=<日付>` に遷移
  - 表示中の月を含む6週間ぶんの `WorkoutSet` / `BodyWeight` を日付範囲でまとめて取得（`useWorkoutSetsInRange` / `useBodyWeightsInRange`）
- 週の記録サマリー: 常に「今週」（本日を含む日〜土、カレンダーの表示月とは独立）の「トレーニング日数」「合計セット数」「総挙上量（Σ 重量×回数）」「体重（その週の最新記録）」。体重の値は `/body-weight?date=<本日>` へのリンク
- 画面下部に固定表示の「本日のトレーニングを記録」ボタン → `/record?date=<本日>`

### グラフ画面 `/stats`
- 画面上部に期間粒度の切替（週＝直近12週 / 月＝直近12ヶ月 / 年＝直近5年）。`SegmentGroup` で選択、既定は「月」
- 期間粒度ごとにデータをバケットに集計し、折れ線グラフ（`StatsLineChart` = `@chakra-ui/charts`）で推移を表示
- **体重の推移**: バケットごとの体重の平均値を折れ線表示。カード右上に期間全体の平均値
- **種目別の記録推移**: 種目セレクト＋指標切替（最大重量 / 総挙上量）。選択種目のセット記録をバケット集計して折れ線表示。カード右上に期間全体の平均値
  - 種目別クエリは `WorkoutSet` の `listWorkoutSetsByExerciseDate`（`exerciseId + date` GSI）を使用
- 記録のないバケットは点を打たず線でつなぐ。データ0件・種目未登録時は各カードにメッセージ表示
- ルート（recharts 込み）は `React.lazy` で遅延読み込み

### 種目管理画面 `/exercises`
- 種目名・カテゴリ（胸/背中/肩/腕/脚/有酸素/その他）を指定して種目を追加
- 登録済み種目をカテゴリごとにセクション分けして一覧表示（カテゴリカラーのドットで区別）
- 種目ごとに削除可能（確認ダイアログ表示）
- クエリパラメータ `?category=` で追加フォームのカテゴリを事前選択、`?from=` で戻り先を指定可能（記録画面からの「種目を追加」導線で使用）

### トレーニング記録一覧画面 `/record?date=YYYY-MM-DD`
- ページタイトルに対象日を表示（`9月8日(月)のトレーニング` 形式）。日付はカレンダーからの遷移で決まるため、画面内に日付ピッカーは持たない（デフォルトは当日）
- 指定日のトレーニング記録をカテゴリごとにセクション分けして表示
- 各種目は「60kg×10回 / 60kg×8回」のようにセット内容を要約表示、クリックでその種目のセット入力画面へ
- ヘッダーの「+」ボタン → 種目選択画面 `/record/new?date=...`
- 戻るボタンでホーム画面へ

### 種目選択画面 `/record/new?date=YYYY-MM-DD`
- カテゴリごとにセクション分けして、ユーザーが登録済みの種目を一覧表示
- 種目が未登録のカテゴリは「種目を追加」ボタンを表示し、押下すると `/exercises` にそのカテゴリが事前入力された状態で遷移（保存後は本画面に戻る）
- 種目をクリックするとセット入力画面 `/record/new/:exerciseId?date=...` へ
- 戻るボタンで記録一覧画面へ

### セット入力画面 `/record/new/:exerciseId?date=YYYY-MM-DD`
- 選択した種目・日付における記録を1セット=1行で表示（初期状態は1セット分の入力欄）
- 重量・回数は横並び、下線のみ（枠なし）の入力欄。入力後フォーカスを外すと自動保存され、トーストで完了を通知
- 「セットを追加」ボタンで2セット目以降を追加
- セットごとに削除ボタンあり
- 戻るボタンで種目選択画面へ

### 体重記録画面 `/body-weight?date=YYYY-MM-DD`
- 指定日（デフォルト当日）の体重を入力・保存（保存済みの値があれば表示）
- 保存完了時にトースト通知
- 戻るボタンでホーム画面へ

## 画面遷移

```
/login ──(ログイン成功)──> /

グローバルメニュー（全認証済み画面の下部に常時表示）
 ├─ ホーム ──> /
 ├─ 種目 ───> /exercises
 └─ グラフ ─> /stats

/ (ホーム / カレンダー)
 ├─ カレンダーの日付タップ ────────> /record?date=<日付>
 ├─ 「本日のトレーニングを記録」────> /record?date=<本日>
 ├─ 週サマリーの体重リンク ────────> /body-weight?date=<本日>
 │                                        └─ 戻る ──> /
 └─ /record
      ├─ 「+」 ──────────> /record/new
      │                      ├─ 種目クリック ──> /record/new/:exerciseId
      │                      │                     └─ 戻る ──> /record/new
      │                      ├─ 種目0件のカテゴリ「種目を追加」──> /exercises?category=..&from=/record/new
      │                      │                                        └─ 保存後 ──> /record/new
      │                      └─ 戻る ──> /record
      └─ 種目クリック（記録済み） ──> /record/new/:exerciseId
```

## 開発ルール

- 機能ごとに feature ブランチを切り、PR を作成する。`main` への直接 push は行わない
- ディレクトリ構成:
  - コンポーネントはファイル・ディレクトリ名をアッパーキャメルにし、`Xxx/Xxx.tsx` + `Xxx.module.css` の単位で配置する（`pages` 配下も同様）
  - `src/components` は UI コンポーネント専用。ルーティングは `src/routes`、Provider は `src/providers` に定義する
  - hooks のファイル名は `useXxx.ts` 形式にする
- 実データ（Cognito + AppSync）を用いた動作確認はサンドボックス環境では実施できないため、各PRのテスト計画に実機確認項目を明記する
