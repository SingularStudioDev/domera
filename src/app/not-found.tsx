"use client";

import { useRouter } from "next/navigation";

import MainButton from "@/components/custom-ui/MainButton";

export default function NotFound() {
  const router = useRouter();

  const handleGoToHome = () => {
    router.push("/");
  };

  return (
    <div className="grid max-h-screen grid-cols-1 items-center justify-center bg-white sm:grid-cols-2">
      <div className="hidden h-screen w-[50vw] items-center justify-center lg:flex">
        <div className="relative w-full">
          <img
            src="/register-img.png"
            alt="Registro Domera"
            className="h-full max-h-screen w-full"
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-8 px-28 text-start">
        <div>
          <p className="translate-y-2.5 text-3xl font-light">Error</p>
          <h1 className="text-primaryColor text-9xl font-bold">404</h1>
        </div>

        <div>
          <h2 className="text-4xl font-bold">Oh no!</h2>
          <p className="text-4xl font-light">
            Parece que no encontramos lo que buscas
          </p>
        </div>

        <MainButton variant="fill" showArrow onClick={handleGoToHome}>
          Ir al Inicio
        </MainButton>
      </div>
    </div>
  );
}
