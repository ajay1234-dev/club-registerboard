"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Club } from "@/types";

interface ClubStatsModalProps {
  club: Club | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  section: string;
  createdAt: string;
}

export default function ClubStatsModal({ club, isOpen, onClose }: ClubStatsModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !club) return;
    
    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/admin/clubs/${club.id}/stats`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success) {
          setStudents(data.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [club, isOpen]);

  if (!club) return null;

  // Group by department
  const depts = students.reduce((acc, student) => {
    if (!acc[student.department]) acc[student.department] = [];
    acc[student.department].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  // Sort departments by count descending
  const sortedDepts = Object.entries(depts).sort((a, b) => b[1].length - a[1].length);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${club.name} Statistics`} size="xl">
      <div className="flex flex-col gap-4 max-h-[70vh]">
        
        {/* Header Stats */}
        <div className="flex items-center gap-6 p-4 rounded-xl bg-white dark:bg-[#14142a] border border-gray-200 dark:border-[#1e1e3f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-[#a1a1c7] uppercase font-bold tracking-wider">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-[#f0f0ff]">{students.length}</p>
            </div>
          </div>
        </div>

        {/* Drill-down List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-600 dark:text-[#a1a1c7]">Loading statistics...</div>
          ) : sortedDepts.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-[#a1a1c7]">No registrations found for this club.</div>
          ) : (
            sortedDepts.map(([dept, deptStudents]) => {
              const isExpanded = expandedDept === dept;
              return (
                <div key={dept} className="border border-gray-200 dark:border-[#1e1e3f] rounded-xl overflow-hidden bg-white dark:bg-[#07070f]">
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                    onClick={() => setExpandedDept(isExpanded ? null : dept)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-600 dark:text-[#a1a1c7]" /> : <ChevronRight className="w-5 h-5 text-gray-600 dark:text-[#a1a1c7]" />}
                      <span className="font-semibold text-lg text-gray-900 dark:text-[#f0f0ff]">{dept}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-bold border border-cyan-500/20">
                        {deptStudents.length} students
                      </span>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-[#1e1e3f] bg-black/40">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-100 dark:bg-[#0f0f1e]/80 text-gray-600 dark:text-[#a1a1c7] border-b border-gray-200 dark:border-[#1e1e3f]">
                          <tr>
                            <th className="px-6 py-3 font-medium">Name</th>
                            <th className="px-6 py-3 font-medium">Section</th>
                            <th className="px-6 py-3 font-medium">Phone</th>
                            <th className="px-6 py-3 font-medium">Email</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e1e3f]/50">
                          {deptStudents.map(s => (
                            <tr key={s.id} className="hover:bg-white/[0.02]">
                              <td className="px-6 py-3 text-gray-900 dark:text-[#f0f0ff]">{s.name}</td>
                              <td className="px-6 py-3 text-gray-600 dark:text-[#a1a1c7]">{s.section}</td>
                              <td className="px-6 py-3 text-gray-600 dark:text-[#a1a1c7]">{s.phone || '-'}</td>
                              <td className="px-6 py-3 text-gray-600 dark:text-[#a1a1c7]">{s.email}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

      </div>
    </Modal>
  );
}
