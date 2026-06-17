# 📐 Feature: Account List Viewer — Design Document

**Date:** 2026-06-12
**Phase:** Design (Phase 1)
**Status:** ✅ Approved

---

## 1. Solution Overview

A lightweight read-only LWC that uses an imperative Apex call to fetch the top 5 Account records and renders them in a `lightning-datatable`. Placed on the Sakcare App Page in region3 (the third column of the three-column layout).

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────┐
│           Sakcare App Page (FlexiPage)       │
│  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │
│  │ region1 │  │ region2 │  │   region3   │ │
│  │chatBotUI│  │chatBotUI│  │ accountList │ │
│  │         │  │         │  │   Viewer    │ │
│  └─────────┘  └─────────┘  └──────┬──────┘ │
└──────────────────────────────────┼──────────┘
                                   │ @AuraEnabled
                              ┌────▼────────────────┐
                              │ AccountListController│
                              │  getAccounts()       │
                              │  SOQL: Account LIMIT 5│
                              └─────────────────────┘
```

## 3. Component Breakdown

### 3.1 LWC: `accountListViewer`

| Property | Value |
|----------|-------|
| Target | `lightning__AppPage`, `lightning__HomePage`, `lightning__Tab` |
| Data source | Imperative Apex call in `connectedCallback` |
| Columns | Account Name, Industry, Phone, Owner |
| Loading state | `lightning-spinner` |
| Error state | SLDS error text block |
| Key field | `Id` |

### 3.2 Apex Class: `AccountListController`

| Property | Value |
|----------|-------|
| Sharing | `with sharing` |
| Method | `getAccounts(): List<Account>` |
| Annotation | `@AuraEnabled(cacheable=true)` |
| SOQL | `SELECT Id, Name, Industry, Phone, Owner.Name FROM Account WITH USER_MODE ORDER BY CreatedDate DESC LIMIT 5` |
| FLS | Enforced via `WITH USER_MODE` |
| Error handling | `try/catch` → `AuraHandledException` |

### 3.3 FlexiPage: `Sakcare`

| Property | Value |
|----------|-------|
| Template | `flexipage:appHomeTemplateThreeColumns` |
| Placement region | `region3` |
| Component reference | `c:accountListViewer` |
| Identifier | `c_accountListViewer` |

## 4. File Structure

```
force-app/main/default/
├── lwc/accountListViewer/
│   ├── accountListViewer.html           ← UI template
│   ├── accountListViewer.js             ← Controller logic
│   ├── accountListViewer.js-meta.xml    ← Metadata (targets)
│   └── __tests__/
│       └── accountListViewer.test.js    ← Jest unit tests (10 tests)
├── classes/
│   ├── AccountListController.cls        ← Apex data layer
│   ├── AccountListController.cls-meta.xml
│   ├── AccountListControllerTest.cls    ← Apex test class
│   └── AccountListControllerTest.cls-meta.xml
└── flexipages/
    └── Sakcare.flexipage-meta.xml       ← App page (modified)
```

## 5. Deployment Order

1. `AccountListController` (Apex Class)
2. `AccountListControllerTest` (Apex Test)
3. `accountListViewer` (LWC)
4. `Sakcare` (FlexiPage)
