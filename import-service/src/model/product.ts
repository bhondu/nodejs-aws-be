import * as Joi from 'joi';

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  country: string;
  count: number;
  color: string;
  image: string;
};

export const productSchema = Joi.object().keys({
  id: Joi.string().uuid(),
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  price: Joi.number().required().greater(0),
  count: Joi.number().required().greater(0),
});
