import { PageHeader } from '@/components/PageHeader';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { mockNotifications } from '@/data/mockData';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export function NotificationCenter() {
  const handleSend = () => {
    toast.success('Notification sent via WhatsApp API', {
      description: 'All recipients will receive the reminder shortly.',
    });
  };

  return (
    <div>
      <PageHeader title="Notification Center" />

      <CardShell title="Send Class Reminder">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Template (WhatsApp-ready):</p>
          <div className="bg-slate-50 rounded-lg p-4 text-sm leading-relaxed border border-slate-100">
            📚 <strong>Class Reminder — EduConnect</strong><br />
            Hi [Student Name], your <strong>[Subject]</strong> class with [Tutor Name] is scheduled for <strong>[Date] at [Time]</strong>.<br />
            Meeting Link: [Link]<br />
            Please be ready 5 mins early. 🎯
          </div>
          <button
            onClick={handleSend}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" /> Send via WhatsApp API
          </button>
        </div>
      </CardShell>

      <CardShell title="Scheduled Reminders">
        <DataTable headers={['Session', 'Recipients', 'Time', 'Channel', 'Status']}>
          {mockNotifications.map((n) => (
            <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="py-3 px-3 text-sm">{n.session}</td>
              <td className="py-3 px-3 text-sm">{n.recipients}</td>
              <td className="py-3 px-3 text-sm">{n.time}</td>
              <td className="py-3 px-3 text-sm">{n.channel}</td>
              <td className="py-3 px-3">
                <StatusBadge variant={getStatusVariant(n.status)}>
                  {n.status.charAt(0).toUpperCase() + n.status.slice(1)}
                </StatusBadge>
              </td>
            </tr>
          ))}
        </DataTable>
      </CardShell>
    </div>
  );
}
