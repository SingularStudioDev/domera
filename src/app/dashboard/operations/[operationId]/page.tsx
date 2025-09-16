"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XIcon,
  FileTextIcon,
  UploadIcon,
  DownloadIcon,
  SendIcon,
  EyeIcon,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { 
  getOperationByIdAction, 
  updateOperationStepAction,
  addStepCommentAction,
  getStepCommentsAction 
} from "@/lib/actions/operations";
import { 
  getRequiredDocumentsForStepAction,
  uploadDocumentAction,
  validateDocumentAction 
} from "@/lib/actions/documents";

export default function OperationDetailPage() {
  const params = useParams();
  const operationId = params.operationId as string;
  
  const [operation, setOperation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);
  const [stepDocuments, setStepDocuments] = useState<any[]>([]);
  const [stepComments, setStepComments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"workflow" | "buyer">("workflow");
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [stepDocsCache, setStepDocsCache] = useState<Record<string, any[]>>({});
  const [stepCommentsCache, setStepCommentsCache] = useState<Record<string, any[]>>({});
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  

  useEffect(() => {
    const fetchOperation = async () => {
      try {
        setLoading(true);
        
        const result = await getOperationByIdAction(operationId);
        if (result.success && result.data) {
          setOperation(result.data);
        } else {
          setError(result.error || "Error cargando operación");
        }
      } catch (err) {
        setError("Error inesperado cargando operación");
        console.error("Error fetching operation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperation();
  }, [operationId]);

  // Load documents and comments when operation is loaded
  useEffect(() => {
    if (operation) {
      loadCurrentStepDocuments();
      loadStepCommentsData();
    }
  }, [operation]);


  const handleStepValidation = async (stepId: string, newStatus: "pending" | "in_progress" | "completed") => {
    try {
      // If trying to complete a step, check if all required documents are validated
      if (newStatus === "completed" && !areDocumentsReadyForStepCompletion()) {
        alert("No se puede completar la etapa: Todos los documentos requeridos deben estar validados primero.");
        return;
      }
      
      // Add confirmation dialog for step completion
      if (newStatus === "completed") {
        const currentStep = getCurrentStep();
        const stepName = currentStep?.stepName || "esta etapa";
        
        const confirmed = confirm(
          `¿Estás seguro de que deseas completar "${stepName}"?\n\n` +
          `Esta acción avanzará la operación a la siguiente etapa y no se puede deshacer fácilmente.\n\n` +
          `Confirma que todos los documentos han sido validados y la etapa está lista para finalizar.`
        );
        
        if (!confirmed) {
          return;
        }
      }

      const result = await updateOperationStepAction(operationId, stepId, newStatus);
      
      if (result.success) {
        // Refresh the operation data
        const refreshResult = await getOperationByIdAction(operationId);
        if (refreshResult.success && refreshResult.data) {
          setOperation(refreshResult.data);
        }
        // Also refresh documents to get latest status
        await refreshDocuments();
      } else {
        alert("Error: " + (result.error || "Error actualizando etapa"));
      }
    } catch (error) {
      console.error("Error updating step:", error);
      alert("Error inesperado actualizando etapa");
    }
  };

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
    if (!currentStep) {
      setStepDocuments([]);
      return;
    }
    
    try {
      setLoadingDocuments(true);
      const result = await getRequiredDocumentsForStepAction(operationId, currentStep.id);
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
      const docsResult = await getRequiredDocumentsForStepAction(operationId, stepId);
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

  // Refresh documents after upload or validation
  const refreshDocuments = async () => {
    await loadCurrentStepDocuments();
    await loadStepCommentsData();
    // Also refresh operation data to get updated status
    const operationResult = await getOperationByIdAction(operationId);
    if (operationResult.success && operationResult.data) {
      setOperation(operationResult.data);
    }
  };

  // Check if user can upload more documents
  const canUploadDocument = () => {
    const currentStep = getCurrentStep();
    if (!currentStep) return false;
    
    // Check if there are any PENDING/UPLOADED documents (not validated or rejected)
    // Organization can upload documents, but should validate existing ones first
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
        operationId,
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

  // Handle document validation
  const handleValidateDocument = async (documentId: string, status: "validated" | "rejected", notes?: string) => {
    try {
      setValidating(documentId);
      
      const result = await validateDocumentAction(documentId, status, notes);
      
      if (result.success) {
        await refreshDocuments();
      } else {
        alert("Error: " + (result.error || "Error validando documento"));
      }
    } catch (error) {
      console.error("Error validating document:", error);
      alert("Error inesperado validando documento");
    } finally {
      setValidating(null);
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

  // Check if all required documents are validated for step completion
  const areDocumentsReadyForStepCompletion = () => {
    const currentStep = getCurrentStep();
    if (!currentStep || !stepDocuments || stepDocuments.length === 0) return false;
    
    // All documents should already be filtered by stepId from the API
    // Check if there are any pending/uploaded documents (not validated or rejected)
    const pendingDocs = stepDocuments.filter((doc: any) => 
      doc.status === "uploaded" || doc.status === "pending"
    );
    
    // Cannot complete step if there are pending documents
    if (pendingDocs.length > 0) return false;
    
    // For step completion, we need at least one validated document
    const validatedDocs = stepDocuments.filter((doc: any) => doc.status === "validated");
    return validatedDocs.length > 0;
  };



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/sales"
            className="text-primaryColor hover:text-primaryColor-hover flex h-10 w-10 items-center justify-center transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="dashboard-title">Cargando operación...</h1>
        </div>
      </div>
    );
  }

  if (error || !operation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/sales"
            className="text-primaryColor hover:text-primaryColor-hover flex h-10 w-10 items-center justify-center transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="dashboard-title">Error</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="mb-2 text-red-600">❌ {error || "Operación no encontrada"}</p>
            <Link href="/dashboard/sales" className="text-blue-600 hover:underline">
              Volver a ventas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const projectInfo = operation.operationUnits?.[0]?.unit?.project;
  const clientInfo = operation.user;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/sales"
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon   className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-4">
            <img
              src={projectInfo?.images[0].url || "/image-hero.png"}
              alt={projectInfo?.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">{`${clientInfo?.firsName} ${clientInfo?.lastName}`}</h1>
              <p className="text-gray-600">{projectInfo?.name}</p>
              <p className="text-sm text-gray-500">{projectInfo?.address}</p>
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

      {/* Tab Navigation */}
      <div className="border-b bg-gray-50">
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("workflow")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "workflow"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📋 Proceso y Documentos
            </button>
            <button
              onClick={() => setActiveTab("buyer")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "buyer"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              👤 Datos del Comprador
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === "workflow" ? (
        <div className="flex">
        {/* Left Content */}
        <div className="flex-1 p-6">
          {/* Unit Info */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">
              Unidad {operation.operationUnits?.[0]?.unit?.unitNumber}
            </h2>
            <p className="text-primaryColor text-xl font-semibold mb-1">
              Total: ${operation.totalAmount?.toLocaleString()}
            </p>
            
          </div>

          {/* Payment Schedule Table */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 font-medium">Etapa</th>
                    <th className="text-left p-3 font-medium">Estado</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedSteps().map((step: any) => {
                    const isExpanded = expandedSteps.has(step.id);
                    
                    return (
                      <Fragment key={step.id}>
                        <tr className="border-t border-gray-200">
                          <td className="p-3 font-medium">{step.stepName}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              step.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : step.status === 'in_progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {step.status === 'completed' ? 'completo' : 
                               step.status === 'in_progress' ? 'En progreso' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="p-3">
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
                            <td colSpan={3} className="p-0">
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
                                                  {doc.uploader?.firstName && doc.uploader?.lastName 
                                                        ? `${doc.uploader.firstName.charAt(0)}${doc.uploader.lastName.charAt(0)}`.toUpperCase()
                                                        : (doc.uploader?.email || 'U').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                  <p className="font-medium">{doc.fileName}</p>
                                                  <div className="flex items-center gap-1">
                                                    <p className="text-gray-600">
                                                      {new Date(doc.createdAt).toLocaleDateString("es-UY")}
                                                    </p>
                                                    <span className="text-gray-600">
                                                      por {doc.uploader?.firstName && doc.uploader?.lastName 
                                                        ? `${doc.uploader.firstName} ${doc.uploader.lastName}`
                                                        : doc.uploader?.email || 'Usuario desconocido'}
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
                    <div key={opUnit.unit.id} className="flex items-center cursor-pointer gap-3 p-3 border rounded-lg hover:bg-gray-50">
                      <EyeIcon className="h-4 w-4 text-blue-600" />
                      <FileTextIcon className="h-4 w-4 text-blue-600" />
                      <button
                        onClick={() => window.open(opUnit.unit.floorPlanUrl, '_blank')}
                        className="text-blue-600 hover:text-blue-800 text-left cursor-pointer flex-1"
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
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                disabled={uploading || !getCurrentStep()}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
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
                            {doc.uploader?.firstName && doc.uploader?.lastName 
                                                        ? `${doc.uploader.firstName.charAt(0)}${doc.uploader.lastName.charAt(0)}`.toUpperCase()
                                                        : (doc.uploader?.email || 'U').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{doc.fileName}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-600">
                                {new Date(doc.createdAt).toLocaleDateString("es-UY")}
                              </p>
                              <span className="text-xs text-gray-600">
                                por {doc.uploader?.firstName && doc.uploader?.lastName 
                                                        ? `${doc.uploader.firstName} ${doc.uploader.lastName}`
                                                        : doc.uploader?.email || 'Usuario desconocido'}
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
                        {doc.status === "uploaded" && (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleValidateDocument(doc.id, "validated")}
                              disabled={validating === doc.id || uploading}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const notes = prompt("Motivo del rechazo:");
                                if (notes) {
                                  handleValidateDocument(doc.id, "rejected", notes);
                                }
                              }}
                              disabled={validating === doc.id || uploading}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {doc.status === "validated" && (
                          <Badge className="bg-green-100 text-green-800">Validado</Badge>
                        )}
                        {doc.status === "rejected" && (
                          <Badge className="bg-red-100 text-red-800">Rechazado</Badge>
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

          {/* Step Management Actions */}
          {(() => {
            const currentStep = getCurrentStep(); // in_progress step
            const nextPendingStep = getSortedSteps().find(step => step.status === "pending");
            
            if (currentStep || nextPendingStep) {
              return (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Gestión de Etapas</h4>
                  
                  {/* Show current in_progress step */}
                  {currentStep && (
                    <div className="mb-4">
                      <p className="text-sm text-blue-800 mb-2">
                        📋 Etapa activa: <strong>{currentStep.stepName}</strong>
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleStepValidation(currentStep.id, "completed")}
                          className="bg-green-600 hover:bg-green-700 font-semibold"
                          disabled={!areDocumentsReadyForStepCompletion() || uploading}
                        >
                          ✅ Completar Etapa
                        </Button>
                      </div>
                      {!areDocumentsReadyForStepCompletion() && (
                        <p className="text-sm text-gray-500 mt-2">
                          Se requiere validar todos los documentos antes de completar la etapa
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Show next pending step */}
                  {!currentStep && nextPendingStep && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        ⏳ Siguiente etapa: <strong>{nextPendingStep.stepName}</strong>
                      </p>
                      <Button 
                        onClick={() => handleStepValidation(nextPendingStep.id, "in_progress")}
                        variant="outline"
                      >
                        Iniciar Etapa
                      </Button>
                    </div>
                  )}
                  
                  {currentStep && nextPendingStep && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        Siguiente: {nextPendingStep.stepName}
                      </p>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Right Sidebar - Comments */}
        <div className="w-80 border-l bg-gray-50 p-6">
          <h3 className="font-semibold text-lg mb-4">Anotaciones</h3>

          {/* Add Comment */}
          <div className="space-y-3 mb-5 ">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={uploading ? "Subiendo archivo..." : "Agregar anotación..."}
              className="w-full p-3 border rounded-lg text-sm min-h-[100px] resize-none"
              disabled={uploading}
            />
            <Button
              onClick={handleAddStepComment}
              disabled={!newComment.trim() || isAddingComment || uploading}
              className="w-full"
            >
              <SendIcon className="h-4 w-4 mr-2" />
              {isAddingComment ? "Enviando..." : "Enviar"}
            </Button>
          </div>
          
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

          

        
        </div>
      </div>
      ) : (
        // Buyer Data Tab
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Personal Information */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">👤 Información Personal</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <p className="text-gray-900">{clientInfo?.firstName || "No especificado"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                      <p className="text-gray-900">{clientInfo?.lastName || "No especificado"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{clientInfo?.email || "No especificado"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <p className="text-gray-900">{clientInfo?.phone || "No especificado"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                      <p className="text-gray-900">{clientInfo?.country || "No especificado"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <p className="text-gray-900">{clientInfo?.address || "No especificado"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                      <p className="text-gray-900">{clientInfo?.documentType || "No especificado"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número de Documento</label>
                      <p className="text-gray-900">{clientInfo?.documentNumber || "No especificado"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operation Details */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">📋 Detalles de la Operación</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                    <p className="text-gray-900">
                      {operation.startedAt ? new Date(operation.startedAt).toLocaleDateString("es-UY") : "No especificado"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Total</label>
                    <p className="text-xl font-semibold text-green-600">
                      ${operation.totalAmount?.toLocaleString()} {operation.currency}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      operation.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : operation.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {operation.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                    <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded">
                      {operation.notes || "Sin notas adicionales"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Units Information */}
              <div className="lg:col-span-2 bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">🏢 Unidades Seleccionadas</h3>
                <div className="space-y-4">
                  {operation.operationUnits?.map((opUnit: any) => (
                    <div key={opUnit.id} className="border rounded p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                          <p className="text-gray-900 font-semibold">{opUnit.unit.unitNumber}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Precio en Reserva</label>
                          <p className="text-gray-900">${opUnit.priceAtReservation?.toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                          <p className="text-gray-900 capitalize">{opUnit.unit.unitType?.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dormitorios</label>
                          <p className="text-gray-900">{opUnit.unit.bedrooms || 0}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
                          <p className="text-gray-900">{opUnit.unit.bathrooms || 0}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Área Total</label>
                          <p className="text-gray-900">{opUnit.unit.totalArea || "No especificado"} m²</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}