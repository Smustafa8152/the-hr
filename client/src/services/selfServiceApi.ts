// TODO: Replace with actual tRPC endpoints when backend is ready

import { RequestStatus } from '../components/common/StatusBadge';

export interface EmployeeDashboardData {
  checkInTime: string | null;
  leaveBalance: number;
  nextPayday: string | null;
  pendingRequestsCount: number;
}

export interface Request {
  id: string;
  type: string;
  category: string;
  date: string;
  status: RequestStatus;
  currentApprover?: string;
  formData: Record<string, any>;
  timeline: TimelineEvent[];
  comments: Comment[];
  attachments: Attachment[];
}

export interface TimelineEvent {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  notes?: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
}

export interface Payslip {
  id: string;
  month: string;
  netSalary: number;
  grossSalary: number;
  deductions: number;
  downloadUrl: string;
}

// Mock data
const mockRequests: Request[] = [
  {
    id: 'REQ-001',
    type: 'Leave Request',
    category: 'Attendance & Leaves',
    date: '2025-12-15',
    status: 'Approved',
    currentApprover: 'HR Department',
    formData: {
      leaveType: 'annual',
      fromDate: '2025-12-20',
      toDate: '2025-12-25',
      reason: 'Family vacation'
    },
    timeline: [
      { id: '1', action: 'Submitted', actor: 'You', timestamp: '2025-12-15 09:00' },
      { id: '2', action: 'Approved by Manager', actor: 'John Smith', timestamp: '2025-12-15 14:30' },
      { id: '3', action: 'Approved by HR', actor: 'HR Department', timestamp: '2025-12-16 10:00' }
    ],
    comments: [],
    attachments: []
  },
  {
    id: 'REQ-002',
    type: 'Salary Certificate',
    category: 'Letters & Certificates',
    date: '2025-12-18',
    status: 'In Review',
    currentApprover: 'HR Department',
    formData: {
      language: 'en',
      destination: 'Bank',
      purpose: 'Loan application',
      stampedCopy: 'yes'
    },
    timeline: [
      { id: '1', action: 'Submitted', actor: 'You', timestamp: '2025-12-18 11:00' }
    ],
    comments: [],
    attachments: []
  },
  {
    id: 'REQ-003',
    type: 'IT Support Ticket',
    category: 'Assets & IT Support',
    date: '2025-12-19',
    status: 'Pending',
    currentApprover: 'IT Department',
    formData: {
      issueCategory: 'software',
      systemOrDevice: 'Email',
      priority: 'high',
      description: 'Cannot access email on mobile device'
    },
    timeline: [
      { id: '1', action: 'Submitted', actor: 'You', timestamp: '2025-12-19 15:30' }
    ],
    comments: [],
    attachments: []
  }
];

const mockPayslips: Payslip[] = [
  {
    id: 'PAY-2025-12',
    month: 'December 2025',
    netSalary: 4500,
    grossSalary: 5000,
    deductions: 500,
    downloadUrl: '#'
  },
  {
    id: 'PAY-2025-11',
    month: 'November 2025',
    netSalary: 4500,
    grossSalary: 5000,
    deductions: 500,
    downloadUrl: '#'
  },
  {
    id: 'PAY-2025-10',
    month: 'October 2025',
    netSalary: 4500,
    grossSalary: 5000,
    deductions: 500,
    downloadUrl: '#'
  }
];

// Mock API functions
export const selfServiceApi = {
  getDashboardData: async (): Promise<EmployeeDashboardData> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      checkInTime: '08:45 AM',
      leaveBalance: 12,
      nextPayday: '2025-12-31',
      pendingRequestsCount: mockRequests.filter(r => 
        r.status === 'Pending' || r.status === 'In Review'
      ).length
    };
  },

  getRecentRequests: async (limit: number = 5): Promise<Request[]> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRequests.slice(0, limit);
  },

  getAllRequests: async (filters?: {
    status?: RequestStatus;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<Request[]> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    let filtered = [...mockRequests];

    if (filters?.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    if (filters?.category) {
      filtered = filtered.filter(r => r.category === filters.category);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.id.toLowerCase().includes(search) ||
        r.type.toLowerCase().includes(search)
      );
    }

    return filtered;
  },

  getRequestById: async (id: string): Promise<Request | null> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockRequests.find(r => r.id === id) || null;
  },

  createRequest: async (requestData: {
    typeId: string;
    categoryId: string;
    formData: Record<string, any>;
  }): Promise<Request> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newRequest: Request = {
      id: `REQ-${String(mockRequests.length + 1).padStart(3, '0')}`,
      type: requestData.typeId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      category: requestData.categoryId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      formData: requestData.formData,
      timeline: [
        {
          id: '1',
          action: 'Submitted',
          actor: 'You',
          timestamp: new Date().toLocaleString()
        }
      ],
      comments: [],
      attachments: []
    };

    mockRequests.unshift(newRequest);
    return newRequest;
  },

  getRecentPayslips: async (limit: number = 3): Promise<Payslip[]> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPayslips.slice(0, limit);
  },

  getAllPayslips: async (): Promise<Payslip[]> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPayslips;
  },

  downloadPayslip: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Downloading payslip:', id);
    // In real implementation, this would trigger a file download
  }
};
