import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BlogBackLink() {
  return (
    <nav className="mx-auto mb-4 max-w-3xl" aria-label="Blog navigation">
      <Link
        href="/blog"
        className="flex w-fit items-center gap-2 text-accent/72 transition-colors duration-300 hover:text-accent"
      >
        <ArrowLeft className="h-6 w-6" />
        <span className="text-md font-medium">Back</span>
      </Link>
    </nav>
  );
}
