DTK6 GitHub Pages READY版 — ブラッシュアップ v2

【今回の変更】
1. どの画面でも時計を確認できます。
   - 時計画面：中央の大型時計
   - ポスター・案内画面：右上側のCURRENT TIME時計
2. 現在のOFFER表示を黄色枠の大型パネルに変更しました。
3. Fire Stick TV / Silk Browser向けスリープ対策を追加しています。
4. 「ALERT」「OTD limit」の表記は使用していません。
5. 時計 → imageA → 時計 → imageB → 時計 → imageC の順で表示します。

【アップロード方法】
このフォルダの中身をGitHubリポジトリの直下へアップロードしてください。
ZIPそのものではなく、展開した中身をアップロードします。

必要ファイル：
index.html / style.css / config.js / display.js / scheduler.js / clock.js / no-sleep.js / app.js / .nojekyll / imagesフォルダ

GitHub Pages：
Settings → Pages → Deploy from a branch → main / root

リポジトリ直下にindex.htmlが見える状態が正解です。


【ブラッシュアップ V3】
- CURRENT OFFER → 「現在のOFFER」へ日本語化
- CURRENT TIME → 「現在時刻」へ日本語化
- メインアナログ時計下のデジタル時計を廃止
- 右上の現在時刻デジタル表示の下に小型アナログ時計を追加
- 時計はポスター・案内・メイン時計のどの画面でも常時表示
