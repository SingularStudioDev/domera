'use client';

import { useState } from 'react';
import { cn } from '@/utils/utils';
import { 
  Search,
  ChevronDown,
  Paperclip,
  Camera,
  FileText,
  BarChart,
  Smile,
  Italic,
  Underline,
  Send,
  MoreVertical
} from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  sender: 'client' | 'advisor';
  isRead?: boolean;
}

interface ChatItem {
  id: string;
  clientName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
  isOnline: boolean;
  messages: ChatMessage[];
}

// Mock data with realistic Spanish real estate conversations
const mockChats: ChatItem[] = [
  {
    id: '1',
    clientName: 'Mar�a Gonz�lez',
    lastMessage: '�Cu�ntos garajes incluye cada apartamento?',
    timestamp: '10:30',
    unreadCount: 2,
    avatar: 'MG',
    isOnline: true,
    messages: [
      {
        id: '1',
        text: 'Hola, estoy interesada en el proyecto Torres del R�o',
        timestamp: '10:15',
        sender: 'client'
      },
      {
        id: '2',
        text: 'Hola Mar�a! Perfecto, es un excelente proyecto. �En qu� tipo de unidad est�s interesada?',
        timestamp: '10:16',
        sender: 'advisor'
      },
      {
        id: '3',
        text: '�Cu�ntos garajes incluye cada apartamento?',
        timestamp: '10:30',
        sender: 'client'
      }
    ]
  },
  {
    id: '2',
    clientName: 'Carlos Rodr�guez',
    lastMessage: 'Perfecto, me encanta que tenga vista al r�o',
    timestamp: '09:45',
    unreadCount: 0,
    avatar: 'CR',
    isOnline: false,
    messages: [
      {
        id: '1',
        text: '�Hay apartamentos disponibles en pisos altos?',
        timestamp: '09:30',
        sender: 'client'
      },
      {
        id: '2',
        text: 'S� Carlos, tenemos disponibilidad en los pisos 12, 15 y 18 con vista al r�o',
        timestamp: '09:32',
        sender: 'advisor'
      },
      {
        id: '3',
        text: 'Perfecto, me encanta que tenga vista al r�o',
        timestamp: '09:45',
        sender: 'client'
      }
    ]
  },
  {
    id: '3',
    clientName: 'Ana Mart�nez',
    lastMessage: 'Los documentos est�n listos para la firma',
    timestamp: 'Ayer',
    unreadCount: 1,
    avatar: 'AM',
    isOnline: true,
    messages: [
      {
        id: '1',
        text: '�Qu� documentos necesito para la reserva?',
        timestamp: 'Ayer 16:00',
        sender: 'client'
      },
      {
        id: '2',
        text: 'Ana, necesitas: c�dula de identidad, recibo de sueldo �ltimos 3 meses, y declaraci�n patrimonial',
        timestamp: 'Ayer 16:05',
        sender: 'advisor'
      },
      {
        id: '3',
        text: 'Los documentos est�n listos para la firma',
        timestamp: 'Ayer 18:30',
        sender: 'client'
      }
    ]
  },
  {
    id: '4',
    clientName: 'Roberto Silva',
    lastMessage: '�Cu�l es el plan de financiamiento?',
    timestamp: 'Ayer',
    unreadCount: 3,
    avatar: 'RS',
    isOnline: false,
    messages: [
      {
        id: '1',
        text: 'Me interesa el apartamento de 2 dormitorios',
        timestamp: 'Ayer 14:00',
        sender: 'client'
      },
      {
        id: '2',
        text: 'Excelente elecci�n Roberto. El precio es USD $180,000',
        timestamp: 'Ayer 14:02',
        sender: 'advisor'
      },
      {
        id: '3',
        text: '�Cu�l es el plan de financiamiento?',
        timestamp: 'Ayer 15:15',
        sender: 'client'
      }
    ]
  },
  {
    id: '5',
    clientName: 'Laura Fern�ndez',
    lastMessage: 'Excelente, confirmo la cita para ma�ana',
    timestamp: '2 d�as',
    unreadCount: 0,
    avatar: 'LF',
    isOnline: true,
    messages: [
      {
        id: '1',
        text: '�Puedo agendar una visita al showroom?',
        timestamp: '2 d�as 10:00',
        sender: 'client'
      },
      {
        id: '2',
        text: 'Por supuesto Laura, �te viene bien ma�ana a las 15:00?',
        timestamp: '2 d�as 10:30',
        sender: 'advisor'
      },
      {
        id: '3',
        text: 'Excelente, confirmo la cita para ma�ana',
        timestamp: '2 d�as 11:00',
        sender: 'client'
      }
    ]
  }
];

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string>(mockChats[0].id);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const currentChat = mockChats.find(chat => chat.id === selectedChat);
  const filteredChats = mockChats.filter(chat => 
    chat.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send the message
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col bg-white rounded-xl border border-[#DCDCDC] shadow">
      {/* Header Bar */}
      <div className="flex h-[60px] items-center justify-between border-b border-[#DCDCDC] bg-white px-6 rounded-t-xl">
        <h1 className="text-xl font-bold text-gray-900">Chat</h1>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#7B7B7B]">354 clientes</span>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B7B7B]" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-lg border border-[#DCDCDC] bg-white pl-10 pr-4 py-2 text-sm focus:border-[#0040FF] focus:outline-none focus:ring-1 focus:ring-[#0040FF]"
            />
          </div>
          
          <button className="flex items-center gap-2 rounded-lg border border-[#DCDCDC] bg-white px-3 py-2 text-sm hover:bg-gray-50">
            Todos
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Chat List */}
        <div className="w-[280px] border-r border-[#DCDCDC] bg-white">
          <div className="h-full overflow-y-auto">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 border-b border-gray-100 p-4 transition-colors hover:bg-gray-50",
                  selectedChat === chat.id ? "bg-[#005BFF] text-white hover:bg-[#005BFF]" : "bg-white"
                )}
              >
                <div className="relative">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full font-medium text-white",
                    selectedChat === chat.id ? "bg-white text-[#005BFF]" : "bg-[#0040FF]"
                  )}>
                    {chat.avatar}
                  </div>
                  {chat.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={cn(
                      "font-medium truncate",
                      selectedChat === chat.id ? "text-white" : "text-gray-900"
                    )}>
                      {chat.clientName}
                    </h3>
                    <span className={cn(
                      "text-xs",
                      selectedChat === chat.id ? "text-white/80" : "text-[#7B7B7B]"
                    )}>
                      {chat.timestamp}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className={cn(
                      "text-sm truncate",
                      selectedChat === chat.id ? "text-white/90" : "text-[#7B7B7B]"
                    )}>
                      {chat.lastMessage}
                    </p>
                    
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column - Conversation */}
        <div className="flex flex-1 flex-col">
          {currentChat ? (
            <>
              {/* Conversation Header */}
              <div className="flex h-[60px] items-center justify-between border-b border-[#DCDCDC] bg-white px-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0040FF] font-medium text-white">
                      {currentChat.avatar}
                    </div>
                    {currentChat.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-medium text-gray-900">{currentChat.clientName}</h2>
                    <p className="text-xs text-[#7B7B7B]">
                      {currentChat.isOnline ? 'En l�nea' : 'Desconectado'}
                    </p>
                  </div>
                </div>
                
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7B7B7B] hover:bg-gray-100">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {currentChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.sender === 'client' ? 'justify-start' : 'justify-end'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-3 text-sm",
                        msg.sender === 'client'
                          ? 'bg-white border border-[#DCDCDC] text-gray-900'
                          : 'bg-[#F7F7F7] text-gray-900'
                      )}
                    >
                      <p>{msg.text}</p>
                      <p className="mt-1 text-xs text-[#7B7B7B]">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input Bar */}
              <div className="border-t border-[#DCDCDC] bg-white p-4">
                <div className="flex items-center gap-3">
                  {/* Left Icons */}
                  <div className="flex items-center gap-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7B7B7B] hover:bg-gray-100">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7B7B7B] hover:bg-gray-100">
                      <Camera className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7B7B7B] hover:bg-gray-100">
                      <FileText className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7B7B7B] hover:bg-gray-100">
                      <BarChart className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7B7B7B] hover:bg-gray-100">
                      <Smile className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7B7B7B] hover:bg-gray-100">
                      <Italic className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7B7B7B] hover:bg-gray-100">
                      <Underline className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Message Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Escribe tu mensaje&"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full rounded-lg border border-[#DCDCDC] bg-white px-4 py-3 text-sm focus:border-[#0040FF] focus:outline-none focus:ring-1 focus:ring-[#0040FF]"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                      message.trim()
                        ? "bg-[#0040FF] text-white hover:bg-[#0030CC]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-[#7B7B7B]">Selecciona una conversaci�n para comenzar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}