'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import {
  User,
  Settings,
  Moon,
  Sun,
  Monitor,
  HelpCircle,
  LogOut,
  Loader2,
  Check,
  Shield
} from 'lucide-react';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut({ callbackUrl: '/' });
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-none p-0">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          {/* <span className="hidden sm:inline-block">
            {user.name || user.email}
          </span> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
          <User className="mr-2 h-4 w-4" />
          Profile
          <DropdownMenuShortcut>⇧⌄P</DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
          <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
        </DropdownMenuItem>

        {user.role === 'admin' && (
          <DropdownMenuItem onClick={() => router.push('/admin')}>
            <Shield className="mr-2 h-4 w-4" />
            Admin
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Appearance</DropdownMenuLabel>

        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light Mode
          {theme === 'light' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark Mode
          {theme === 'dark' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          System
          {theme === 'system' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push('/dashboard/help')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Help & Support
          <DropdownMenuShortcut>?</DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600"
          disabled={loggingOut}
        >
          {loggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Log Out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
