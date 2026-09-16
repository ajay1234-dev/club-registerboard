"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { motion } from "framer-motion";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

interface LiveHeroProps {
  initialStatus: {
    registrationOpen: boolean;
    eventName: string;
    totalRegistrationCount: number;
    totalExpectedStudents: number;
  };
}

export default function LiveHero({ initialStatus }: LiveHeroProps) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "event"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStatus({
          registrationOpen: data.registrationOpen ?? true,
          eventName: data.eventName ?? "First Year Club Enrollment",
          totalRegistrationCount: data.totalRegistrationCount ?? 0,
          totalExpectedStudents: data.totalExpectedStudents ?? 900,
        });
      }
    });

    return () => unsub();
  }, []);

  return (
    <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
      {/* Status badge */}
      <div className="mb-6">
        {status.registrationOpen ? (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Registrations Open
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Registrations Closed
          </span>
        )}
      </div>

      {/* Headline */}
      <div className="mb-2 text-sm sm:text-base font-semibold text-gray-400 uppercase tracking-widest text-center flex flex-col items-center">
        <span>Meenakshi Sundararajan Engineering College</span>
        <span className="text-xs text-gray-500 mt-1">An Autonomous Institution</span>
      </div>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="font-outfit text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-50 leading-tight tracking-tight mb-4 mt-4"
      >
        {status.eventName.startsWith("First Year") ? (
          <>
            <motion.span 
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.3, duration: 1 }}
              className="rainbow-text"
            >
              First Year
            </motion.span>{" "}
            {status.eventName.slice(11)}
          </>
        ) : (
          status.eventName
        )}
      </motion.h1>

      <p className="text-lg sm:text-xl text-gray-400 max-w-lg mb-4">
        Pick your tribe. Find your people. Join a club that matches your passion.
      </p>

      {/* Registration count */}
      {status.totalRegistrationCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-10">
          <Users className="w-4 h-4" />
          <span>
            <span className="text-gray-300 font-semibold">
              {status.totalRegistrationCount.toLocaleString("en-IN")}
            </span>{" "}
            of {status.totalExpectedStudents.toLocaleString("en-IN")} students registered
          </span>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 items-center mt-2">
        {status.registrationOpen ? (
          <Link
            href="/register"
            id="register-now-btn"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg rounded-2xl shadow-lg shadow-indigo-500/20"
          >
            Register Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        ) : (
          <div className="px-8 py-4 rounded-2xl bg-gray-900 border border-gray-800 text-gray-500 text-lg">
            Registration has closed
          </div>
        )}
      </div>

      {/* Sub-hint */}
      <p className="mt-6 text-sm font-semibold text-gray-300">
        One club per student · No changes after submission
      </p>
    </section>
  );
}
