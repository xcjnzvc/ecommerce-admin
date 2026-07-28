import "./globals.css";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/lib/react-query/provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <Toaster position="top-center" />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
