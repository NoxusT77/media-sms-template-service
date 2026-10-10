import { z } from "zod";
import { infrai } from "./infrai.js";

export const approvedTemplate = z.object({
  name: z.string().min(1),
  signature: z.string().min(1),
  template_vars: z.record(z.string())
});
export type ApprovedTemplate = z.infer<typeof approvedTemplate>;

export function approveTemplate(input: unknown): ApprovedTemplate {
  return approvedTemplate.parse(input);
}

export async function deliverLessonNotice(template: ApprovedTemplate, to: string) {
  const requestBody = { messages: [{ to, template_vars: { ...template.template_vars, signature: template.signature } }] };
  return infrai.sms.batch.send(requestBody);
}
