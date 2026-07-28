import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, CreditCard, QrCode, Barcode } from "lucide-react";
import { brl } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-context";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar Compra — Puro Fio Lingerie" },
      { name: "description", content: "Complete seu pedido com segurança." },
      { property: "og:title", content: "Checkout — Puro Fio" },
      { property: "og:description", content: "Complete seu pedido na Puro Fio." },
    ],
  }),
  component: CheckoutPage,
});

type PaymentMethod = "pix" | "credit" | "boleto";

function CheckoutPage() {
  const { cart, cartTotal, cartCount, clearCart, products } = useShop();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [done, setDone] = useState<string | null>(null);

  const items = Object.entries(cart)
    .map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      return p ? { p, qty } : null;
    })
    .filter(Boolean) as { p: any; qty: number }[];

  const shipping = cartTotal >= 199 ? 0 : cartTotal > 0 ? 19.9 : 0;
  const total = cartTotal + shipping;
  const pixTotal = total * 0.95;

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
        <h1 className="mt-6 font-serif text-3xl">Pedido confirmado!</h1>
        <p className="mt-2 text-muted-foreground">
          Número do pedido: <strong>{done}</strong>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Enviamos os detalhes para o seu e-mail.
        </p>
        <Link
          to="/"
          className="inline-block mt-8 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold"
        >
          Voltar à loja
        </Link>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-serif text-2xl">Seu carrinho está vazio</h1>
        <Link
          to="/produtos"
          className="inline-block mt-6 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  const finish = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = "PF" + Math.floor(Math.random() * 900000 + 100000);
    clearCart();
    setDone(orderId);
  };

  return (
    <div className="pb-16">
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <h1 className="font-serif text-3xl sm:text-4xl">Finalizar Compra</h1>
        <div className="mt-4 flex items-center gap-2 text-xs flex-wrap">
          {(["Identificação", "Entrega", "Pagamento"] as const).map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            const active = step === n;
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`grid place-items-center h-7 w-7 rounded-full text-[11px] font-bold ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : step > n
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {n}
                </div>
                <span
                  className={`uppercase tracking-wider ${
                    active ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
                {n < 3 && <span className="text-muted-foreground">·</span>}
              </div>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={finish}
        className="mx-auto max-w-7xl px-4 mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8"
      >
        <div className="space-y-6">
          {step === 1 && (
            <div className="bg-secondary/30 rounded-2xl p-6 space-y-4">
              <h2 className="font-serif text-xl text-primary">Seus dados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome completo" required />
                <Field label="CPF" required />
                <Field label="E-mail" type="email" required />
                <Field label="Telefone" required />
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-full bg-primary text-primary-foreground px-6 py-3 font-semibold text-sm"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-secondary/30 rounded-2xl p-6 space-y-4">
              <h2 className="font-serif text-xl text-primary">Endereço de entrega</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="CEP" required />
                <Field label="Endereço" className="sm:col-span-2" required />
                <Field label="Número" required />
                <Field label="Complemento" />
                <Field label="Bairro" required />
                <Field label="Cidade" required />
                <Field label="Estado" required />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-border px-6 py-3 font-semibold text-sm"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-full bg-primary text-primary-foreground px-6 py-3 font-semibold text-sm"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-secondary/30 rounded-2xl p-6 space-y-4">
              <h2 className="font-serif text-xl text-primary">Pagamento</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    { id: "pix" as const, label: "PIX (5% OFF)", icon: QrCode },
                    { id: "credit" as const, label: "Cartão de crédito", icon: CreditCard },
                    { id: "boleto" as const, label: "Boleto", icon: Barcode },
                  ]
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setPayment(id)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition ${
                      payment === id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/60"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>

              {payment === "credit" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <Field label="Número do cartão" className="sm:col-span-2" required />
                  <Field label="Nome no cartão" required />
                  <Field label="Validade" placeholder="MM/AA" required />
                  <Field label="CVV" required />
                  <div>
                    <label className="text-xs font-semibold text-foreground/80">
                      Parcelas
                    </label>
                    <select className="mt-1 w-full bg-background border border-border rounded-full px-4 py-2.5 text-sm">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const n = i + 1;
                        return (
                          <option key={n} value={n}>
                            {n}x de {brl(total / n)} sem juros
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}
              {payment === "pix" && (
                <p className="text-sm text-muted-foreground">
                  Ao confirmar, você receberá um QR Code para pagamento. Total no PIX:{" "}
                  <strong className="text-primary">{brl(pixTotal)}</strong>
                </p>
              )}
              {payment === "boleto" && (
                <p className="text-sm text-muted-foreground">
                  O boleto será enviado para o seu e-mail com vencimento em 3 dias úteis.
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full border border-border px-6 py-3 font-semibold text-sm"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-primary text-primary-foreground px-6 py-3 font-semibold text-sm"
                >
                  Confirmar Pedido
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="bg-secondary/40 rounded-2xl p-6 h-max lg:sticky lg:top-32 space-y-4">
          <h2 className="font-serif text-xl text-primary">Seu pedido</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map(({ p, qty }) => (
              <div key={p.id} className="flex gap-3 items-center text-sm">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">Qtd: {qty}</div>
                </div>
                <div className="font-semibold">{brl(p.price * qty)}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{brl(cartTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>{shipping === 0 ? "Grátis" : brl(shipping)}</span>
            </div>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>{brl(total)}</span>
          </div>
          {payment === "pix" && (
            <div className="text-xs text-primary">
              No PIX: {brl(pixTotal)} (5% OFF)
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate({ to: "/carrinho" })}
            className="text-xs text-muted-foreground hover:text-primary underline"
          >
            Editar carrinho
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="text-xs font-semibold text-foreground/80">{label}</span>
      <input
        {...rest}
        className="mt-1 w-full bg-background border border-border rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}