"use client";

import { useState } from "react";
import { Edit2, Plus, Power, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ClubStatsModal from "./ClubStatsModal";
import { BarChart2 } from "lucide-react";
import type { Club } from "@/types";

interface ClubManagementProps {
  clubs: Club[];
  onUpdate: () => void;
}

const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.8));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export default function ClubManagement({ clubs, onUpdate }: ClubManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [statsClub, setStatsClub] = useState<Club | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openNew = () => {
    setEditingClub(null);
    setName("");
    setDescription("");
    setDisplayOrder(String(clubs.length + 1));
    setLogoFile(null);
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (club: Club) => {
    setEditingClub(club);
    setName(club.name);
    setDescription(club.description);
    setDisplayOrder(String(club.displayOrder));
    setLogoFile(null);
    setError(null);
    setIsModalOpen(true);
  };

  const toggleActive = async (club: Club) => {
    try {
      await fetch(`/api/admin/clubs/${club.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !club.active }),
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
      let logoUrl = editingClub?.logoUrl;

      // Handle logo upload if new file selected
      if (logoFile) {
        logoUrl = await resizeImage(logoFile);
      }

      const payload = {
        name,
        description,
        displayOrder: parseInt(displayOrder, 10),
        active: editingClub ? editingClub.active : true,
        logoUrl,
      };

      const url = editingClub ? `/api/admin/clubs/${editingClub.id}` : `/api/admin/clubs`;
      const method = editingClub ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setIsModalOpen(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || "Failed to save club");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-[#1e1e3f] flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f0f0ff]">Clubs</h2>
        <Button variant="primary" size="sm" onClick={openNew}>
          <Plus className="w-4 h-4" />
          Add Club
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {clubs.map((club) => (
          <div
            key={club.id}
            className={`p-3 rounded-xl border flex items-center gap-4 transition-colors ${
              club.active ? "bg-white/[0.02] border-gray-200 dark:border-[#1e1e3f]" : "bg-black/20 border-red-500/20 opacity-75"
            }`}
          >
            {/* Logo */}
            <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-800">
              {club.logoUrl ? (
                <img src={club.logoUrl} alt={club.name} className="object-contain p-0.5 w-full h-full" />
              ) : (
                <span className="text-lg font-bold text-gray-600 dark:text-[#a1a1c7]">{club.name.charAt(0)}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-[#f0f0ff] truncate">{club.name}</h3>
                {!club.active && (
                  <span className="text-[10px] uppercase font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">Inactive</span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-[#6b7280] truncate">{club.description || "No description"}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStatsClub(club)} className="px-2 text-cyan-400 hover:text-cyan-300">
                <BarChart2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openEdit(club)} className="px-2">
                <Edit2 className="w-4 h-4 text-gray-600 dark:text-[#a1a1c7]" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toggleActive(club)} className="px-2">
                <Power className={`w-4 h-4 ${club.active ? "text-red-400" : "text-green-400"}`} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClub ? "Edit Club" : "New Club"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-400 text-sm">{error}</div>}
          
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-600 dark:text-[#a1a1c7]">Description</label>
            <textarea
              className="input-field px-4 py-3 min-h-[100px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <Input label="Display Order" type="number" min="0" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} required disabled={isSubmitting} />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-600 dark:text-[#a1a1c7]">Logo</label>
            <div className="flex items-center gap-4">
               {/* Current logo preview if exists and no new file selected */}
               {editingClub?.logoUrl && !logoFile && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                    <img src={editingClub.logoUrl} alt="" className="object-cover w-full h-full" />
                  </div>
               )}
               <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                disabled={isSubmitting}
                className="text-sm text-gray-600 dark:text-[#a1a1c7] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/5 file:text-gray-900 dark:text-[#f0f0ff] hover:file:bg-white/10 file:cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>Save</Button>
          </div>
        </form>
      </Modal>

      <ClubStatsModal 
        club={statsClub} 
        isOpen={!!statsClub} 
        onClose={() => setStatsClub(null)} 
      />
    </div>
  );
}
