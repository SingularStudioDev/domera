export default function MapLoading() {
  return (
    <div className="flex h-[600px] w-full items-center justify-center rounded-lg border bg-gray-50">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-sm text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  );
}
