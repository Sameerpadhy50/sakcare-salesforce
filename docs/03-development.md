# 💻 Feature: Account List Viewer — Development Notes

**Date:** 2026-06-12
**Phase:** Code Generation (Phase 2)
**Status:** ✅ Complete

---

## 1. Files Created

### `AccountListController.cls`
- `with sharing` enforces record-level security
- `@TestVisible static Boolean throwExceptionForTest` flag added to allow catch-block coverage in tests
- `WITH USER_MODE` in SOQL enforces field-level security (FLS)
- `ORDER BY CreatedDate DESC LIMIT 5` returns the 5 most recent accounts
- All exceptions surfaced as `AuraHandledException` with original message

### `accountListViewer.html`
- Outer wrapper: `<lightning-card>` with `icon-name="standard:account"`
- Three conditional blocks using `lwc:if / lwc:elseif / lwc:else`:
  1. `isLoading=true` → `<lightning-spinner>`
  2. `error` set → SLDS error text div
  3. Default → `<lightning-datatable>`
- `hide-checkbox-column` set to suppress row checkboxes

### `accountListViewer.js`
- Imports: `LightningElement`, `track` from `lwc`; `getAccounts` from `@salesforce/apex/AccountListController.getAccounts`
- Columns defined as a module-level constant `COLUMNS` (not reactive — no need to)
- `connectedCallback()` triggers `loadAccounts()` on mount
- `.map()` flattens `Owner.Name` → `OwnerName` for datatable compatibility
- `reduceError()` helper gracefully handles both `{ body: { message } }` and generic `Error` shapes
- `.finally()` always sets `isLoading = false`

### `accountListViewer.js-meta.xml`
- `isExposed: true`
- Targets: `lightning__AppPage`, `lightning__HomePage`, `lightning__Tab`
- No `targetConfigs` (removed — caused deployment error with empty property)

## 2. Key Decisions

| Decision | Rationale |
|----------|-----------|
| Imperative call vs `@wire` | Imperative gives full control of loading/error state; cleaner for simple fetch-on-mount |
| `connectedCallback` for data load | Runs once when component is inserted into DOM |
| Flatten `Owner.Name` | `lightning-datatable` doesn't support nested field paths like `Owner.Name` — must be flat |
| `LIMIT 5` in SOQL (not JS) | More efficient — only 5 rows fetched from DB, not filtered client-side |
| `WITH USER_MODE` | Preferred over `Security.stripInaccessible()` for new Apex (API 49+); simpler and enforces both CRUD and FLS |

## 3. Fixes Applied During Development

| Issue | Fix |
|-------|-----|
| `targetConfig` with empty property caused deploy error | Removed `<targetConfigs>` entirely |
| `__tests__/` folder included in LWC bundle deploy caused error | Added `**/__tests__/**` to `.forceignore` |
| `createElement` import caused LWC deploy error | `__tests__/` excluded from org deploy via `.forceignore`; tests run locally via Jest only |
