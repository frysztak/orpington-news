import Ajv from 'ajv';

export const defaultAjv = new Ajv({
  coerceTypes: true,
})
  .addKeyword('kind')
  .addKeyword('modifier');

export const disableCoercionAjv = new Ajv({
  coerceTypes: false,
})
  .addKeyword('kind')
  .addKeyword('modifier');
