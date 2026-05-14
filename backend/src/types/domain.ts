export type Role = "customer" | "restaurant_staff" | "delivery_staff" | "admin";
export type OrderStatus =
  | "placed"
  | "accepted"
  | "rejected"
  | "preparing"
  | "ready_for_pickup"
  | "partner_assigned"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface ApiResponse<T> {
  data: T;
  source: "database" | "mock";
}
