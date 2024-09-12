import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Things to awaken - Admin",
  description: "",
};

const activeLinkClass = "bg-muted text-primary";

export default function AdminPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] m-[-15px]">
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
