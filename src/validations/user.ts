// src/validations/user.ts
import Joi from "joi";

export const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required().messages({
    "string.base": "Full name must be a text string",
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least {#limit} characters long",
    "string.max": "Full name must not exceed {#limit} characters",
    "any.required": "Full name is required",
  }),

  email: Joi.string().email().required().messages({
    "string.base": "Email must be a text string",
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": "Password must be a text string",
    "string.empty": "Password is required",
    "string.min": "Password must be at least {#limit} characters long",
    "any.required": "Password is required",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a text string",
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string().required().messages({
    "string.base": "Password must be a text string",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});
