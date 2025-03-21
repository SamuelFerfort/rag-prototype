"use client";
import React from "react";
import { Button } from "../ui/button";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const SignOut = () => {
  const router = useRouter();
  return (
    <Button
      className="cursor-pointer"
      onClick={async () => {
        await signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/signin");
            },
          },
        });
      }}
    >
      Cerrar sesión
    </Button>
  );
};

export default SignOut;
