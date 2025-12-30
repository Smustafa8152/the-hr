import { useState, ChangeEvent } from 'react';
import { cn } from './UIComponents';
import { Upload, X } from 'lucide-react';

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'time' | 'number' | 'checkbox' | 'file';
  required?: boolean;
  conditionalRequired?: (formData: Record<string, any>) => boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
  fileConfig?: {
    allowedTypes?: string[];
    maxSize?: number; // in MB
    multiple?: boolean;
  };
  dependsOn?: {
    field: string;
    value: any;
  };
}

interface DynamicFormProps {
  fields: FieldConfig[];
  formData: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
  className?: string;
}

export const DynamicForm = ({ fields, formData, onChange, errors = {}, className }: DynamicFormProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});

  const handleFileChange = (key: string, files: FileList | null, config?: FieldConfig['fileConfig']) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errorMessages: string[] = [];

    fileArray.forEach(file => {
      // Check file type
      if (config?.allowedTypes && config.allowedTypes.length > 0) {
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!config.allowedTypes.includes(fileExt)) {
          errorMessages.push(`${file.name}: Invalid file type`);
          return;
        }
      }

      // Check file size
      if (config?.maxSize) {
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > config.maxSize) {
          errorMessages.push(`${file.name}: File too large (max ${config.maxSize}MB)`);
          return;
        }
      }

      validFiles.push(file);
    });

    if (errorMessages.length > 0) {
      alert(errorMessages.join('\n'));
    }

    if (validFiles.length > 0) {
      const newFiles = config?.multiple 
        ? [...(uploadedFiles[key] || []), ...validFiles]
        : validFiles;
      
      setUploadedFiles(prev => ({ ...prev, [key]: newFiles }));
      onChange(key, newFiles);
    }
  };

  const removeFile = (key: string, index: number) => {
    const newFiles = [...(uploadedFiles[key] || [])];
    newFiles.splice(index, 1);
    setUploadedFiles(prev => ({ ...prev, [key]: newFiles }));
    onChange(key, newFiles.length > 0 ? newFiles : null);
  };

  const isFieldVisible = (field: FieldConfig): boolean => {
    if (!field.dependsOn) return true;
    return formData[field.dependsOn.field] === field.dependsOn.value;
  };

  const isFieldRequired = (field: FieldConfig): boolean => {
    if (field.conditionalRequired) {
      return field.conditionalRequired(formData);
    }
    return field.required || false;
  };

  const renderField = (field: FieldConfig) => {
    if (!isFieldVisible(field)) return null;

    const required = isFieldRequired(field);
    const error = errors[field.key];
    const value = formData[field.key] || '';

    const baseInputClasses = cn(
      'w-full px-3 py-2 bg-background border rounded-lg transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-primary/50',
      error ? 'border-red-500' : 'border-border',
      'text-foreground placeholder:text-muted-foreground'
    );

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            required={required}
            className={baseInputClasses}
            {...(field.validation?.min && { min: field.validation.min })}
            {...(field.validation?.max && { max: field.validation.max })}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            required={required}
            rows={4}
            className={baseInputClasses}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            required={required}
            className={baseInputClasses}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
      case 'time':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            required={required}
            className={baseInputClasses}
          />
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(field.key, e.target.checked)}
              required={required}
              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
            />
            <span className="text-sm text-foreground">{field.placeholder || field.label}</span>
          </label>
        );

      case 'file':
        return (
          <div>
            <label className={cn(
              'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer',
              'hover:bg-muted/50 transition-colors',
              error ? 'border-red-500' : 'border-border'
            )}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                {field.fileConfig && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {field.fileConfig.allowedTypes?.join(', ')} (max {field.fileConfig.maxSize}MB)
                  </p>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange(field.key, e.target.files, field.fileConfig)}
                accept={field.fileConfig?.allowedTypes?.join(',')}
                multiple={field.fileConfig?.multiple}
                required={required && (!uploadedFiles[field.key] || uploadedFiles[field.key].length === 0)}
              />
            </label>
            
            {/* Uploaded files list */}
            {uploadedFiles[field.key] && uploadedFiles[field.key].length > 0 && (
              <div className="mt-2 space-y-2">
                {uploadedFiles[field.key].map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span className="text-sm text-foreground truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(field.key, index)}
                      className="p-1 hover:bg-background rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {fields.map(field => (
        isFieldVisible(field) && (
          <div key={field.key} className="space-y-1.5">
            {field.type !== 'checkbox' && (
              <label className="block text-sm font-medium text-foreground">
                {field.label}
                {isFieldRequired(field) && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            {renderField(field)}
            {errors[field.key] && (
              <p className="text-xs text-red-500">{errors[field.key]}</p>
            )}
          </div>
        )
      ))}
    </div>
  );
};
