import type { Tutor } from '@/lib/types';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorCardProps {
  tutor: Tutor;
}

export function TutorCard({ tutor }: TutorCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex gap-3 items-start">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0',
          tutor.avatarColor,
        )}>
          {tutor.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{tutor.name}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: Math.floor(tutor.rating) }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs text-muted-foreground ml-1">{tutor.rating}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tutor.languages} · {tutor.students} students · {tutor.sessions} sessions
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tutor.subjects.map(s => (
              <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                {s}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Available slots:</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tutor.slots.map(s => (
              <span key={s} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-md border border-indigo-100">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
