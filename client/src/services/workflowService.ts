// Workflow routing logic for request approvals

export type ApproverRole = 'Manager' | 'HR' | 'Finance' | 'IT' | 'Assets' | 'Legal' | 'Admin';

export interface WorkflowRoute {
  requestTypeId: string;
  approvers: ApproverRole[];
  conditionalRouting?: (formData: Record<string, any>) => ApproverRole[];
}

/**
 * Workflow routing configuration
 * Defines the approval chain for each request type
 */
export const WORKFLOW_ROUTES: Record<string, WorkflowRoute> = {
  // Attendance & Leaves
  'leave-request': {
    requestTypeId: 'leave-request',
    approvers: ['Manager', 'HR']
  },
  'permission-early-leave': {
    requestTypeId: 'permission-early-leave',
    approvers: ['Manager']
  },
  'attendance-correction': {
    requestTypeId: 'attendance-correction',
    approvers: ['Manager', 'HR']
  },

  // Payroll & Finance
  'payslip-inquiry': {
    requestTypeId: 'payslip-inquiry',
    approvers: ['Finance', 'HR']
  },
  'advance-loan': {
    requestTypeId: 'advance-loan',
    approvers: ['Finance', 'HR']
  },
  'expense-reimbursement': {
    requestTypeId: 'expense-reimbursement',
    approvers: ['Manager', 'Finance']
  },

  // Administrative
  'update-personal-data': {
    requestTypeId: 'update-personal-data',
    approvers: ['HR']
  },

  // Letters & Certificates
  'salary-certificate': {
    requestTypeId: 'salary-certificate',
    approvers: ['HR']
  },
  'experience-letter': {
    requestTypeId: 'experience-letter',
    approvers: ['HR']
  },

  // Training & Development
  'training-request': {
    requestTypeId: 'training-request',
    approvers: ['Manager', 'HR']
  },

  // Assets & IT Support
  'asset-request': {
    requestTypeId: 'asset-request',
    approvers: ['IT', 'Manager']
  },
  'it-support': {
    requestTypeId: 'it-support',
    approvers: ['IT']
  },

  // Sensitive Requests
  'complaint-grievance': {
    requestTypeId: 'complaint-grievance',
    approvers: ['HR'], // Default
    conditionalRouting: (formData) => {
      // If confidential, bypass manager and go directly to HR
      if (formData.confidentiality === 'yes') {
        return ['HR', 'Legal']; // Optional Legal review for sensitive cases
      }
      return ['Manager', 'HR'];
    }
  },
  'resignation': {
    requestTypeId: 'resignation',
    approvers: ['Manager', 'HR']
  }
};

/**
 * Get the approval workflow for a specific request type
 */
export const getWorkflowRoute = (
  requestTypeId: string,
  formData?: Record<string, any>
): ApproverRole[] => {
  const route = WORKFLOW_ROUTES[requestTypeId];
  
  if (!route) {
    console.warn(`No workflow route defined for request type: ${requestTypeId}`);
    return ['HR']; // Default fallback
  }

  // Check for conditional routing
  if (route.conditionalRouting && formData) {
    return route.conditionalRouting(formData);
  }

  return route.approvers;
};

/**
 * Get the next approver in the workflow
 */
export const getNextApprover = (
  requestTypeId: string,
  currentApproverIndex: number,
  formData?: Record<string, any>
): ApproverRole | null => {
  const workflow = getWorkflowRoute(requestTypeId, formData);
  
  if (currentApproverIndex >= workflow.length - 1) {
    return null; // No more approvers
  }

  return workflow[currentApproverIndex + 1];
};

/**
 * Check if a request has completed all approvals
 */
export const isWorkflowComplete = (
  requestTypeId: string,
  currentApproverIndex: number,
  formData?: Record<string, any>
): boolean => {
  const workflow = getWorkflowRoute(requestTypeId, formData);
  return currentApproverIndex >= workflow.length - 1;
};

/**
 * Get workflow progress percentage
 */
export const getWorkflowProgress = (
  requestTypeId: string,
  currentApproverIndex: number,
  formData?: Record<string, any>
): number => {
  const workflow = getWorkflowRoute(requestTypeId, formData);
  if (workflow.length === 0) return 100;
  
  return Math.round(((currentApproverIndex + 1) / workflow.length) * 100);
};

/**
 * Validate if a user can approve a request based on their role
 */
export const canUserApprove = (
  userRole: ApproverRole,
  requestTypeId: string,
  currentApproverIndex: number,
  formData?: Record<string, any>
): boolean => {
  const workflow = getWorkflowRoute(requestTypeId, formData);
  const currentApprover = workflow[currentApproverIndex];
  
  return userRole === currentApprover;
};

/**
 * Get all approvers for a request (for display purposes)
 */
export const getAllApprovers = (
  requestTypeId: string,
  formData?: Record<string, any>
): ApproverRole[] => {
  return getWorkflowRoute(requestTypeId, formData);
};

// Example usage:
// const workflow = getWorkflowRoute('leave-request');
// console.log('Approval chain:', workflow); // ['Manager', 'HR']
//
// const nextApprover = getNextApprover('leave-request', 0);
// console.log('Next approver:', nextApprover); // 'HR'
//
// const isComplete = isWorkflowComplete('leave-request', 1);
// console.log('Workflow complete:', isComplete); // true
