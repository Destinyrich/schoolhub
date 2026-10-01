import Providers from "@/components/Providers";
import AdminSidebar from "@/components/AdminSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <Providers>
      <div className="flex flex-col md:flex-row">
        {session && <AdminSidebar />}
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </Providers>
  );
}
