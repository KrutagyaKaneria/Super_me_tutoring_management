import type { Student } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: Student;
}

export function StudentCard({ student }: StudentCardProps) {
  const progress = Math.round((student.hoursCompleted / student.targetHours) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0',
          student.avatarColor,
        )}>
          {student.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{student.name}</span>
            <span className="text-xs text-muted-foreground">Grade {student.grade}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {student.subject} · {student.hoursCompleted}h completed of {student.targetHours}h
          </p>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right mt-1">{progress}%</p>
        </div>
      </div>
    </div>
  );
}
