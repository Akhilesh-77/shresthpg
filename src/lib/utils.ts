import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function formatDate(date: string | Date | number | any) {
  if (!date) return "N/A";
  let d = date;
  if (date?.toDate) d = date.toDate();
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

export function formatDateTime(date: string | Date | any) {
  if (!date) return "N/A";
  let d = date;
  if (date?.toDate) d = date.toDate();
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

export function generateWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  // Ensure it has country code, default to India if 10 digits
  const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}
