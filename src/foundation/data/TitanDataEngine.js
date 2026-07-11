/**

 * Project TITAN V1.6 — TitanDataEngine (Foundation Data Layer SSOT)

 *

 * SessionStorage → TitanDataEngine → Store → Page

 * Page는 SessionStorage를 직접 접근하지 않음

 */



import { hasKey, readJson, writeJson } from "./sessionStorageAdapter";

import {

  TITAN_DATA_ENGINE_VERSION,

  TITAN_DATA_STORAGE_KEYS,

} from "./titanDataStorageKeys";

import equipmentStore from "./equipmentStore";

import lotStore from "./lotStore";

import productionStore from "./productionStore";

import qualityStore from "./qualityStore";

import dashboardStore from "./dashboardStore";

import timelineStore from "./timelineStore";

import customerStore from "./master/customerStore";

import productStore from "./master/productStore";

import materialStore from "./master/materialStore";

import processStore from "./master/processStore";

import workerStore from "./master/workerStore";

import companyStore from "./master/companyStore";

import { initMasterDataStoresFromSessionStorage } from "./master/masterDataSync";



/** @type {TitanDataEngine | null} */

let engineInstance = null;



export class TitanDataEngine {

  constructor() {

    this.version = TITAN_DATA_ENGINE_VERSION;

    this.stores = {

      equipment: equipmentStore,

      lot: lotStore,

      production: productionStore,

      quality: qualityStore,

      dashboard: dashboardStore,

      timeline: timelineStore,

      customer: customerStore,

      product: productStore,

      material: materialStore,

      process: processStore,

      worker: workerStore,

      company: companyStore,

    };

  }



  /** Store 키 보장 · Demo 자동 Seed 없음 (company 프로필만 seedIfEmpty) */

  init() {

    const emptyArrayStores = [

      equipmentStore,

      lotStore,

      productionStore,

      timelineStore,

      customerStore,

      productStore,

      materialStore,

      processStore,

      workerStore,

    ];

    emptyArrayStores.forEach((store) => {

      if (!hasKey(store.storageKey)) {

        writeJson(store.storageKey, []);

      }

    });



    if (!hasKey(qualityStore.storageKey)) {

      writeJson(qualityStore.storageKey, {

        inspections: [],

        certificates: [],

        defects: [],

        documents: [],

      });

    }



    companyStore.seedIfEmpty?.();



    initMasterDataStoresFromSessionStorage();

    dashboardStore.refreshCache();



    const meta = {

      version: this.version,

      initializedAt: new Date().toISOString(),

      storageKeys: { ...TITAN_DATA_STORAGE_KEYS },

    };

    writeJson(TITAN_DATA_STORAGE_KEYS.meta, meta);

    return meta;

  }



  getMeta() {

    return (

      readJson(TITAN_DATA_STORAGE_KEYS.meta, null) ?? {

        version: this.version,

        initializedAt: null,

        storageKeys: { ...TITAN_DATA_STORAGE_KEYS },

      }

    );

  }



  isInitialized() {

    return hasKey(TITAN_DATA_STORAGE_KEYS.meta);

  }



  /** @param {{ includeDashboardCache?: boolean }} [options] */

  reset(options = {}) {

    equipmentStore.clear();

    lotStore.clear();

    productionStore.clear();

    qualityStore.clear();

    timelineStore.clear();

    customerStore.clear();

    productStore.clear();

    materialStore.clear();

    processStore.clear();

    workerStore.clear();

    companyStore.clear();

    if (options.includeDashboardCache !== false) {

      dashboardStore.clear();

    }

    return this.init();

  }



  get equipment() {

    return equipmentStore;

  }



  get lot() {

    return lotStore;

  }



  get production() {

    return productionStore;

  }



  get quality() {

    return qualityStore;

  }



  get dashboard() {

    return dashboardStore;

  }



  get timeline() {

    return timelineStore;

  }



  get customer() {

    return customerStore;

  }



  get product() {

    return productStore;

  }



  get material() {

    return materialStore;

  }



  get process() {

    return processStore;

  }



  get worker() {

    return workerStore;

  }



  get company() {

    return companyStore;

  }



  /** QR Scan · Workflow 연동 준비 — Store 상태 요약 */

  getPipelineStatus() {

    return {

      equipmentCount: equipmentStore.list().length,

      lotCount: lotStore.list().length,

      productionCount: productionStore.list().length,

      inspectionCount: qualityStore.listInspections().length,

      certificateCount: qualityStore.listCertificates().length,

      timelineCount: timelineStore.list().length,

      customerCount: customerStore.list().length,

      productCount: productStore.list().length,

      materialCount: materialStore.list().length,

      processCount: processStore.list().length,

      workerCount: workerStore.list().length,

      companyConfigured: Boolean(companyStore.get()?.companyMaster?.companyName),

      dashboard: dashboardStore.getKpi(),

    };

  }

}



/** @returns {TitanDataEngine} */

export function getTitanDataEngine() {

  if (!engineInstance) {

    engineInstance = new TitanDataEngine();

    engineInstance.init();

  }

  return engineInstance;

}



/** 테스트 / QA용 — Singleton 재생성 */

export function resetTitanDataEngineInstance() {

  engineInstance = null;

}



export default getTitanDataEngine;

