import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { CardShell } from '@/components/CardShell';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, X, Save, Clock, BookOpen, Languages, Loader2 } from 'lucide-react';

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export function TutorProfile() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newSubject, setNewSubject] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tutor/dashboard');
      const profile = res.data.profile;
      if (profile) {
        setSubjects(profile.subjects || []);
        setLanguages(profile.languages || []);
        setAvailability(profile.availabilitySlots || []);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const handleAddSlot = () => {
    setAvailability([...availability, { day: 'Monday', startTime: '09:00', endTime: '10:00' }]);
  };

  const handleUpdateSlot = (index: number, field: keyof AvailabilitySlot, value: string) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  const handleRemoveSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch('/tutor/profile', {
        subjects,
        languages,
        availabilitySlots: availability
      });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Profile Settings">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subjects Section */}
        <CardShell title="Expertise & Subjects">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                  placeholder="Add a subject..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <button
                onClick={handleAddSubject}
                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((sub, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                  {sub}
                  <button onClick={() => setSubjects(subjects.filter((_, idx) => idx !== i))} className="hover:text-indigo-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {subjects.length === 0 && <p className="text-xs text-slate-400 italic">No subjects added yet</p>}
            </div>
          </div>
        </CardShell>

        {/* Languages Section */}
        <CardShell title="Languages Spoken">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLanguage()}
                  placeholder="Add a language..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <button
                onClick={handleAddLanguage}
                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                  {lang}
                  <button onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))} className="hover:text-emerald-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {languages.length === 0 && <p className="text-xs text-slate-400 italic">No languages added yet</p>}
            </div>
          </div>
        </CardShell>

        {/* Availability Section */}
        <div className="md:col-span-2">
          <CardShell title="Weekly Availability">
            <div className="space-y-3">
              {availability.map((slot, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl items-center animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex-1 w-full">
                    <select
                      value={slot.day}
                      onChange={(e) => handleUpdateSlot(i, 'day', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="time"
                        value={slot.startTime || ''}
                        onChange={(e) => handleUpdateSlot(i, 'startTime', e.target.value)}
                        className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <span className="text-slate-400">to</span>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="time"
                        value={slot.endTime || ''}
                        onChange={(e) => handleUpdateSlot(i, 'endTime', e.target.value)}
                        className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSlot(i)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={handleAddSlot}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm font-medium flex items-center justify-center gap-2 bg-white cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Availability Slot
              </button>
            </div>
          </CardShell>
        </div>
      </div>
    </div>
  );
}
