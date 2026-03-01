"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconAlertTriangle } from "@tabler/icons-react";
import ReportProblemModal from "./ReportProblemModal";
import TimeRemainingIndicator from "./TimeRemainingIndicator";

/**
 * Child Compliance Widget
 * Floating component that shows time remaining and report button
 * Can be added to any page where child interacts
 */
export default function ChildComplianceWidget({ childId, position = "top-right" }) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <>
      {/* Floating Widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed ${positionClasses[position]} z-40 flex flex-col gap-3`}
      >
        {/* Time Indicator */}
        <TimeRemainingIndicator childId={childId} />

        {/* Report Button */}
        <motion.button
          onClick={() => setIsReportModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <IconAlertTriangle size={20} />
          <span className="text-sm">Reportar Problema</span>
        </motion.button>
      </motion.div>

      {/* Report Modal */}
      <ReportProblemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        childId={childId}
      />
    </>
  );
}
