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
| アイコン | react-icons |
| トースト通知 | Chakra UI の `Toaster`（`src/components/Toaster/Toaster.tsx`） |
| Lint/Format | Biome |

## データモデル（`amplify/data/resource.ts`）

owner ベースの認可（`allow.owner().identityClaim('sub')`）により、ユーザーは自分のデータのみ操作できる。

- **Exercise**（種目マスタ）: `name`, `category`, `owner`。ユーザーが登録した種目を保持し、記録画面の種目選択に使う。
- **WorkoutSet**（トレーニング記録・1セット=1レコード）: `date`, `exerciseId`, `weight`, `reps`, `setNumber`, `owner`。セカンダリインデックス `owner + date`（`listWorkoutSetsByDate`）でカレンダー・日別表示に対応。
  - `exerciseId + date` のセカンダリインデックス（種目別グラフ用）は未追加。Issue #6 実装時に追加予定。
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
- ヘッダー: アプリタイトル、種目管理へのアイコンボタン、テーマ切替、ログアウトボタン
- カレンダーをメインコンテンツとして配置（`src/components/Calendar/Calendar.tsx`、日曜始まり・6週間固定表示）
  - 月送り（前月/次月）と「今日」ボタン（当月以外を表示中のみ）で移動
  - トレーニング記録がある日にはアクセントカラーの丸い点（ドット）を表示
  - 体重記録がある日にはセル下部に体重値（`62.5kg` 形式）を表示
  - 表示時は本日の日付が選択済み。日付タップで選択日を切り替え
  - 表示中の月を含む6週間ぶんの `WorkoutSet` / `BodyWeight` を日付範囲でまとめて取得（`useWorkoutSetsInRange` / `useBodyWeightsInRange`）
- 週の記録サマリー: 選択日を含む週（日〜土）の「トレーニング日数」「合計セット数」「総挙上量（Σ 重量×回数）」「体重（その週の最新記録）」
- 選択日の詳細: その日のトレーニングをカテゴリごとにセクション分けし、各種目を「60kg×10回 / …」形式で要約表示。クリックでセット入力画面（`/record/new/:exerciseId?date=...`）へ
- 選択日の詳細見出し横に体重リンク（記録済みなら値、未記録なら「体重を記録」）→ `/body-weight?date=<選択日>`
- 画面下部に固定表示の「本日のトレーニングを記録」ボタン → `/record?date=<本日>`

### 種目管理画面 `/exercises`
- 種目名・カテゴリ（胸/背中/肩/腕/脚/有酸素/その他）を指定して種目を追加
- 登録済み種目をカテゴリごとにセクション分けして一覧表示（カテゴリカラーのドットで区別）
- 種目ごとに削除可能（確認ダイアログ表示）
- クエリパラメータ `?category=` で追加フォームのカテゴリを事前選択、`?from=` で戻り先を指定可能（記録画面からの「種目を追加」導線で使用）

### トレーニング記録一覧画面 `/record?date=YYYY-MM-DD`
- 指定日（デフォルト当日）のトレーニング記録をカテゴリごとにセクション分けして表示
- 各種目は「60kg×10回 / 60kg×8回」のようにセット内容を要約表示、クリックでその種目のセット入力画面へ
- ヘッダーの「+」ボタン → 種目選択画面 `/record/new?date=...`
- 日付ピッカーで表示日を変更可能
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

/ (ホーム / カレンダー)
 ├─ 種目管理アイコン ──────────────> /exercises
 ├─ 「本日のトレーニングを記録」────> /record?date=<本日>
 ├─ カレンダー選択日の種目クリック ─> /record/new/:exerciseId?date=<選択日>
 ├─ 選択日の体重リンク ────────────> /body-weight?date=<選択日>
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
- Issue #6 着手時に `WorkoutSet` へ `exerciseId + date` のセカンダリインデックスを追加する（当初 #8 で予定していたが #6 に変更済み）
- 実データ（Cognito + AppSync）を用いた動作確認はサンドボックス環境では実施できないため、各PRのテスト計画に実機確認項目を明記する
