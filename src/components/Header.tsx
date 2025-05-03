
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { usePatients } from '@/contexts/PatientContext';
import { Bell, Home, Users, Settings, LogOut, Bed, Cpu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { alerts } = usePatients();

  const unreadAlerts = alerts.filter(alert => !alert.viewed).length;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <div className="flex items-center">
            <span className="text-primary-blue text-2xl font-semibold">Pulse</span>
            <span className="text-gray-800 text-2xl font-semibold">VistaCare</span>
          </div>
        </Link>

        {user && (
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/dashboard">
              <Button
                variant={isActive('/dashboard') ? "default" : "ghost"}
                className={`px-3 ${isActive('/dashboard') ? 'bg-primary-blue text-white' : 'text-gray-700'}`}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            
            <Link to="/patients">
              <Button
                variant={isActive('/patients') ? "default" : "ghost"}
                className={`px-3 ${isActive('/patients') ? 'bg-primary-blue text-white' : 'text-gray-700'}`}
              >
                <Users className="mr-2 h-4 w-4" />
                Pacientes
              </Button>
            </Link>
            
            <Link to="/rooms">
              <Button
                variant={isActive('/rooms') ? "default" : "ghost"}
                className={`px-3 ${isActive('/rooms') ? 'bg-primary-blue text-white' : 'text-gray-700'}`}
              >
                <Bed className="mr-2 h-4 w-4" />
                Quartos
              </Button>
            </Link>
            
            <Link to="/devices">
              <Button
                variant={isActive('/devices') ? "default" : "ghost"}
                className={`px-3 ${isActive('/devices') ? 'bg-primary-blue text-white' : 'text-gray-700'}`}
              >
                <Cpu className="mr-2 h-4 w-4" />
                Dispositivos
              </Button>
            </Link>
            
            <Link to="/settings">
              <Button
                variant={isActive('/settings') ? "default" : "ghost"}
                className={`px-3 ${isActive('/settings') ? 'bg-primary-blue text-white' : 'text-gray-700'}`}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Button>
            </Link>
          </nav>
        )}

        <div className="flex items-center">
          {user && (
            <>
              <div className="mr-2 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Bell className="h-5 w-5" />
                      {unreadAlerts > 0 && (
                        <span className="absolute -top-1 -right-1 bg-status-urgent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                          {unreadAlerts}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    <h3 className="font-medium px-2 py-1.5 border-b">Notificações</h3>
                    {alerts.length > 0 ? (
                      alerts.map(alert => (
                        <DropdownMenuItem key={alert.id} className="cursor-pointer px-2 py-2">
                          <div className="flex items-start space-x-2">
                            <div className={`h-2 w-2 mt-1.5 rounded-full ${
                              alert.type === 'urgent' ? 'bg-status-urgent' : 
                              alert.type === 'alert' ? 'bg-status-alert' : 'bg-status-warning'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Quarto {alert.roomNumber}</p>
                              <p className="text-xs text-gray-500">{alert.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 p-3">Nenhuma notificação</p>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center text-sm bg-gray-100 rounded-full p-0.5 pl-2 pr-1 hover:bg-gray-200 transition-colors">
                    <span className="mr-1">{user.name.split(' ')[0]}</span>
                    <div className="h-8 w-8 rounded-full bg-primary-blue text-white flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
