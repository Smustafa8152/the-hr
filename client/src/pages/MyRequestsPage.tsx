import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Plus } from 'lucide-react';
import { selfServiceApi, Request } from '../services/selfServiceApi';
import { StatusBadge, RequestStatus } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { SubmitRequestModal } from '../components/selfservice/SubmitRequestModal';
import { RequestDetailModal } from '../components/selfservice/RequestDetailModal';
import { REQUEST_CATEGORIES } from '../config/selfServiceRequests';
import { toast } from 'sonner';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, statusFilter, categoryFilter, searchQuery, dateFrom, dateTo]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await selfServiceApi.getAllRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (statusFilter) {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.id.toLowerCase().includes(query) ||
        r.type.toLowerCase().includes(query)
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(r => r.date >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter(r => r.date <= dateTo);
    }

    setFilteredRequests(filtered);
  };

  const handleRequestClick = (request: Request) => {
    setSelectedRequest(request);
  };

  const handleRequestSubmitted = () => {
    loadRequests();
    toast.success('Request submitted successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Requests</h1>
          <p className="text-muted-foreground mt-1">View and track all your submitted requests</p>
        </div>
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by ID or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RequestStatus | '')}
            className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Review">In Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
          >
            <option value="">All Categories</option>
            {REQUEST_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.title}>{cat.title}</option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              placeholder="From"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              placeholder="To"
            />
          </div>
        </div>

        {/* Active Filters Summary */}
        {(statusFilter || categoryFilter || searchQuery || dateFrom || dateTo) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {statusFilter && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                Status: {statusFilter}
              </span>
            )}
            {categoryFilter && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                Category: {categoryFilter}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                Search: {searchQuery}
              </span>
            )}
            <button
              onClick={() => {
                setStatusFilter('');
                setCategoryFilter('');
                setSearchQuery('');
                setDateFrom('');
                setDateTo('');
              }}
              className="ml-auto text-sm text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No requests found"
          description={requests.length === 0 
            ? "You haven't submitted any requests yet" 
            : "No requests match your current filters"}
          action={requests.length === 0 ? {
            label: 'Submit Request',
            onClick: () => setIsSubmitModalOpen(true)
          } : undefined}
        />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Current Approver
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.map(request => (
                  <tr
                    key={request.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleRequestClick(request)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-foreground">{request.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">{request.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">{request.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">{request.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {request.currentApprover || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestClick(request);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <SubmitRequestModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleRequestSubmitted}
      />

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}
