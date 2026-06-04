import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import Header from "../../../components/superadmin/Header";
import Charts from "../../../components/superadmin/Charts";
import DataTable from "../../../components/superadmin/DataTable";
import { fetchReports } from "../superAdminApi";

function Reports() {
  const [rows, setRows] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadReports = async () => {
      setLoading(true);
      setError("");

      try {
        const reports = await fetchReports();
        if (!active) return;

        setRows(reports.rows);
        setChartData(reports.chartData);
        setError(reports.error);
      } catch (requestError) {
        if (active) setError(requestError.message || "Unable to load reports.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  const columns = [
    { key: "name", label: "Clinic" },
    {
      key: "revenue",
      label: "Revenue Report",
      render: (clinic) => `Rs. ${clinic.revenue.toLocaleString("en-IN")}`,
    },
    { key: "users", label: "User Activity" },
    {
      key: "performance",
      label: "Clinic Performance",
      render: (clinic) => (clinic.status === "Active" ? "Healthy" : "Needs Review"),
    },
  ];

  return (
    <>
      <Header
        title="Reports"
        subtitle="Revenue, user activity, and clinic performance reports."
        action={
          <>
            <button className="sa-btn">
              <Download size={16} />
              Export PDF
            </button>
            <button className="sa-btn sa-btn-primary">
              <Download size={16} />
              Export Excel
            </button>
          </>
        }
      />

      <div className="sa-panel">
        <h3>Reports Dashboard</h3>
        <p>Monthly revenue report and usage trend.</p>
        {loading ? <div className="sa-state">Loading reports...</div> : null}
        {!loading && error ? <div className="sa-state sa-state--error">{error}</div> : null}
        {!loading && !error ? <Charts data={chartData} type="line" dataKey="revenue" secondaryKey="users" /> : null}
      </div>

      <div style={{ marginTop: 16 }}>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          emptyMessage="No report records found."
        />
      </div>
    </>
  );
}

export default Reports;
