import { SiteFooter } from "@/components/layout/SiteFooter";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
