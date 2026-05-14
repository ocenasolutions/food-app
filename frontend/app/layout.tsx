import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoodFlow",
  description: "Full-stack food delivery platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
