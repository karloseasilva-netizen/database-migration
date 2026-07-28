import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar ou cadastrar — Puro Fio Lingerie" },
      { name: "description", content: "Acesse sua conta Puro Fio ou crie um novo cadastro para acompanhar pedidos, favoritos e endereços." },
      { property: "og:title", content: "Entrar — Puro Fio Lingerie" },
      { property: "og:description", content: "Acesse sua conta ou cadastre-se na Puro Fio Lingerie." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Senha precisa ter ao menos 6 caracteres").max(72),
});

const signinSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(1, "Informe sua senha").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/conta", replace: true });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsed.data.fullName },
          },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Cadastro realizado! Verifique seu email se necessário.");
        navigate({ to: "/conta", replace: true });
      } else {
        const parsed = signinSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Bem-vinda de volta!");
        navigate({ to: "/conta", replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (res.redirected) return;
    navigate({ to: "/conta", replace: true });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-md bg-background rounded-2xl border border-border shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="mx-auto grid place-items-center h-14 w-14 rounded-full border border-primary/40 text-primary font-serif italic text-xl mb-3">PF</div>
          <h1 className="font-serif text-3xl text-primary">
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin"
              ? "Acesse sua conta Puro Fio."
              : "Cadastre-se e acompanhe seus pedidos e favoritos."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 bg-secondary rounded-full p-1 mb-6">
          <button
            onClick={() => setMode("signin")}
            className={`py-2 text-sm rounded-full transition ${mode === "signin" ? "bg-background shadow font-semibold text-primary" : "text-foreground/70"}`}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`py-2 text-sm rounded-full transition ${mode === "signup" ? "bg-background shadow font-semibold text-primary" : "text-foreground/70"}`}
          >
            Cadastrar
          </button>
        </div>

        <button
          onClick={onGoogle}
          className="w-full flex items-center justify-center gap-2 border border-border rounded-full py-2.5 text-sm font-medium hover:bg-secondary transition mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.8 0 19.5-8.7 19.5-19.5 0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.7 6.4 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.9 13.1-5l-6.1-5c-2 1.4-4.4 2.3-7 2.3-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.6 39 16.3 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.1 5c-.4.4 6.4-4.7 6.4-14 0-1.2-.1-2.3-.4-3.5z"/></svg>
          Continuar com Google
        </button>

        <div className="flex items-center gap-3 my-4 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Nome completo</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
          )}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          <Link to="/" className="hover:text-primary">← Voltar para a loja</Link>
        </p>
      </div>
    </div>
  );
}