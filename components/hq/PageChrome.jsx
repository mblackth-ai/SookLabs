"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const PageChromeContext = createContext({
  pageTitle: null,
  setPageTitle: () => {},
});

export function PageChromeProvider({ children }) {
  const [pageTitle, setPageTitleState] = useState(null);

  const setPageTitle = useCallback((title) => {
    setPageTitleState(title || null);
  }, []);

  const value = useMemo(() => ({ pageTitle, setPageTitle }), [pageTitle, setPageTitle]);

  return <PageChromeContext.Provider value={value}>{children}</PageChromeContext.Provider>;
}

export function usePageChrome() {
  return useContext(PageChromeContext);
}

/** Sync TopBar title into DashShell mobile chrome. */
export function PageTitleBridge({ title }) {
  const { setPageTitle } = usePageChrome();
  const safeTitle = typeof title === "string" ? title : null;

  useEffect(() => {
    setPageTitle(safeTitle);
    return () => setPageTitle(null);
  }, [safeTitle, setPageTitle]);

  return null;
}
