import Sidebar from "@/components/Sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-full flex">
      <Sidebar email={user?.email ?? ""} />
      {/* Offset main content by sidebar width on md+ */}
      <main className="flex-1 min-w-0 md:ml-[240px]">{children}</main>
    </div>
  );
}
