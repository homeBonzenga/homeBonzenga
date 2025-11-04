import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';
import { Loader2, Search, Filter, CheckCircle, XCircle, Shield, Globe } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface AccessLog {
  id: string;
  userId: string | null;
  emailAttempted: string | null;
  roleAttempted: string | null;
  success: boolean;
  method: 'email_password' | 'google';
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
}

interface AccessLogsResponse {
  logs: AccessLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const AccessLogsPage = () => {
  const { user } = useSupabaseAuth();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    role: '',
    success: '',
    method: '',
    email: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
      fetchLogs();
    }
  }, [user, filters, pagination.page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.role) params.append('role', filters.role);
      if (filters.success) params.append('success', filters.success);
      if (filters.method) params.append('method', filters.method);
      if (filters.email) params.append('email', filters.email);

      const response = await fetch(`${API_URL}/admin/access-logs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch access logs');
      }

      const data: AccessLogsResponse = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching access logs:', error);
      toast.error('Failed to load access logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      role: '',
      success: '',
      method: '',
      email: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to view access logs.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#4e342e] mb-2">Access Logs</h1>
          <p className="text-[#6d4c41]">Monitor all login attempts and authentication events</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="VENDOR">Vendor</SelectItem>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="success">Status</Label>
                <Select value={filters.success} onValueChange={(value) => handleFilterChange('success', value)}>
                  <SelectTrigger id="success">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="true">Success</SelectItem>
                    <SelectItem value="false">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="method">Method</Label>
                <Select value={filters.method} onValueChange={(value) => handleFilterChange('method', value)}>
                  <SelectTrigger id="method">
                    <SelectValue placeholder="All methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All methods</SelectItem>
                    <SelectItem value="email_password">Email/Password</SelectItem>
                    <SelectItem value="google">Google OAuth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Search by email..."
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={fetchLogs} className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Logs ({pagination.total} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No access logs found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Timestamp</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Role</th>
                        <th className="text-left p-3">Method</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">IP Address</th>
                        <th className="text-left p-3">User Agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">{formatDate(log.timestamp)}</td>
                          <td className="p-3">
                            {log.user?.email || log.emailAttempted || '-'}
                          </td>
                          <td className="p-3">
                            {log.user?.role || log.roleAttempted || '-'}
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1">
                              {log.method === 'google' ? (
                                <Globe className="w-4 h-4" />
                              ) : (
                                <Shield className="w-4 h-4" />
                              )}
                              {log.method === 'google' ? 'Google OAuth' : 'Email/Password'}
                            </span>
                          </td>
                          <td className="p-3">
                            {log.success ? (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-600">
                                <XCircle className="w-4 h-4" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-sm">{log.ipAddress || '-'}</td>
                          <td className="p-3 text-sm max-w-xs truncate" title={log.userAgent || ''}>
                            {log.userAgent || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AccessLogsPage;

