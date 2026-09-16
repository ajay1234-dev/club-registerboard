"use client";

import { motion } from "framer-motion";
import { AlertOctagon, RotateCcw } from "lucide-react";
import Button from "@/components/ui/Button";

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorScreen({
  message,
  onRetry,
}: ErrorScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.1 }}
        className="w-full max-w-sm"
      >
        {/* Error icon ring */}
        <div className="relative flex items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.3 }}
            className="absolute w-32 h-32 rounded-full bg-red-500/10"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
            className="absolute w-24 h-24 rounded-full bg-red-500/15"
          />
          <AlertOctagon className="w-16 h-16 text-red-400 relative z-10" strokeWidth={1.5} />
        </div>

        {/* Error text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#f0f0ff] mb-2">
            Registration Blocked 🛑
          </h1>
        </motion.div>

        {/* Message card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card border border-red-500/30 p-6 mb-8 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
        >
          <p className="text-gray-900 dark:text-[#f0f0ff] font-medium text-lg leading-relaxed">
            {message}
          </p>
        </motion.div>

        {/* Footer actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button variant="secondary" onClick={onRetry} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Go Back to Form
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
