# GitHub の設定手順（依頼者向け）

認証が要る操作は依頼者が行う。作り手は認証情報に触れない。

## ① GitHub CLI の導入とログイン（済）

- `winget install GitHub.cli` で導入し、`gh auth login` でログインした。
- 導入直後は、すでに開いている VS Code の PATH に `gh` が入っておらず、`gh` が見つからないことがある。
  その場合は VS Code を開き直す。

## ② 公開リポジトリ `hand-odds` の作成（済）

- 公開リポジトリとして作成し、ローカルの `origin` に設定した（https://github.com/K-UTUABU/hand-odds）。
- 公開にする理由：無料プランでは、公開でないと main の保護（取り込みの制限）と GitHub Pages が使えない。

## ③ 最初の push のあとに、main を保護する（これから）

最初の push（作り手が許可を得て行う）で、自動チェック（ジョブ名 `check`）が一度動いたあとに行う。
動く前は、`check` が候補に出ない。

1. リポジトリの **Settings** → **Branches** を開く
2. **Add branch protection rule**（または **Add classic branch protection rule**）を押す
3. **Branch name pattern** に `main` と入れる
4. **Require a pull request before merging** にチェックを入れる
5. **Require status checks to pass before merging** にチェックを入れ、検索欄で `check` を選ぶ
6. **Create**（保存）を押す

画面の項目名は 2026-11 時点の GitHub の公式文書による。画面と違うときは公式文書（"Managing a branch protection rule"）で確認する。

## ④ GitHub Pages の公開元を設定する（これから）

1. リポジトリの **Settings** → **Pages** を開く
2. **Build and deployment** の **Source** を **GitHub Actions** にする

公開用の設定（ワークフロー）は、あとのタスクで作り手が用意する。
