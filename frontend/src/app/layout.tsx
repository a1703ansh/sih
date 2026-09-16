import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "SkillTrace AI",
  description: "Vocational Education Outcome Tracking & Labor Analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=window.localStorage.getItem("skilltrace-theme");if(t==="light"){document.documentElement.setAttribute("data-theme","light")}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}