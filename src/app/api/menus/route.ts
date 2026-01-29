import { NextResponse } from "next/server";

const demoMenus = [
  {
    id: "menu-1",
    name: "Buffet continental",
    cost_theoretical: 3.2,
    servings: 120,
    allergens: ["gluten", "lácteos"],
    recipes: [
      { name: "Huevos revueltos", cost: 1.1 },
      { name: "Bollería", cost: 0.9 },
      { name: "Café + zumo", cost: 1.2 },
    ],
  },
  {
    id: "menu-2",
    name: "Coffee break",
    cost_theoretical: 2.4,
    servings: 80,
    allergens: ["frutos secos"],
    recipes: [
      { name: "Mini sándwich", cost: 1.0 },
      { name: "Bizcocho", cost: 0.7 },
      { name: "Bebidas", cost: 0.7 },
    ],
  },
];

export async function GET() {
  return NextResponse.json({ data: demoMenus, mode: "stub" });
}
