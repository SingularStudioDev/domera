// =============================================================================
// DOCUMENTS PAGE - OPERATIONS DASHBOARD
// Document management interface for active operations
// =============================================================================

'use client';

import { useActiveOperation } from '@/hooks/useActiveOperation';
import { useDocuments } from '@/hooks/useDocuments';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { DocumentType } from '@prisma/client';

export default function OperationDocumentsPage() {
  const { data: session, status } = useSession();
  const { activeOperation, hasActiveOperation, loading: operationLoading } = useActiveOperation();
  const {
    documents,
    requiredDocuments,
    loading: documentsLoading,
    error,
    uploading,
    handleUploadDocument,
    isDocumentCompleted,
    isDocumentPending,
    getCompletionProgress
  } = useDocuments(activeOperation?.id);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | ''>('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Authentication check
  if (status === 'loading' || operationLoading) {
    return <div style={{ padding: '20px' }}>Cargando...</div>;
  }

  if (!session) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Acceso Denegado</h1>
        <p>Debes iniciar sesión para gestionar documentos.</p>
        <a href="/login">Iniciar Sesión</a>
      </div>
    );
  }

  if (!hasActiveOperation) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Documentos de Operación</h1>
        <div style={{
          border: '1px solid #fcc',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#fee',
          textAlign: 'center'
        }}>
          <p>❌ No tienes una operación activa.</p>
          <p>Debes iniciar una operación para gestionar documentos.</p>
          <a href="/operations" style={{ 
            color: '#007bff', 
            textDecoration: 'underline' 
          }}>
            Ir a Operaciones
          </a>
        </div>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocType || !documentTitle.trim()) {
      setUploadError('Completa todos los campos requeridos');
      return;
    }

    const success = await handleUploadDocument(
      selectedFile,
      selectedDocType as DocumentType,
      documentTitle.trim(),
      documentDescription.trim() || undefined
    );

    if (success) {
      // Reset form
      setSelectedFile(null);
      setSelectedDocType('');
      setDocumentTitle('');
      setDocumentDescription('');
      setUploadError(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const getDocumentStatusIcon = (docType: DocumentType) => {
    if (isDocumentCompleted(docType)) return '✅';
    if (isDocumentPending(docType)) return '⏳';
    return '⭕';
  };

  const getDocumentStatusText = (docType: DocumentType) => {
    if (isDocumentCompleted(docType)) return 'Validado';
    if (isDocumentPending(docType)) return 'Pendiente validación';
    return 'No subido';
  };

  if (documentsLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Cargando documentos...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1>Documentos de Operación</h1>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px',
          marginTop: '10px'
        }}>
          <span>Operación: #{activeOperation!.id.slice(0, 8)}</span>
          <span>Estado: {activeOperation!.status}</span>
          <div style={{
            backgroundColor: '#e9ecef',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '14px'
          }}>
            Progreso: {getCompletionProgress()}%
          </div>
        </div>
      </header>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Required Documents Status */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Documentos Requeridos</h2>
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {requiredDocuments.map((reqDoc, index) => (
            <div
              key={reqDoc.type}
              style={{
                padding: '15px',
                borderBottom: index < requiredDocuments.length - 1 ? '1px solid #eee' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: isDocumentCompleted(reqDoc.type) ? '#f0f8f0' : '#fff'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {getDocumentStatusIcon(reqDoc.type)} {reqDoc.type.replace('_', ' ')}
                  {reqDoc.required && <span style={{ color: 'red' }}> *</span>}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {reqDoc.description}
                </div>
              </div>
              <div style={{
                fontSize: '14px',
                padding: '5px 10px',
                borderRadius: '4px',
                backgroundColor: isDocumentCompleted(reqDoc.type) ? '#d4edda' : 
                                isDocumentPending(reqDoc.type) ? '#fff3cd' : '#f8d7da',
                color: isDocumentCompleted(reqDoc.type) ? '#155724' : 
                       isDocumentPending(reqDoc.type) ? '#856404' : '#721c24'
              }}>
                {getDocumentStatusText(reqDoc.type)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upload New Document */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Subir Documento</h2>
        <div style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          {uploadError && (
            <div style={{
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              padding: '10px',
              marginBottom: '15px',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              ❌ {uploadError}
            </div>
          )}

          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tipo de Documento *
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                <option value="">Seleccionar tipo...</option>
                {requiredDocuments.map(reqDoc => (
                  <option key={reqDoc.type} value={reqDoc.type}>
                    {reqDoc.type.replace('_', ' ')} {reqDoc.required ? '*' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Título del Documento *
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Ej: Cédula de Identidad - Juan Pérez"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Descripción (opcional)
              </label>
              <textarea
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                placeholder="Descripción adicional del documento..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Archivo *
              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                Formatos permitidos: PDF, JPG, PNG, DOC, DOCX. Máximo 10MB.
              </small>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !selectedDocType || !documentTitle.trim()}
              style={{
                backgroundColor: uploading ? '#6c757d' : '#007bff',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '4px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                marginTop: '10px'
              }}
            >
              {uploading ? 'Subiendo...' : 'Subir Documento'}
            </button>
          </div>
        </div>
      </section>

      {/* Existing Documents */}
      <section>
        <h2>Documentos Subidos ({documents.length})</h2>
        {documents.length === 0 ? (
          <div style={{
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666'
          }}>
            No has subido documentos aún.
          </div>
        ) : (
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {documents.map((doc, index) => (
              <div
                key={doc.id}
                style={{
                  padding: '15px',
                  borderBottom: index < documents.length - 1 ? '1px solid #eee' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {doc.title}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '3px' }}>
                    Tipo: {doc.documentType.replace('_', ' ')} | Archivo: {doc.fileName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    Subido: {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{
                  fontSize: '14px',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  backgroundColor: doc.status === 'validated' ? '#d4edda' : 
                                  doc.status === 'uploaded' ? '#fff3cd' : '#f8d7da',
                  color: doc.status === 'validated' ? '#155724' : 
                         doc.status === 'uploaded' ? '#856404' : '#721c24'
                }}>
                  {doc.status === 'validated' ? 'Validado' : 
                   doc.status === 'uploaded' ? 'Pendiente' : 'Rechazado'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TODO: Frontend developers should implement:
          - File upload integration with storage service (Supabase Storage, AWS S3, etc.)
          - Document preview functionality
          - Progress bars for upload
          - Drag & drop file upload interface
          - Document version management
          - Professional validation interface
          - Real-time status updates
          - Mobile-responsive design
      */}
    </div>
  );
}