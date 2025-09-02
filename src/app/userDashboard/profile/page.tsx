import { redirect } from "next/navigation";

import { getCurrentUserWithRoles } from "@/lib/auth/validation";
import { Separator } from "@/components/ui/separator";

export default async function ProfilePage() {
  const user = await getCurrentUserWithRoles();

  if (!user) {
    redirect("/login");
  }

  const hasGoogleAuth = !!user.email;
  const hasPassword = false;

  return (
    <div className="bg-white pt-26">
      <h1 className="dashboard-title mb-10">Perfil</h1>
      <div>
        {/* Datos personales */}
        <section className="pb-6">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Datos personales
          </h2>
          <div className="flex w-full flex-col items-center justify-between md:flex-row">
            <div className="flex flex-col">
              <label className="mb-2 text-sm text-gray-500">Nombre</label>
              <span className="text-gray-900">{user.firstName}</span>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-sm text-gray-500">Apellido</label>
              <span className="text-gray-900">{user.lastName}</span>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-sm text-gray-500">Telefono</label>
              <span className="text-gray-900">{user.phone}</span>
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-sm text-gray-500">Email</label>
              <span className="text-gray-900">{user.email}</span>
            </div>
          </div>
        </section>

        {/* Inicio de sesion */}
        <section>
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Inicio de sesion
          </h2>
          {hasGoogleAuth ? (
            <div className="w-ful flex items-start justify-between">
              <p className="max-w-2xl text-gray-700">
                Has vinculado tu cuenta de Google a Domera y la estas usando
                para iniciar sesion. Has iniciado sesion como{" "}
                <span className="font-medium">{user.email}</span>.
              </p>
              <button
                className="border-primaryColor text-primaryColor hover:border-primaryColor-hover hover:text-primaryColor-hover cursor-pointer rounded-full border px-4 py-2 transition-colors"
                type="button"
              >
                Desconectar
              </button>
            </div>
          ) : (
            <p className="text-gray-700">
              No tienes cuentas externas vinculadas.
            </p>
          )}
        </section>

        <Separator className="my-4" />

        {/* Gestion del email */}
        <section>
          <h3 className="mb-2 text-sm text-gray-500">Email</h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-gray-900">{user.email}</span>
            </div>
            <div className="flex space-x-4">
              <button className="text-primaryColor hover:text-primaryColor-hover cursor-pointer">
                Verificar
              </button>
              <button className="text-primaryColor hover:text-primaryColor-hover cursor-pointer">
                Editar
              </button>
            </div>
          </div>
        </section>

        <Separator className="my-4" />

        {/* Contrasena */}
        <section>
          <h3 className="mb-4 text-lg font-medium text-gray-900">Contrasena</h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">
                Establezca una contrasena unica para proteger su cuenta.
              </span>
            </div>
            <div>
              {hasPassword ? (
                <button className="text-primaryColor hover:text-primaryColor-hover cursor-pointer">
                  Cambiar contrasena
                </button>
              ) : (
                <button className="text-primaryColor hover:text-primaryColor-hover cursor-pointer">
                  Crear contrasena
                </button>
              )}
            </div>
          </div>
        </section>

        <Separator className="my-4" />

        {/* Desactivar cuenta */}
        <section>
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Desactivar cuenta
          </h3>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-700">
                Esto cerrara tu cuenta, pero conservara tu informacion. No
                podras volver a iniciar sesion hasta que se reactive.
              </p>
            </div>
            <div className="ml-4">
              <button className="text-primaryColor hover:text-primaryColor-hover cursor-pointer">
                Desactivar cuenta
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
