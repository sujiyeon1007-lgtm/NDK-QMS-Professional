import { createSessionRepositories } from "../session/createSessionRepositories.js";
import { createSqliteMasterRepositories } from "./createSqliteMasterRepositories.js";

/** @returns {import("../repositoryTypes.js").TitanRepositories} */
export function createSqliteRepositories() {
  const session = createSessionRepositories();
  return {
    ...session,
    master: createSqliteMasterRepositories(),
  };
}
