import * as faker from 'faker';
import { Product } from '../model/product';

export const createProductMock = (id?: string): Product => ({
  id: id ?? faker.random.uuid(),
  title: faker.commerce.product(),
  description: faker.commerce.productDescription(),
  country: faker.address.country(),
  count: faker.random.number({ min: 0, max: 10 }),
  color: faker.commerce.color(),
  price: faker.random.float({ min: 5, max: 300, precision: 2 }),
  image: faker.image.imageUrl(undefined, undefined, undefined, true, true),
});

export const fetchProducts = async (length = 10): Promise<Product[]> => {
  faker.seed(123);
  return new Promise<Product[]>(resolve => setTimeout(() => resolve(Array.from({ length }, () => createProductMock())), 0));
};
