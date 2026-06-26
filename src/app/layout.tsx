import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://descienceosclub.com"),
  title: {
    default: "Descience Open Source Club - Build in the open",
    template: "%s | Descience Open Source Club",
  },
  description:
    "Descience Open Source Club is a student-driven community for collaborative learning in web development, cloud computing and open source. Learn, build and ship together.",
  keywords: [
    "open source club",
    "Descience",
    "React workshop",
    "cloud computing",
    "student developer community",
  ],
  openGraph: {
    title: "Descience Open Source Club",
    description:
      "A community for collaborative learning in web, cloud and open source. Learn, build and ship together.",
    type: "website",
    url: "https://descienceosclub.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Descience Open Source Club",
    description:
      "A community for collaborative learning in web, cloud and open source.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${mono.variable} antialiased`}
    >
      <body className="noise min-h-screen">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
