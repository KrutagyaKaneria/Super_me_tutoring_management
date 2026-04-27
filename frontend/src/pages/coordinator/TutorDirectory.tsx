import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { TutorCard } from '@/components/TutorCard';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function TutorDirectory() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coordinator/tutors');
      setTutors(res.data.tutors || []);
    } catch (error) {
      toast.error('Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const colors = ['bg-indigo-100 text-indigo-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-purple-100 text-purple-700'];

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Tutor Directory" />
      
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {tutors.map((t, index) => {
            const mappedTutor = {
              id: t._id,
              name: t.user?.name || 'Tutor',
              initials: getInitials(t.user?.name || 'T'),
              avatarColor: colors[index % colors.length],
              subjects: t.subjects || [],
              languages: (t.languages || []).join(', '),
              rating: t.rating || 0,
              slots: (t.availabilitySlots || []).map((s: any) => `${s.day}: ${s.startTime}-${s.endTime}`),
              students: 0, // Placeholder
              sessions: 0  // Placeholder
            };
            return <TutorCard key={mappedTutor.id} tutor={mappedTutor} />;
          })}
          {tutors.length === 0 && <p className="text-center text-slate-500 py-10">No tutors found.</p>}
        </div>
      )}
    </div>
  );
}
