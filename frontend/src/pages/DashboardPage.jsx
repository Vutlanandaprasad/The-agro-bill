import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api } from "../lib/api.js";

const PIE_COLORS = ["#22c55e", "#ef4444"];

export function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const summaryRes = await api.get("/bills/dashboard/summary");
        setSummary(summaryRes.data.summary);
        setCharts(summaryRes.data.charts);
      } catch (err) {
        console.error("Dashboard error:", err);
        setSummary(null);
        setCharts(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!summary || !charts) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Unable to load dashboard. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border-2 border-primary-700 bg-white p-5 md:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-black text-slate-700">
              📊 Overview
            </h2>
            <p className="text-base font-semibold text-slate-800 mt-2">
              Interest is calculated dynamically until a bill is marked as paid.
            </p>
          </div>
          <div className="ml-auto rounded-lg bg-slate-900 px-5 py-3 text-base font-black text-white shadow-lg whitespace-nowrap border-2 border-primary-600">
            Bills: {summary.totalBillsCount}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <SummaryCard
          title="Total Principal"
          value={`₹ ${summary.totalPrincipal.toFixed(2)}`}
          gradient="from-emerald-500 to-emerald-600"
        />
        <SummaryCard
          title="Total Interest"
          value={`₹ ${summary.totalInterest.toFixed(2)}`}
          gradient="from-orange-500 to-orange-600"
        />
        <SummaryCard
          title="Pending Amount"
          value={`₹ ${summary.totalPending.toFixed(2)}`}
          gradient="from-rose-500 to-rose-600"
        />
        <SummaryCard
          title="Total Paid"
          value={`₹ ${summary.totalPaid.toFixed(2)}`}
          gradient="from-sky-500 to-sky-600"
        />
        <SummaryCard
          title="Pending Interest"
          value={`₹ ${summary.pendingInterest.toFixed(2)}`}
          gradient="from-amber-500 to-amber-600"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Spending Trend
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              Daily
            </span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickMargin={6}
                  stroke="#9ca3af"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${value}`, "Total"]}
                  contentStyle={{
                    fontSize: 10,
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Section-wise Breakdown
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.sectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="section"
                    tick={{ fontSize: 9 }}
                    tickMargin={6}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${value}`, "Total"]}
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Paid vs Unpaid
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={charts.paidVsUnpaidData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {charts.paidVsUnpaidData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={24}
                    iconSize={10}
                    formatter={(value) => (
                      <span style={{ fontSize: 10 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Interest per bill (from backend) */}
      {charts.billsWithInterest.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Interest till date (all bills with interest)
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Interest is calculated by the system. Below values are from the
            backend.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600 font-medium">
                  <th className="py-2 pr-3">Bill / Section</th>
                  <th className="py-2 pr-3 text-right">Principal (₹)</th>
                  <th className="py-2 pr-3 text-right">Interest (₹)</th>
                  <th className="py-2 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {charts.billsWithInterest.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2 pr-3">
                      <span className="font-medium text-slate-800">
                        {row.title}
                      </span>
                      <span className="text-slate-500 ml-1">
                        · {row.section}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {row.principal.toFixed(2)}
                    </td>
                    <td className="py-2 pr-3 text-right font-medium text-amber-600">
                      {row.interest.toFixed(2)}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {row.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, gradient }) {
  return (
    <button className="group flex flex-col rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-[1px] text-left shadow-md transition hover:shadow-lg">
      <div className="flex flex-1 flex-col justify-between rounded-xl bg-slate-900/80 p-3 text-slate-50">
        <p className="text-xs font-medium text-slate-300">{title}</p>
        <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
        <span
          className={
            "mt-2 inline-flex h-6 items-center justify-center rounded-full bg-gradient-to-r px-2 text-[10px] font-semibold uppercase tracking-wide text-white opacity-90 group-hover:opacity-100 " +
            gradient
          }
        >
          View details
        </span>
      </div>
    </button>
  );
}
