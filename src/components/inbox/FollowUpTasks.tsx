import { useEffect, useState } from 'react';
import { tasksHelper } from '../../lib/dataHelpers';
import { FollowUpTask } from '../../types/supabase';
import { Plus, Check, Trash2, Clock } from 'lucide-react';

interface Props {
  conversationId: string;
}

export default function FollowUpTasks({ conversationId }: Props) {
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const all = await tasksHelper.getAll();
    setTasks(all.filter(t => t.conversation_id === conversationId));
    setLoading(false);
  };

  useEffect(() => { load(); }, [conversationId]);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    const t = await tasksHelper.create({ conversation_id: conversationId, title: newTitle.trim(), completed: false } as any);
    setTasks(prev => [...prev, t]);
    setNewTitle('');
  };

  const toggleTask = async (task: FollowUpTask) => {
    const updated = await tasksHelper.update(task.id, { completed: !task.completed } as any);
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
  };

  const deleteTask = async (id: string) => {
    await tasksHelper.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Follow-up</p>
        <span className="text-[11px] text-gray-600">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
      </div>
      <div className="space-y-1 mb-2">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-2 group">
            <button
              onClick={() => toggleTask(task)}
              className={`size-4 rounded border shrink-0 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-600 hover:border-gray-500'}`}
            >
              {task.completed && <Check size={10} className="text-white" />}
            </button>
            <span className={`text-xs flex-1 min-w-0 truncate ${task.completed ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
              {task.title}
            </span>
            <button onClick={() => deleteTask(task.id)} className="p-0.5 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={10} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addTask(); }}
          placeholder="Νέα εργασία..."
          className="input text-xs py-1 flex-1"
        />
        <button onClick={addTask} className="p-1 text-blue-400 hover:text-blue-300 disabled:opacity-40" disabled={!newTitle.trim()}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
