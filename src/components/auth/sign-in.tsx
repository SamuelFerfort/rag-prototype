"use client";
import React from "react";
import CardWrapper from "../ui/card-wrapper";
import { useAuthState } from "@/hooks/useAuthState";
import LoginSchema from "@/helpers/zod/login-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import FormError from "../common/form-error";
import FormSuccess from "../common/form-success";

const SignIn = () => {
  const router = useRouter();
  const {
    error,
    success,
    loading,
    setSuccess,
    setError,
    setLoading,
    resetState,
  } = useAuthState();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    try {
      await signIn.email(
        {
          email: values.email,
          password: values.password,
        },
        {
          onResponse: () => {
            setLoading(false);
          },
          onRequest: () => {
            resetState();
            setLoading(true);
          },
          onSuccess: (ctx) => {
            setSuccess("Registrado correctamente");
            router.replace("/");
          },
          onError: (ctx) => {
            setError(ctx.error.message);
          },
        }
      );
    } catch (error) {
      console.log(error);
      setError("Algo ha salido mal");
    }
  };

  return (
    <CardWrapper cardTitle="Iniciar sesión" cardDescription="">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    type="email"
                    placeholder="juanperez@gmail.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    type="password"
                    placeholder="********"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={loading} type="submit" className="w-full">
            Iniciar sesión
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default SignIn;
