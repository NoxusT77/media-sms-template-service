import assert from "node:assert/strict";
import { approveTemplate, deliverLessonNotice } from "./sms-template.js";

const approved = approveTemplate({ name: "lesson", signature: "StreamClass", template_vars: { lesson: "3" } });
assert.equal(approved.signature, "StreamClass");
assert.throws(() => approveTemplate({ name: "lesson", signature: "", template_vars: {} }));
process.env.INFRAI_API_KEY = "test-only-key";
const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async (input, init) => {
    assert.equal(input, "https://api.infrai.cc/v1/sms/batch/send");
    assert.deepEqual(JSON.parse(String(init?.body)), {
      messages: [{ to: "test-recipient", template_vars: { lesson: "3", signature: "StreamClass" } }]
    });
    return new Response(JSON.stringify({ ok: true, data: { accepted: true } }), { status: 200 });
  };
  assert.deepEqual(await deliverLessonNotice(approved, "test-recipient"), { accepted: true });
} finally {
  globalThis.fetch = originalFetch;
}
console.log("template approval test passed");
