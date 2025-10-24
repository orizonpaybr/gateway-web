import { memo, ReactNode } from 'react'

interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  className?: string
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

const TabsContext = memo<TabsProps>(
  ({ defaultValue, value, onValueChange, children, className }) => {
    const [activeTab, setActiveTab] = React.useState(value || defaultValue)

    React.useEffect(() => {
      if (value !== undefined) {
        setActiveTab(value)
      }
    }, [value])

    const handleTabChange = (newValue: string) => {
      if (!value) {
        setActiveTab(newValue)
      }
      onValueChange?.(newValue)
    }

    return (
      <TabsProvider value={{ activeTab, setActiveTab: handleTabChange }}>
        <div className={className}>{children}</div>
      </TabsProvider>
    )
  },
)

TabsContext.displayName = 'TabsContext'

import React, { createContext, useContext } from 'react'

interface TabsContextType {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContextValue = createContext<TabsContextType | null>(null)

const TabsProvider = ({
  children,
  value,
}: {
  children: ReactNode
  value: TabsContextType
}) => (
  <TabsContextValue.Provider value={value}>
    {children}
  </TabsContextValue.Provider>
)

const useTabsContext = () => {
  const context = useContext(TabsContextValue)
  if (!context) {
    throw new Error('Tabs components must be used within Tabs')
  }
  return context
}

export const Tabs = memo<TabsProps>(
  ({ defaultValue, value, onValueChange, children, className = '' }) => {
    const [activeTab, setActiveTab] = React.useState(value || defaultValue)

    React.useEffect(() => {
      if (value !== undefined) {
        setActiveTab(value)
      }
    }, [value])

    const handleTabChange = React.useCallback(
      (newValue: string) => {
        if (!value) {
          setActiveTab(newValue)
        }
        onValueChange?.(newValue)
      },
      [value, onValueChange],
    )

    const contextValue = React.useMemo(
      () => ({ activeTab, setActiveTab: handleTabChange }),
      [activeTab, handleTabChange],
    )

    return (
      <TabsProvider value={contextValue}>
        <div className={className}>{children}</div>
      </TabsProvider>
    )
  },
)

Tabs.displayName = 'Tabs'

export const TabsList = memo<TabsListProps>(({ children, className = '' }) => {
  return (
    <div
      className={`inline-flex h-12 items-center justify-start rounded-lg bg-gray-100 p-1 text-gray-600 w-full md:w-auto ${className}`}
      role="tablist"
    >
      {children}
    </div>
  )
})

TabsList.displayName = 'TabsList'

export const TabsTrigger = memo<TabsTriggerProps>(
  ({ value, children, className = '' }) => {
    const { activeTab, setActiveTab } = useTabsContext()
    const isActive = activeTab === value

    return (
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => setActiveTab(value)}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
          isActive
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        } ${className}`}
      >
        {children}
      </button>
    )
  },
)

TabsTrigger.displayName = 'TabsTrigger'

export const TabsContent = memo<TabsContentProps>(
  ({ value, children, className = '' }) => {
    const { activeTab } = useTabsContext()

    if (activeTab !== value) {
      return null
    }

    return (
      <div
        role="tabpanel"
        className={`mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
      >
        {children}
      </div>
    )
  },
)

TabsContent.displayName = 'TabsContent'
