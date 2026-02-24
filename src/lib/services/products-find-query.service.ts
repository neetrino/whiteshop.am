import { buildWhereClause } from "./products-find-query/query-builder";
import { executeProductQuery } from "./products-find-query/query-executor";
import type { ProductFilters, ProductWithRelations } from "./products-find-query/types";

/**
 * Service for building and executing product find queries
 */
class ProductsFindQueryService {
  /**
   * Build where clause and fetch products from database
   */
  async buildQueryAndFetch(filters: ProductFilters): Promise<{
    products: ProductWithRelations[];
    bestsellerProductIds: string[];
  }> {
    const { limit = 24 } = filters;

    const { where, bestsellerProductIds } = await buildWhereClause(filters);

    if (where === null) {
      return {
        products: [],
        bestsellerProductIds: [],
      };
    }

    const needOverFetch =
      Boolean(filters.category || filters.search) ||
      filters.minPrice != null ||
      filters.maxPrice != null ||
      Boolean(filters.colors || filters.sizes || filters.brand);
    const fetchLimit = needOverFetch ? Math.min(limit * 10, 200) : limit;

    const products = await executeProductQuery(where, fetchLimit);

    return {
      products,
      bestsellerProductIds,
    };
  }
}

export const productsFindQueryService = new ProductsFindQueryService();
export type { ProductFilters, ProductWithRelations };
