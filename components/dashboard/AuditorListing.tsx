"use client";

import { Star } from "lucide-react";
import { auditors } from "@/hooks/auditorData";

export default function AuditorListingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          🔍 Smart Contract Auditors
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {auditors.map((auditor) => (
            <div
              key={auditor.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              {/* Profile */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={auditor.avatar}
                  alt={auditor.name}
                  className="w-12 h-12 rounded-full border border-gray-300"
                />
                <div>
                  <h2 className="font-semibold text-gray-800">{auditor.name}</h2>
                  <p className="text-xs text-gray-500">{auditor.type}</p>
                </div>
              </div>

              {/* Experience & Stats */}
              <div className="text-sm text-gray-700 mb-3">
                <p className="mb-1">
                  <span className="font-medium text-gray-800">Experience:</span>{" "}
                  {auditor.experience}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Audits Done:</span>{" "}
                  {auditor.audits}
                </p>
              </div>

              {/* Expertise */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1 font-medium">
                  Expertise
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {auditor.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Issue Stats */}
              <div className="flex justify-between text-xs text-gray-600 mt-3 mb-2">
                <div>
                  <span className="text-red-600 font-semibold">
                    {auditor.issues.critical}
                  </span>{" "}
                  Critical
                </div>
                <div>
                  <span className="text-yellow-600 font-semibold">
                    {auditor.issues.medium}
                  </span>{" "}
                  Medium
                </div>
                <div>
                  <span className="text-green-600 font-semibold">
                    {auditor.issues.low}
                  </span>{" "}
                  Low
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center">
                <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                  <Star size={14} fill="currentColor" />
                  {auditor.rating.toFixed(2)}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {auditor.fee}
                </div>
              </div>

              {/* Action */}
              <button className="mt-4 w-full bg-orange-600 text-white py-2 rounded-md text-sm font-medium hover:bg-orange-500 transition">
                Request Audit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
