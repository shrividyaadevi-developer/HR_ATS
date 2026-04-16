import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

import { candidates, selected } from "../services/api";
import { StatCard, PageTitle, ChartBox } from "../components/UI";

import { MdOutlineWorkHistory } from "react-icons/md";
import { IoPeople } from "react-icons/io5";
import { FaRegCalendarCheck } from "react-icons/fa";
import { MdIncompleteCircle } from "react-icons/md";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [jobData, setJobData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsRes, selectedRes] = await Promise.all([
        candidates.analytics(),
        selected.getAll()
      ]);

      setSummary(analyticsRes);

      // ✅ FINAL SELECTED COUNT
      setSelectedCount(selectedRes.length);

      // 🔥 Job-wise data
      const jobs = analyticsRes.job_breakdown.map(j => ({
        job: j.job_title,
        applicants: j.total_applicants,
        shortlisted: j.shortlisted
      }));
      setJobData(jobs);

      // 🔥 Status Distribution (UPDATED)
      setStatusData([
        { name: "Selected", value: selectedRes.length }, // ✅ real
        { name: "Rejected", value: analyticsRes.rejected },
        { name: "Pending", value: analyticsRes.pending }
      ]);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
      <PageTitle>Dashboard</PageTitle>

      {/* Stat Cards */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        <StatCard label="Total Jobs" value={summary?.total_jobs || 0} icon={<MdOutlineWorkHistory />} />
        <StatCard label="Candidates" value={summary?.total_candidates || 0} icon={<IoPeople />} />
        <StatCard label="Rejected" value={summary?.rejected || 0} icon={<FaRegCalendarCheck />} />
        <StatCard label="Selected" value={selectedCount} icon={<MdIncompleteCircle />} />
      </div>

      {/* CHART ROW 1 */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>

        <ChartBox title="Applicants per Job">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={jobData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="job"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="applicants" fill="var(--accent)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Shortlisted per Job">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={jobData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="job"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="shortlisted" fill="var(--accent2)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

      </div>

      {/* CHART ROW 2 */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>

        <ChartBox title="Hiring Status">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="value" fill="var(--accent3)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Applicants vs Shortlisted">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={jobData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="job"/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              <Line dataKey="applicants" stroke="var(--accent)" />
              <Line dataKey="shortlisted" stroke="var(--accent2)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

      </div>
    </div>
  );
}