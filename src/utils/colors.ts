import type { HabitColor } from "../types";

interface ColorSet {
  bg: string;
  bgSoft: string;
  border: string;
  text: string;
  ring: string;
}

export const COLOR_MAP: Record<HabitColor, ColorSet> = {
  green: {
    bg: "bg-duo-green",
    bgSoft: "bg-duo-green/15",
    border: "border-duo-green-dark",
    text: "text-duo-green-dark",
    ring: "ring-duo-green",
  },
  blue: {
    bg: "bg-duo-blue",
    bgSoft: "bg-duo-blue/15",
    border: "border-duo-blue-dark",
    text: "text-duo-blue-dark",
    ring: "ring-duo-blue",
  },
  red: {
    bg: "bg-duo-red",
    bgSoft: "bg-duo-red/15",
    border: "border-duo-red-dark",
    text: "text-duo-red-dark",
    ring: "ring-duo-red",
  },
  yellow: {
    bg: "bg-duo-yellow",
    bgSoft: "bg-duo-yellow/15",
    border: "border-duo-yellow-dark",
    text: "text-duo-yellow-dark",
    ring: "ring-duo-yellow",
  },
  purple: {
    bg: "bg-duo-purple",
    bgSoft: "bg-duo-purple/15",
    border: "border-duo-purple-dark",
    text: "text-duo-purple-dark",
    ring: "ring-duo-purple",
  },
};

export const HABIT_COLORS: HabitColor[] = ["green", "blue", "red", "yellow", "purple"];

export const HABIT_EMOJIS = [
  "💧", "🏃", "📚", "🧘", "🥗", "😴", "🦷", "✍️",
  "💪", "🎯", "🧹", "🎸", "🚭", "💊", "🌱", "🙏",
  "☀️", "💤", "🍎", "🚴", "🧠", "❤️", "📵", "💰",
];
