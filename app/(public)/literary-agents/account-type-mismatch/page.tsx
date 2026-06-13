import type { Metadata } from "next";

import { AuthPageShell } from "../../components/auth-page-shell";
import { AccountTypeMismatchActions } from "./actions";

export const metadata: Metadata = {
  title: "Separate Agent Account Required",
  description:
    "This Write Query Hook email is already connected to a writer account.",
  robots: { index: false, follow: false },
};

const PROOF_ITEMS = [
  "Separate account types",
  "Different email required",
  "Agent-only workspace",
];

export default function AccountTypeMismatchPage() {
  return (
    <AuthPageShell
      eyebrow="Separate account required"
      title="This email is already a writer account."
      description="Writer and literary-agent workspaces are separate in Write Query Hook. To create an agent workspace, sign out and use a different email address."
      proofItems={PROOF_ITEMS}
      authPrompt="Need the writer app?"
      authLinkHref="/home"
      authLinkLabel="Go to writer home"
    >
      <AccountTypeMismatchActions />
    </AuthPageShell>
  );
}
