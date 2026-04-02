type ServerEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseEdgeSharedSecret: string;
  supabaseEdgeFunctionName: string;
  turnstileEnabled: boolean;
  turnstileSecretKey?: string;
  turnstileVerifyUrl: string;
};

let cachedServerEnv: ServerEnv | null = null;

function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return defaultValue;
}

function requireEnv(name: "SUPABASE_URL" | "SUPABASE_ANON_KEY" | "SUPABASE_EDGE_SHARED_SECRET") {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  cachedServerEnv = {
    supabaseUrl: requireEnv("SUPABASE_URL"),
    supabaseAnonKey: requireEnv("SUPABASE_ANON_KEY"),
    supabaseEdgeSharedSecret: requireEnv("SUPABASE_EDGE_SHARED_SECRET"),
    supabaseEdgeFunctionName: process.env.SUPABASE_EDGE_FUNCTION_NAME || "submit_wish",
    turnstileEnabled: parseBooleanEnv(process.env.TURNSTILE_ENABLED, false),
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
    turnstileVerifyUrl:
      process.env.TURNSTILE_VERIFY_URL || "https://challenges.cloudflare.com/turnstile/v0/siteverify",
  };

  return cachedServerEnv;
}