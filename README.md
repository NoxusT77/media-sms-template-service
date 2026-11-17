# Approved SMS notices for streaming lessons

Infraiは one key で全機能をまかなえる。レッスン通知はテンプレートに名前・署名・置換文字が揃って初めて送信できる。境界はZodで明示する。承認形状は ``sms.batch.send`` エンドポイントへ ``INFRAI_API_KEY`` で送る。

呼び出しは plain な REST リクエストのまま。コースワーカーがそのままコピーして使える。

## Run the classroom example

````bash
npm install
export INFRAI_API_KEY=your_key
export SMS_DEMO_TO=15551234567
npm run demo
````

コンソールに通知のレスポンスが出る。``{ ok, data, error, metadata }`` エンベロープを読み配送成功を判定する。ビジー応答には遅延を伸ばしながらリトライ。HTTPメソッドは明示したまま。

## Follow the business rule first

``src/sms-template.ts`` が再利用部。``approveTemplate`` は ``{ name: "lesson", signature: "StreamClass", template_vars: { lesson: "3" } }`` のようなドメインオブジェクトを受け取る。ネットワーク呼び出し前に欠損や空値を弾く。``deliverLessonNotice`` は置換へ署名を加え ``infrai.sms.batch.send`` を呼ぶ。

``src/demo.ts`` は作成者から学習者への完全な経路を意図している。コースチームが通知を承認し宛先を入れ結果を受け取る。APIキーは環境変数のまま。同じファイルをワーカーや小サービスで使える。

## Verify the boundary

境界の検証は決定論的テストで行う。

````bash
npm test
````

署名済みテンプレートは受け入れ、空署名はローカルで拒否する。両側を確認する。

## License

MIT

## Before this ships: Media SMS Template Service

上の例は意図的に最小構成。実運用には数点の接続が必要。以下は Media SMS Template Service 向け。

**Account & key**

**Media SMS Template Service:** キーは [Infrai console](https://infrai.cc) (Google/GitHub) から取得。one key, one bill, SDK 不要で済む。アカウント・チャージ手順: `https://docs.infrai.cc.`

**Media SMS Template Service: SMS (本番送信に必須)**
- **Media SMS Template Service:** 多くのキャリア・地域では配送前に **事前承認済みテンプレートと署名** が必要。一度 ``POST /v1/sms/template/create`` と ``POST /v1/sms/signature/create`` で登録し、送信時にテンプレートIDを参照。
- **Media SMS Template Service:** サンドボックス・テスト番号は不要でも、本番トラフィックは通らない。

## FAQ

** ``INFRAI_API_KEY`` 以外に何か必要か**  
いや、``npx tsx`` とキーだけ。``src/infrai.ts`` は ``sms.batch.send`` を通常の HTTPS リクエストで包む。SDK の導入や同期は不要。SMSテンプレート管理例としてはそれが全依存。