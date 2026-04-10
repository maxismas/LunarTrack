'use client'

import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  ChevronDown,
  FileText,
  LogOut,
  Settings,
  Users,
  Home,
  Calendar,
} from 'lucide-react'

const navItems = {
  MANAGER: [
    { label: 'Dashboard', href: '/manager', icon: Home },
    { label: 'New Meeting', href: '/manager/meetings/new', icon: Calendar },
    { label: 'Quarterly Review', href: '/manager/quarterly/new', icon: FileText },
    { label: 'My Team', href: '/manager/employees', icon: Users },
  ],
  EMPLOYEE: [
    { label: 'My Meetings', href: '/employee', icon: Home },
  ],
  HR_ADMIN: [
    { label: 'Dashboard', href: '/hr', icon: BarChart3 },
    { label: 'Rating Distribution', href: '/hr/ratings', icon: BarChart3 },
  ],
  SUPER_ADMIN: [
    { label: 'Dashboard', href: '/manager', icon: Home },
    { label: 'User Management', href: '/admin', icon: Users },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ],
}

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session?.user) return null

  const role = session.user.role as keyof typeof navItems
  const items = navItems[role] || []

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col h-full w-64 bg-lunar-dark border-r border-lunar-border">
      {/* Logo */}
      <div className="p-6 border-b border-lunar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-lunar-accent rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">LR</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">LunarTrack</h1>
            <p className="text-xs text-lunar-muted">by Lunar Rails</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-lunar-accent text-white'
                  : 'text-lunar-muted hover:text-white hover:bg-lunar-dark-2'
              )}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-lunar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-3 h-auto py-2 hover:bg-lunar-dark-2 text-white"
            >
              <div className="flex items-center gap-3 text-left">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-lunar-accent text-white text-xs">
                    {getInitials(session.user.name || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-white">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-lunar-muted truncate">
                    {session.user.role}
                  </p>
                </div>
              </div>
              <ChevronDown size={16} className="text-lunar-muted" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-semibold">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings size={16} className="mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ redirect: true, redirectUrl: '/login' })}
              className="cursor-pointer text-red-600"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
