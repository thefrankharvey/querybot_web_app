"use client";

import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/app/ui-primitives/dialog";
import { Button } from "@/app/ui-primitives/button";

interface QDashDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCtaClick: () => void;
}

export default function QDashDialog({
    open,
    onOpenChange,
    onCtaClick,
}: QDashDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white border-accent/20">
                <DialogHeader>
                    <DialogTitle className="text-center mt-2">Saved Agents page upgraded!</DialogTitle>
                    <DialogDescription className="text-base text-black leading-relaxed mt-4 mb-2 text-left">
                        The Saved Agents page is now the <span className="font-bold">Query Dashboard</span>!
                        The agents you have saved are safe and sound, you&apos;ll find them in the {` `}
                        <span className="font-bold">Query Dashboard</span>, with new features to help you track your query progress!
                        <br />
                        <br />
                        If you have any questions or feedback feel free to reach out to us on social media or via email at<br />
                        <span className="font-bold">feedback@writequeryhook.com</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="pt-2 text-center">
                    <Link href="/query-dashboard" onClick={onCtaClick}>
                        <Button className="w-full sm:w-auto">Go to Query Dashboard</Button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
}
