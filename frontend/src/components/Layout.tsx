import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import OnlineUsers from './OnlineUsers';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Ana içerik */}
      <div className="flex-1 flex flex-col">
        {/* Üst bar */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                YKS Buddy Chat
              </h1>
              
              <div className="flex items-center space-x-4">
                {/* Kullanıcı profili */}
                <div className="flex items-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600">
                        {user?.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="ml-2 text-gray-700">{user?.username}</span>
                </div>

                {/* Çıkış butonu */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Ana içerik alanı */}
        <main className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex h-full py-6">
              {/* Sol taraf - Sohbet alanı */}
              <div className="flex-1 min-w-0 bg-white rounded-lg shadow">
                {children}
              </div>

              {/* Sağ taraf - Çevrimiçi kullanıcılar */}
              <div className="ml-6 w-80 flex-shrink-0">
                <OnlineUsers />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 