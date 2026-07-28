import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar initialUserEmail={user?.email ?? null} />
      <main className="flex-1 p-[32px]">{children}</main>
    </div>
  );
}
