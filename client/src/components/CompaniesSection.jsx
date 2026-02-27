// src/components/CompaniesSection.jsx
// Replaces your existing companies list UI.
// Import and use in whichever page renders your companies list.
//
// Example:
//   import CompaniesSection from "../components/CompaniesSection";
//   <CompaniesSection onSelect={(company) => setSelectedCompany(company)} />

import React from "react";
import { useCompanies } from "../hooks/useCompanies";
import { RefreshCw, AlertCircle, Loader2, Building2 } from "lucide-react";

// onSelect — optional callback fired when a company card is clicked
export default function CompaniesSection({ onSelect }) {
  const { companies, loading, error, refetch, attempt } = useCompanies();

  // ── Loading / cold-start state ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
        <Loader2 className="w-9 h-9 animate-spin text-orange-500" />
        <p className="text-sm font-semibold text-slate-700">
          {attempt === 0
            ? "Loading companies…"
            : `Server is waking up — retrying (${attempt} / 4)…`}
        </p>
        {attempt > 0 && (
          <p className="text-xs text-slate-400 max-w-xs text-center">
            Render free tier goes to sleep after inactivity. This can take up to
            30 seconds on the first load.
          </p>
        )}
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-9 h-9 text-red-400" />
        <p className="text-sm font-semibold text-slate-700 max-w-xs text-center">
          {error}
        </p>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition-colors shadow"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // ── Empty state ──
  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
        <Building2 className="w-9 h-9 text-slate-300" />
        <p className="text-sm font-semibold">No companies found.</p>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    );
  }

  // ── Companies grid ──
  return (
    <div>
      {/* Section header with count + manual refresh */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500 font-medium">
          {companies.length} {companies.length === 1 ? "company" : "companies"}
        </p>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          title="Refresh companies"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company) => (
          <div
            key={company._id}
            onClick={() => onSelect?.(company)}
            className={`p-4 bg-white rounded-xl border-2 border-slate-200 shadow-sm transition-all duration-150 ${
              onSelect
                ? "cursor-pointer hover:border-orange-400 hover:shadow-md active:scale-[0.98]"
                : ""
            }`}
          >
            {/* Logo + name */}
            <div className="flex items-center gap-3 mb-3">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${
                    company.logoColor || "from-slate-600 to-slate-800"
                  }`}
                >
                  <span className="text-white font-bold text-sm">
                    {company.logoInitials}
                  </span>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 text-sm leading-tight truncate">
                  {company.name}
                </p>
                {company.shortName && company.shortName !== company.name && (
                  <p className="text-xs text-slate-400 truncate">
                    {company.shortName}
                  </p>
                )}
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-1 text-xs text-slate-600">
              {company.phone && (
                <div className="flex items-center gap-2 truncate">
                  <span className="flex-shrink-0">📞</span>
                  <span className="truncate">{company.phone}</span>
                </div>
              )}
              {company.email && (
                <div className="flex items-center gap-2 truncate">
                  <span className="flex-shrink-0">✉️</span>
                  <span className="truncate">{company.email}</span>
                </div>
              )}
              {company.address && (
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0">📍</span>
                  <span className="leading-relaxed line-clamp-2">
                    {company.address}
                  </span>
                </div>
              )}
              {company.pvt && (
                <p className="font-mono text-slate-400 text-[10px] pt-1 truncate">
                  {company.pvt}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
