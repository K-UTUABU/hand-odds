# 初手の確率計算（hand-odds）

デッキをグループに分けて枚数を入れると、初手で条件を満たす確率が分かるツールです。
厳密な計算（多変量の超幾何分布）とシミュレーションの両方で求め、並べて表示します。
特定のゲームのデータは持たず、計算はすべてブラウザの中で行います。

公開 URL：（タスク7で記入）

## 使用技術

- Vite / React / TypeScript / Tailwind CSS
- テスト：Vitest + React Testing Library
- リント：oxlint
- 自動チェック・公開：GitHub Actions、GitHub Pages

## 起動方法

```bash
npm install
npm run dev     # 開発サーバー（http://localhost:5173/hand-odds/）
npm test        # テスト
npm run lint    # リント
npm run build   # 型チェック + ビルド
```

## この作品の作り方

（骨組み。リンクはタスク7で埋める）

- 役割分担：依頼者は要件定義と受け入れ判定、作り手（Claude Code）は実装・テスト・文書
- 検算表：依頼者が手計算した「入力と正解」を `docs/acceptance/kensan.md` に置き、作り手はそれをそのままテストにする
- 課題 → プルリクエスト → 自動チェック → 依頼者の判定の流れ：課題（リンク予定）、プルリクエスト（リンク予定）
- 判断の記録：[docs/decisions/](docs/decisions/)
