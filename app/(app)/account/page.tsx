"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { cancelUserSubscription } from "@/app/actions/subscription-actions";
import { deleteUserAccountComplete } from "@/app/actions/subscription-actions";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/ui-primitives/alert-dialog";
import { Button } from "@/app/ui-primitives/button";

const Account = () => {
  const { isSubscribed, user } = useClerkUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState({ cancel: false, delete: false });

  const cancelSubscription = async () => {
    if (!user?.id) return;

    setIsLoading((prev) => ({ ...prev, cancel: true }));
    try {
      const result = await cancelUserSubscription(user.id);
      if (result.success) {
        toast("Subscription canceled successfully", {
          style: {
            backgroundColor: "white",
            color: "black",
            textAlign: "center",
            width: "fit-content",
          },
        });
        setTimeout(() => {
          window.location.replace("/account");
        }, 300);
      } else {
        alert(result.error || "Failed to cancel subscription");
        setIsLoading((prev) => ({ ...prev, cancel: false }));
      }
    } catch {
      alert("Failed to cancel subscription");
      setIsLoading((prev) => ({ ...prev, cancel: false }));
    }
  };

  const deleteAccount = async () => {
    if (!user?.id) return;

    setIsLoading((prev) => ({ ...prev, delete: true }));
    try {
      const result = await deleteUserAccountComplete(user.id);
      if (result.success) {
        toast("Account deleted successfully", {
          style: {
            backgroundColor: "white",
            color: "black",
            textAlign: "center",
            width: "fit-content",
          },
        });
        setTimeout(async () => {
          await signOut();
          router.push("/");
        }, 1000);
      } else {
        alert(result.error || "Failed to delete account");
        setIsLoading((prev) => ({ ...prev, delete: false }));
      }
    } catch {
      alert("Failed to delete account");
      setIsLoading((prev) => ({ ...prev, delete: false }));
    }
  };
  return (
    <div className="px-4 pb-68 pt-8 md:px-6">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col justify-start">
        <h1 className="mb-[27px] flex items-center gap-4 text-4xl font-semibold leading-tight text-accent md:text-[32px] font-serif">
          Account
        </h1>
        <div className="glass-panel-strong flex w-full flex-col gap-8 p-4 md:p-12">
          <div className="flex flex-col md:flex-row gap-1">
            <h2 className="font-semibold">Subscription:</h2>
            <p>{isSubscribed ? "Write Query Hook Subscriber" : "none"}</p>
          </div>
          <div className="flex flex-col md:flex-row gap-1">
            <h2 className="font-semibold">Email:</h2>
            <p>{user?.emailAddresses[0].emailAddress}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {isSubscribed && (
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="secondary"
                      className="text-red-500 border-red-500 border-1 hover:bg-red-500 hover:text-white"
                      disabled={isLoading.cancel}
                    >
                      {isLoading.cancel ? "Canceling..." : "Cancel Subscription"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will cancel your Write Query Hook subscription.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        Back
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={cancelSubscription}
                        className="border border-red-500 bg-white/82 text-red-500 hover:bg-red-500 hover:text-white"
                        disabled={isLoading.cancel}
                      >
                        {isLoading.cancel
                          ? "Cancelling..."
                          : "Cancel Subscription"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="secondary"
                    className="text-red-500 border-red-500 border-1 hover:bg-red-500 hover:text-white"
                    disabled={isLoading.delete}
                  >
                    {isLoading.delete ? "Deleting..." : "Delete Account"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      Back
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteAccount}
                      className="border border-red-500 bg-white/82 text-red-500 hover:bg-red-500 hover:text-white"
                      disabled={isLoading.delete}
                    >
                      {isLoading.delete ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
