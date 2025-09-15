# 給与明細サイト

給与明細の作成と PDF 出力ができる Web アプリケーションです。

## 機能

- 給与明細の作成・編集
- 支給項目と控除項目の動的追加
- リアルタイムプレビュー
- PDF 出力機能
- レスポンシブデザイン

## 技術スタック

- **フレームワーク**: Next.js 15.5.3 (App Router)
- **言語**: TypeScript
- **スタイリング**: TailwindCSS
- **PDF 生成**: jsPDF + html2canvas
- **フォント**: Inter (Google Fonts)

## プロジェクト構成

```
salary-statement-site/
├── app/
│   ├── globals.css          # グローバルスタイル
│   ├── layout.tsx          # ルートレイアウト
│   └── page.tsx            # メインページ（給与明細作成）
├── public/
│   └── favicon.svg         # ファビコン
├── next.config.js          # Next.js設定
├── tailwind.config.js      # TailwindCSS設定
├── postcss.config.js       # PostCSS設定
├── tsconfig.json           # TypeScript設定
├── package.json            # 依存関係
└── README.md               # このファイル
```

## セットアップ

### 前提条件

- Node.js 18.0 以上
- npm または yarn

### インストール

1. リポジトリをクローン

```bash
git clone <repository-url>
cd salary-statement-site
```

2. 依存関係をインストール

```bash
npm install
```

3. 開発サーバーを起動

```bash
npm run dev
```

4. ブラウザで `http://localhost:3000` を開く

## 使用方法

1. **基本情報の入力**

   - 会社名
   - 社員番号
   - 従業員名
   - 年・月

2. **労働期間の設定**

   - 労働日数
   - 残業時間

3. **支給項目の入力**

   - 基本給
   - 各種手当（通勤手当、住宅手当、残業手当など）
   - 追加項目の動的追加

4. **控除項目の入力**

   - 健康保険
   - 厚生年金
   - 雇用保険
   - 所得税
   - 住民税
   - その他控除
   - 追加項目の動的追加

5. **プレビューと PDF 出力**
   - リアルタイムで給与明細をプレビュー
   - 「PDF 出力」ボタンで PDF ファイルをダウンロード

## ビルドとデプロイ

### 本番ビルド

```bash
npm run build
```

### 本番サーバー起動

```bash
npm start
```

### Vercel でのデプロイ

```bash
npm install -g vercel
vercel
```

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 貢献

プルリクエストやイシューの報告を歓迎します。

## 更新履歴

- v0.1.0: 初回リリース
  - 給与明細作成機能
  - PDF 出力機能
  - レスポンシブデザイン
