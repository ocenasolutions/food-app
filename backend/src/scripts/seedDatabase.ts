import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { MenuCategory, MenuItem } from "../models/Menu.js";
import { Order } from "../models/Order.js";
import { Restaurant } from "../models/Restaurant.js";
import { DeliveryPartner, Notification, Payment, Review } from "../models/Support.js";
import { User } from "../models/User.js";

dotenv.config();

const mongoUri = (process.env.MONGODB_URI ?? "").replace(/^MONGODB_URI=/, "");
const password = "password123";

const restaurantSeeds = [
  {
    key: "levant",
    staffKey: "staffLevant",
    name: "Levant Table",
    nameAr: "مائدة الشام",
    description: "Premium Levantine grills, mezze, and fresh-baked breads.",
    descriptionAr: "مشاوي ومقبلات شامية فاخرة مع خبز طازج.",
    coverImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80",
    logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80",
    cuisines: ["Levantine", "Grill", "Healthy"],
    rating: 4.8,
    reviewCount: 1240,
    deliveryTime: "25-35 min",
    priceLevel: 3,
    deliveryFee: 4.5,
    minOrder: 25,
    address: "Jumeirah Beach Road, Dubai"
  },
  {
    key: "roma",
    staffKey: "staffRoma",
    name: "Roma Pantry",
    nameAr: "روما بانتري",
    description: "Wood-fired pizza, handmade pasta, and Italian desserts.",
    descriptionAr: "بيتزا على الحطب ومعكرونة طازجة وحلويات إيطالية.",
    coverImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=80",
    logo: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=300&q=80",
    cuisines: ["Italian", "Pizza", "Pasta"],
    rating: 4.6,
    reviewCount: 890,
    deliveryTime: "30-40 min",
    priceLevel: 2,
    deliveryFee: 6,
    minOrder: 30,
    address: "Downtown Dubai"
  },
  {
    key: "bento",
    staffKey: "staffBento",
    name: "Bento District",
    nameAr: "بنتو ديستريكت",
    description: "Fast sushi, bento boxes, ramen, and Japanese drinks.",
    descriptionAr: "سوشي سريع وصناديق بنتو ورامن ومشروبات يابانية.",
    coverImage: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=1400&q=80",
    logo: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=300&q=80",
    cuisines: ["Japanese", "Sushi", "Ramen"],
    rating: 4.7,
    reviewCount: 620,
    deliveryTime: "20-30 min",
    priceLevel: 3,
    deliveryFee: 5,
    minOrder: 35,
    address: "Business Bay, Dubai"
  },
  {
    key: "tandoor",
    staffKey: "staffLevant",
    name: "Tandoor Lane",
    nameAr: "زقاق التنور",
    description: "North Indian curries, biryani, kebabs, and fresh naan.",
    descriptionAr: "كاري وبرياني وكباب وخبز نان طازج.",
    coverImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1400&q=80",
    logo: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=300&q=80",
    cuisines: ["Indian", "Biryani", "Curry"],
    rating: 4.5,
    reviewCount: 730,
    deliveryTime: "30-45 min",
    priceLevel: 2,
    deliveryFee: 5.5,
    minOrder: 28,
    address: "Karama, Dubai"
  },
  {
    key: "green",
    staffKey: "staffRoma",
    name: "Green Bowl Co.",
    nameAr: "غرين بول",
    description: "Fresh salads, grain bowls, smoothies, and protein plates.",
    descriptionAr: "سلطات وأطباق حبوب وسموذي وأطباق بروتين.",
    coverImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80",
    logo: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=300&q=80",
    cuisines: ["Healthy", "Salads", "Bowls"],
    rating: 4.4,
    reviewCount: 520,
    deliveryTime: "18-28 min",
    priceLevel: 2,
    deliveryFee: 4,
    minOrder: 22,
    address: "Dubai Marina"
  }
];

const menuSeeds = [
  ["levant", "Cold Mezze", "مقبلات باردة", [
    ["Silky Hummus", "حمص ناعم", "Chickpeas, tahini, lemon, olive oil, and warm pita.", 18, true, 310, "https://images.unsplash.com/photo-1577906096429-f73c2c312435?auto=format&fit=crop&w=900&q=80"],
    ["Fattoush Salad", "فتوش", "Crisp vegetables, toasted pita, sumac, and pomegranate dressing.", 24, true, 210, "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=900&q=80"]
  ]],
  ["levant", "Grills", "مشاوي", [
    ["Signature Mixed Grill", "مشاوي مشكلة", "Lamb kofta, shish tawook, beef kebab, rice, and dips.", 64, false, 820, "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=900&q=80"],
    ["Chicken Shawarma Plate", "طبق شاورما دجاج", "Marinated chicken, garlic sauce, pickles, fries, and bread.", 42, false, 680, "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=900&q=80"]
  ]],
  ["roma", "Pizza", "بيتزا", [
    ["Margherita DOP", "مارغريتا", "San Marzano tomato, buffalo mozzarella, basil, olive oil.", 44, true, 690, "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80"],
    ["Truffle Mushroom Pizza", "بيتزا فطر بالكمأة", "Wild mushrooms, truffle cream, mozzarella, and thyme.", 58, true, 760, "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80"]
  ]],
  ["roma", "Pasta", "باستا", [
    ["Spaghetti Pomodoro", "سباغيتي بومودورو", "Tomato, garlic, basil, olive oil, and parmesan.", 39, true, 540, "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80"],
    ["Chicken Alfredo", "دجاج ألفريدو", "Cream sauce, grilled chicken, parmesan, and fettuccine.", 52, false, 780, "https://images.unsplash.com/photo-1645112411341-6c4fd023882c?auto=format&fit=crop&w=900&q=80"]
  ]],
  ["bento", "Sushi Sets", "مجموعات السوشي", [
    ["Chef Sushi Set", "مجموعة سوشي الشيف", "Salmon nigiri, tuna maki, shrimp tempura roll, edamame.", 72, false, 640, "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=900&q=80"],
    ["Vegetable Maki Box", "ماكي خضار", "Avocado, cucumber, carrot, sesame, soy, and wasabi.", 38, true, 390, "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80"]
  ]],
  ["bento", "Ramen", "رامن", [
    ["Chicken Shoyu Ramen", "رامن دجاج شويو", "Chicken broth, noodles, egg, corn, scallions, and nori.", 49, false, 710, "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80"],
    ["Miso Tofu Ramen", "رامن ميسو بالتوفو", "Miso broth, tofu, mushrooms, bok choy, and noodles.", 45, true, 620, "https://images.unsplash.com/photo-1623341214825-9f4f963727da?auto=format&fit=crop&w=900&q=80"]
  ]],
  ["tandoor", "Curries", "كاري", [
    ["Butter Chicken", "دجاج بالزبدة", "Tandoori chicken simmered in tomato butter gravy.", 46, false, 740, "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80"],
    ["Paneer Tikka Masala", "بانير تيكا ماسالا", "Paneer cubes in spiced tomato cream sauce.", 39, true, 650, "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80"]
  ]],
  ["tandoor", "Rice & Bread", "أرز وخبز", [
    ["Chicken Biryani", "برياني دجاج", "Fragrant basmati rice, chicken, saffron, and raita.", 48, false, 790, "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=80"],
    ["Garlic Naan Basket", "سلة نان بالثوم", "Three warm garlic naan breads with butter.", 18, true, 420, "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80"]
  ]],
  ["green", "Bowls", "أطباق", [
    ["Salmon Power Bowl", "طبق سلمون", "Grilled salmon, quinoa, avocado, greens, and citrus dressing.", 62, false, 610, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80"],
    ["Falafel Grain Bowl", "طبق فلافل", "Falafel, brown rice, hummus, pickles, greens, and tahini.", 36, true, 540, "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=900&q=80"]
  ]],
  ["green", "Drinks", "مشروبات", [
    ["Mango Protein Smoothie", "سموذي مانجو", "Mango, banana, whey protein, yogurt, and chia.", 28, true, 330, "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80"],
    ["Cold Press Green Juice", "عصير أخضر", "Kale, cucumber, apple, celery, lemon, and ginger.", 22, true, 140, "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=900&q=80"]
  ]],
  ["levant", "Wraps & Sides", "لفائف وجوانب", [
    ["Beef Kofta Wrap", "لفائف كفتة", "Charcoal kofta, parsley onion salad, pickles, and tahini.", 32, false, 560, "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=80"],
    ["Za'atar Fries", "بطاطا زعتر", "Crispy fries tossed with za'atar, sumac, and garlic dip.", 21, true, 430, "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80"],
    ["Lentil Soup", "شوربة عدس", "Slow-cooked red lentils, cumin, lemon, and crispy pita.", 19, true, 260, "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80"]
  ]],
  ["roma", "Desserts & Sides", "حلويات وجوانب", [
    ["Classic Tiramisu", "تيراميسو", "Mascarpone cream, espresso-soaked ladyfingers, and cocoa.", 32, true, 420, "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80"],
    ["Burrata Caprese", "بوراتا كابريزي", "Creamy burrata, heirloom tomato, basil, and aged balsamic.", 47, true, 510, "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=80"],
    ["Arancini Bites", "أرانشيني", "Crispy risotto balls filled with mozzarella and tomato sauce.", 34, true, 540, "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=900&q=80"]
  ]],
  ["bento", "Bento Boxes", "صناديق بنتو", [
    ["Teriyaki Chicken Bento", "بنتو دجاج ترياكي", "Teriyaki chicken, steamed rice, gyoza, salad, and pickles.", 58, false, 760, "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=900&q=80"],
    ["Salmon Donburi", "دونبوري سلمون", "Seared salmon, sushi rice, avocado, edamame, and spicy mayo.", 66, false, 690, "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80"],
    ["Crispy Gyoza", "جيوزا مقرمشة", "Pan-seared chicken dumplings with ponzu dipping sauce.", 31, false, 410, "https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=900&q=80"]
  ]],
  ["tandoor", "Tandoor Specials", "أطباق التنور", [
    ["Tandoori Prawns", "روبيان تندوري", "Charred prawns marinated with yogurt, chili, and lime.", 69, false, 520, "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=900&q=80"],
    ["Seekh Kebab Platter", "طبق كباب سيخ", "Spiced lamb kebabs with mint chutney, onions, and naan.", 54, false, 710, "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=900&q=80"],
    ["Masala Chai", "شاي ماسالا", "Slow-brewed black tea with milk, ginger, cardamom, and cloves.", 14, true, 130, "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=80"]
  ]],
  ["green", "Breakfast & Snacks", "فطور ووجبات خفيفة", [
    ["Avocado Toast", "توست أفوكادو", "Sourdough, smashed avocado, poached egg, chili, and lime.", 34, true, 430, "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80"],
    ["Greek Yogurt Parfait", "بارفيه زبادي يوناني", "Greek yogurt, berries, granola, honey, and pistachio.", 27, true, 310, "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80"],
    ["Protein Energy Bites", "كرات بروتين", "Dates, oats, almond butter, cocoa, and chia seeds.", 24, true, 280, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80"]
  ]]
] as const;

async function main() {
  if (!mongoUri) throw new Error("MONGODB_URI is required to seed the database.");
  await mongoose.connect(mongoUri);

  await Promise.all([
    Notification.deleteMany({}),
    Review.deleteMany({}),
    Payment.deleteMany({}),
    DeliveryPartner.deleteMany({}),
    Order.deleteMany({}),
    MenuItem.deleteMany({}),
    MenuCategory.deleteMany({}),
    Restaurant.deleteMany({}),
    User.deleteMany({})
  ]);

  const passwordHash = await bcrypt.hash(password, 12);
  const users = await User.create([
    {
      name: "Platform Admin",
      email: "admin@foodflow.local",
      phone: "+971500000000",
      passwordHash,
      role: "admin",
      addresses: [{ label: "Office", line1: "FoodFlow HQ", city: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 }]
    },
    {
      name: "Aisha Khan",
      email: "aisha@example.com",
      phone: "+971501234567",
      passwordHash,
      role: "customer",
      addresses: [
        { label: "Home", line1: "Marina Promenade", city: "Dubai", country: "UAE", lat: 25.0804, lng: 55.1403 },
        { label: "Work", line1: "One Central", city: "Dubai", country: "UAE", lat: 25.2194, lng: 55.2867 }
      ]
    },
    {
      name: "Nora Singh",
      email: "nora@example.com",
      phone: "+971502223344",
      passwordHash,
      role: "customer",
      addresses: [{ label: "Apartment", line1: "Business Bay Tower", city: "Dubai", country: "UAE", lat: 25.184, lng: 55.26 }]
    },
    { name: "Omar Haddad", email: "staff@levanttable.com", phone: "+971551112222", passwordHash, role: "restaurant_staff" },
    { name: "Maya Rossi", email: "staff@romapantry.com", phone: "+971551113333", passwordHash, role: "restaurant_staff" },
    { name: "Kenji Tanaka", email: "staff@bentodistrict.com", phone: "+971551114444", passwordHash, role: "restaurant_staff" },
    { name: "Ravi Menon", email: "delivery@foodflow.local", phone: "+971555554444", passwordHash, role: "delivery_staff" },
    { name: "Sara Ali", email: "sara.delivery@foodflow.local", phone: "+971555556666", passwordHash, role: "delivery_staff" }
  ]);

  const userByEmail = Object.fromEntries(users.map((user) => [user.email, user]));
  const staffByKey = {
    staffLevant: userByEmail["staff@levanttable.com"],
    staffRoma: userByEmail["staff@romapantry.com"],
    staffBento: userByEmail["staff@bentodistrict.com"]
  };

  const restaurants = await Restaurant.create(
    restaurantSeeds.map((restaurant) => ({
      ...restaurant,
      ownerId: staffByKey[restaurant.staffKey as keyof typeof staffByKey]._id,
      isOpen: true,
      supportsDelivery: true,
      supportsPickup: true
    }))
  );
  const restaurantByKey = Object.fromEntries(restaurants.map((restaurant, index) => [restaurantSeeds[index].key, restaurant]));

  await Promise.all([
    User.findByIdAndUpdate(staffByKey.staffLevant._id, { restaurantId: restaurantByKey.levant._id }),
    User.findByIdAndUpdate(staffByKey.staffRoma._id, { restaurantId: restaurantByKey.roma._id }),
    User.findByIdAndUpdate(staffByKey.staffBento._id, { restaurantId: restaurantByKey.bento._id })
  ]);

  const categoryByName = new Map<string, mongoose.Types.ObjectId>();
  const itemByName = new Map<string, { _id: mongoose.Types.ObjectId; name: string; price: number }>();

  for (const [restaurantKey, categoryName, categoryNameAr, items] of menuSeeds) {
    const category = await MenuCategory.create({
      restaurantId: restaurantByKey[restaurantKey]._id,
      name: categoryName,
      nameAr: categoryNameAr,
      sortOrder: categoryByName.size + 1
    });
    categoryByName.set(`${restaurantKey}:${categoryName}`, category._id);

    const createdItems = await MenuItem.create(
      items.map(([name, nameAr, description, price, isVegetarian, calories, image]) => ({
        restaurantId: restaurantByKey[restaurantKey]._id,
        categoryId: category._id,
        name,
        nameAr,
        description,
        descriptionAr: description,
        price,
        image,
        isAvailable: true,
        isVegetarian,
        calories
      }))
    );
    createdItems.forEach((item) => itemByName.set(item.name, { _id: item._id, name: item.name, price: item.price }));
  }

  const deliveryPartners = await DeliveryPartner.create([
    { userId: userByEmail["delivery@foodflow.local"]._id, status: "on_delivery", vehicleType: "bike", rating: 4.9 },
    { userId: userByEmail["sara.delivery@foodflow.local"]._id, status: "available", vehicleType: "scooter", rating: 4.8 }
  ]);

  const orderInput = [
    { customer: "aisha@example.com", restaurant: "levant", partner: 0, status: "out_for_delivery", paymentMethod: "card", paymentStatus: "paid", items: [["Silky Hummus", 1], ["Signature Mixed Grill", 1]] },
    { customer: "nora@example.com", restaurant: "roma", partner: 1, status: "preparing", paymentMethod: "wallet", paymentStatus: "paid", items: [["Margherita DOP", 1], ["Spaghetti Pomodoro", 2]] },
    { customer: "aisha@example.com", restaurant: "bento", partner: 1, status: "placed", paymentMethod: "cash", paymentStatus: "pending", items: [["Chef Sushi Set", 1], ["Miso Tofu Ramen", 1]] },
    { customer: "nora@example.com", restaurant: "tandoor", partner: 0, status: "delivered", paymentMethod: "card", paymentStatus: "paid", items: [["Butter Chicken", 1], ["Garlic Naan Basket", 2]] },
    { customer: "aisha@example.com", restaurant: "green", partner: 1, status: "accepted", paymentMethod: "card", paymentStatus: "paid", items: [["Salmon Power Bowl", 1], ["Cold Press Green Juice", 2]] },
    { customer: "nora@example.com", restaurant: "levant", partner: 0, status: "ready_for_pickup", paymentMethod: "cash", paymentStatus: "pending", fulfillmentType: "pickup", items: [["Fattoush Salad", 2], ["Chicken Shawarma Plate", 1]] }
  ] as const;

  const timelineFor = (status: string) => {
    const flow = ["placed", "accepted", "preparing", "ready_for_pickup", "partner_assigned", "out_for_delivery", "delivered"];
    const index = flow.indexOf(status);
    return index === -1 ? ["placed"] : flow.slice(0, index + 1);
  };

  const orders = await Order.create(
    orderInput.map((order) => {
      const items = order.items.map(([name, quantity]) => {
        const item = itemByName.get(name);
        if (!item) throw new Error(`Missing menu item ${name}`);
        return { menuItemId: item._id, name: item.name, quantity, unitPrice: item.price };
      });
      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const fulfillmentType = "fulfillmentType" in order ? order.fulfillmentType : "delivery";
      const deliveryFee = fulfillmentType === "delivery" ? restaurantByKey[order.restaurant].deliveryFee : 0;
      const tax = Number((subtotal * 0.05).toFixed(2));
      const total = Number((subtotal + deliveryFee + tax).toFixed(2));
      return {
        customerId: userByEmail[order.customer]._id,
        restaurantId: restaurantByKey[order.restaurant]._id,
        deliveryPartnerId: deliveryPartners[order.partner]._id,
        status: order.status,
        fulfillmentType,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        items,
        subtotal,
        deliveryFee,
        tax,
        total,
        addressId: String(userByEmail[order.customer].addresses?.[0]?._id ?? ""),
        timeline: timelineFor(order.status)
      };
    })
  );

  await Promise.all([
    DeliveryPartner.findByIdAndUpdate(deliveryPartners[0]._id, { assignedOrderIds: [orders[0]._id, orders[3]._id, orders[5]._id] }),
    DeliveryPartner.findByIdAndUpdate(deliveryPartners[1]._id, { assignedOrderIds: [orders[1]._id, orders[2]._id, orders[4]._id] })
  ]);

  await Payment.create(
    orders.map((order, index) => ({
      orderId: order._id,
      provider: order.paymentMethod === "cash" ? "cash" : index % 2 ? "razorpay" : "stripe",
      providerPaymentId: order.paymentMethod === "cash" ? undefined : `pay_seed_${index + 1}`,
      status: order.paymentStatus === "paid" ? "succeeded" : "created",
      amount: order.total,
      currency: "AED"
    }))
  );

  await Review.create([
    { restaurantId: restaurantByKey.levant._id, customerId: userByEmail["aisha@example.com"]._id, rating: 5, comment: "Excellent grill and careful packing." },
    { restaurantId: restaurantByKey.roma._id, customerId: userByEmail["nora@example.com"]._id, rating: 4, comment: "Great pasta and quick delivery." },
    { restaurantId: restaurantByKey.bento._id, customerId: userByEmail["aisha@example.com"]._id, rating: 5, comment: "Fresh sushi and well packed." },
    { restaurantId: restaurantByKey.tandoor._id, customerId: userByEmail["nora@example.com"]._id, rating: 4, comment: "Rich curry and soft naan." },
    { restaurantId: restaurantByKey.green._id, customerId: userByEmail["aisha@example.com"]._id, rating: 4, comment: "Healthy and filling bowl." },
    { restaurantId: restaurantByKey.levant._id, customerId: userByEmail["nora@example.com"]._id, rating: 5, comment: "Reliable pickup experience." }
  ]);

  await Notification.create([
    { userId: userByEmail["aisha@example.com"]._id, title: "Order update", body: "Your Levant Table order is out for delivery.", read: false },
    { userId: userByEmail["nora@example.com"]._id, title: "Order accepted", body: "Roma Pantry accepted your order.", read: false },
    { userId: userByEmail["admin@foodflow.local"]._id, title: "Daily sales", body: "Six demo orders were seeded for operations review.", read: true },
    { userId: userByEmail["staff@levanttable.com"]._id, title: "Pickup order", body: "A pickup order is ready for handoff.", read: false },
    { userId: userByEmail["delivery@foodflow.local"]._id, title: "Route assigned", body: "Three seeded orders are assigned to your route.", read: false },
    { userId: userByEmail["sara.delivery@foodflow.local"]._id, title: "Available queue", body: "You are available for the next delivery.", read: true }
  ]);

  console.log("Database seeded successfully.");
  console.table({
    users: await User.countDocuments(),
    restaurants: await Restaurant.countDocuments(),
    menuCategories: await MenuCategory.countDocuments(),
    menuItems: await MenuItem.countDocuments(),
    orders: await Order.countDocuments(),
    deliveryPartners: await DeliveryPartner.countDocuments(),
    payments: await Payment.countDocuments(),
    reviews: await Review.countDocuments(),
    notifications: await Notification.countDocuments()
  });
  console.log(`Seeded login password for all users: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
