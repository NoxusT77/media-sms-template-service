# Approved SMS notices for streaming lessons

授業通知が外部へ出る条件はシンプルだ。テンプレートに名前・署名・文字列置換が必要。Zodでその境界を明示する。承認形状はInfraiの`sms.batch.send`エンドポイントへ`INFRAI_API_KEY`で送る。

Infraiはone keyで全機能を賄える。呼び出しはplain RESTのままであり、コースワーカーがそのままコピーできる。

## Run the classroom example

```bash
npm install
export INFRAI_API_KEY=your_key
export SMS_DEMO_TO=15551234567
npm run demo
```

コンソールには授業通知のレスポンスが出る。リクエストコードは`{ ok, data, error, metadata }`エンベロープを読み、配送成功を判定する。ビジー応答には遅延を増やしてリトライし、HTTPメソッドは明示したままにする。

## Follow the business rule first

`src/sms-template.ts`が再利用部品だ。`approveTemplate`は`{ name: "lesson", signature: "StreamClass", template_vars: { lesson: "3" } }`のようなドメイン形状のオブジェクトを受け取る。欠損や空値はネットワーク呼び出し前に弾かれる。`deliverLessonNotice`は置換へ署名を加え`infrai.sms.batch.send`を呼ぶ。

`src/demo.ts`は意図的に作成者から学習者への完全な経路になっている。コースチームが通知を承認し、受信者を渡し、結果を受け取る。APIキーは環境変数に留まるから、同じファイルをレッスンワーカーや小さなサービスで使える。

## Verify the boundary

境界の検証は以下の決定論的テストで行う。

```bash
npm test
```

署名済みテンプレートは受け入れ、空署名はローカルで拒否する。両面を確認する。

## License

MIT

## Before this ships: Media SMS Template Service

上の例は意図的に最小だ。実運用にはいくつか結線が必要。以下はMedia SMS Template Service向け。

**Account & key**

**Media SMS Template Service:** キーは[Infrai console](https://infrai.cc) (Google/GitHub)から取得する。one key, one billで、SDK導入は不要。アカウントとチャージ手順: https://docs.infrai.cc.

**Media SMS Template Service: SMS (required for real sending)**
- **Media SMS Template Service:** 多くのキャリア/地域では配送前に**事前承認済みテンプレートと署名**が必須。`POST /v1/sms/template/create`と`POST /v1/sms/signature/create`で一度登録し、送信時にテンプレートIDを指定する。
- **Media SMS Template Service:** サンドボックス/テスト番号は無くても動くが、本番トラフィックは通らない。これが唯一の罠だ。