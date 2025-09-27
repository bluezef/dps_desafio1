import React, { useState } from 'react';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X, 
  Home, 
  FolderOpen, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  User
} from 'lucide-react';

const Layout = ({ children, title = "Gestión de Proyectos" }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderOpen, label: 'Proyectos', href: '/projects' },
  { icon: CheckSquare, label: 'Tareas', href: '/tasks' },
  ...(user?.role === 'gerente' ? [
    { icon: Users, label: 'Equipo', href: '/team' },
    { icon: Settings, label: 'Configuración', href: '/settings' }
  ] : [])
];

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Sistema de gestión de proyectos" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                Gestión de Proyectos
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.avatar || user?.name?.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="flex items-center justify-between p-4 border-b lg:hidden">
              <span className="text-lg font-semibold">Menú</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-4 px-4">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Overlay para mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 p-6 lg:ml-0">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;