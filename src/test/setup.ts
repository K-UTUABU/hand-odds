// すべてのテストの前に読み込まれる準備ファイル
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// テストごとに、描画した画面を片付ける
afterEach(() => {
  cleanup()
})
