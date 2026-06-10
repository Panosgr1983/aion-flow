import { AlertTriangle } from 'lucide-react';

interface Props {
  status: string | null;
}

export default function SuspensionBanner({ status }: Props) {
  if (!status || status === 'active' || status === 'trial') return null;

  const messages: Record<string, { title: string; desc: string }> = {
    suspended: { title: 'Λογαριασμός ανεσταλμένος', desc: 'Η πρόσβαση έχει προσωρινά απενεργοποιηθεί. Επικοινωνήστε με τον διαχειριστή.' },
    cancelled: { title: 'Λογαριασμός ακυρωμένος', desc: 'Η συνδρομή έχει λήξει. Επικοινωνήστε με τον διαχειριστή.' },
  };

  const msg = messages[status] || { title: 'Μη διαθέσιμο', desc: '' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md text-center">
        <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold mb-2">{msg.title}</h2>
        <p className="text-sm text-gray-400 mb-6">{msg.desc}</p>
      </div>
    </div>
  );
}
