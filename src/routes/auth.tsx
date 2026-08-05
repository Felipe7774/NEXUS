import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión | Nexo CRM" },
      { name: "description", content: "Accede a Nexo CRM con tu cuenta de Google." },
      { property: "og:title", content: "Iniciar sesión | Nexo CRM" },
      { property: "og:description", content: "Accede a Nexo CRM con tu cuenta de Google." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
      else setChecking(false);
    });
  }, [navigate]);

  async function signInWithGoogle() {
    setIsSigningIn(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth` },
    });

    if (error) {
      setIsSigningIn(false);
      toast.error(
        "No pudimos abrir el acceso con Google. Verifica que el proveedor esté habilitado en Supabase Auth.",
      );
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            n
          </div>
          <span className="text-lg font-semibold tracking-tight">Nexo</span>
        </div>
        <Card className="rounded-xl border shadow-[0_12px_35px_rgb(16_16_20/0.08)]">
          <CardHeader className="pb-3 text-center">
            <CardTitle>Bienvenido a Nexo</CardTitle>
            <CardDescription>Ingresa con tu cuenta de Google para continuar.</CardDescription>
          </CardHeader>
          <CardContent className="pt-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-lg gap-3"
              onClick={signInWithGoogle}
              disabled={isSigningIn}
            >
              <GoogleIcon />
              {isSigningIn ? "Redirigiendo a Google..." : "Continuar con Google"}
            </Button>
            <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
              Al continuar, autorizas el inicio de sesión seguro mediante Google y Supabase.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M21.805 12.205c0-.65-.058-1.274-.166-1.875H12v3.545h5.51a4.71 4.71 0 0 1-2.044 3.09v2.3h3.307c1.936-1.783 3.032-4.408 3.032-7.06Z"
      />
      <path
        fill="#34A853"
        d="M12 22.2c2.76 0 5.074-.915 6.765-2.935l-3.307-2.3c-.915.613-2.085.975-3.458.975-2.662 0-4.916-1.798-5.722-4.215H3.86v2.375A10.2 10.2 0 0 0 12 22.2Z"
      />
      <path
        fill="#FBBC05"
        d="M6.278 13.725A6.13 6.13 0 0 1 5.958 12c0-.598.11-1.178.32-1.725V7.9H3.86A10.2 10.2 0 0 0 1.8 12c0 1.647.394 3.207 1.06 4.1l3.418-2.375Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.06c1.5 0 2.847.515 3.908 1.525l2.932-2.932C17.07 3.005 14.758 1.8 12 1.8A10.2 10.2 0 0 0 3.86 7.9l2.418 2.375C7.084 7.858 9.338 6.06 12 6.06Z"
      />
    </svg>
  );
}
