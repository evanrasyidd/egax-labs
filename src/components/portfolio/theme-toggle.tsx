'use client'

import * as React from 'react'
import { Moon, Sun, Palette, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme, type ThemeName } from './theme-provider'

const themes: { key: ThemeName; label: string; desc: string; swatch: string }[] = [
  { key: 'dark', label: 'Dark', desc: 'Neutral default', swatch: '#0a0a0a' },
  { key: 'light', label: 'Light', desc: 'Clean white', swatch: '#ffffff' },
  { key: 'valentine', label: 'Valentine', desc: 'Rose pink', swatch: '#fff5f9' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const current = themes.find((t) => t.key === theme) ?? themes[0]
  const isDark = theme === 'dark'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
          aria-label="Ganti tema"
          title={`Theme: ${current.label}`}
        >
          {mounted ? (
            theme === 'dark' ? (
              <Moon className="h-[1.1rem] w-[1.1rem]" />
            ) : theme === 'light' ? (
              <Sun className="h-[1.1rem] w-[1.1rem]" />
            ) : (
              <Palette className="h-[1.1rem] w-[1.1rem]" />
            )
          ) : (
            <div className="h-[1.1rem] w-[1.1rem]" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Pilih tema
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.key}
            onClick={() => setTheme(t.key)}
            className="flex items-center gap-2.5 py-2"
          >
            <span
              className="h-5 w-5 shrink-0 rounded-md border border-border"
              style={{ backgroundColor: t.swatch }}
              aria-hidden
            />
            <span className="flex-1">
              <span className="block text-sm font-medium leading-tight">{t.label}</span>
              <span className="block text-[10px] text-muted-foreground">{t.desc}</span>
            </span>
            {theme === t.key && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
