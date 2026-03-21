"use client";

import { createContext, useContext } from "react";

export const AuthContext = createContext<{ password: string }>({ password: "" });
export function useAdminAuth() {
  return useContext(AuthContext);
}
