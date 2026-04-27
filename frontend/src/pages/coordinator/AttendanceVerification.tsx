import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { NotificationBanner } from '@/components/NotificationBanner';
import { AttendanceCard } from '@/components/AttendanceCard';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function AttendanceVerification() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await api.get('/coordinator/pending-attendance');
        const mappedClaims = response.data.pending.map((c: any) => ({
          id: c._id,
          tutor: c.tutorId?.name || 'Unknown Tutor',
          student: c.studentId?.name || 'Unknown Student',
          date: new Date(c.scheduledDate).toLocaleDateString(),
          startTime: c.actualStartTime ? new Date(c.actualStartTime).toLocaleTimeString() : 'N/A',
          endTime: c.actualEndTime ? new Date(c.actualEndTime).toLocaleTimeString() : 'N/A',
          claimedDuration: `${c.durationInHours || 0} hours`,
          status: c.status
        }));
        setClaims(mappedClaims);
      } catch (error) {
        toast.error('Failed to load attendance claims');
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  return (
    <div>
      <PageHeader title="Attendance Verification" />
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <>
          <NotificationBanner variant="warning">
            {claims.length} session claims awaiting your review
          </NotificationBanner>
          <div className="space-y-3">
            {claims.map((claim) => (
              <AttendanceCard key={claim.id} claim={claim} />
            ))}
            {claims.length === 0 && (
              <div className="text-center py-6 text-sm text-slate-500">No pending claims found</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
