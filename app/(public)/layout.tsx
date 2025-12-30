import Footer from "../components/footer";
import ClientNav from "../components/client-nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex flex-col items-center">
      <ClientNav />
      <div className="max-w-screen-xl px-4 py-0 min-h-screen w-full">
        {children}
      </div>
      <Footer />
    </div>
  );
}
