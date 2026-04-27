import { PageHeader } from '@/components/PageHeader';
import { StudentCard } from '@/components/StudentCard';
import { mockStudents } from '@/data/mockData';

export function MyStudents() {
  return (
    <div>
      <PageHeader title="My Students" />
      {mockStudents.map((student) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
}
