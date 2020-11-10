import { Product } from '../model/product';

export const createProductsTable = `
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  price integer,
  country text,
  color text,
  image text
)`;

export const createStocksTable = `
create table if not exists stocks (
  product_id uuid,
  count integer constraint min_count check (count >=0),
  foreign key ("product_id") references "products" ("id")
)`;

export const escape = (s: string) => s?.replace(/'/g, "''") || '';

export const productToQuery = ({ title, description, price, country, color, image }: Product) =>
  `('${escape(title)}', '${escape(description)}', ${price}, '${escape(country)}', '${escape(color)}', '${escape(image)}')`;

export const createProducts = (products: Product[]) =>
  `insert into products (title, description, price, country, color, image) values
${products.map(p => productToQuery(p)).join(',\n')}
returning *;
`;

export const updateProduct = (product: Product) =>
  `
update products
set
title='${escape(product.title)}',
description='${escape(product.title)}',
price = ${product.price}
where id = '${product.id}'
returning *;
`;

export const stockToQuery = ({ id, count }: Product) => `('${id}', ${count})`;

export const createStocks = (products: Product[]) =>
  `insert into stocks (product_id, count) values
` + products.map(p => stockToQuery(p)).join(',\n');

export const getProducts = `
select * from products;
`;

export const getProductsWithStocks = `
select id, title, description, price, count, country, color, image from products p left join stocks s on p.id = s.product_id;
`;

export const getProductWithStocksById = (id: string) => `
select id, title, description, price, count, country, color, image from products p left join stocks s on p.id = s.product_id
  where p.id = '${id}';
`;

export const getProductsWithStocksAvailable = `
select id, title, description, price, count, country, color, image from products p left join stocks s on p.id = s.product_id
  where s.count > 0;
`;
