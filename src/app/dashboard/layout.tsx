export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full border-2 border-e-orange-700">
      {children}
    </div>
  );
}
