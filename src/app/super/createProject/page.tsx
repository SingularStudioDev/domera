import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { ProjectFormMain } from '@/components/create-project-form/ProjectFormMain';
import { createProjectAction } from '@/lib/actions/projects';
import { ProjectFormData } from '@/types/project-form';
import { authOptions } from '@/lib/auth/config';

export default async function CreateProjectPage() {
  const session = await getServerSession(authOptions);

  // Verificar que el usuario tenga permisos de super admin
//   if (
//     !session?.user ||
//     !session.user.roles.some((role) => role.role === 'admin')
//   ) {
//     redirect('/login');
//   }

  const handleCreateProject = async (data: ProjectFormData) => {
    'use server';

    try {
      // Transformar los datos del formulario al formato requerido por las server actions
      const projectData = {
        name: data.name,
        slug: data.slug,
        organizationId: data.organizationId,
        description: data.description || undefined,
        shortDescription: data.shortDescription || undefined,
        address: data.address,
        neighborhood: data.neighborhood || undefined,
        city: data.city,
        status: data.status,
        basePrice: data.basePrice || undefined,
        currency: data.currency,
        images: data.images,
        amenities: data.amenities.map((amenity) => amenity.text), // Server action espera array de strings
        startDate: undefined, // Se puede agregar después
        estimatedCompletion: data.estimatedCompletion || undefined,
      };

      const result = await createProjectAction(
        projectData,
        // TODO: Obtener IP y User Agent del request
        undefined,
        undefined
      );

      if (result.success && result.data) {
        const project = result.data as { id: string };
        redirect(`/super/projects/${project.id}`);
      } else {
        throw new Error(result.error || 'Error al crear el proyecto');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  // Para este ejemplo, usaremos una organizationId hardcodeada
  // En una implementación real, esto se obtendría de la sesión del usuario
  const organizationId = '00000000-0000-0000-0000-000000000000'; // Placeholder

  return (
    <div className="min-h-screen bg-white">
      <ProjectFormMain
        onSubmit={handleCreateProject}
        isEditing={false}
        organizationId={organizationId}
      />
    </div>
  );
}
