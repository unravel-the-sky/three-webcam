import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webcam demo - admin panel",
  description: "",
};

const activeLinkClass = "bg-muted text-primary";

export default function AdminPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen w-full">{children}</div>;
}
