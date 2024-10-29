import { ApiError } from "./ApiError.js";

const validateTrimmedFields = (...fields) => {
  if (fields.some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
};

export { validateTrimmedFields };
