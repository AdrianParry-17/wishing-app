import { getServerEnv } from "@/lib/config/env";

type VerifyCaptchaInput = {
  token: unknown;
  requesterIp: string | null;
};

export async function verifyCaptcha({ token, requesterIp }: VerifyCaptchaInput): Promise<boolean> {
  const env = getServerEnv();

  // Disabled by default for test environments unless explicitly enabled.
  if (!env.turnstileEnabled) {
    return true;
  }

  if (!env.turnstileSecretKey) {
    return false;
  }

  if (typeof token !== "string" || token.trim() === "") {
    return false;
  }

  const body = new URLSearchParams({
    secret: env.turnstileSecretKey,
    response: token,
  });

  if (requesterIp) {
    body.append("remoteip", requesterIp);
  }

  const response = await fetch(env.turnstileVerifyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { success?: boolean };
  return data.success === true;
}