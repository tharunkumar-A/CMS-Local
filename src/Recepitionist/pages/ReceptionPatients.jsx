import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { parseList, requestJson } from "../receptionApi";
import { useToast } from "../../components/ToastProvider";
import {
  buildAddress,
  emptyAddressParts,
  onlyPincodeValue,
  parseAddress,
  validateAddressParts,
} from "../../utils/address";
import {
  onlyAlpha,
  onlyIndianMobileValue,
  onlyNumberValue,
  validateAlpha,
  validateDate,
  validateGmail,
  validateMobile,
  validateNumeric,
  validateRequired,
  validateSelected,
} from "../../utils/validation";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  age: "",
  dateOfBirth: "",
  bloodGroup: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  gender: "Female",
  address: "",
  addressParts: emptyAddressParts,
};

function ReceptionPatients() {
  const navigate = useNavigate();
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchPatients = () =>
    requestJson("Patient")
      .then((data) => {
        setPatients(parseList(data));
        setMessage("");
      })
      .catch((error) => {
        setMessage(error.message);
        toast.error(error.message || "Unable to load patients.");
      });

  useEffect(() => {
    fetchPatients();
  }, []);

  const rows = useMemo(() => [...patients].reverse(), [patients]);

  const openAdd = () => {
    setForm(emptyForm);
    setFieldErrors({});
    setModal("add");
    setMessage("");
  };

  const openEdit = (patient) => {
    setForm({
      id: patient.id,
      name: patient.name || "",
      email: patient.email || "",
      phone: patient.phone || "",
      age: patient.age || "",
      dateOfBirth: patient.dateOfBirth || "",
      bloodGroup: patient.bloodGroup || "",
      emergencyContactName: patient.emergencyContactName || "",
      emergencyContactPhone: patient.emergencyContactPhone || "",
      gender: patient.gender || "Female",
      address: patient.address || "",
      addressParts: parseAddress(patient.address || ""),
    });
    setFieldErrors({});
    setModal("edit");
    setMessage("");
  };

  const updateAddressField = (name, value) => {
    const nextValue = name === "pincode" ? onlyPincodeValue(value) : value;
    setForm((prev) => {
      const addressParts = {
        ...(prev.addressParts || emptyAddressParts),
        [name]: nextValue,
      };

      return {
        ...prev,
        addressParts,
        address: buildAddress(addressParts),
      };
    });
    setFieldErrors((prev) => ({
      ...prev,
      address: "",
      [`address.${name}`]: "",
    }));
    setMessage("");
  };

  const updateField = (name, value) => {
    let nextValue = value;

    if (["name", "emergencyContactName"].includes(name)) {
      nextValue = onlyAlpha(value);
    }

    if (["phone", "emergencyContactPhone"].includes(name)) {
      nextValue = onlyIndianMobileValue(value);
    }

    if (name === "age") {
      nextValue = onlyNumberValue(value);
    }

    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setMessage("");
  };

  const validateForm = () => {
    const nextErrors = {
      name: validateAlpha(form.name, "Name"),
      email: validateGmail(form.email),
      phone: validateMobile(form.phone, "Phone"),
      age: validateNumeric(form.age, "Age", { integer: true }),
      dateOfBirth: validateDate(form.dateOfBirth, "Date of birth"),
      bloodGroup: validateRequired(form.bloodGroup, "Blood group"),
      emergencyContactName: validateAlpha(
        form.emergencyContactName,
        "Emergency contact name"
      ),
      emergencyContactPhone: validateMobile(
        form.emergencyContactPhone,
        "Emergency contact phone"
      ),
      gender: validateSelected(form.gender, "gender"),
      ...Object.fromEntries(
        Object.entries(validateAddressParts(form.addressParts, "Address")).map(
          ([key, value]) => [key === "address" ? "address" : `address.${key}`, value]
        )
      ),
    };

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const savePatient = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      const text = "Please fix the highlighted fields.";
      setMessage(text);
      toast.error(text);
      return;
    }

    const body = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      age: Number(form.age) || 0,
      dateOfBirth: form.dateOfBirth || "",
      bloodGroup: form.bloodGroup.trim(),
      emergencyContactName: form.emergencyContactName.trim(),
      emergencyContactPhone: form.emergencyContactPhone.trim(),
      gender: form.gender,
      address: buildAddress(form.addressParts),
    };

    try {
      if (modal === "edit" && form.id) {
        await requestJson(`Patient/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await requestJson("Patient", { method: "POST", body: JSON.stringify(body) });
      }
      setModal(null);
      await fetchPatients();
      toast.success(modal === "edit" ? "Patient updated successfully" : "Patient added successfully");
    } catch (error) {
      setMessage(error.message);
      toast.error(error.message || "Unable to save patient.");
    }
  };

  const deletePatient = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await requestJson(`Patient/${id}`, { method: "DELETE" });
      await fetchPatients();
      toast.success("Patient deleted successfully");
    } catch (error) {
      setMessage(error.message);
      toast.error(error.message || "Unable to delete patient.");
    }
  };

  return (
    <section className="rc-page">
      <div className="rc-page-head">
        <div>
          <h2>Patients</h2>
          <p>
            Manage patients: add new patients, view existing details, update records,
            or remove outdated entries.
          </p>
        </div>
        <div className="rc-head-actions">
          <button className="rc-btn" onClick={openAdd}>
            <Plus size={16} /> Add Patient
          </button>
          <button className="rc-btn ghost" onClick={fetchPatients}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="rc-btn" onClick={() => navigate("/reception/dashboard")}>
            <ArrowLeft size={16} /> Dashboard
          </button>
        </div>
      </div>

      {message ? <div className="rc-alert">{message}</div> : null}

      <div className="rc-card">
        <div className="rc-card-head">
          <div>
            <h3>Patient List</h3>
            <p>View, edit, or delete registered patients.</p>
          </div>
        </div>
        <div className="rc-table">
          <div className="rc-table-head five">
            <span>PID</span>
            <span>Name</span>
            <span>Phone</span>
            <span>Age</span>
            <span>Actions</span>
          </div>
          {rows.map((patient) => (
            <div className="rc-table-row five" key={patient.id}>
              <span>{patient.id}</span>
              <span>{patient.name || "-"}</span>
              <span>{patient.phone || "-"}</span>
              <span>{patient.age ? `${patient.age} yrs` : "-"}</span>
              <span className="rc-row-actions">
                <button
                  onClick={() => {
                    setForm({
                      ...patient,
                      addressParts: parseAddress(patient.address || ""),
                    });
                    setModal("view");
                  }}
                >
                  <Eye size={15} /> View
                </button>
                <button onClick={() => openEdit(patient)}>
                  <Pencil size={15} /> Edit
                </button>
                <button className="danger" onClick={() => deletePatient(patient.id)}>
                  <Trash2 size={15} /> Delete
                </button>
              </span>
            </div>
          ))}
          {!rows.length ? <div className="rc-empty">No patients found.</div> : null}
        </div>
      </div>

      {modal ? (
        <div className="rc-modal-backdrop" onClick={() => setModal(null)}>
          <form
            noValidate
            className="rc-modal"
            onSubmit={savePatient}
            onClick={(event) => event.stopPropagation()}
          >
            <h3>
              {modal === "view"
                ? "Patient Details"
                : modal === "edit"
                  ? "Edit Patient"
                  : "Add Patient"}
            </h3>
            <div className="rc-form-grid">
              {[
                "name",
                "email",
                "phone",
                "age",
                "dateOfBirth",
                "bloodGroup",
                "emergencyContactName",
                "emergencyContactPhone",
              ].map((field) => (
                <label key={field}>
                  <span>
                    {field
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (s) => s.toUpperCase())}
                  </span>
                  <input
                    name={field}
                    type={
                      field === "age"
                        ? "number"
                        : field === "dateOfBirth"
                          ? "date"
                          : ["phone", "emergencyContactPhone"].includes(field)
                            ? "tel"
                            : "text"
                    }
                    inputMode={["phone", "emergencyContactPhone"].includes(field) ? "numeric" : undefined}
                    pattern={["phone", "emergencyContactPhone"].includes(field) ? "^(?!([0-9])\\1{9})[6-9][0-9]{9}$" : undefined}
                    maxLength={["phone", "emergencyContactPhone"].includes(field) ? 10 : undefined}
                    placeholder={["phone", "emergencyContactPhone"].includes(field) ? "10-digit Indian mobile number" : ""}
                    title={["phone", "emergencyContactPhone"].includes(field) ? "Enter a 10-digit Indian mobile number starting with 6-9 and not all identical digits" : ""}
                    value={form[field] || ""}
                    disabled={modal === "view"}
                    className={fieldErrors[field] ? "is-invalid" : ""}
                    onChange={(event) => updateField(field, event.target.value)}
                  />
                  {fieldErrors[field] ? (
                    <small className="rc-field-error">{fieldErrors[field]}</small>
                  ) : null}
                </label>
              ))}
              <div className="rc-address-block">
                <span>Address</span>
                <div className="rc-address-grid">
                  {[
                    ["streetVillage", "Street/Village Name"],
                    ["city", "City"],
                    ["state", "State"],
                    ["country", "Country"],
                    ["pincode", "Pincode"],
                  ].map(([key, label]) => (
                    <label key={key}>
                      <span>{label}</span>
                      <input
                        value={form.addressParts?.[key] || ""}
                        disabled={modal === "view"}
                        className={fieldErrors[`address.${key}`] ? "is-invalid" : ""}
                        inputMode={key === "pincode" ? "numeric" : undefined}
                        maxLength={key === "pincode" ? 6 : undefined}
                        onChange={(event) => updateAddressField(key, event.target.value)}
                      />
                      {fieldErrors[`address.${key}`] ? (
                        <small className="rc-field-error">{fieldErrors[`address.${key}`]}</small>
                      ) : null}
                    </label>
                  ))}
                </div>
                <textarea value={buildAddress(form.addressParts)} readOnly />
                {fieldErrors.address ? (
                  <small className="rc-field-error">{fieldErrors.address}</small>
                ) : null}
              </div>
              <label>
                <span>Gender</span>
                <select
                  value={form.gender || "Female"}
                  disabled={modal === "view"}
                  className={fieldErrors.gender ? "is-invalid" : ""}
                  onChange={(event) => updateField("gender", event.target.value)}
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
                {fieldErrors.gender ? (
                  <small className="rc-field-error">{fieldErrors.gender}</small>
                ) : null}
              </label>
            </div>
            <div className="rc-modal-actions">
              <button type="button" className="rc-btn ghost" onClick={() => setModal(null)}>
                Close
              </button>
              {modal !== "view" ? (
                <button type="submit" className="rc-btn primary">
                  Save
                </button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

export default ReceptionPatients;
