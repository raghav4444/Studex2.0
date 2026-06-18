import { useState, useRef } from 'react';
import { X, Plus, ChevronDown, ChevronRight, Hash, Lock, Users } from 'lucide-react';
import { StudexChannel, StudexConversation } from '../../hooks/useStudexChat';

interface SidebarListProps {
  channels: StudexChannel[];
  conversations: StudexConversation[];
  activeId: string | null;
  activeType: 'channel' | 'dm' | null;
  creatingChannel: boolean;
  onCreateChannel: () => void;
  onSelectChannel: (channel: StudexChannel) => void;
  onSelectDM: (conv: StudexConversation) => void;
  onAddDM: () => void;
}

export const ChannelSection: React.FC<{
  channels: StudexChannel[];
  activeId: string | null;
  activeType: 'channel' | 'dm';
  onSelect: (id: string) => void;
  onCreate: () => void;
  creating: boolean;
}> = ({ channels, activeId, activeType, onSelect, onCreate, creating }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest hover:text-gray-400 transition">
          {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Channels · {channels.length}
        </button>
        <button
          onClick={onCreate}
          className="p-0.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition"
          title="Create channel"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div className="space-y-0.5 px-2">
          {channels.map(ch => {
            const isActive = activeType === 'channel' && activeId === ch._id;
            return (
              <button
                key={ch._id}
                onClick={() => onSelect(ch._id)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition group ${
                  isActive ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {ch.isPrivate
                  ? <Lock className="w-3.5 h-3.5 flex-shrink-0 text-gray-600" />
                  : <Hash className="w-3.5 h-3.5 flex-shrink-0 text-gray-600" />
                }
                <span className="truncate">{ch.name}</span>
                {ch.isPrivate && (
                  <Lock className="w-2.5 h-2.5 text-gray-600 ml-auto flex-shrink-0" />
                )}
              </button>
            );
          })}
          {channels.length === 0 && (
            <p className="text-gray-700 text-xs text-center py-3 px-2">No channels yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export const DMSection: React.FC<{
  conversations: StudexConversation[];
  activeId: string | null;
  activeType: 'channel' | 'dm';
  onSelect: (id: string) => void;
  onAdd: () => void;
}> = ({ conversations, activeId, activeType, onSelect, onAdd }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest hover:text-gray-400 transition">
          {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Messages · {conversations.length}
        </button>
        <button
          onClick={onAdd}
          className="p-0.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition"
          title="New message"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div className="space-y-0.5 px-2">
          {conversations.map(conv => {
            const id = conv.partner.supabaseId || (conv.partner as any)._id;
            const isActive = activeType === 'dm' && activeId === id;
            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition group ${
                  isActive ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                    {conv.partner.avatar
                      ? <img src={conv.partner.avatar} className="w-full h-full object-cover" />
                      : conv.partner.name?.[0]?.toUpperCase()
                    }
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#09090b]" />
                </div>
                <span className="truncate flex-1 text-left">{conv.partner.name}</span>
                {conv.unreadCount > 0 && (
                  <span className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
          {conversations.length === 0 && (
            <p className="text-gray-700 text-xs text-center py-3 px-2">No conversations yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default { ChannelSection, DMSection };