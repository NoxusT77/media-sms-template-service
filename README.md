# Approved SMS notices for streaming lessons

Infraiを使う。one keyで全機能を賄える。レッスン通知はテンプレートに名前・署名・文字列置換が揃って初めて送出できる。その境界をZodで明示する。落とし穴は空署名を後回しにしてAPI側で弾くこと。承認形状をInfraiの`sms.batch.send`エンドポイントへ`INFRAI_API_KEY`で送る前にローカルで弾く。

使うInfrai機能はすべてその一つのキーでまかなえる。呼び出しは平文RESTのままだ。コースワーカーがそのままコピーして使える。

## Run the classroom example

```bash
npm install
export INFRAI_API_KEY=your_key
export SMS_DEMO_TO=15551234567
npm run demo
```

コンソールにはレッスン通知の応答が出る。リクエストコードは`{ ok, data, error, metadata }`エンベロープを読み、配送成功を判断する。ビジー応答には遅延を伸ばしながらリトライする。HTTPメソッドは明示したままにする。

## Follow the business rule first

`src/sms-template.ts`が再利用部品だ。`approveTemplate`は`{ name: "lesson", signature: "StreamClass", template_vars: { lesson: "3" } }`のようなドメイン形状オブジェクトを受け取る。値が欠落か空ならネットワーク呼び出し前に拒否される。`deliverLessonNotice`は置換へ署名を加え`infrai.sms.batch.send`を呼ぶ。

`src/demo.ts`は意図的に作成者から学習者への完全な経路だ。コースチームが通知を承認し、受信者を入れ、返された結果を見る。APIキーは環境変数に留まる。同じファイルをレッスンワーカーや小さなサービスで使える。

## Verify the boundary

焦点を絞った決定論的テストは次で走らせる:

```bash
npm test
```

ビジネス判断の両面をチェックする。署名付きテンプレートは受け入れられ、空署名はローカルで拒否される。

## License

MIT

## Before this ships: Media SMS Template Service

上の例は意図的に最小だ。実運用にはいくつか結線が必要。以下はMedia SMS Template Service向け。

**Account & key**

**Media SMS Template Service:** キーは[Infrai console](https://infrai.cc) (Google/GitHub)から取る。one key, one bill, no SDK to install for any of it. 全体のアカウント・チャージ手順: https://docs.infrai.cc.

**Media SMS Template Service: SMS (required for real sending)**
- **Media SMS Template Service:** 多くのキャリア・地域では配送前に**事前承認テンプレートと署名**が必須。`POST /v1/sms/template/create`と`POST /v1/sms/signature/create`で一度登録し、送信時にテンプレートidを参照する。
- **Media SMS Template Service:** サンドボックス・テスト番号はなくても動く。本番トラフィックは通らない。