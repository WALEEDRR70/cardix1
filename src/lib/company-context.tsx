import { createContext, useContext } from "react";
import type { Company, CompanyRole } from "@/lib/workspace";

export type CompanyCtx = { company: Company; role: CompanyRole };

const Ctx = createContext<CompanyCtx | null>(null);

export function CompanyProvider({ value, children }: { value: CompanyCtx; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCompany(): CompanyCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCompany must be used inside a company workspace route");
  return ctx;
}
