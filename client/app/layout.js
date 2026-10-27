import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/context/AuthContext";
import { StoreProvider } from "@/store/StoreProvider";

export const metadata = {
  title: "HRM Dashboard",
  description: "Human resource management dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
