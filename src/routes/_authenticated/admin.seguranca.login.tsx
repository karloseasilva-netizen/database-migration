import { createFileRoute } from "@tanstack/react-router";
import { Shield, KeyRound, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/seguranca/login")({
  component: LoginPolicy,
});

function LoginPolicy() {
  const items = [
    {
      icon: KeyRound,
      title: "Autenticação por e-mail e senha",
      desc: "Ativada. Senha mínima de 6 caracteres exigida pelo provedor.",
    },
    {
      icon: Users,
      title: "Login com Google",
      desc: "Ativado. Novos cadastros via Google criam automaticamente uma conta de cliente.",
    },
    {
      icon: Shield,
      title: "Proteção de conta",
      desc: "Somente usuários com papel admin podem acessar este painel. Tentativas negadas ficam no log.",
    },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">Login</h1>
        <p className="text-sm text-muted-foreground">Políticas de autenticação e acesso da loja.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((i) => (
          <div key={i.title} className="bg-background rounded-2xl border border-border p-6">
            <i.icon className="h-6 w-6 text-primary" />
            <div className="font-serif text-lg text-primary mt-3">{i.title}</div>
            <p className="text-sm text-muted-foreground mt-1">{i.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
