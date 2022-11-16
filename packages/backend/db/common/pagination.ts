import { z } from 'zod';
import { sql, SqlSqlToken } from 'slonik';
import { numeric, defaultPageSize } from '@orpington-news/shared';

export const PaginationSchema = z.object({
  pageSize: numeric(z.number().int().optional()),
  pageIndex: numeric(z.number().int().optional()),
});
export type PaginationParams = z.infer<typeof PaginationSchema>;

export const addPagination = (
  paginationParams: PaginationParams,
  query: SqlSqlToken
) => {
  const { pageIndex = 0, pageSize = defaultPageSize } = paginationParams;
  const offset = pageIndex * pageSize;

  return sql`${query} LIMIT ${pageSize} OFFSET ${offset}`;
};
