import type { Request, Response } from "express";
import { z } from "zod";
import { isDatabaseConnected } from "../config/db.js";
import { Order } from "../models/Order.js";
import { readMockData } from "../services/mockStore.js";

const orderSchema = z.object({
  customerId: z.string(),
  restaurantId: z.string(),
  fulfillmentType: z.enum(["delivery", "pickup"]),
  paymentMethod: z.enum(["card", "cash", "wallet"]),
  addressId: z.string().optional(),
  items: z.array(
    z.object({
      menuItemId: z.string(),
      name: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().nonnegative()
    })
  )
});

export async function listOrders(_req: Request, res: Response) {
  try {
    if (isDatabaseConnected()) {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      return res.json({ data: orders, source: "database" });
    }

    const data = await readMockData<any>();
    return res.json({ data: data.orders, source: "mock" });
  } catch (error: any) {
    console.error("List orders error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createOrder(req: Request, res: Response) {
  try {
    const payload = orderSchema.parse(req.body);
    const subtotal = payload.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const deliveryFee = payload.fulfillmentType === "delivery" ? 5 : 0;
    const tax = Number((subtotal * 0.05).toFixed(2));
    const total = Number((subtotal + deliveryFee + tax).toFixed(2));

    if (isDatabaseConnected()) {
      const order = await Order.create({
        ...payload,
        subtotal,
        deliveryFee,
        tax,
        total,
        status: "placed",
        paymentStatus: payload.paymentMethod === "cash" ? "pending" : "pending",
        timeline: ["placed"]
      });
      return res.status(201).json({ data: order, source: "database" });
    }

    return res.status(201).json({
      data: {
        id: `mock_order_${Date.now()}`,
        ...payload,
        subtotal,
        deliveryFee,
        tax,
        total,
        status: "placed",
        paymentStatus: "pending",
        timeline: ["placed"],
        createdAt: new Date().toISOString()
      },
      source: "mock"
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: "Validation failed", details: error.flatten() });
    }
    console.error("Create order error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const body = z.object({ status: z.string() }).parse(req.body);
    if (isDatabaseConnected()) {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: body.status, $addToSet: { timeline: body.status } },
        { new: true }
      ).lean();
      if (!order) return res.status(404).json({ error: "Order not found" });
      return res.json({ data: order, source: "database" });
    }

    return res.json({ data: { id: req.params.id, status: body.status }, source: "mock" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: "Validation failed", details: error.flatten() });
    }
    console.error("Update order status error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
