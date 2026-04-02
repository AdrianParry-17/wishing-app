export type WishRequestPayload = {
  content: unknown;
  honeypot?: unknown;
  captchaToken?: unknown;
};

export type WishSubmissionResult =
  | { ok: true }
  | {
      ok: false;
      code: "invalid_input" | "captcha_failed" | "upstream_rejected" | "server_error";
    };