import { useState } from 'react';
import type { AttendanceClaim } from '@/lib/types';
import { StatusBadge, getStatusVariant } from './StatusBadge';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { api } from '@/lib/api';

interface AttendanceCardProps {
  claim: AttendanceClaim;
}

export function AttendanceCard({ claim }: AttendanceCardProps) {
  const [status, setStatus] = useState(claim.status);

  const handleApprove = async () => {
    try {
      await api.patch(`/coordinator/approve-session/${claim.id}`);
      setStatus('approved');
      toast.success(`Approved session: ${claim.tutor} → ${claim.student}`, {
        description: `Duration: ${claim.claimedDuration}`,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve session');
    }
  };

  const handleReject = async () => {
    try {
      await api.patch(`/coordinator/reject-session/${claim.id}`);
      setStatus('rejected');
      toast.error(`Rejected session: ${claim.tutor} → ${claim.student}`, {
        description: 'The tutor will be notified.',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject session');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <p className="font-semibold text-sm">{claim.tutor} → {claim.student}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {claim.date} · Started {claim.startTime} · Ended {claim.endTime}
          </p>
        </div>
        <StatusBadge variant={getStatusVariant(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </StatusBadge>
      </div>
      <p className="text-sm mt-2">
        Claimed duration: <strong>{claim.claimedDuration}</strong>
      </p>
      {status === 'pending' && (
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleApprove}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Approve
          </button>
          <button
            onClick={handleReject}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Reject
          </button>
          <span className="text-xs text-muted-foreground">Flag discrepancy if needed</span>
        </div>
      )}
    </div>
  );
}
