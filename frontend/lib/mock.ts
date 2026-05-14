import seed from "../mock-data/seed.json";
import type { MenuCategory, MenuItem, MockUser, Order, Restaurant } from "./types";

export const mockData = seed as {
  restaurants: Restaurant[];
  menuCategories: MenuCategory[];
  menuItems: MenuItem[];
  orders: Order[];
  users: MockUser[];
  deliveryPartners: unknown[];
};

export function getMockRestaurant(id: string) {
  return {
    restaurant: mockData.restaurants.find((restaurant) => restaurant.id === id),
    categories: mockData.menuCategories.filter((category) => category.restaurantId === id),
    items: mockData.menuItems.filter((item) => item.restaurantId === id)
  };
}
