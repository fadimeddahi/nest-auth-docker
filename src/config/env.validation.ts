import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  POSTGRES_USER: Joi.string()
    .min(3)
    .max(32)
    .required()
    .messages({
      'string.min': 'POSTGRES_USER must be at least 3 characters',
      'any.required': 'POSTGRES_USER is required',
    }),
  POSTGRES_PASSWORD: Joi.string()
    .min(16)
    .required()
    .messages({
      'string.min': 'POSTGRES_PASSWORD must be at least 16 characters for security',
      'any.required': 'POSTGRES_PASSWORD is required',
    }),
  POSTGRES_DB: Joi.string()
    .alphanum()
    .min(2)
    .max(32)
    .required(),
  POSTGRES_PORT: Joi.number().port().default(5432),
  POSTGRES_HOST: Joi.string().hostname().default('db'),
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'string.min': 'JWT_SECRET must be at least 32 characters for cryptographic security',
      'any.required': 'JWT_SECRET is required and must be set in environment variables',
    }),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  PORT: Joi.number().port().default(3000),
  CORS_ORIGINS: Joi.string()
    .optional()
    .default('http://localhost:3000'),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
}) as any;
