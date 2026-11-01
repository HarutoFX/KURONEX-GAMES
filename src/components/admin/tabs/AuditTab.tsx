"use client";

import React from "react";
import { AuditLog } from "@/lib/admin-store";

interface AuditTabProps {
  filteredLogs: AuditLog[];
}

export function AuditTab({ filteredLogs }: AuditTabProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-2xl border border-[#35151C] bg-[#130A0C]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#35151C] bg-[#1A0D10]/50 text-[10px] font-mono text-[#A1A1AA] uppercase">
              <th className="py-3 px-4">Event ID</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Target</th>
              <th className="py-3 px-4">Details</th>
              <th className="py-3 px-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#35151C]/60 text-white">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#1A0D10]/60 transition-colors">
                <td className="py-3 px-4 font-mono text-[10px] text-[#A1A1AA]">
                  {log.id}
                </td>
                <td className="py-3 px-4 font-semibold text-white">
                  {log.action}
                </td>
                <td className="py-3 px-4 font-mono text-[10px] text-[#FF263D]">
                  {log.category}
                </td>
                <td className="py-3 px-4 font-mono text-white">
                  @{log.actor}
                </td>
                <td className="py-3 px-4 text-[#A1A1AA]">
                  {log.target}
                </td>
                <td className="py-3 px-4 text-[#A1A1AA] max-w-sm truncate">
                  {log.details}
                </td>
                <td className="py-3 px-4 text-right font-mono text-[10px] text-[#A1A1AA]">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
