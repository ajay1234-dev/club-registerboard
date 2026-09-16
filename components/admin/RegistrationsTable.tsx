"use client";

import { useState, useEffect, useCallback } from "react";

import { Search, ChevronLeft, ChevronRight, Download, Filter } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { formatDate } from "@/lib/utils/helpers";
import type { AdminRegistration, Club, DepartmentConfig, SectionConfig } from "@/types";

interface RegistrationsTableProps {
  clubs: Club[];
  departments: DepartmentConfig[];
  sections: SectionConfig[];
}

export default function RegistrationsTable({ clubs, departments, sections }: RegistrationsTableProps) {
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [clubFilter, setClubFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(clubFilter && { club: clubFilter }),
        ...(deptFilter && { dept: deptFilter }),
        ...(sectionFilter && { section: sectionFilter }),
      });

      const res = await fetch(`/api/admin/registrations?${params}`);
      const data = await res.json();

      if (data.success) {
        setRegistrations(data.data.registrations);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch registrations", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, clubFilter, deptFilter, sectionFilter]);

  useEffect(() => {
    // Debounce search slightly
    const timeoutId = setTimeout(() => {
      fetchRegistrations();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchRegistrations]);

  const handleExport = () => {
    window.location.href = "/api/admin/export";
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-[#1e1e3f] flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f0f0ff]">Registrations ({total})</h2>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-[#1e1e3f] bg-black/20 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" />
            <Input
              placeholder="Search name, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 py-2"
            />
          </div>
        </div>
        <div className="w-[160px]">
          <Select
            value={clubFilter}
            onChange={(e) => {
              setClubFilter(e.target.value);
              setPage(1);
            }}
            options={[{ value: "", label: "All Clubs" }, ...clubs.map(c => ({ value: c.id, label: c.name }))]}
            className="py-2"
          />
        </div>
        <div className="w-[140px]">
          <Select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
             options={[{ value: "", label: "All Depts" }, ...departments.map(d => ({ value: d.name, label: d.name }))]}
            className="py-2"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-gray-100 dark:bg-[#0f0f1e] text-gray-600 dark:text-[#a1a1c7] z-10 shadow-sm border-b border-gray-200 dark:border-[#1e1e3f]">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Dept / Section</th>
              <th className="px-6 py-3 font-medium">Club</th>
              <th className="px-6 py-3 font-medium">Registered At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e3f]/50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#6b7280]">
                  Loading...
                </td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#6b7280]">
                  No registrations found
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900 dark:text-[#f0f0ff]">{reg.name}</td>
                  <td className="px-6 py-3 text-gray-600 dark:text-[#a1a1c7]">{reg.email}</td>
                  <td className="px-6 py-3 text-gray-600 dark:text-[#a1a1c7]">{reg.department} - {reg.section}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 bg-violet-500/10 text-violet-400 rounded-md text-xs font-medium border border-violet-500/20">
                      {reg.clubName}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[#6b7280]">{formatDate(reg.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-200 dark:border-[#1e1e3f] flex items-center justify-between text-sm text-gray-600 dark:text-[#a1a1c7]">
        <div>
          Showing {registrations.length > 0 ? (page - 1) * 50 + 1 : 0} to{" "}
          {Math.min(page * 50, total)} of {total}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0 || isLoading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
