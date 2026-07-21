import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold font-[family-name:var(--font-display)]">Orders</h1>
          <form
            action={async () => {
              "use server";
              redirect("/admin/login");
            }}
          >
            <button
              type="submit"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-muted/50">
                <th className="py-3 px-4 font-medium">Order ID</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Package</th>
                <th className="py-3 px-4 font-medium">Amount</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                allOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono text-xs">{order.id}</td>
                    <td className="py-3 px-4">
                      {order.customerName}
                      <br />
                      <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
                    </td>
                    <td className="py-3 px-4 capitalize">
                      {order.packageTier}
                      {order.rushRequested ? " + rush" : ""}
                    </td>
                    <td className="py-3 px-4">${(order.amountCents / 100).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : order.status === "delivered"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {order.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
