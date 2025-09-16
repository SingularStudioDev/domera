import { Dispatch, SetStateAction, useState, useEffect, Fragment } from "react";

import { FileText, DownloadIcon, EyeIcon, SendIcon, ChevronRight, ChevronDown } from "lucide-react";

import { getRequiredDocumentsForStepAction, uploadDocumentAction } from "@/lib/actions/documents";
import { addStepCommentAction, getStepCommentsAction } from "@/lib/actions/operations";
import { getProjectBasicInfoAction } from "@/lib/actions/projects";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Define operation interface based on the useActiveOperation hook structure
interface Operation {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  startedAt: Date;
  notes?: string;
  operationUnits: Array<{
    unit: {
      id: string;
      unitNumber: string;
      price: number;
      project: { name: string; slug: string };
    };
    priceAtReservation: number;
  }>;
  steps: Array<{
    id: string;
    stepName: string;
    stepOrder: number;
    status: string;
    startedAt?: Date;
    completedAt?: Date;
  }>;
}

interface ShoppingSheetProps {
  isSheetOpen: boolean;
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>;
  operation: Operation | null;
  onOperationUpdate: () => Promise<void>;
}

export function ShoppingSheet({
  isSheetOpen,
  setIsSheetOpen,
  operation,
  onOperationUpdate,
}: ShoppingSheetProps) {
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [stepDocuments, setStepDocuments] = useState<any[]>([]);
  const [stepComments, setStepComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [stepDocsCache, setStepDocsCache] = useState<Record<string, any[]>>({});
  const [stepCommentsCache, setStepCommentsCache] = useState<Record<string, any[]>>({});
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Get current active step (only in_progress steps allow document uploads)
  const getCurrentStep = () => {
    if (!operation?.steps) return null;
    const sortedSteps = [...operation.steps].sort((a, b) => a.stepOrder - b.stepOrder);
    return sortedSteps.find(step => step.status === "in_progress");
  };

  // Get sorted steps for display
  const getSortedSteps = () => {
    if (!operation?.steps) return [];
    return [...operation.steps].sort((a, b) => a.stepOrder - b.stepOrder);
  };

  // Load documents for the current step only
  const loadCurrentStepDocuments = async () => {
    const currentStep = getCurrentStep();
    if (!currentStep || !operation) {
      setStepDocuments([]);
      return;
    }
    
    try {
      setLoadingDocuments(true);
      const result = await getRequiredDocumentsForStepAction(operation.id, currentStep.id);
      if (result.success && result.data) {
        // Extract the existingDocuments array from the response
        const data = result.data as any;
        // Documents are now filtered by stepId in the API
        setStepDocuments(data.existingDocuments || []);
      }
    } catch (error) {
      console.error("Error loading step documents:", error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Load documents and comments for any specific step
  const loadStepDocuments = async (stepId: string) => {
    if (!operation) return;
    
    // Check cache first
    if (stepDocsCache[stepId] && stepCommentsCache[stepId]) {
      return;
    }
    
    try {
      // Load documents
      const docsResult = await getRequiredDocumentsForStepAction(operation.id, stepId);
      if (docsResult.success && docsResult.data) {
        const data = docsResult.data as any;
        // Documents are now filtered by stepId in the API
        const documents = data.existingDocuments || [];
        
        // Cache the documents
        setStepDocsCache(prev => ({
          ...prev,
          [stepId]: documents
        }));
      }
      
      // Load comments
      const commentsResult = await getStepCommentsAction(stepId);
      if (commentsResult.success && commentsResult.data) {
        // Cache the comments
        setStepCommentsCache(prev => ({
          ...prev,
          [stepId]: commentsResult.data as any[]
        }));
      }
    } catch (error) {
      console.error("Error loading step documents/comments:", error);
    }
  };

  // Toggle step expansion
  const toggleStepExpansion = async (stepId: string) => {
    const isExpanded = expandedSteps.has(stepId);
    
    if (isExpanded) {
      // Collapse the step
      const newExpanded = new Set(expandedSteps);
      newExpanded.delete(stepId);
      setExpandedSteps(newExpanded);
    } else {
      // Expand the step
      await loadStepDocuments(stepId);
      const newExpanded = new Set(expandedSteps);
      newExpanded.add(stepId);
      setExpandedSteps(newExpanded);
    }
  };

  // Load comments for current step
  const loadStepCommentsData = async () => {
    const currentStep = getCurrentStep();
    if (!currentStep) {
      setStepComments([]);
      return;
    }
    
    try {
      const result = await getStepCommentsAction(currentStep.id);
      if (result.success && result.data) {
        setStepComments(result.data as any[]);
      }
    } catch (error) {
      console.error("Error loading step comments:", error);
    }
  };

  // Load project information when operation changes
  useEffect(() => {
    const loadProjectInfo = async () => {
      if (!operation?.operationUnits?.length) {
        setProjectInfo(null);
        return;
      }

      // Get project ID from the first unit
      const projectId = operation.operationUnits[0]?.unit?.project?.id;
      if (!projectId) {
        setProjectInfo(null);
        return;
      }

      try {
        const result = await getProjectBasicInfoAction(projectId);
        if (result.success && result.data) {
          setProjectInfo(result.data);
        } else {
          console.error("Error loading project info:", result.error);
          setProjectInfo(null);
        }
      } catch (error) {
        console.error("Error loading project info:", error);
        setProjectInfo(null);
      }
    };

    loadProjectInfo();
  }, [operation]);

  // Load documents and comments when operation is loaded
  useEffect(() => {
    if (operation && isSheetOpen) {
      loadCurrentStepDocuments();
      loadStepCommentsData();
    }
  }, [operation, isSheetOpen]);

  // Refresh documents after upload
  const refreshDocuments = async () => {
    await loadCurrentStepDocuments();
    await loadStepCommentsData();
    await onOperationUpdate();
  };

  // Check if user can upload more documents
  const canUploadDocument = () => {
    const currentStep = getCurrentStep();
    if (!currentStep) return false;
    
    // Check if there are any PENDING/UPLOADED documents (not validated or rejected)
    // User can only upload one document at a time per step
    const pendingDocs = stepDocuments.filter((doc: any) => 
      doc.status === "uploaded" || doc.status === "pending"
    );
    
    return pendingDocs.length === 0;
  };

  // Handle file upload (only for in_progress steps)
  const handleFileUpload = async (file: File) => {
    if (!file || uploading) return;
    
    const currentStep = getCurrentStep();
    if (!currentStep) {
      alert("No hay una etapa activa para subir documentos. Solo se pueden subir documentos a etapas en progreso.");
      return;
    }
    
    if (!canUploadDocument()) {
      alert("No se puede subir un nuevo documento mientras hay documentos pendientes de validación en esta etapa.");
      return;
    }
    
    try {
      setUploading(true);
      
      // Get document type based on current step
      const getDocumentTypeForStep = (stepName: string): string => {
        switch (stepName.toLowerCase()) {
          case 'boleto de reserva':
          case 'reserva':
            return 'boleto_reserva';
          case 'compromiso de compraventa':
          case 'compraventa':
            return 'compromiso_compraventa';
          case 'pago':
          case 'comprobante de pago':
            return 'comprobante_pago';
          default:
            return 'otros';
        }
      };
      
      const documentType = getDocumentTypeForStep(currentStep.stepName);
      
      const result = await uploadDocumentAction({
        operationId: operation!.id,
        stepId: currentStep.id,
        documentType: documentType as any,
        title: `${currentStep.stepName} - ${file.name}`,
        description: `Documento para ${currentStep.stepName} - ${file.name}`,
        fileUrl: `https://placeholder-storage.com/${file.name}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });
      
      if (result.success) {
        setUploadSuccess(`✅ Archivo "${file.name}" subido correctamente`);
        await refreshDocuments();
        // Clear success message after 5 seconds
        setTimeout(() => setUploadSuccess(null), 5000);
      } else {
        alert("Error: " + (result.error || "Error subiendo documento"));
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Error inesperado subiendo documento");
    } finally {
      setUploading(false);
    }
  };

  // Add comment to current step
  const handleAddStepComment = async () => {
    const currentStep = getCurrentStep();
    if (!currentStep || !newComment.trim()) return;
    
    try {
      setIsAddingComment(true);
      const result = await addStepCommentAction({
        stepId: currentStep.id,
        content: newComment.trim(),
        isInternal: false
      });
      
      if (result.success) {
        setNewComment("");
        await loadStepCommentsData();
      } else {
        alert("Error: " + (result.error || "Error agregando comentario"));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Error inesperado agregando comentario");
    } finally {
      setIsAddingComment(false);
    }
  };

  // If no operation, show empty state
  if (!operation) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-[80vw] overflow-y-auto rounded-l-xl p-3 sm:max-w-[80vw]"
        >
          <SheetTitle className="sr-only">Detalles de la Operación</SheetTitle>
          <div className="h-full bg-white">
            <div className="space-y-8 p-8">
              <div className="py-12 text-center">
                <p className="text-gray-600">
                  No hay información de operación disponible
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Get primary operation unit (first one) for display
  const primaryUnit = operation.operationUnits[0];
  const projectName = primaryUnit?.unit.project.name || "Proyecto";

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent
        side="right"
        className="w-[80vw] overflow-y-auto rounded-l-xl p-0 sm:max-w-[80vw]"
      >
        <SheetTitle className="sr-only">
          Detalles de la Operación - {primaryUnit?.unit.project.name}
        </SheetTitle>
        <div className="min-h-screen bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-4">
              
              <div className="flex items-center gap-4">
                <img
                  src={projectInfo?.primaryImageUrl || "/image-hero.png"}
                  alt={projectInfo?.name || projectName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold">{projectInfo?.name || projectName}</h1>
                  <p className="text-gray-600">{projectInfo?.address || primaryUnit.unit.project.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-purple-600 font-medium">Firma boleto de compra</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-blue-500 rounded"></div>
                  <span className="text-sm font-medium">20% Pago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {/* TODO add view for multiple units operation */}
          <div className="flex">
            {/* Left Content */}
            <div className="flex-1 p-6">
              {/* Unit Info */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">
                  Unidad {primaryUnit?.unit.unitNumber}
                </h2>
                <p className="text-gray-600 mb-1">
                  Total: ${operation.totalAmount?.toLocaleString()}
                </p>
                
              </div>

              {/* Process Steps Table */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-4">Proceso de Compra</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-3 font-medium">Etapa</th>
                        <th className="text-left p-3 font-medium">Descripción</th>
                        <th className="text-left p-3 font-medium">Estado</th>
                        <th className="text-center p-3 font-medium w-24">Ver docs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedSteps().map((step: any) => {
                        // Format step name for display
                        const formatStepName = (stepName: string): string => {
                          switch (stepName.toLowerCase()) {
                            case 'document_generation':
                              return 'Generación de documentos';
                            case 'document_upload':
                              return 'Carga de documentos';
                            case 'professional_validation':
                              return 'Validación profesional';
                            case 'payment_confirmation':
                              return 'Confirmación de pago';
                            case 'operation_completion':
                              return 'Finalización de operación';
                            default:
                              // Fallback: replace underscores with spaces and capitalize
                              return stepName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          }
                        };

                        // Get step description based on step name
                        const getStepDescription = (stepName: string): string => {
                          switch (stepName.toLowerCase()) {
                            case 'document_generation':
                              return 'Generación y preparación de documentos legales';
                            case 'document_upload':
                              return 'Carga y validación de documentos requeridos';
                            case 'professional_validation':
                              return 'Revisión y validación por profesional asignado';
                            case 'payment_confirmation':
                              return `Confirmación de pago - $${operation.totalAmount?.toLocaleString()} ${operation.currency}`;
                            case 'operation_completion':
                              return 'Finalización y cierre de la operación';
                            default:
                              return 'Proceso administrativo';
                          }
                        };
                        
                        const isExpanded = expandedSteps.has(step.id);
                        
                        return (
                          <Fragment key={step.id}>
                            <tr className="border-t border-gray-200">
                              <td className="p-3 font-medium">{formatStepName(step.stepName)}</td>
                              <td className="p-3 text-gray-600">{getStepDescription(step.stepName)}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  step.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : step.status === 'in_progress'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {step.status === 'completed' ? 'Completo' : 
                                   step.status === 'in_progress' ? 'En progreso' : 'Pendiente'}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {step.status === 'completed' && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => toggleStepExpansion(step.id)}
                                    className="hover:bg-blue-50"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-blue-600" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-blue-600" />
                                    )}
                                  </Button>
                                )}
                              </td>
                            </tr>
                            {/* Expanded content row */}
                            {isExpanded && step.status === 'completed' && (
                              <tr className="border-t border-gray-100">
                                <td colSpan={4} className="p-0">
                                  <div className="p-4 bg-gray-50 border-l-4 border-l-blue-200">
                                    {/* Documents Section */}
                                    <div className="mb-4">
                                      <h4 className="font-medium text-sm mb-2 text-gray-800">Documentos</h4>
                                      {stepDocsCache[step.id] && stepDocsCache[step.id].length > 0 ? (
                                        <div className="space-y-2">
                                          {stepDocsCache[step.id]
                                            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                            .map((doc: any) => {
                                              const isOrganization = doc.uploader?.userRoles?.some((role: any) => role.organizationId);
                                              return (
                                              <div key={doc.id} className={`p-2 border rounded text-xs ${
                                                isOrganization ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'
                                              }`}>
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                                                      isOrganization ? 'bg-blue-500' : 'bg-green-500'
                                                    }`}>
                                                      {(doc.uploader?.name || doc.uploader?.email || 'U').substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                      <p className="font-medium">{doc.fileName}</p>
                                                      <div className="flex items-center gap-1">
                                                        <p className="text-gray-600">
                                                          {new Date(doc.createdAt).toLocaleDateString("es-UY")}
                                                        </p>
                                                        <span className="text-gray-600">
                                                          por {doc.uploader?.name || doc.uploader?.email || 'Usuario desconocido'}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-1">
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() => window.open(doc.fileUrl, '_blank')}
                                                      className="h-6 w-6 p-0"
                                                    >
                                                      <DownloadIcon className="h-3 w-3" />
                                                    </Button>
                                                    {doc.status === "validated" && (
                                                      <Badge className="bg-green-100 text-green-800 text-xs">Validado</Badge>
                                                    )}
                                                    {doc.status === "rejected" && (
                                                      <Badge className="bg-red-100 text-red-800 text-xs">Rechazado</Badge>
                                                    )}
                                                    {doc.status === "uploaded" && (
                                                      <Badge className="bg-blue-100 text-blue-800 text-xs">Subido</Badge>
                                                    )}
                                                  </div>
                                                </div>
                                                
                                                {/* Rejection Reason */}
                                                {doc.status === "rejected" && doc.notes && (
                                                  <div className="mt-1 p-1 bg-red-50 border border-red-200 rounded">
                                                    <p className="text-xs font-medium text-red-700">Motivo del rechazo:</p>
                                                    <p className="text-xs text-red-600">{doc.notes}</p>
                                                  </div>
                                                )}
                                              </div>
                                              );
                                            })}
                                        </div>
                                      ) : (
                                        <div className="p-2 bg-white border border-gray-200 rounded text-center">
                                          <p className="text-gray-600 text-xs">
                                            📄 No hay documentos disponibles para esta etapa
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Comments Section */}
                                    <div>
                                      <h4 className="font-medium text-sm mb-2 text-gray-800">Comentarios</h4>
                                      {stepCommentsCache[step.id] && stepCommentsCache[step.id].length > 0 ? (
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                          {stepCommentsCache[step.id]
                                            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                            .map((comment: any) => (
                                            <div key={comment.id} className="bg-white rounded p-2 border-l-2 border-l-blue-200 text-xs">
                                              <div className="flex items-center gap-1 mb-1">
                                                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                                                  <span className="text-xs font-medium text-blue-600">
                                                    {(comment.authorName || "U").charAt(0).toUpperCase()}
                                                  </span>
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                  {comment.authorName || "Usuario"}
                                                </span>
                                                <span className="text-gray-500">
                                                  {new Date(comment.createdAt).toLocaleDateString("es-UY")}
                                                </span>
                                              </div>
                                              <p className="text-gray-700 ml-5">{comment.content}</p>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="p-2 bg-white border border-gray-200 rounded text-center">
                                          <p className="text-gray-600 text-xs">
                                            💬 No hay comentarios para esta etapa
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>


              {/* Plans Section */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-4">Planos</h3>
                {(() => {
                  const availableFloorPlans = operation.operationUnits?.filter(
                    (opUnit: any) => opUnit.unit.floorPlanUrl
                  ) || [];
                  
                  if (availableFloorPlans.length === 0) {
                    return (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                        <p className="text-gray-600 text-sm">
                          📋 No hay planos disponibles para las unidades seleccionadas
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-3">
                      {availableFloorPlans.map((opUnit: any) => (
                        <div key={opUnit.unit.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <EyeIcon className="h-4 w-4 text-blue-600" />
                          <FileText className="h-4 w-4 text-blue-600" />
                          <button
                            onClick={() => window.open(opUnit.unit.floorPlanUrl, '_blank')}
                            className="text-blue-600 hover:text-blue-800 text-left flex-1"
                          >
                            Planos unidad {opUnit.unit.unitNumber}
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Upload Section */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Subir archivo</h3>
                {getCurrentStep() ? (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      📋 Etapa activa: <strong>{getCurrentStep()?.stepName}</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Los documentos se subirán para esta etapa
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                      ⏸️ No hay etapas activas para subir documentos
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Solo se pueden subir documentos cuando una etapa está en progreso
                    </p>
                  </div>
                )}
                
                {/* Success Message */}
                {uploadSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">{uploadSuccess}</p>
                  </div>
                )}
                
                <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  getCurrentStep() ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                }`}>
                  <p className="text-gray-600 mb-4">
                    {getCurrentStep() 
                      ? 'Arrastra el archivo o selecciona desde tu dispositivo'
                      : 'No se pueden subir archivos en este momento'
                    }
                  </p>
                  <input
                    type="file"
                    id="file-upload-user"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    disabled={uploading || !getCurrentStep() || !canUploadDocument()}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload-user')?.click()}
                    disabled={uploading || !getCurrentStep() || !canUploadDocument()}
                  >
                    {uploading ? "Subiendo..." : 
                     !getCurrentStep() ? "Sin etapas activas" :
                     !canUploadDocument() ? "Documentos pendientes" : "Cargar archivo"}
                  </Button>
                </div>

                {/* Document History */}
                {stepDocuments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Documentos subidos</h4>
                    <div className="space-y-2">
                      {stepDocuments
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((doc: any) => {
                          const isOrganization = doc.uploader?.userRoles?.some((role: any) => role.organizationId);
                          return (
                        <div key={doc.id} className={`p-3 border rounded-lg ${
                          isOrganization ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                isOrganization ? 'bg-blue-500' : 'bg-green-500'
                              }`}>
                                {(doc.uploader?.name || doc.uploader?.email || 'U').substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{doc.fileName}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-gray-600">
                                    {new Date(doc.createdAt).toLocaleDateString("es-UY")}
                                  </p>
                                  <span className="text-xs text-gray-600">
                                    por {doc.uploader?.name || doc.uploader?.email || 'Usuario desconocido'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.fileUrl, '_blank')}
                            >
                              <DownloadIcon className="h-4 w-4" />
                            </Button>
                            {doc.status === "validated" && (
                              <Badge className="bg-green-100 text-green-800">Validado</Badge>
                            )}
                            {doc.status === "rejected" && (
                              <Badge className="bg-red-100 text-red-800">Rechazado</Badge>
                            )}
                            {doc.status === "uploaded" && (
                              <Badge className="bg-blue-100 text-blue-800">Subido</Badge>
                            )}
                          </div>
                          </div>
                          
                          {/* Rejection Reason */}
                          {doc.status === "rejected" && doc.notes && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                              <p className="text-xs font-medium text-red-700 mb-1">Motivo del rechazo:</p>
                              <p className="text-xs text-red-600">{doc.notes}</p>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Comments */}
            <div className="w-80 border-l bg-gray-50 p-6">
              <h3 className="font-semibold text-lg mb-4">Anotaciones</h3>
              
              {/* Comments List */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {stepComments.length > 0 ? (
                  stepComments
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((comment: any) => (
                    <div key={comment.id} className="bg-white rounded-lg p-4 border-l-4 border-l-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {(comment.authorName || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {comment.authorName || "Usuario"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString("es-UY")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 ml-8">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm italic">
                    No hay anotaciones aún
                  </div>
                )}
              </div>

              {/* Add Comment */}
              <div className="space-y-3">
                {!getCurrentStep() && (
                  <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800 font-medium mb-1">⚠️ No se pueden agregar comentarios</p>
                    <p className="text-xs text-orange-600">
                      Solo se pueden agregar comentarios cuando hay una etapa activa en progreso.
                    </p>
                  </div>
                )}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    uploading ? "Subiendo archivo..." : 
                    !getCurrentStep() ? "No hay etapa activa para comentar..." : 
                    "Agregar anotación..."
                  }
                  className="w-full p-3 border rounded-lg text-sm min-h-[100px] resize-none"
                  disabled={uploading || !getCurrentStep()}
                />
                <Button
                  onClick={handleAddStepComment}
                  disabled={!newComment.trim() || isAddingComment || uploading || !getCurrentStep()}
                  className="w-full"
                >
                  <SendIcon className="h-4 w-4 mr-2" />
                  {isAddingComment ? "Enviando..." : 
                   !getCurrentStep() ? "Sin etapa activa" : "Enviar"}
                </Button>
              </div>

            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}