import { LoginForm } from "./login-form";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default async function LoginPage() {
  const authed = await isAuthenticated();
  if (authed) redirect("/");

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Acceso Admin</h1>
      <LoginForm />
    </div>
  );
}
