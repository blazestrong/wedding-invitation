import localFont from "next/font/local";
import "./globals.css";

const serif = localFont({
  src: [
    { path: "./fonts/CormorantGaramond-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/CormorantGaramond-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/CormorantGaramond-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/CormorantGaramond-MediumItalic.ttf", weight: "500", style: "italic" },
  ],
  variable: "--serif",
});
const sans = localFont({
  src: [
    { path: "./fonts/Jost-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Jost-Regular.ttf", weight: "400", style: "normal" },
  ],
  variable: "--sans",
});
const hand = localFont({ src: "./fonts/Caveat-Regular.ttf", variable: "--hand" });
const typed = localFont({ src: "./fonts/SpecialElite-Regular.ttf", variable: "--type" });

export const metadata = { title: "A letter for you", description: "A wedding invitation, sent by post" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${hand.variable} ${typed.variable}`}>
      <body className="locked">{children}</body>
    </html>
  );
}