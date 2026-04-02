import { getServerEnv } from "@/lib/config/env";

function getEdgeFunctionUrl(supabaseUrl: string, functionName: string): string {
  const normalizedBaseUrl = supabaseUrl.endsWith("/")
    ? supabaseUrl.slice(0, -1)
    : supabaseUrl;

  return `${normalizedBaseUrl}/functions/v1/${encodeURIComponent(functionName)}`;
}

export async function submitWishToEdgeFunction(content: string): Promise<void> {
  const env = getServerEnv();
  const edgeFunctionUrl = getEdgeFunctionUrl(
    env.supabaseUrl,
    env.supabaseEdgeFunctionName,
  );

  const response = await fetch(edgeFunctionUrl, {
    method: "POST",
    body: JSON.stringify({ content }),
    headers: {
      Authorization: `Bearer ${env.supabaseAnonKey}`,
      "x-edge-secret": env.supabaseEdgeSharedSecret,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const responseBody = await response.text();
    const details = responseBody ? `: ${responseBody.slice(0, 400)}` : "";
    throw new Error(
      `Edge function request failed with status ${response.status}${details}`,
    );
  }
}