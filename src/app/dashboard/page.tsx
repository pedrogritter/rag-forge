import { setTimeout } from "timers/promises";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const res = await setTimeout(2000, "result");

  return (
    <div className="flex h-full w-full">
      <div className="flex items-center justify-center">
        <h1 className="text-5xl font-extrabold">Welcome to the dashboard</h1>
      </div>
    </div>
  );
}
