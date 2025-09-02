'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, ImageIcon, Plus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/utils/utils';
import { uploadProjectImages, validateImageFiles, deleteImages } from '@/lib/actions/storage';

// =============================================================================
// TYPES
// =============================================================================

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  uploadedUrl?: string;
  uploadedPath?: string;
  error?: string;
}

interface BatchImageUploadProps {
  value: string[]; // URLs of uploaded images
  onChange: (urls: string[]) => void;
  onPathsChange?: (paths: string[]) => void; // For tracking storage paths
  maxImages?: number;
  projectId?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  aspectRatio?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const BatchImageUpload: React.FC<BatchImageUploadProps> = ({
  value = [],
  onChange,
  onPathsChange,
  maxImages = 20,
  projectId,
  placeholder = 'Agregar imágenes del proyecto',
  className,
  disabled = false,
  aspectRatio = 'aspect-video',
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const createImageFile = (file: File): ImageFile => ({
    id: generateId(),
    file,
    preview: URL.createObjectURL(file),
    status: 'pending'
  });

  const canAddMore = images.length + value.length < maxImages;

  // =============================================================================
  // FILE HANDLING
  // =============================================================================

  const handleFileSelect = useCallback((files: FileList | File[]) => {
    if (disabled || isUploading) return;

    const fileArray = Array.from(files);
    const { valid, invalid } = validateImageFiles(fileArray);

    // Show validation errors
    if (invalid.length > 0) {
      const errors = invalid.map(item => `${item.file.name}: ${item.reason}`);
      setUploadError(`Archivos inválidos:\n${errors.join('\n')}`);
      return;
    }

    // Check total limit
    const totalImages = images.length + value.length + valid.length;
    if (totalImages > maxImages) {
      setUploadError(`Se excede el límite de ${maxImages} imágenes`);
      return;
    }

    // Add new images to pending list
    const newImages = valid.map(createImageFile);
    setImages(prev => [...prev, ...newImages]);
    setUploadError(null);
  }, [disabled, isUploading, images.length, value.length, maxImages]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [disabled, isUploading, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setDragActive(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  // =============================================================================
  // IMAGE MANAGEMENT
  // =============================================================================

  const removeImage = useCallback((imageId: string) => {
    if (disabled || isUploading) return;

    setImages(prev => {
      const updatedImages = prev.filter(img => img.id !== imageId);
      // Cleanup preview URL
      const removedImage = prev.find(img => img.id === imageId);
      if (removedImage) {
        URL.revokeObjectURL(removedImage.preview);
      }
      return updatedImages;
    });
  }, [disabled, isUploading]);

  const removeUploadedImage = useCallback(async (index: number) => {
    if (disabled || isUploading) return;

    const newUrls = [...value];
    const removedUrl = newUrls.splice(index, 1)[0];
    
    // If we have path tracking, delete from storage
    // For now, we'll just update the state
    // TODO: Implement proper cleanup when we have path tracking
    
    onChange(newUrls);
  }, [disabled, isUploading, value, onChange]);

  // =============================================================================
  // BATCH UPLOAD
  // =============================================================================

  const handleBatchUpload = useCallback(async () => {
    if (images.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadError(null);

    // Update all images to uploading status
    setImages(prev => prev.map(img => ({ ...img, status: 'uploading' as const })));

    try {
      // Create FormData with images
      const formData = new FormData();
      images.forEach((img, index) => {
        formData.append(`image-${index}`, img.file);
      });

      // Upload images via server action
      const result = await uploadProjectImages(formData, projectId);

      if (result.success && result.images) {
        // Update successful uploads
        const uploadedUrls = result.images.map(img => img.url);
        const uploadedPaths = result.images.map(img => img.path);
        
        onChange([...value, ...uploadedUrls]);
        if (onPathsChange) {
          // Assuming we have a way to track existing paths
          onPathsChange([...uploadedPaths]);
        }

        // Update image states to uploaded
        setImages(prev => prev.map((img, index) => ({
          ...img,
          status: 'uploaded' as const,
          uploadedUrl: result.images![index]?.url,
          uploadedPath: result.images![index]?.path
        })));

        // Clear uploaded images after a short delay
        setTimeout(() => {
          setImages([]);
        }, 1000);

      } else {
        // Handle upload errors
        setUploadError(result.error || 'Error desconocido en la subida');
        
        // Update image states to error
        setImages(prev => prev.map(img => ({
          ...img,
          status: 'error' as const,
          error: result.error
        })));

        // If there were specific file failures
        if (result.failedUploads) {
          const failureMap = new Map(result.failedUploads.map(f => [f.fileName, f.error]));
          setImages(prev => prev.map(img => ({
            ...img,
            status: 'error' as const,
            error: failureMap.get(img.file.name) || 'Error desconocido'
          })));
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Error interno del servidor');
      
      // Update all images to error status
      setImages(prev => prev.map(img => ({
        ...img,
        status: 'error' as const,
        error: 'Error de conexión'
      })));
    } finally {
      setIsUploading(false);
    }
  }, [images, isUploading, value, onChange, onPathsChange, projectId]);

  // =============================================================================
  // RENDER STATUS ICON
  // =============================================================================

  const renderStatusIcon = (status: ImageFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'uploaded':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Already uploaded images */}
      {value.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Imágenes subidas ({value.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((url, index) => (
              <div key={`uploaded-${index}`} className={cn('relative group', aspectRatio)}>
                <div className="absolute inset-0 rounded-lg overflow-hidden border">
                  <img
                    src={url}
                    alt={`Imagen subida ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending images */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Imágenes pendientes ({images.length})
            </h4>
            {images.length > 0 && !isUploading && (
              <button
                type="button"
                onClick={handleBatchUpload}
                disabled={disabled}
                className="px-4 py-2 bg-primaryColor text-white text-sm rounded-lg hover:bg-primaryColor/90 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Subir {images.length} imagen{images.length > 1 ? 'es' : ''}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className={cn('relative group', aspectRatio)}>
                <div className={cn(
                  'absolute inset-0 rounded-lg overflow-hidden border-2',
                  img.status === 'error' && 'border-red-300',
                  img.status === 'uploaded' && 'border-green-300',
                  img.status === 'uploading' && 'border-blue-300',
                  img.status === 'pending' && 'border-gray-300'
                )}>
                  <img
                    src={img.preview}
                    alt={`Preview ${img.file.name}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                
                {!disabled && img.status !== 'uploading' && (
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                {/* Status indicator */}
                <div className={cn(
                  'absolute bottom-2 left-2 text-white text-xs px-2 py-1 rounded flex items-center gap-1',
                  img.status === 'pending' && 'bg-gray-500',
                  img.status === 'uploading' && 'bg-blue-500',
                  img.status === 'uploaded' && 'bg-green-500',
                  img.status === 'error' && 'bg-red-500'
                )}>
                  {renderStatusIcon(img.status)}
                  {img.status === 'pending' && 'Pendiente'}
                  {img.status === 'uploading' && 'Subiendo...'}
                  {img.status === 'uploaded' && 'Subida'}
                  {img.status === 'error' && 'Error'}
                </div>

                {/* Error tooltip */}
                {img.status === 'error' && img.error && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs p-1 rounded max-w-32 opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload area */}
      {canAddMore && !isUploading && (
        <div
          className={cn(
            'relative w-full border-2 border-dashed rounded-lg transition-colors p-8 cursor-pointer',
            dragActive && !disabled && 'border-primaryColor bg-primaryColor/5',
            !dragActive && 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed',
            uploadError && 'border-red-300'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center text-gray-500">
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
              {value.length === 0 && images.length === 0 ? (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              ) : (
                <Plus className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            <p className="text-lg font-medium mb-2">
              {value.length === 0 && images.length === 0 ? placeholder : 'Agregar más imágenes'}
            </p>
            
            <p className="text-sm text-center mb-4">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>
            
            <div className="text-xs text-gray-400 text-center">
              <p>JPG, PNG, WebP. Máximo 10MB por imagen</p>
              <p>{value.length + images.length} / {maxImages} imágenes</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
            onChange={handleInputChange}
            disabled={disabled}
            multiple
            className="hidden"
          />
        </div>
      )}

      {/* Limit reached message */}
      {!canAddMore && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Límite de {maxImages} imágenes alcanzado
          </p>
        </div>
      )}

      {/* Global upload progress */}
      {isUploading && (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-sm">Subiendo {images.length} imagen{images.length > 1 ? 'es' : ''}...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm font-medium">Error en la subida</p>
          </div>
          <p className="text-sm text-red-600 mt-1 whitespace-pre-line">{uploadError}</p>
        </div>
      )}
    </div>
  );
};