DTK6 DIS V12 / GitHub Pages 完全版

【アップロード】
このフォルダの中身をGitHubリポジトリ直下へアップロードしてください。
ZIPそのものではなく、index.htmlがリポジトリ直下にある状態にします。

アップロード:
- index.html
- style.css
- config.js
- scheduler.js
- display.js
- clock.js
- app.js
- no-sleep.js
- .nojekyll
- images/imageA.png
- images/imageB.png
- images/imageC.png

【V12変更点】
1. ヘッダーの情報順を「現在のOFFER → 出庫目安時間 → 次のチェックイン」に変更。
2. 出庫目安時間を明るい赤色で表示。
3. 現在時刻（デジタル＋小型アナログ）は右上を維持。
4. ポスター表示を表示領域いっぱいまで拡大（縦横比は維持）。
5. プロジェクター向けに、暗い紺色をやめ、明るいライトグレー／白を基調に変更。文字は濃いチャコールで高コントラスト化。
6. 前WaveのSAFE DRIVEと次WaveのCHECK-INが重なる場合でも、CHECK-INを必ず優先表示。
7. Google TV Streamer等のChromium系ブラウザでの画像再描画対策を継続。
8. mini clockのJavaScript呼び出しを修正。
9. V11のOFFER切替・次回OFFER（水色）・次チェックイン・30分以上空く場合の出庫目安表示を維持。

【DEMO】
PCで index.html を開き、キーボード D でDEMO ON/OFF、RでDEMO時刻へリセットできます。
URL例: ?demo=1&time=17:04:50&speed=20

【Google TV Streamer (4K)】
本番ではGoogle TV Streamer側のブラウザアプリでGitHub PagesのURLを開いて使用してください。
画面の自動スリープやブラウザのバックグラウンド停止は、端末側の設定・使用ブラウザにも依存します。

【画像差し替え】
images/imageA.png / imageB.png / imageC.png を同じファイル名で差し替えれば、コード変更なしでポスターを更新できます。


V12修正版: 運行案内画面はV9の色分け（CHECK-IN=青 / 残り5分=黄 / DEPART NOW=オレンジ / SAFE DRIVE=緑）を維持。出庫目安時間は表示中のOFFERに必ず対応します。


【最終修正】現在のOFFER時刻はLIVEと同じ緑色、次回OFFER時刻は水色。


【今回の修正】
・CHECK-IN開始をOFFERの15分前に変更。
・現在OFFERは「CHECK-IN開始（15分前）から次OFFERのCHECK-IN開始（次OFFERの15分前）まで」の30分間固定。
・次のチェックイン開始時刻は次OFFERの15分前を表示。例：17:30 OFFER中は現在OFFER 17:30、次のチェックイン 17:30（次OFFER 17:45の15分前）。
・ALERT表記を廃止。時間帯ごとにV9系の全画面モード切替を維持。
