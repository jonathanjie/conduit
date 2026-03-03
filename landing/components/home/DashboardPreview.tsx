"use client";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

const CALLOUTS = [
  { label: "Active Students", value: "143", delta: "+12 this month" },
  { label: "Messages Relayed", value: "3,847", delta: "last 30 days" },
  { label: "Tokens Generated", value: "28", delta: "this semester" },
];

export default function DashboardPreview() {
  return (
    <section className="bg-bg-dark py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/70 border border-white/20 mb-4">
            The Dashboard
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Your operations, at a glance
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            A web-first admin panel your office staff will actually use. Students, mappings, broadcasts — all in one place.
          </p>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          {CALLOUTS.map((c) => (
            <motion.div
              key={c.label}
              variants={staggerItem}
              className="rounded-2xl p-6 bg-white/[0.05] border border-white/[0.08]"
            >
              <p className="text-white/50 text-sm mb-2">{c.label}</p>
              <p className="font-display text-4xl font-bold text-white mb-1">{c.value}</p>
              <p className="text-primary-light text-xs">{c.delta}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Dashboard table mockup */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="rounded-3xl bg-white/[0.04] border border-white/[0.08] overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
            <span className="text-white text-sm font-semibold">Students</span>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-primary text-white font-medium">+ Add Student</span>
              <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/60">Import CSV</span>
            </div>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {[
              { name: "Emma Tan", teacher: "Mrs Tan", subject: "Mathematics", status: "Active" },
              { name: "Jayden Lim", teacher: "Mr Wong", subject: "Mathematics", status: "Active" },
              { name: "Sophia Ng", teacher: "Mrs Tan", subject: "Mathematics", status: "Pending" },
              { name: "Ethan Ong", teacher: "Mr Wong", subject: "Mathematics", status: "Active" },
            ].map((row) => (
              <div key={row.name} className="px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-light">
                    {row.name[0]}
                  </div>
                  <span className="text-white text-sm">{row.name}</span>
                </div>
                <span className="text-white/50 text-xs hidden md:block">{row.teacher}</span>
                <span className="text-white/50 text-xs hidden md:block">{row.subject}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  row.status === "Active"
                    ? "bg-green-500/15 text-green-400"
                    : "bg-amber-500/15 text-amber-400"
                }`}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
