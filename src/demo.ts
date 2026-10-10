import { approveTemplate, deliverLessonNotice } from "./sms-template.js";

const to = process.env.SMS_DEMO_TO;
if (!to) throw new Error("SMS_DEMO_TO is required");
const template = approveTemplate({
  name: "course-release",
  signature: "StreamClass",
  template_vars: { course: "Media Literacy 101", lesson: "Episode 3" }
});
const result = await deliverLessonNotice(template, to);
console.log("lesson notice accepted:", result);
