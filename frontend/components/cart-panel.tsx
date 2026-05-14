"use client";

import { CheckCircle2, CreditCard, Minus, Plus, ReceiptText, Truck, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { placeOrder, updateOrderStatus } from "@/lib/api";
import { readSession } from "@/lib/auth-client";
import type { MenuItem } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export type CartLine = MenuItem & { quantity: number };

export function CartPanel({ lines, onAdd, onRemove, restaurantId }: {
  lines: CartLine[];
  onAdd: (item: MenuItem) => void;
  onRemove: (item: MenuItem) => void;
  restaurantId: string;
}) {
  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | "wallet">("card");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const subtotal = useMemo(() => lines.reduce((sum, item) => sum + item.price * item.quantity, 0), [lines]);
  const deliveryFee = fulfillmentType === "delivery" ? 5 : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + deliveryFee + tax;

  function lineKey(item: MenuItem) {
    return item.id ?? item._id ?? item.name;
  }

  async function checkout() {
    setStatus("");
    setError("");
    setProcessing(true);
    const user = readSession();
    const customerId = user?.id ?? user?._id;
    if (!customerId) {
      setError("Please log in before placing an order.");
      setProcessing(false);
      return;
    }

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      const result = await placeOrder({
        customerId,
        restaurantId,
        fulfillmentType,
        paymentMethod,
        items: lines.map((line) => ({
          menuItemId: line.id ?? line._id ?? line.name,
          name: line.name,
          quantity: line.quantity,
          unitPrice: line.price
        }))
      });
      const orderId = result.data.id ?? result.data._id;
      if (orderId) await updateOrderStatus(orderId, "accepted");
      setStatus(`Payment of ${formatMoney(total)} completed. Your order has been accepted.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <aside className="sticky top-20 rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <ReceiptText size={19} />
          Cart
        </h2>
        <span className="text-sm text-muted-foreground">{lines.length} items</span>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Button variant={fulfillmentType === "delivery" ? "default" : "outline"} onClick={() => setFulfillmentType("delivery")}>
          <Truck size={16} />
          Delivery
        </Button>
        <Button variant={fulfillmentType === "pickup" ? "default" : "outline"} onClick={() => setFulfillmentType("pickup")}>
          Pickup
        </Button>
      </div>
      <div className="space-y-3">
        {!lines.length ? (
          <p className="rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
            Add items from the menu to start an order.
          </p>
        ) : null}
        {lines.map((line) => (
          <div key={lineKey(line)} className="flex items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <p className="font-semibold">{line.name}</p>
              <p className="text-sm text-muted-foreground">{formatMoney(line.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={() => onRemove(line)} aria-label="Remove item">
                <Minus size={15} />
              </Button>
              <span className="w-5 text-center text-sm font-bold">{line.quantity}</span>
              <Button size="icon" variant="outline" onClick={() => onAdd(line)} aria-label="Add item">
                <Plus size={15} />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
        <div className="flex justify-between"><span>Delivery</span><span>{formatMoney(deliveryFee)}</span></div>
        <div className="flex justify-between"><span>Tax</span><span>{formatMoney(tax)}</span></div>
        <div className="flex justify-between border-t border-border pt-3 text-base font-bold"><span>Total</span><span>{formatMoney(total)}</span></div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button variant={paymentMethod === "card" ? "secondary" : "outline"} onClick={() => setPaymentMethod("card")}>
          <CreditCard size={16} />
          Card
        </Button>
        <Button variant={paymentMethod === "wallet" ? "secondary" : "outline"} onClick={() => setPaymentMethod("wallet")}>
          <WalletCards size={16} />
          Wallet
        </Button>
        <Button variant={paymentMethod === "cash" ? "secondary" : "outline"} onClick={() => setPaymentMethod("cash")}>
          Cash
        </Button>
      </div>
      <Button className="mt-4 w-full" disabled={!lines.length || processing} onClick={checkout}>
        {processing ? "Processing..." : paymentMethod === "cash" ? `Confirm ${formatMoney(total)}` : `Pay mocked ${formatMoney(total)}`}
      </Button>
      {status ? (
        <p className="mt-3 flex items-start gap-2 rounded-md bg-accent/10 p-3 text-sm font-semibold text-accent">
          <CheckCircle2 className="mt-0.5 shrink-0" size={17} />
          {status}
        </p>
      ) : null}
      {error ? <p className="mt-3 rounded-md bg-primary/10 p-3 text-sm font-semibold text-primary">{error}</p> : null}
    </aside>
  );
}
