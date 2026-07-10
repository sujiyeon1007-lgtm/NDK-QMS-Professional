# Repository Layer V1.1 (PM Conditional Approved)

Status: conditional-approved | 2026-07-10
Code SSoT: src/config/titanRepositoryLayerV11.js
RC1: No implementation until RC1 exit

## V1.1 Official Principle

Real company operations -> Workflow -> UI -> Repository -> Data Source

Repository supports Workflow. Never change Workflow for Repository.

## V1.1 Success Criteria (not Repository completion)

Equipment QR scan
-> chargeable LOT auto-query
-> LOT select
-> work start
-> same data on quality PC, production PC, phone

## Sprint Priority (PM approved)

Sprint 1: LotRepository, EquipmentWorkflowRepository (highest)
Sprint 2: IncomingRepository, OutboundRepository, InventoryRepository
Sprint 3: CertificateRepository, TransactionRepository, CompanyRepository
Sprint 4: QrRepository, StatisticsRepository, DashboardRepository

## Data Source Chain

sessionStorage -> SQLite -> Oracle -> REST API -> ERP -> MES

Repository interface must NOT know Data Source type.

## Oracle Policy

Goal: Repository -> Adapter -> Oracle capable
Not goal: Oracle implementation first

Frozen on swap: UI, Workflow, Business Logic, QR Engine, Print Engine

## RC1

Complete P0 stabilization first. V1.1 starts after RC1 exit with LOT-centric central data.

## Next (after RC1)

1. Map Sprint 1 workflow to existing equipmentWorkflowService + production records
2. Define LotRepository + EquipmentWorkflowRepository interfaces in repositoryTypes.js
3. Session adapter delegates — workflow demo before Oracle/SQLite adapter
