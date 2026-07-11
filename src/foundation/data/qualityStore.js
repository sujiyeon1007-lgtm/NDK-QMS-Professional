/**
 * Project TITAN V1.5 — qualityStore (SSOT)
 * 검사 · 성적서 · 불량 · 문서
 */

import {
  getTitanDemoCertificateSeeds,
  getTitanDemoInspectionLogSeeds,
} from "../../data/titanDemoSampleData";
import { TITAN_DATA_STORAGE_KEYS } from "./titanDataStorageKeys";
import { createJsonObjectStore } from "./storeFactory";

export function buildSeedQualityBundle(records) {
  return {
    inspections: getTitanDemoInspectionLogSeeds(records).map((row) => ({ ...row })),
    certificates: getTitanDemoCertificateSeeds(records).map((row) => ({ ...row })),
    defects: [],
    documents: [],
  };
}

const objectStore = createJsonObjectStore({
  storageKey: TITAN_DATA_STORAGE_KEYS.quality,
});

function readBundle() {
  const bundle = objectStore.read();
  return {
    inspections: Array.isArray(bundle.inspections) ? bundle.inspections.map((row) => ({ ...row })) : [],
    certificates: Array.isArray(bundle.certificates) ? bundle.certificates.map((row) => ({ ...row })) : [],
    defects: Array.isArray(bundle.defects) ? bundle.defects.map((row) => ({ ...row })) : [],
    documents: Array.isArray(bundle.documents) ? bundle.documents.map((row) => ({ ...row })) : [],
  };
}

function writeBundle(bundle) {
  return objectStore.replace({
    inspections: bundle.inspections ?? [],
    certificates: bundle.certificates ?? [],
    defects: bundle.defects ?? [],
    documents: bundle.documents ?? [],
  });
}

export const qualityStore = {
  storageKey: objectStore.storageKey,

  read() {
    return readBundle();
  },

  clear() {
    objectStore.clear();
  },

  // — inspections —
  listInspections() {
    return readBundle().inspections;
  },

  /** @param {unknown} record */
  addInspection(record) {
    const bundle = readBundle();
    bundle.inspections.unshift({ ...record });
    writeBundle(bundle);
    return bundle.inspections[0];
  },

  updateInspection(id, patch) {
    const bundle = readBundle();
    let updated = null;
    bundle.inspections = bundle.inspections.map((row) => {
      if (String(row.id ?? row.logId ?? "") !== String(id)) return row;
      updated = { ...row, ...patch };
      return updated;
    });
    writeBundle(bundle);
    return updated;
  },

  removeInspection(id) {
    const bundle = readBundle();
    const before = bundle.inspections.length;
    bundle.inspections = bundle.inspections.filter(
      (row) => String(row.id ?? row.logId ?? "") !== String(id)
    );
    writeBundle(bundle);
    return bundle.inspections.length < before;
  },

  // — certificates —
  listCertificates() {
    return readBundle().certificates;
  },

  /** @param {unknown} record */
  addCertificate(record) {
    const bundle = readBundle();
    bundle.certificates.unshift({ ...record });
    writeBundle(bundle);
    return bundle.certificates[0];
  },

  updateCertificate(id, patch) {
    const bundle = readBundle();
    let updated = null;
    bundle.certificates = bundle.certificates.map((row) => {
      if (String(row.id ?? row.certificateId ?? "") !== String(id)) return row;
      updated = { ...row, ...patch };
      return updated;
    });
    writeBundle(bundle);
    return updated;
  },

  removeCertificate(id) {
    const bundle = readBundle();
    const before = bundle.certificates.length;
    bundle.certificates = bundle.certificates.filter(
      (row) => String(row.id ?? row.certificateId ?? "") !== String(id)
    );
    writeBundle(bundle);
    return bundle.certificates.length < before;
  },

  // — defects —
  listDefects() {
    return readBundle().defects;
  },

  /** @param {unknown} record */
  addDefect(record) {
    const bundle = readBundle();
    bundle.defects.unshift({ ...record });
    writeBundle(bundle);
    return bundle.defects[0];
  },

  // — documents —
  listDocuments() {
    return readBundle().documents;
  },

  /** @param {unknown} record */
  addDocument(record) {
    const bundle = readBundle();
    bundle.documents.unshift({ ...record });
    writeBundle(bundle);
    return bundle.documents[0];
  },
};

export default qualityStore;
