import { verifyCaptcha } from "@/lib/services/captcha.service";
import { submitWishToEdgeFunction } from "@/lib/services/supabase-edge.service";
import {
  isHoneypotFilled,
  normalizeAndValidateWish,
} from "@/lib/services/wish-validation.service";
import type { WishRequestPayload, WishSubmissionResult } from "@/lib/types/wish";

type SubmitWishInput = {
  payload: WishRequestPayload;
  requesterIp: string | null;
};

export async function submitWish({ payload, requesterIp }: SubmitWishInput): Promise<WishSubmissionResult> {
  if (isHoneypotFilled(payload.honeypot)) {
    return { ok: false, code: "invalid_input" };
  }

  const normalizedWish = normalizeAndValidateWish(payload.content);
  if (!normalizedWish.ok) {
    return { ok: false, code: "invalid_input" };
  }

  const captchaPassed = await verifyCaptcha({
    token: payload.captchaToken,
    requesterIp,
  });

  if (!captchaPassed) {
    return { ok: false, code: "captcha_failed" };
  }

  try {
    await submitWishToEdgeFunction(normalizedWish.content);
    return { ok: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to submit wish to edge function", { message: error.message });
    } else {
      console.error("Failed to submit wish to edge function");
    }

    return { ok: false, code: "upstream_rejected" };
  }
}