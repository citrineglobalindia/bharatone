import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    throw redirect({ href: "https://app.mybharatone.com/login" });
  },
  component: () => null,
});
