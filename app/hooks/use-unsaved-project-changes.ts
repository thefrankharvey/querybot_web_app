"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useUnsavedProjectChanges(dirty: boolean) {
  const router = useRouter();
  useEffect(() => {
    if (!dirty) return;
    const href = window.location.href;
    const state = window.history.state;
    const marker = `project-profile-${Date.now()}`;
    let pendingHref: string | null = null;
    let restoring = false;
    let leaving = false;
    let cleaning = false;
    // Keep Back on this URL long enough to confirm before Next handles it.
    window.history.pushState(
      { ...state, projectProfileGuard: marker },
      "",
      href,
    );
    const confirm = () =>
      window.confirm("Discard your unsaved project trait changes?");
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.href === href ||
        anchor.getAttribute("href")?.startsWith("#")
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      if (!confirm()) return;
      pendingHref = anchor.href;
      window.history.back();
    };
    const pop = (event: PopStateEvent) => {
      if (leaving) return;
      event.stopImmediatePropagation();
      if (cleaning) {
        detach();
        return;
      }
      if (restoring) {
        restoring = false;
        return;
      }
      if (pendingHref) {
        leaving = true;
        const target = new URL(pendingHref);
        detach();
        if (target.origin === window.location.origin)
          router.push(`${target.pathname}${target.search}${target.hash}`);
        else window.location.assign(target.href);
      } else if (confirm()) {
        leaving = true;
        detach();
        window.history.back();
      } else {
        restoring = true;
        window.history.forward();
      }
    };
    function detach() {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", click, true);
      window.removeEventListener("popstate", pop, true);
    }
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click, true);
    window.addEventListener("popstate", pop, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", click, true);
      if (
        !leaving &&
        window.location.href === href &&
        window.history.state?.projectProfileGuard === marker
      ) {
        cleaning = true;
        window.history.back();
      } else detach();
    };
  }, [dirty, router]);
}
