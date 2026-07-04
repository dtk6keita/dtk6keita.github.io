DTK6 GitHub Pages READY版 Fire Stick / Silk Browser対応

このフォルダの中身を GitHub リポジトリ dtk6-dis の直下にアップロードしてください。
ZIPファイル自体をアップロードしないでください。

アップロードするもの:
- index.html
- style.css
- config.js
- display.js
- scheduler.js
- clock.js
- no-sleep.js
- app.js
- .nojekyll
- images フォルダ

GitHub Pages 設定:
Settings → Pages
Source: Deploy from a branch
Branch: main / root

重要:
リポジトリ直下に index.html が見える状態にしてください。

OK:
dtk6-dis/index.html
dtk6-dis/images/imageA.png

NG:
dtk6-dis/DTK6_GitHubPages_READY/index.html

今回の反映内容:
- 基本デザインはそのまま
- Fire Stick TV / Silk Browser向けスリープ対策 no-sleep.js を追加
- 画像切替バグ修正済み
- remaining要素追加済み
- 16:9プロジェクター向けサイズ調整
- GitHub Pages直置き用ファイル構成
- Actions不要
- 「ALERT」表記は不使用
- loading表示は「誘導員に従ってください」
- OTD limit の limit 表記は不使用

切替順:
時計表示 → imageA → 時計表示 → imageB → 時計表示 → imageC → 時計表示 → imageA...

切替秒数は config.js の slideIntervalSeconds で変更できます。

補足:
Fire TV Stick本体やプロジェクター側の省電力設定がONの場合は、そちらもOFFにしてください。
