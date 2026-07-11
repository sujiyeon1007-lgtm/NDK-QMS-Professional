import {
  titanDbMasterList,
  titanDbMasterReplaceAll,
} from "../../services/titanDbBridge.js";
import { resolveV11MasterLegacyKey } from "../../config/titanV11Sprint1MasterRepository.js";

function createSqliteMasterCategoryRepository(categoryKey) {
  const legacyKey = resolveV11MasterLegacyKey(categoryKey);
  return {
    listAll() {
      throw new Error("MasterCategoryRepository.listAll is async-only in SQLite backend");
    },
    listActive() {
      throw new Error("MasterCategoryRepository.listActive is async-only in SQLite backend");
    },
    async listAllAsync() {
      const result = await titanDbMasterList(legacyKey);
      return result.ok ? result.rows : [];
    },
    async listActiveAsync() {
      const rows = await this.listAllAsync();
      return rows.filter((row) => row.active !== false);
    },
    async replaceAll(rows) {
      const result = await titanDbMasterReplaceAll(legacyKey, rows);
      return { ok: Boolean(result.ok), count: result.count ?? 0 };
    },
    findById(id) {
      void id;
      throw new Error("MasterCategoryRepository.findById is async-only in SQLite backend");
    },
  };
}

export function createSqliteMasterRepositories() {
  return {
    companies: createSqliteMasterCategoryRepository("companies"),
    products: createSqliteMasterCategoryRepository("products"),
    materials: createSqliteMasterCategoryRepository("materials"),
    equipment: createSqliteMasterCategoryRepository("equipment"),
    workers: createSqliteMasterCategoryRepository("workers"),
    processes: createSqliteMasterCategoryRepository("heatTreatment"),
    internalItems: createSqliteMasterCategoryRepository("internalItems"),
  };
}
