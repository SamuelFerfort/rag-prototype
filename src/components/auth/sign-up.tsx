"use client";
import React from "react";
import CardWrapper from "../ui/card-wrapper";
import FormError from "../common/form-error";
import FormSuccess from "../common/form-success";
import { useAuthState } from "@/hooks/useAuthState";
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
import { SignupSchema } from "@/helpers/zod/signup-schema";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const router = useRouter();
  const {
    error,
    success,
    loading,
    setLoading,
    setError,
    setSuccess,
    resetState,
  } = useAuthState();

  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof SignupSchema>) => {
    console.log("values", values);
    try {
      await signUp.email(
        {
          name: values.name,
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
          onSuccess: () => {
            setSuccess("Usuario creado correctamente");
            router.replace("/");
          },
          onError: (ctx) => {
            console.log("ctx", ctx);
            setError(ctx.error.message);
          },
        }
      );
    } catch (error) {
      console.error(error);
      setError("Algo ha salido mal");
    }
  };

  return (
    <CardWrapper
      cardTitle="Registrarse"
      cardDescription="Crea una nueva cuenta"
      cardFooterLink="/signin"
      cardFooterDescription="¿Ya tienes una cuenta?"
      cardFooterLinkTitle="Iniciar sesión"
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    type="text"
                    placeholder="Juan Perez"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            Registrar
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default SignUp;
