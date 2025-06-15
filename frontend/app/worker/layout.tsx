import WorkerSidebar from "@/components/worker/WorkerSidebar";

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkerSidebar>
      {children}
    </WorkerSidebar>
  );
}
