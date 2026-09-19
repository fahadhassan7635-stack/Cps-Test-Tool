import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";

export const metadata: Metadata = {
  title: "FixedAim - Free CPS Test, Aim Trainer & Typing Speed Test Online",
  description: "The ultimate free platform to test clicking speed, typing WPM, reaction time, and aim precision. No signup needed. Play, test, and improve instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
