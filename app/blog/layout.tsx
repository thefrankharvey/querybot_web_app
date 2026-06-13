import ClientNav from "../components/client-nav";
import Footer from "../components/footer";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <ClientNav />
      <div className="min-h-screen w-full">{children}</div>
      <Footer />
    </div>
  );
}
