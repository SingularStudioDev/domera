'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, ImageIcon, Plus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/utils/utils';
import { useBatchImageUpload } from '@/hooks/useBatchImageUpload';

// =============================================================================
// TYPES
// =============================================================================

interface OptimizedImageUploadProps {
  value: string[]; // URLs of uploaded images
  onChange: (urls: string[]) => void;
  onPathsChange?: (paths: string[]) => void;
  entityId?: string;
  entityType: 'project' | 'organization' | 'unit';
  maxImages?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  aspectRatio?: string;
  showUploadButton?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const OptimizedImageUpload: React.FC<OptimizedImageUploadProps> = ({
  value = [],
  onChange,
  onPathsChange,
  entityId,
  entityType,
  maxImages = 20,
  placeholder = 'Agregar imágenes',
  className,
  disabled = false,
  aspectRatio = 'aspect-video',
  showUploadButton = true
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [storedPaths, setStoredPaths] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use batch upload hook
  const {
    images,
    isUploading,
    uploadError,
    canAddMore,
    addImages,
    removeImage,
    uploadImages,
    clearError
  } = useBatchImageUpload({
    maxImages: maxImages - value.length,
    onUploadComplete: (urls, paths) => {
      onChange([...value, ...urls]);
      if (onPathsChange) {
        onPathsChange([...storedPaths, ...paths]);
        setStoredPaths(prev => [...prev, ...paths]);
      }
    },
    onError: (error) => {
      console.error('Upload error:', error);
    }
  });

  // =============================================================================
  // FILE HANDLING
  // =============================================================================

  const handleFileSelect = useCallback((files: FileList | File[]) => {
    if (disabled || isUploading) return;
    addImages(Array.from(files));
  }, [disabled, isUploading, addImages]);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  // =============================================================================
  // UPLOAD HANDLING
  // =============================================================================

  const handleUpload = useCallback(async () => {
    if (images.length === 0) return;
    await uploadImages(entityType, entityId);
  }, [images.length, uploadImages, entityType, entityId]);

  // =============================================================================
  // EXISTING IMAGE MANAGEMENT
  // =============================================================================

  const removeExistingImage = useCallback((index: number) => {
    if (disabled || isUploading) return;

    const newUrls = [...value];
    newUrls.splice(index, 1);
    onChange(newUrls);

    // Also remove from paths if tracking
    if (onPathsChange && storedPaths.length > index) {
      const newPaths = [...storedPaths];
      newPaths.splice(index, 1);
      setStoredPaths(newPaths);
      onPathsChange(newPaths);
    }
  }, [disabled, isUploading, value, onChange, onPathsChange, storedPaths]);

  // =============================================================================
  // STATUS ICON HELPER
  // =============================================================================

  const renderStatusIcon = (status: string) => {
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

  // Calculate total capacity
  const totalImages = value.length + images.length;
  const canAddMoreImages = totalImages < maxImages;

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Existing uploaded images */}
      {value.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Imágenes guardadas ({value.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((url, index) => (
              <div key={`uploaded-${index}`} className={cn('relative group', aspectRatio)}>
                <div className="absolute inset-0 rounded-lg overflow-hidden border">
                  <img
                    src={url}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                
                {!disabled && !isUploading && (
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
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
            {showUploadButton && images.length > 0 && !isUploading && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={disabled}
                className="px-4 py-2 bg-primaryColor text-white text-sm rounded-lg hover:bg-primaryColor/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
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
                  img.status === 'uploading' && 'border-blue-300 animate-pulse',
                  img.status === 'pending' && 'border-gray-300'
                )}>
                  <img
                    src={img.preview}
                    alt={`Preview ${img.file.name}`}
                    className="w-full h-full object-cover"
                  />
                  {img.status === 'uploading' && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  )}
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
                  {img.status === 'pending' && 'Listo'}
                  {img.status === 'uploading' && 'Subiendo...'}
                  {img.status === 'uploaded' && 'Subida'}
                  {img.status === 'error' && 'Error'}
                </div>

                {/* Error message */}
                {img.status === 'error' && img.error && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs p-1 rounded max-w-32 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    {img.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload area */}
      {canAddMoreImages && !isUploading && (
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
              {totalImages === 0 ? (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              ) : (
                <Plus className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            <p className="text-lg font-medium mb-2">
              {totalImages === 0 ? placeholder : 'Agregar más imágenes'}
            </p>
            
            <p className="text-sm text-center mb-4">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>
            
            <div className="text-xs text-gray-400 text-center">
              <p>JPG, PNG, WebP, AVIF. Máximo 10MB por imagen</p>
              <p>{totalImages} / {maxImages} imágenes</p>
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

      {/* Capacity limit message */}
      {!canAddMoreImages && (
        <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-600">
            Límite de {maxImages} imágenes alcanzado
          </p>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-sm font-medium">
              Subiendo {images.filter(img => img.status === 'uploading').length} imagen(es)...
            </p>
          </div>
          <div className="mt-2 bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(images.filter(img => img.status !== 'pending').length / images.length) * 100}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600">Error en la subida</p>
              <p className="text-sm text-red-600 mt-1 whitespace-pre-line">{uploadError}</p>
              <button
                type="button"
                onClick={clearError}
                className="mt-2 text-xs text-red-600 underline hover:no-underline"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};