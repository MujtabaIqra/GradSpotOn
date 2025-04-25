import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, AlertTriangle, Check, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminViolationsProps {
  violations: any[];
  refreshData: () => Promise<void>;
}

const AdminViolations: React.FC<AdminViolationsProps> = ({ violations, refreshData }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Filter violations based on search and status
  const filteredViolations = violations.filter(violation => {
    const matchesSearch = 
      violation.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      violation.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'paid' && violation.is_paid) ||
      (statusFilter === 'unpaid' && !violation.is_paid);

    return matchesSearch && matchesStatus;
  });

  // Calculate total unpaid fines
  const totalUnpaidFines = violations
    .filter(v => !v.is_paid)
    .reduce((acc, v) => acc + v.fine_amount, 0);

  // Handle marking violation as paid
  const handleMarkAsPaid = async (violationId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('violations')
        .update({ is_paid: true })
        .eq('id', violationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Violation marked as paid",
      });

      await refreshData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update violation status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{violations.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              All time violations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Fines</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalUnpaidFines} AED
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {violations.filter(v => !v.is_paid).length} unpaid violations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((violations.filter(v => v.is_paid).length / violations.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {violations.filter(v => v.is_paid).length} paid violations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Violations List */}
      <Card>
        <CardHeader>
          <CardTitle>Violations Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search violations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Violations</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Violations Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Fine</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredViolations.map(violation => (
                  <TableRow key={violation.id}>
                    <TableCell>
                      {new Date(violation.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {violation.user?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        violation.violation_type === 'Overstay' ? 'default' :
                        violation.violation_type === 'NoQRScan' ? 'secondary' :
                        violation.violation_type === 'UnauthorizedSpot' ? 'destructive' :
                        'outline'
                      }>
                        {violation.violation_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {violation.description}
                    </TableCell>
                    <TableCell>
                      {violation.fine_amount} AED
                    </TableCell>
                    <TableCell>
                      <Badge variant={violation.is_paid ? 'success' : 'destructive'}>
                        {violation.is_paid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!violation.is_paid && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsPaid(violation.id)}
                          disabled={loading}
                        >
                          Mark as Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminViolations; 