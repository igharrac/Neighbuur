import { Nav, Footer, MobileBar } from "@/components/layout/nav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="pt-16 min-h-screen">{children}</main>
      <Footer />
      <MobileBar />
    </>
  );
}
