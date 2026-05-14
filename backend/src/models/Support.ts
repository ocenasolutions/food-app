import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    provider: { type: String, enum: ["stripe", "razorpay", "cash"], required: true },
    providerPaymentId: String,
    status: { type: String, enum: ["created", "succeeded", "failed", "refunded"], default: "created" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "AED" }
  },
  { timestamps: true }
);

const ReviewSchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String
  },
  { timestamps: true }
);

const DeliveryPartnerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["available", "offline", "on_delivery"], default: "offline" },
    vehicleType: { type: String, enum: ["bike", "car", "scooter"], default: "bike" },
    assignedOrderIds: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    rating: { type: Number, default: 5 }
  },
  { timestamps: true }
);

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
export const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
export const DeliveryPartner =
  mongoose.models.DeliveryPartner || mongoose.model("DeliveryPartner", DeliveryPartnerSchema);
export const Notification =
  mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
