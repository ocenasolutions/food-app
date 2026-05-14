import mongoose, { Schema } from "mongoose";

const OrderItemSchema = new Schema(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem" },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
    deliveryPartnerId: { type: Schema.Types.ObjectId, ref: "DeliveryPartner" },
    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "rejected",
        "preparing",
        "ready_for_pickup",
        "partner_assigned",
        "out_for_delivery",
        "delivered",
        "cancelled"
      ],
      default: "placed"
    },
    fulfillmentType: { type: String, enum: ["delivery", "pickup"], default: "delivery" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    paymentMethod: { type: String, enum: ["card", "cash", "wallet"], default: "cash" },
    items: [OrderItemSchema],
    subtotal: Number,
    deliveryFee: Number,
    tax: Number,
    total: Number,
    addressId: String,
    timeline: [{ type: String }]
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
