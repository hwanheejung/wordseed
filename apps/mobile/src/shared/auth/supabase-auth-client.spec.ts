import { describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAuthClient } from "./supabase-auth-client";

vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => ({ auth: { kind: "auth-client" } })) }));

describe("createSupabaseAuthClient", () => {
  it("injects secure persistence and leaves refresh lifecycle to the native app", () => {
    const storage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() };
    const client = createSupabaseAuthClient({ url: "https://project.example", publishableKey: "public-test-key", storage });
    expect(createClient).toHaveBeenCalledWith("https://project.example", "public-test-key", {
      auth: { storage, flowType: "pkce", persistSession: true, autoRefreshToken: false, detectSessionInUrl: false },
    });
    expect(client).toEqual({ kind: "auth-client" });
  });
});
