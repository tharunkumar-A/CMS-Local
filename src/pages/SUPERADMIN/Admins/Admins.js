import React, { useEffect, useMemo, useState } from "react";
import { Eye, Plus } from "lucide-react";
import Header from "../../../components/superadmin/Header";
import DataTable from "../../../components/superadmin/DataTable";
import SearchFilter from "../../../components/superadmin/SearchFilter";
import { createClinicAdmin, fetchAdmins } from "../superAdminApi";

const emptyAdmin = {
  name: "",
  email: "",
  assignedClinic: "",
  role: "Clinic Admin",
  status: "Active",
};

function Admins() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(emptyAdmin);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAdmins = async () => {
    setLoading(true);
    setError("");

    try {
      setAdmins(await fetchAdmins());
    } catch (requestError) {
      setError(requestError.message || "Unable to load admins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await createClinicAdmin(form);
      setForm(emptyAdmin);
      setShowForm(false);
      await loadAdmins();
    } catch (requestError) {
      setError(requestError.message || "Unable to create admin.");
    } finally {
      setSaving(false);
    }
  };

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return admins.filter((admin) => {
      const matchesSearch = [admin.name, admin.email, admin.assignedClinic, admin.role]
        .some((value) => String(value).toLowerCase().includes(query));
      const matchesStatus = status === "All" || admin.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [admins, search, status]);

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email", width: "minmax(170px, 1.2fr)" },
    { key: "assignedClinic", label: "Assigned Clinic" },
    { key: "role", label: "Role" },
    {
      key: "status",
      label: "Status",
      width: "minmax(90px, 0.6fr)",
      render: (admin) => (
        <span className={`sa-badge ${admin.status === "Active" ? "is-active" : "is-danger"}`}>
          {admin.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "minmax(112px, 0.7fr)",
      render: (admin) => (
        <div className="sa-actions">
          <button className="sa-icon-btn" onClick={() => setSelectedAdmin(admin)} title="View admin">
            <Eye size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header
        title="Admin Management"
        subtitle={`${rows.length} admins found`}
        action={
          <button
            className="sa-btn sa-btn-primary"
            onClick={() => {
              setSelectedAdmin(null);
              setShowForm((value) => !value);
            }}
          >
            <Plus size={16} />
            Create Admin
          </button>
        }
      />

      <SearchFilter
        value={search}
        onChange={setSearch}
        placeholder="Search admins by name, email, clinic, or role..."
        filters={["All", "Active", "Inactive"]}
        selectedFilter={status}
        onFilterChange={setStatus}
      />

      {showForm ? (
        <form className="sa-form-card" style={{ marginBottom: 16 }} onSubmit={handleCreateAdmin}>
          <h3>Create Admin</h3>
          {error ? <div className="sa-state sa-state--error">{error}</div> : null}
          <div className="sa-form-grid">
            {["name", "email", "assignedClinic", "role"].map((key) => (
              <div className="sa-form-field" key={key}>
                <label>{key === "assignedClinic" ? "Assigned Clinic" : key.replace(/^\w/, (letter) => letter.toUpperCase())}</label>
                <input name={key} value={form[key]} onChange={handleChange} required />
              </div>
            ))}
            <div className="sa-form-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="sa-page-actions" style={{ marginTop: 14 }}>
            <button type="button" className="sa-btn" onClick={() => setShowForm(false)}>
              Close
            </button>
            <button className="sa-btn sa-btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Admin"}
            </button>
          </div>
        </form>
      ) : null}

      {selectedAdmin ? (
        <div className="sa-form-card" style={{ marginBottom: 16 }}>
          <Header
            title="View Admin"
            subtitle={selectedAdmin.id}
            action={
              <button className="sa-btn" onClick={() => setSelectedAdmin(null)}>
                Close
              </button>
            }
          />
          <div className="sa-form-grid">
            {["name", "email", "assignedClinic", "role", "status"].map((key) => (
              <div className="sa-form-field" key={key}>
                <label>{key === "assignedClinic" ? "Assigned Clinic" : key.replace(/^\w/, (letter) => letter.toUpperCase())}</label>
                <input value={selectedAdmin?.[key] || ""} readOnly />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={!showForm ? error : ""}
        emptyMessage="No admins match your filters."
      />
    </>
  );
}

export default Admins;
