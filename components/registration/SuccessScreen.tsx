"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, Sparkles } from "lucide-react";

interface SuccessScreenProps {
  clubName: string;
  clubLogoUrl: string;
  studentName: string;
}

export default function SuccessScreen({
  clubName,
  clubLogoUrl,
  studentName,
}: SuccessScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.1 }}
        className="w-full max-w-sm"
      >
        {/* Success icon ring */}
        <div className="relative flex items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.3 }}
            className="absolute w-32 h-32 rounded-full bg-green-500/10"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
            className="absolute w-24 h-24 rounded-full bg-green-500/15"
          />
          <CheckCircle2 className="w-16 h-16 text-green-400 relative z-10" strokeWidth={1.5} />
        </div>

        {/* Success text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#f0f0ff] mb-2">
            You&apos;re in, {studentName.split(" ")[0]}! 🎉
          </h1>
          <p className="text-gray-600 dark:text-[#a1a1c7] text-sm">
            Registration confirmed. Welcome to
          </p>
        </motion.div>

        {/* Club card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card border border-violet-500/30 p-6 mb-8 glow-violet"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-white dark:bg-[#14142a] flex items-center justify-center">
              {clubLogoUrl ? (
                <Image
                  src={clubLogoUrl}
                  alt={clubName}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold gradient-text">
                  {clubName.charAt(0)}
                </span>
              )}
            </div>
            <div className="text-left">
              <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-1">
                Your Club
              </p>
              <p className="text-xl font-bold gradient-text">{clubName}</p>
            </div>
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-center gap-2 text-[#6b7280] text-sm">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Look out for your club&apos;s announcements!</span>
          </div>
          <p className="text-xs text-[#4b5563]">
            Keep an eye on the live leaderboard on the projector screen
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
