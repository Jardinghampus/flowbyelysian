"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface MobileMenuContextValue {
  isMenuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

const MobileMenuContext = createContext<MobileMenuContextValue>({
  isMenuOpen: false,
  setMenuOpen: () => {},
})

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isMenuOpen, setMenuOpen] = useState(false)
  return (
    <MobileMenuContext.Provider value={{ isMenuOpen, setMenuOpen }}>
      {children}
    </MobileMenuContext.Provider>
  )
}

export function useMobileMenu() {
  return useContext(MobileMenuContext)
}
