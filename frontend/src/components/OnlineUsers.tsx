import React from 'react';
import { useOnlineUsersStore } from '../store/onlineUsersStore';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const OnlineUsers: React.FC = () => {
  const { users, typingUsers } = useOnlineUsersStore();

  // Kullanıcıları durumlarına göre sırala
  const sortedUsers = [...users].sort((a, b) => {
    // Önce çevrimiçi kullanıcılar
    if (a.status === 'online' && b.status !== 'online') return -1;
    if (a.status !== 'online' && b.status === 'online') return 1;
    
    // Sonra uzakta olanlar
    if (a.status === 'away' && b.status === 'offline') return -1;
    if (a.status === 'offline' && b.status === 'away') return 1;
    
    // Son olarak çevrimdışı kullanıcılar
    return 0;
  });

  // Kullanıcı durumunu renkli nokta olarak göster
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Son görülme zamanını formatla
  const formatLastSeen = (date: Date) => {
    return format(new Date(date), "'Son görülme:' d MMMM HH:mm", { locale: tr });
  };

  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          Çevrimiçi Kullanıcılar
        </h2>
      </div>

      <div className="overflow-y-auto h-[calc(100%-4rem)]">
        <ul className="divide-y divide-gray-200">
          {sortedUsers.map((user) => (
            <li key={user.userId} className="p-4 hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Durum göstergesi */}
                  <span
                    className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${getStatusColor(
                      user.status
                    )}`}
                  />
                </div>

                {/* Kullanıcı bilgileri */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.username}
                  </p>
                  
                  {/* Durum mesajı */}
                  <p className="text-sm text-gray-500">
                    {user.status === 'online' && typingUsers[user.userId] && (
                      <span className="text-green-600">Yazıyor...</span>
                    )}
                    {user.status === 'away' && (
                      <span className="text-yellow-600">Uzakta</span>
                    )}
                    {user.status === 'offline' && user.lastSeen && (
                      <span className="text-gray-500">
                        {formatLastSeen(user.lastSeen)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OnlineUsers; 