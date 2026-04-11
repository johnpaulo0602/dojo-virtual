import type { Belt } from "@/types";

export const belts: Belt[] = [
  { name: "white_belt", label: "Branca", color: "bg-belt-white", degrees: { quantity: 4, bg: "bg-belt-stripe-bg", color: "white" } },
  { name: "blue_belt", label: "Azul", color: "bg-belt-blue", degrees: { quantity: 4, bg: "bg-belt-stripe-bg", color: "white" } },
  { name: "purple_belt", label: "Roxa", color: "bg-belt-purple", degrees: { quantity: 4, bg: "bg-belt-stripe-bg", color: "white" } },
  { name: "brown_belt", label: "Marrom", color: "bg-belt-brown", degrees: { quantity: 4, bg: "bg-belt-stripe-bg", color: "white" } },
  { name: "black_belt", label: "Preta", color: "bg-belt-black", degrees: { quantity: 6, bg: "bg-belt-stripe-red", color: "white" } },
  { name: "red_black_belt", label: "Coral", color: "bg-belt-red", degrees: { quantity: 1, bg: "bg-belt-stripe-bg", color: "white" } },
  { name: "red_white_belt", label: "Vermelho e Branca", color: "bg-belt-red", degrees: { quantity: 1, bg: "bg-white", color: "black" } },
  { name: "red_belt", label: "Vermelha", color: "bg-belt-red", degrees: { quantity: 2, bg: "bg-white", color: "black" } },
];
