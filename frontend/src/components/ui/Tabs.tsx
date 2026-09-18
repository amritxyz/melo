import * as React from 'react'
import { cn } from '#/lib/utils'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
} & React.HTMLAttributes<HTMLDivElement>) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || '')
  const currentVal = value !== undefined ? value : activeTab

  const handleValueChange = (val: string) => {
    if (value === undefined) setActiveTab(val)
    onValueChange?.(val)
  }

  return (
    <TabsContext.Provider
      value={{ value: currentVal, onValueChange: handleValueChange }}
    >
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 w-full bg-zinc-50/50 dark:bg-zinc-900/40 px-1 overflow-x-auto whitespace-nowrap scrollbar-none',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: {
  value: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(TabsContext)
  const isSelected = ctx?.value === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => ctx?.onValueChange(value)}
      className={cn(
        'px-2.5 py-1.5 text-xs font-mono transition-colors border-b-2 -mb-px cursor-pointer shrink-0 min-h-[36px] sm:min-h-0 flex items-center justify-center',
        isSelected
          ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
          : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: {
  value: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(TabsContext)
  if (ctx?.value !== value) return null

  return (
    <div
      role="tabpanel"
      className={cn('pt-3 focus-visible:outline-none', className)}
      {...props}
    >
      {children}
    </div>
  )
}
