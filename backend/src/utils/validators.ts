/**
 * Validadores de dados usando Joi
 */

import Joi from 'joi';

// Esquemas de validação para autenticação
export const authValidators = {
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório',
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.min': 'Senha deve ter pelo menos 6 caracteres',
        'string.max': 'Senha deve ter no máximo 128 caracteres',
        'any.required': 'Senha é obrigatória',
      }),
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres',
        'any.required': 'Nome é obrigatório',
      }),
    phone: Joi.string()
      .pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Telefone deve ter o formato (11) 99999-9999',
      }),
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório',
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Senha é obrigatória',
      }),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Token de refresh é obrigatório',
      }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório',
      }),
  }),

  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Token é obrigatório',
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.min': 'Senha deve ter pelo menos 6 caracteres',
        'string.max': 'Senha deve ter no máximo 128 caracteres',
        'any.required': 'Nova senha é obrigatória',
      }),
  }),

  updateProfile: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres',
      }),
    phone: Joi.string()
      .pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'Telefone deve ter o formato (11) 99999-9999',
      }),
    avatar: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Avatar deve ser uma URL válida',
      }),
  }),

  updateFCMToken: Joi.object({
    fcmToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Token FCM é obrigatório',
      }),
  }),
};

// Esquemas de validação para pets
export const petValidators = {
  create: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'Nome do pet deve ter pelo menos 1 caractere',
        'string.max': 'Nome do pet deve ter no máximo 50 caracteres',
        'any.required': 'Nome do pet é obrigatório',
      }),
    species: Joi.string()
      .valid('dog', 'cat', 'other')
      .required()
      .messages({
        'any.only': 'Espécie deve ser: dog, cat ou other',
        'any.required': 'Espécie é obrigatória',
      }),
    breed: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Raça deve ter pelo menos 1 caractere',
        'string.max': 'Raça deve ter no máximo 100 caracteres',
        'any.required': 'Raça é obrigatória',
      }),
    birthDate: Joi.date()
      .max('now')
      .required()
      .messages({
        'date.max': 'Data de nascimento não pode ser no futuro',
        'any.required': 'Data de nascimento é obrigatória',
      }),
    weight: Joi.number()
      .min(0.1)
      .max(200)
      .required()
      .messages({
        'number.min': 'Peso deve ser maior que 0.1kg',
        'number.max': 'Peso deve ser menor que 200kg',
        'any.required': 'Peso é obrigatório',
      }),
    height: Joi.number()
      .min(1)
      .max(300)
      .required()
      .messages({
        'number.min': 'Altura deve ser maior que 1cm',
        'number.max': 'Altura deve ser menor que 300cm',
        'any.required': 'Altura é obrigatória',
      }),
    gender: Joi.string()
      .valid('male', 'female')
      .required()
      .messages({
        'any.only': 'Gênero deve ser: male ou female',
        'any.required': 'Gênero é obrigatório',
      }),
    isNeutered: Joi.boolean()
      .default(false),
    avatar: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Avatar deve ser uma URL válida',
      }),
    microchipId: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.base': 'ID do microchip deve ser um texto',
      }),
    medicalConditions: Joi.array()
      .items(Joi.string().trim().max(100))
      .optional()
      .default([]),
    allergies: Joi.array()
      .items(Joi.string().trim().max(100))
      .optional()
      .default([]),
  }),

  update: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Nome do pet deve ter pelo menos 1 caractere',
        'string.max': 'Nome do pet deve ter no máximo 50 caracteres',
      }),
    species: Joi.string()
      .valid('dog', 'cat', 'other')
      .optional()
      .messages({
        'any.only': 'Espécie deve ser: dog, cat ou other',
      }),
    breed: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Raça deve ter pelo menos 1 caractere',
        'string.max': 'Raça deve ter no máximo 100 caracteres',
      }),
    birthDate: Joi.date()
      .max('now')
      .optional()
      .messages({
        'date.max': 'Data de nascimento não pode ser no futuro',
      }),
    weight: Joi.number()
      .min(0.1)
      .max(200)
      .optional()
      .messages({
        'number.min': 'Peso deve ser maior que 0.1kg',
        'number.max': 'Peso deve ser menor que 200kg',
      }),
    height: Joi.number()
      .min(1)
      .max(300)
      .optional()
      .messages({
        'number.min': 'Altura deve ser maior que 1cm',
        'number.max': 'Altura deve ser menor que 300cm',
      }),
    gender: Joi.string()
      .valid('male', 'female')
      .optional()
      .messages({
        'any.only': 'Gênero deve ser: male ou female',
      }),
    isNeutered: Joi.boolean()
      .optional(),
    avatar: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Avatar deve ser uma URL válida',
      }),
    microchipId: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.base': 'ID do microchip deve ser um texto',
      }),
    medicalConditions: Joi.array()
      .items(Joi.string().trim().max(100))
      .optional(),
    allergies: Joi.array()
      .items(Joi.string().trim().max(100))
      .optional(),
  }),
};

// Esquemas de validação para registros de saúde
export const healthValidators = {
  create: Joi.object({
    date: Joi.date()
      .max('now')
      .default(Date.now)
      .messages({
        'date.max': 'Data do registro não pode ser no futuro',
      }),
    weight: Joi.number()
      .min(0.1)
      .max(200)
      .optional()
      .messages({
        'number.min': 'Peso deve ser maior que 0.1kg',
        'number.max': 'Peso deve ser menor que 200kg',
      }),
    height: Joi.number()
      .min(1)
      .max(300)
      .optional()
      .messages({
        'number.min': 'Altura deve ser maior que 1cm',
        'number.max': 'Altura deve ser menor que 300cm',
      }),
    activity: Joi.object({
      type: Joi.string()
        .trim()
        .max(100)
        .required()
        .messages({
          'string.max': 'Tipo de atividade deve ter no máximo 100 caracteres',
          'any.required': 'Tipo de atividade é obrigatório',
        }),
      duration: Joi.number()
        .min(1)
        .max(1440)
        .required()
        .messages({
          'number.min': 'Duração deve ser maior que 0 minutos',
          'number.max': 'Duração deve ser menor que 1440 minutos (24h)',
          'any.required': 'Duração é obrigatória',
        }),
      intensity: Joi.string()
        .valid('low', 'medium', 'high')
        .required()
        .messages({
          'any.only': 'Intensidade deve ser: low, medium ou high',
          'any.required': 'Intensidade é obrigatória',
        }),
      calories: Joi.number()
        .min(0)
        .max(10000)
        .optional()
        .messages({
          'number.min': 'Calorias não podem ser negativas',
          'number.max': 'Calorias devem ser menores que 10000',
        }),
    }).optional(),
    feeding: Joi.object({
      food: Joi.string()
        .trim()
        .max(200)
        .required()
        .messages({
          'string.max': 'Nome da comida deve ter no máximo 200 caracteres',
          'any.required': 'Nome da comida é obrigatório',
        }),
      amount: Joi.number()
        .min(1)
        .max(5000)
        .required()
        .messages({
          'number.min': 'Quantidade deve ser maior que 0g',
          'number.max': 'Quantidade deve ser menor que 5000g',
          'any.required': 'Quantidade é obrigatória',
        }),
      calories: Joi.number()
        .min(0)
        .max(10000)
        .required()
        .messages({
          'number.min': 'Calorias não podem ser negativas',
          'number.max': 'Calorias devem ser menores que 10000',
          'any.required': 'Calorias são obrigatórias',
        }),
      time: Joi.date()
        .default(Date.now),
    }).optional(),
    mood: Joi.string()
      .valid('very_sad', 'sad', 'neutral', 'happy', 'very_happy')
      .optional()
      .messages({
        'any.only': 'Humor deve ser: very_sad, sad, neutral, happy ou very_happy',
      }),
    notes: Joi.string()
      .trim()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Observações devem ter no máximo 1000 caracteres',
      }),
  }),
};

// Esquemas de validação para consultas
export const queryValidators = {
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.integer': 'Página deve ser um número inteiro',
        'number.min': 'Página deve ser maior que 0',
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        'number.integer': 'Limite deve ser um número inteiro',
        'number.min': 'Limite deve ser maior que 0',
        'number.max': 'Limite deve ser menor que 100',
      }),
    sort: Joi.string()
      .optional()
      .default('-createdAt'),
  }),

  dateRange: Joi.object({
    startDate: Joi.date()
      .optional()
      .messages({
        'date.base': 'Data de início deve ser uma data válida',
      }),
    endDate: Joi.date()
      .optional()
      .min(Joi.ref('startDate'))
      .messages({
        'date.base': 'Data de fim deve ser uma data válida',
        'date.min': 'Data de fim deve ser posterior à data de início',
      }),
  }),
};

// Middleware de validação
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errorMessages,
      });
    }

    req.body = value;
    next();
  };
};

// Middleware de validação para query params
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        error: 'Parâmetros de consulta inválidos',
        details: errorMessages,
      });
    }

    req.query = value;
    next();
  };
};