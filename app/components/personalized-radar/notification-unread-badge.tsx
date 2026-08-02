"use client";

import { Badge } from "@/app/ui-primitives/badge";
import { useUnreadNotificationCount } from "@/app/hooks/use-notifications";

export function NotificationUnreadBadge() {
  const count = useUnreadNotificationCount();
  if (!count.data) return null;
  const label = count.data > 99 ? "99+" : String(count.data);

  return (
    <Badge aria-label={`${count.data} unread notifications`} variant="default">
      {label}
    </Badge>
  );
}

