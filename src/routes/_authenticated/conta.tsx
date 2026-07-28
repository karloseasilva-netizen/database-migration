import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, User as UserIcon, Mail, Phone, MapPin, Heart, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({
    meta: [
      { title: "Minha Conta — Puro Fio Lingerie" },
      { name: "description", content: "Gerencie seus dados pessoais, endereço e preferências na Puro Fio Lingerie." },
      { property: "og:title", content: "Minha Conta — Puro Fio" },
      { property: "og:description", content: "Gerencie seus dados pessoais e endereço." },
    ],
  }),
  component: ContaPage,
});

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  avatar_url: string | null;
};

const empty: Omit<Profile, "id"> = {
  full_name: "",
  phone: "",
  address_street: "",
  address_number: "",
  address_complement: "",
  address_city: "",
  address_state: "",
  address_zip: "",
  avatar_url: "",
};

function ContaPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext() as { user: { id: string; email?: string } };
  const [profile, setProfile] = useState<Omit<Profile, "id">>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setProfile({
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          address_street: data.address_street ?? "",
          address_number: data.address_number ?? "",
          address_complement: data.address_complement ?? "",
          address_city: data.address_city ?? "",
          address_state: data.address_state ?? "",
          address_zip: data.address_zip ?? "",
          avatar_url: data.avatar_url ?? "",
        });
      }
      setLoading(false);
    })();
  }, [user.id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...profile }, { onConflict: "id" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado com sucesso!");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-sm text-muted-foreground">
        Carregando seu perfil...
      </div>
    );
  }

  const initials = (profile.full_name || user.email || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="h-16 w-16 rounded-full object-cover border border-border" />
          ) : (
            <div className="grid place-items-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-serif text-xl">
              {initials}
            </div>
          )}
          <div>
            <h1 className="font-serif text-3xl text-primary">Olá, {profile.full_name?.split(" ")[0] || "cliente"}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Mail className="h-3.5 w-3.5" />{user.email}</p>
          </div>
        </div>
        <button onClick={signOut} className="inline-flex items-center gap-2 self-start rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary transition">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <Link to="/favoritos" className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 hover:bg-secondary transition">
          <Heart className="h-5 w-5 text-primary" />
          <div><div className="text-xs text-muted-foreground">Meus</div><div className="font-semibold">Favoritos</div></div>
        </Link>
        <Link to="/carrinho" className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 hover:bg-secondary transition">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <div><div className="text-xs text-muted-foreground">Meu</div><div className="font-semibold">Carrinho</div></div>
        </Link>
        <Link to="/produtos" className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 hover:bg-secondary transition">
          <UserIcon className="h-5 w-5 text-primary" />
          <div><div className="text-xs text-muted-foreground">Continuar</div><div className="font-semibold">Comprando</div></div>
        </Link>
      </div>

      <form onSubmit={save} className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-background p-6">
          <h2 className="font-serif text-xl text-primary flex items-center gap-2 mb-4"><UserIcon className="h-5 w-5" /> Dados pessoais</h2>
          <div className="space-y-3">
            <Field label="Nome completo" value={profile.full_name ?? ""} onChange={(v) => setProfile({ ...profile, full_name: v })} />
            <Field label="Telefone" value={profile.phone ?? ""} onChange={(v) => setProfile({ ...profile, phone: v })} placeholder="(11) 99999-9999" icon={<Phone className="h-4 w-4" />} />
            <Field label="URL do avatar" value={profile.avatar_url ?? ""} onChange={(v) => setProfile({ ...profile, avatar_url: v })} placeholder="https://..." />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-background p-6">
          <h2 className="font-serif text-xl text-primary flex items-center gap-2 mb-4"><MapPin className="h-5 w-5" /> Endereço</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2"><Field label="Rua" value={profile.address_street ?? ""} onChange={(v) => setProfile({ ...profile, address_street: v })} /></div>
              <Field label="Número" value={profile.address_number ?? ""} onChange={(v) => setProfile({ ...profile, address_number: v })} />
            </div>
            <Field label="Complemento" value={profile.address_complement ?? ""} onChange={(v) => setProfile({ ...profile, address_complement: v })} />
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2"><Field label="Cidade" value={profile.address_city ?? ""} onChange={(v) => setProfile({ ...profile, address_city: v })} /></div>
              <Field label="UF" value={profile.address_state ?? ""} onChange={(v) => setProfile({ ...profile, address_state: v.toUpperCase().slice(0, 2) })} />
            </div>
            <Field label="CEP" value={profile.address_zip ?? ""} onChange={(v) => setProfile({ ...profile, address_zip: v })} placeholder="00000-000" />
          </div>
        </section>

        <div className="lg:col-span-2 flex justify-end">
          <button disabled={saving} type="submit" className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-60">
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, icon }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">{icon}{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}