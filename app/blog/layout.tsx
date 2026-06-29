import type { ReactNode } from "react";

import { BlogAuthShell } from "./blog-auth-shell";

export default function BlogLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <BlogAuthShell>{children}</BlogAuthShell>;
}
