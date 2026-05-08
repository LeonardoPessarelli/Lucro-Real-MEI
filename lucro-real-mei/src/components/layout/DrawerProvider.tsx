'use client'
import { createContext, useContext, useState } from 'react'

interface DrawerCtx {
  drawerOpen: boolean
  toggleDrawer: () => void
  closeDrawer: () => void
}

const DrawerContext = createContext<DrawerCtx>({
  drawerOpen: false,
  toggleDrawer: () => {},
  closeDrawer: () => {},
})

export function useDrawer() {
  return useContext(DrawerContext)
}

export default function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  return (
    <DrawerContext.Provider value={{
      drawerOpen,
      toggleDrawer: () => setDrawerOpen(v => !v),
      closeDrawer: () => setDrawerOpen(false),
    }}>
      {children}
    </DrawerContext.Provider>
  )
}
