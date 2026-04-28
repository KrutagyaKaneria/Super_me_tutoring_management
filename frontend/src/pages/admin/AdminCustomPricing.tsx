import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { CardShell } from '@/components/CardShell';
import { Loader2 } from 'lucide-react';

type SimpleUser = {
  _id: string;
  name?: string;
  email?: string;
};

type StudentProfile = {
  _id: string;
  grade?: number | string;
  user?: SimpleUser;
};

type TutorProfile = {
  _id: string;
  user?: SimpleUser;
};

type Pricing = {
  _id: string;
  tutorId: string;
  studentId: string;
  subject: string;
  billingRatePerHour?: number;
  tutorPayoutPerHour?: number;
  board?: string;
  grade?: number;
  customNotes?: string;
  isActive?: boolean;
};

export function AdminCustomPricing() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);

  const [tutorId, setTutorId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');

  const [billingRatePerHour, setBillingRatePerHour] = useState('');
  const [tutorPayoutPerHour, setTutorPayoutPerHour] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [customNotes, setCustomNotes] = useState('');

  const [loadedPricing, setLoadedPricing] = useState<Pricing | null>(null);
  const [working, setWorking] = useState<'idle' | 'loading' | 'saving'>('idle');

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoading(true);
        const [studentsRes, tutorsRes] = await Promise.all([
          api.get('/coordinator/students'),
          api.get('/coordinator/tutors'),
        ]);

        setStudents(studentsRes.data?.students || []);
        setTutors(tutorsRes.data?.tutors || []);
      } catch (e: any) {
        toast.error(e.message || 'Failed to load tutors/students');
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, []);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.user?._id === studentId);
  }, [students, studentId]);

  const canQuery = Boolean(tutorId && studentId);

  const resetFormFromPricing = (pricing: Pricing | null) => {
    setLoadedPricing(pricing);
    setBillingRatePerHour(pricing?.billingRatePerHour != null ? String(pricing.billingRatePerHour) : '');
    setTutorPayoutPerHour(pricing?.tutorPayoutPerHour != null ? String(pricing.tutorPayoutPerHour) : '');
    setIsActive(pricing?.isActive ?? true);
    setCustomNotes(pricing?.customNotes || '');
  };

  const handleLoad = async () => {
    if (!canQuery) {
      toast.error('Select both tutor and student');
      return;
    }

    try {
      setWorking('loading');
      const qs = new URLSearchParams({
        tutorId,
        studentId,
        subject: subject.trim(),
      });

      const res = await api.get(`/admin/assignment-pricing?${qs.toString()}`);
      const pricing = res.data?.pricing || null;
      resetFormFromPricing(pricing);

      if (!pricing) {
        toast.message('No custom pricing found', {
          description: 'Saving will create it (Fee Config remains the fallback).',
        });
      } else {
        toast.success('Custom pricing loaded');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to load custom pricing');
    } finally {
      setWorking('idle');
    }
  };

  const toPositiveNumberOrNull = (value: string) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  };

  const handleSave = async () => {
    if (!canQuery) {
      toast.error('Select both tutor and student');
      return;
    }

    const billing = billingRatePerHour.trim() ? toPositiveNumberOrNull(billingRatePerHour) : null;
    const payout = tutorPayoutPerHour.trim() ? toPositiveNumberOrNull(tutorPayoutPerHour) : null;

    if (billingRatePerHour.trim() && billing === null) {
      toast.error('Billing rate must be a positive number');
      return;
    }

    if (tutorPayoutPerHour.trim() && payout === null) {
      toast.error('Tutor payout must be a positive number');
      return;
    }

    if (billing === null && payout === null) {
      toast.error('Provide at least one rate (billing or payout)');
      return;
    }

    try {
      setWorking('saving');
      const payload = {
        tutorId,
        studentId,
        subject: subject.trim(), // empty string means "all subjects" in backend
        billingRatePerHour: billing ?? undefined,
        tutorPayoutPerHour: payout ?? undefined,
        isActive,
        customNotes: customNotes.trim() || undefined,
        grade: selectedStudent?.grade != null ? Number(selectedStudent.grade) : undefined,
      };

      const res = await api.put('/admin/assignment-pricing', payload);
      const pricing = res.data?.pricing || null;
      resetFormFromPricing(pricing);
      toast.success('Custom pricing saved');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save custom pricing');
    } finally {
      setWorking('idle');
    }
  };

  const handleClear = () => {
    setSubject('');
    resetFormFromPricing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Custom Pricing (Student-Level)" />

      <CardShell title="Set a custom rate for a tutor–student pair">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Tutor</label>
            <select
              value={tutorId}
              onChange={(e) => {
                setTutorId(e.target.value);
                resetFormFromPricing(null);
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            >
              <option value="">-- Select Tutor --</option>
              {tutors.map((t) => (
                <option key={t._id} value={t.user?._id || ''}>
                  {t.user?.name || t.user?.email || t._id}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Student</label>
            <select
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                resetFormFromPricing(null);
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s._id} value={s.user?._id || ''}>
                  {s.user?.name || s.user?.email || s._id}
                  {s.grade != null ? ` (Grade ${s.grade})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Subject (optional)</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Leave empty for all subjects"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
            <p className="text-xs text-slate-500">
              If empty, this pricing applies to all subjects for this tutor–student.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4"
              />
              Active
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Billing Rate / Hour (Student pays)</label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">₹</span>
              <input
                type="number"
                value={billingRatePerHour}
                onChange={(e) => setBillingRatePerHour(e.target.value)}
                placeholder="e.g. 350"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Tutor Payout / Hour (Tutor earns)</label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">₹</span>
              <input
                type="number"
                value={tutorPayoutPerHour}
                onChange={(e) => setTutorPayoutPerHour(e.target.value)}
                placeholder="e.g. 250"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Notes (optional)</label>
            <input
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Special discount for this student"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <button
            onClick={handleLoad}
            disabled={!canQuery || working !== 'idle'}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {working === 'loading' ? 'Loading…' : 'Load Existing'}
          </button>
          <button
            onClick={handleSave}
            disabled={!canQuery || working !== 'idle'}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {working === 'saving' ? 'Saving…' : 'Save Pricing'}
          </button>
          <button
            onClick={handleClear}
            disabled={working !== 'idle'}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </CardShell>

      <CardShell title="Current record">
        {!loadedPricing ? (
          <p className="text-sm text-slate-500">No pricing loaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Subject</p>
              <p className="font-medium text-slate-900">{loadedPricing.subject || 'All subjects'}</p>
            </div>
            <div>
              <p className="text-slate-500">Active</p>
              <p className="font-medium text-slate-900">{loadedPricing.isActive ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-slate-500">Billing rate / hour</p>
              <p className="font-medium text-slate-900">
                {loadedPricing.billingRatePerHour != null ? `₹${loadedPricing.billingRatePerHour}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Tutor payout / hour</p>
              <p className="font-medium text-slate-900">
                {loadedPricing.tutorPayoutPerHour != null ? `₹${loadedPricing.tutorPayoutPerHour}` : '—'}
              </p>
            </div>
            {loadedPricing.customNotes ? (
              <div className="md:col-span-2">
                <p className="text-slate-500">Notes</p>
                <p className="font-medium text-slate-900">{loadedPricing.customNotes}</p>
              </div>
            ) : null}
          </div>
        )}
      </CardShell>
    </div>
  );
}
