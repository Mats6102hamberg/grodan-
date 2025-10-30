
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Grodan",
  description: "AI Headmaster with memory and reminders"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="max-w-5xl mx-auto p-6">{children}</div>
      </body>
    </html>
  );
}
