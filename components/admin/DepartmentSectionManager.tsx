"use client";

import { useState } from "react";
import { Plus, Edit2, Power } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import type { DepartmentConfig, SectionConfig } from "@/types";

interface DepartmentSectionManagerProps {
  departments: DepartmentConfig[];
  sections: SectionConfig[];
  onUpdate: () => void;
}

type Mode = "departments" | "sections";

export default function DepartmentSectionManager({ departments, sections, onUpdate }: DepartmentSectionManagerProps) {
  const [activeTab, setActiveTab] = useState<Mode>("departments");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openNew = () => {
    setEditingId(null);
    setName("");
    setDisplayOrder(String(activeTab === "departments" ? departments.length : sections.length));
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: DepartmentConfig | SectionConfig) => {
    setEditingId(item.id);
    setName(item.name);
    setDisplayOrder(String(item.displayOrder));
    setError(null);
    setIsModalOpen(true);
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: activeTab === "departments" ? "update_department" : "update_section",
          [activeTab === "departments" ? "departmentId" : "sectionId"]: id,
          updates: { active: !currentActive },
        }),
      });
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let action = "";
      const payload: any = {};

      if (editingId) {
        action = activeTab === "departments" ? "update_department" : "update_section";
        payload[activeTab === "departments" ? "departmentId" : "sectionId"] = editingId;
        payload.updates = { name, displayOrder: parseInt(displayOrder, 10) };
      } else {
        action = activeTab === "departments" ? "add_department" : "add_section";
        payload[activeTab === "departments" ? "department" : "section"] = { name, displayOrder: parseInt(displayOrder, 10) };
      }

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setIsModalOpen(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentList = activeTab === "departments" ? departments : sections;

  return (
    <div className="glass-card flex flex-col h-[500px]">
      <div className="p-4 border-b border-gray-200 dark:border-[#1e1e3f] flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("departments")}
            className={`text-sm font-semibold transition-colors ${activeTab === "departments" ? "text-violet-400" : "text-[#6b7280] hover:text-gray-600 dark:text-[#a1a1c7]"}`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab("sections")}
            className={`text-sm font-semibold transition-colors ${activeTab === "sections" ? "text-violet-400" : "text-[#6b7280] hover:text-gray-600 dark:text-[#a1a1c7]"}`}
          >
            Sections
          </button>
        </div>
        <Button variant="secondary" size="sm" onClick={openNew}>
          <Plus className="w-4 h-4" />
          Add {activeTab === "departments" ? "Dept" : "Section"}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-2">
        {currentList.length === 0 ? (
          <p className="text-center text-[#6b7280] py-8 text-sm">No items found</p>
        ) : (
          currentList.map((item) => (
            <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${item.active ? "bg-white/[0.02] border-gray-200 dark:border-[#1e1e3f]" : "bg-black/20 border-red-500/20 opacity-75"}`}>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-[#f0f0ff]">{item.name}</span>
                {!item.active && <span className="text-[10px] uppercase font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">Inactive</span>}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="px-2">
                  <Edit2 className="w-4 h-4 text-gray-600 dark:text-[#a1a1c7]" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toggleActive(item.id, item.active)} className="px-2">
                  <Power className={`w-4 h-4 ${item.active ? "text-red-400" : "text-green-400"}`} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${editingId ? "Edit" : "Add"} ${activeTab === "departments" ? "Department" : "Section"}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
          <Input label="Display Order" type="number" min="0" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} required disabled={isSubmitting} />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
