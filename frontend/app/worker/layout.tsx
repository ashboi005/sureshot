import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  // If user is not authenticated or not a worker, redirect to login
  if (role !== "WORKER") {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">{children}</div>
    </div>
  );
}
