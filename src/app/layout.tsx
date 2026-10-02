import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { shadcn } from "@clerk/ui/themes";
import { ClerkProvider } from "@clerk/nextjs";
export const metadata: Metadata = {
  title: {
    default: "ResonaAI",
    template: "%s | ResonaAI"
  },
  description: "Speech generated on your laptop, with workspace history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider signInFallbackRedirectUrl="/home" signUpFallbackRedirectUrl="/home" appearance={{ theme: shadcn }}>
      <html lang="en" suppressHydrationWarning>

        <body
          className="antialiased"
        >
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
