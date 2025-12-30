import { useState } from 'react';
import { ModalEnhanced } from '../common/ModalEnhanced';
import { Stepper } from '../common/Stepper';
import { DynamicForm, FieldConfig } from '../common/DynamicForm';
import { REQUEST_CATEGORIES, RequestCategory, RequestType, getRequestTypeById } from '../../config/selfServiceRequests';
import { selfServiceApi } from '../../services/selfServiceApi';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface SubmitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubmitRequestModal = ({ isOpen, onClose, onSuccess }: SubmitRequestModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<RequestCategory | null>(null);
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, title: 'Category', description: 'Choose category' },
    { id: 2, title: 'Request Type', description: 'Select type' },
    { id: 3, title: 'Details', description: 'Fill form' }
  ];

  const handleCategorySelect = (category: RequestCategory) => {
    setSelectedCategory(category);
    setCurrentStep(2);
  };

  const handleRequestTypeSelect = (requestType: RequestType) => {
    setSelectedRequestType(requestType);
    setFormData({});
    setFormErrors({});
    setCurrentStep(3);
  };

  const handleFormChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (formErrors[key]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    if (!selectedRequestType) return false;

    const errors: Record<string, string> = {};
    
    selectedRequestType.fields.forEach(field => {
      const value = formData[field.key];
      const isRequired = field.conditionalRequired 
        ? field.conditionalRequired(formData)
        : field.required;

      if (isRequired && (!value || (Array.isArray(value) && value.length === 0))) {
        errors[field.key] = `${field.label} is required`;
      }

      // Additional validation
      if (value && field.validation) {
        if (field.type === 'number') {
          const numValue = Number(value);
          if (field.validation.min !== undefined && numValue < field.validation.min) {
            errors[field.key] = `Minimum value is ${field.validation.min}`;
          }
          if (field.validation.max !== undefined && numValue > field.validation.max) {
            errors[field.key] = `Maximum value is ${field.validation.max}`;
          }
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedRequestType || !selectedCategory) return;

    try {
      setIsSubmitting(true);
      await selfServiceApi.createRequest({
        typeId: selectedRequestType.id,
        categoryId: selectedCategory.id,
        formData
      });

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setSelectedRequestType(null);
    setFormData({});
    setFormErrors({});
    onClose();
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedCategory(null);
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setSelectedRequestType(null);
      setFormData({});
      setFormErrors({});
    }
  };

  return (
    <ModalEnhanced
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      className="max-h-[90vh]"
    >
      <div className="p-6">
        {/* Stepper */}
        <Stepper steps={steps} currentStep={currentStep} className="mb-8" />

        {/* Step 1: Category Selection */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Choose Request Category</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Select the category that best matches your request
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REQUEST_CATEGORIES.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className="flex items-start gap-4 p-4 bg-muted/50 hover:bg-muted border border-border hover:border-primary/50 rounded-lg transition-all text-left"
                  >
                    <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground mb-1">{category.title}</h4>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Request Type Selection */}
        {currentStep === 2 && selectedCategory && (
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Choose Request Type</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Select the specific type of request you want to submit
            </p>
            <div className="grid grid-cols-1 gap-3">
              {selectedCategory.requestTypes.map(requestType => (
                <button
                  key={requestType.id}
                  onClick={() => handleRequestTypeSelect(requestType)}
                  className="flex items-start gap-4 p-4 bg-muted/50 hover:bg-muted border border-border hover:border-primary/50 rounded-lg transition-all text-left"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground mb-1">{requestType.title}</h4>
                    <p className="text-sm text-muted-foreground">{requestType.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Form */}
        {currentStep === 3 && selectedRequestType && (
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{selectedRequestType.title}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Fill in the required information for your request
            </p>
            <DynamicForm
              fields={selectedRequestType.fields}
              formData={formData}
              onChange={handleFormChange}
              errors={formErrors}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            {currentStep === 3 && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalEnhanced>
  );
};
