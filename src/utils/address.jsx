import { validateRequired } from "./validation";
import { INDIA_COUNTRY } from "./indianLocations";

export const emptyAddressParts = {
  streetVillage: "",
  city: "",
  state: "",
  country: INDIA_COUNTRY,
  pincode: "",
};

export const onlyPincodeValue = (value) =>
  String(value ?? "").replace(/\D/g, "").slice(0, 6);

export const parseAddress = (address = "") => {
  const parts = String(address)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const pincodeMatch = String(address).match(/\b\d{5,6}\b/);

  return {
    streetVillage: parts[0]?.replace(/\b\d{5,6}\b/g, "").trim() || "",
    city: parts[1]?.replace(/\b\d{5,6}\b/g, "").trim() || "",
    state: parts[2]?.replace(/\b\d{5,6}\b/g, "").trim() || "",
    country: INDIA_COUNTRY,
    pincode: pincodeMatch?.[0] || parts[4] || "",
  };
};

export const buildAddress = (parts = {}) =>
  [
    parts.streetVillage,
    parts.city,
    parts.state,
    parts.country,
    parts.pincode,
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");

export const validateAddressParts = (parts = {}, label = "Address") => {
  const errors = {};
  const fields = [
    ["streetVillage", "Street/Village name"],
    ["city", "City"],
    ["state", "State"],
    ["country", "Country"],
    ["pincode", "Pincode"],
  ];

  fields.forEach(([key, fieldLabel]) => {
    const required = validateRequired(parts[key], fieldLabel);
    if (required) errors[key] = required;
  });

  if (!errors.pincode && !/^\d{6}$/.test(String(parts.pincode || "").trim())) {
    errors.pincode = "Pincode must be exactly 6 digits.";
  }
  if (!errors.country && String(parts.country || "").trim() !== INDIA_COUNTRY) {
    errors.country = "Country must be India.";
  }

  if (!Object.keys(errors).length && !buildAddress(parts)) {
    errors.address = `${label} is required.`;
  }

  return errors;
};
