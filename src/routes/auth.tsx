import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión | Nexo CRM" },
      {
        name: "description",
        content: "Accede a Nexo CRM para gestionar tu pipeline de ventas B2B.",
      },
      { property: "og:title", content: "Iniciar sesión | Nexo CRM" },
      {
        property: "og:description",
        content: "Accede a Nexo CRM para gestionar tu pipeline de ventas B2B.",
      },
    ],
  }),
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().trim().min(1, "El correo es obligatorio").email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const signupSchema = loginSchema.extend({
  fullName: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre completo")
    .max(100, "Máximo 100 caracteres"),
});

function AuthPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
      else setChecking(false);
    });
  }, [navigate]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  async function onLogin(values: z.infer<typeof loginSchema>) {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      toast.error(
        error.message.includes("Invalid login credentials")
          ? "Correo o contraseña incorrectos"
          : "No pudimos iniciar sesión. Intenta de nuevo.",
      );
      return;
    }
    toast.success("Sesión iniciada");
    navigate({ to: "/dashboard", replace: true });
  }

  async function onSignup(values: z.infer<typeof signupSchema>) {
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: values.fullName },
      },
    });
    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? "Ese correo ya está registrado"
          : "No pudimos crear la cuenta. Intenta de nuevo.",
      );
      return;
    }
    if (data.session) {
      toast.success("Cuenta creada");
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    toast.success("Revisa tu correo para confirmar la cuenta");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
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
          <CardHeader className="pb-4">
            <CardTitle>Bienvenido</CardTitle>
            <CardDescription>Gestiona tu pipeline de ventas B2B.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted/70 p-1">
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="pt-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              autoComplete="email"
                              placeholder="tu@empresa.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" autoComplete="current-password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full rounded-lg"
                      disabled={loginForm.formState.isSubmitting}
                    >
                      {loginForm.formState.isSubmitting ? "Ingresando..." : "Iniciar sesión"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup" className="pt-4">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <Input autoComplete="name" placeholder="Ana Ramírez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              autoComplete="email"
                              placeholder="tu@empresa.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" autoComplete="new-password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full rounded-lg"
                      disabled={signupForm.formState.isSubmitting}
                    >
                      {signupForm.formState.isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
