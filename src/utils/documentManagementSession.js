/**
 * Project TITAN V1.3 — 문서관리 SessionStorage (barrel)
 */

export {
  getDocumentFavorites,
  isDocumentFavorite,
  toggleDocumentFavorite,
} from "./documentFavoritesSession";

export {
  getRecentDocuments,
  addRecentDocument,
  clearRecentDocuments,
  MAX_RECENT_DOCUMENTS,
} from "./documentRecentSession";

export {
  getPinnedDocumentIds,
  isDocumentPinned,
  toggleDocumentPin,
} from "./documentPinsSession";

export {
  getDocumentChangeLogs,
  appendDocumentChangeLog,
} from "./documentChangeLogSession";

export {
  getAllDocumentMetadata,
  getDocumentMetadata,
  saveDocumentMetadata,
  enrichRegistryRow,
} from "./documentMetadataSession";
