# Vendor Management — Project Setup Guide (Agent Instructions)

> **Purpose:** Single source of truth for setting up the **Vendor Management** system in Power Platform (Dataverse + Power Apps), aligned with the COSTDB-style dashboard.  
> **Publisher prefix:** `cdb`  
> **Solution:** Vendor Management (`VendorManagement`)  
> **Environment org (example):** `https://orgfd37376e.crm7.dynamics.com`

Use this document as the agent/playbook: fix schema first, then seed, then build UI (Canvas / Model-driven / Code app).

---

## 1. Goals

### 1.1 Business domain

| Area | Capability |
|------|------------|
| **Materials** | List, import, download; add/edit material + category |
| **Vendors** | List, import, download; add/edit; delete only if not linked |
| **Vendor materials** | List; assign material to vendor; set price |
| **Material prices** | List; edit price / year / unit |
| **Units** | List; add/edit; delete only if not linked |
| **Projects** | Name, year, area (prefecture/city/address), status; materials on project |
| **Areas** | Prefecture + City (seed / master data) |
| **Dashboard** | COSTDB-like: filters, charts, item list (Code app or Canvas) |

### 1.2 Existing tables (logical names)

| Display name | Logical name |
|--------------|--------------|
| City | `cdb_city` |
| Material | `cdb_material` |
| Material Category | `cdb_materialcategory` |
| Material Price Per Unit | `cdb_materialpriceperunit` |
| Material Vendor | `cdb_materialvendor` |
| Prefecture | `cdb_prefecture` |
| Project | `cdb_project` |
| Project Material | `cdb_projectmaterial` |
| Unit | `cdb_unit` |
| Vendor | `cdb_vendor` |

---

## 2. Target data model (relationships)

```
Prefecture 1──N City

Unit 1──N Material (Default Unit)     [optional lookup]
Material Category 1──N Material

Vendor 1──N Material Vendor N──1 Material
Material Vendor 1──N Material Price Per Unit
Material 1──N Material Price Per Unit
Vendor 1──N Material Price Per Unit
Unit 1──N Material Price Per Unit

Project 1──N Project Material N──1 Material
```

### 2.1 Relationship matrix (must exist)

| Parent | Child | Lookup on child | Notes |
|--------|-------|-----------------|--------|
| Prefecture | City | `cdb_prefectureid` → Prefecture | Cascading area |
| Material Category | Material | category lookup | Exact logical name from UI |
| Unit | Material | Default Unit | Schema often `cdb_DefaultUnit`; confirm nav property before API bind |
| Vendor | Material Vendor | Vendor lookup | e.g. `cdb_vendor` / `cdb_vendorid` |
| Material | Material Vendor | Material lookup | e.g. `cdb_material` / `cdb_materialid` |
| Material Vendor | Material Price Per Unit | `cdb_materialvendorid` | |
| Material | Material Price Per Unit | `cdb_materialid` | |
| Vendor | Material Price Per Unit | `cdb_vendorid` | |
| Unit | Material Price Per Unit | `cdb_unitid` | |
| Project | Project Material | `cdb_projectid` | |
| Material | Project Material | `cdb_materialid` | |

**Rule:** Creating a **Lookup** column on the child creates the 1:N relationship. Do not invent `@odata.bind` names; use **Logical name** from Columns UI or metadata API.

---

## 3. Column contracts (verified / known)

Web API always uses **logical names** (usually lowercase). Primary **key** (`…id`) is GUID — never send a string name into it.

### 3.1 Unit (`cdb_unit`)

| Display | Logical (API) | Type | Notes |
|---------|---------------|------|--------|
| Unit Code / primary name | `cdb_newcolumn` | Text | Primary **name** attribute (confirm via metadata) |
| Unit Symbol | `cdb_unitsymbol` | Text | e.g. `t`, `kg` |
| Unit (PK) | `cdb_unitid` | GUID | System |

### 3.2 Material (`cdb_material`)

| Display | Logical (API) | Type |
|---------|---------------|------|
| Material Name (primary) | `cdb_materialname` | Text |
| Code | `cdb_code` | Text |
| Material Code | `cdb_materialcode` | Text |
| Description | `cdb_description` | Text / memo |
| Default Unit | `cdb_DefaultUnit` (schema) | Lookup → Unit |
| Material (PK) | `cdb_materialid` | GUID |

**API pitfall:** Do not bind `cdb_defaultunit@odata.bind` unless metadata confirms that navigation property. Prefer create without unit bind, then set lookup in UI, or resolve nav name from:

```http
GET .../EntityDefinitions(LogicalName='cdb_material')/Attributes/Microsoft.Dynamics.CRM.LookupAttributeMetadata
```

### 3.3 Material Vendor (`cdb_materialvendor`)

| Display | Logical (API) | Type |
|---------|---------------|------|
| Material Vendor Name (primary) | `cdb_materialvendorname` | Text |
| Vendor Material Code | `cdb_vendormaterialcode` | Text |
| Vendor | `cdb_vendor` / `cdb_Vendor` | Lookup |
| Material | `cdb_material` / `cdb_Material` | Lookup |
| Lead Time (Days) | `cdb_leadtimedays` | Whole number |
| Min order qty | `cdb_minimumorderquantity` | Number |
| Notes | `cdb_notes` | Text |
| PK | `cdb_materialvendorid` | GUID |

**API pitfall:** Primary name is **`cdb_materialvendorname`**, not `cdb_name`.

### 3.4 Material Price Per Unit (`cdb_materialpriceperunit`)

| Display | Logical (API) | Type |
|---------|---------------|------|
| Name (primary) | `cdb_name` | Text |
| Year | `cdb_year` | Whole number |
| Price | `cdb_price` | Decimal / Currency |
| Material Vendor | `cdb_materialvendorid` | Lookup |
| Material | `cdb_materialid` | Lookup |
| Vendor | `cdb_vendorid` | Lookup |
| Unit | `cdb_unitid` | Lookup |
| PK | `cdb_materialpriceperunitid` | GUID |

### 3.5 Vendor (`cdb_vendor`) — expected for Area + services

| Display | Logical (expected) | Type |
|---------|-------------------|------|
| Name (primary) | `cdb_name` or custom primary | Text — **verify in UI** |
| Phone | `cdb_phone` | Text |
| Services description | `cdb_servicesdescription` | Multiline |
| Postal code | `cdb_postalcode` | Text |
| Prefecture | `cdb_prefecture` | Text or Choice or Lookup |
| City | `cdb_city` | Text or Lookup |
| Street address | `cdb_streetaddress` | Text (150) |

### 3.6 Project (`cdb_project`) — expected

| Display | Logical (expected) | Type |
|---------|-------------------|------|
| Name | primary name | Text |
| Year | `cdb_year` | Whole number |
| Prefecture / City / Street / Postal | area fields | Text or lookups |
| Status | `cdb_status` | Text or Choice |
| Completed | `cdb_completed` | Yes/No |

### 3.7 Project Material (`cdb_projectmaterial`)

| Field | Role |
|-------|------|
| Primary name | Optional display string |
| Project lookup | Required |
| Material lookup | Required |

### 3.8 Material Category, Prefecture, City

- Primary name typically `cdb_name` (confirm each table).  
- City → Prefecture lookup when cascading is required.

---

## 4. Lookup / schema fix checklist (do before dashboard)

Work **inside solution Vendor Management**. Publish after each batch.

### Phase A — Inventory

For **each** table:

1. Open **Columns**.
2. Note for every custom column: **Display name**, **Logical name**, **Type**, **Primary name?**  
3. List all **Lookups** and their targets.

### Phase B — Missing relationships

Create missing lookups (do not duplicate):

- [ ] City → Prefecture  
- [ ] Material → Material Category  
- [ ] Material → Unit (Default Unit) — if required by design  
- [ ] Material Vendor → Vendor  
- [ ] Material Vendor → Material  
- [ ] Material Price → Material Vendor, Material, Vendor, Unit  
- [ ] Project Material → Project, Material  

### Phase C — Naming consistency

- Prefer one convention: English display names, `cdb_` logical names.  
- Do not rename primary keys.  
- If primary name was auto-created as `cdb_newcolumn` on Unit, either leave it or add a clearer display name; avoid breaking existing seed data.

### Phase D — Delete rules (business)

| Entity | Delete allowed when |
|--------|---------------------|
| Unit | Not referenced by Material or Material Price |
| Vendor | Not referenced by Material Vendor / Price |
| Material | Not referenced by Material Vendor / Project Material / Price |
| Material Vendor | Not referenced by Price (or cascade policy agreed) |

Implement with **Cascade / Restrict** on relationships and/or app logic (disable Delete button when related rows exist).

### Phase E — Forms (Area block)

**Vendor** and **Project** forms should support:

```
Area *
  [ Postal code ]  [ Prefecture ▼ ]  [ City ▼ ]
  Auto Search Address   (optional — Flow/API later)
  [ Street address e.g. 1-3-5 ]     0/150
```

- Model-driven: section with four fields.  
- Canvas / Custom page: match COSTDB mockup layout.  
- Prefecture: Choice (47) **or** Lookup to Prefecture table.  
- City: Text **or** Lookup filtered by prefecture (Canvas/`citiesMap` / PCF).

---

## 5. Entity set names (Web API)

Resolve via metadata (do not guess plurals):

```http
GET /api/data/v9.2/EntityDefinitions(LogicalName='cdb_materialcategory')?$select=EntitySetName,PrimaryNameAttribute
```

Known working examples in this environment:

| Logical | Entity set (example) |
|---------|----------------------|
| `cdb_unit` | `cdb_units` |
| `cdb_materialcategory` | `cdb_materialcategories` |
| `cdb_vendor` | `cdb_vendors` |
| `cdb_material` | `cdb_materials` |
| `cdb_materialvendor` | `cdb_materialvendors` |
| `cdb_materialpriceperunit` | `cdb_materialpriceperunits` |
| `cdb_project` | `cdb_projects` |
| `cdb_projectmaterial` | `cdb_projectmaterials` |

---

## 6. Seed data

### 6.1 Scripts (artifacts)

| Script | Role |
|--------|------|
| `create-costdb-tables.sh` | Create empty tables (if needed) |
| `add-costdb-columns.sh` | Add columns / relationships |
| `seed-costdb-data.sh` | Seed English sample rows |

Auth: same Node helper `costdb-dashboard/scripts/dataverseClient.mjs` (or `AUTH_HELPER`).

```bash
export ORG_URL="https://orgfd37376e.crm7.dynamics.com"
export AUTH_HELPER="/path/to/dataverseClient.mjs"
./seed-costdb-data.sh
```

### 6.2 Seed rules learned from production runs

1. **Never** put `#` comments inside JSON bodies.  
2. **Never** POST into primary key GUID fields.  
3. Use **logical** names from UI/metadata, not assumed `cdb_name`.  
4. On **duplicate**, skip create and **load existing IDs** into temp files for later lookups.  
5. Define `skip()`; do not use `set -e` alone or undefined `skip` will abort the script.  
6. Avoid invalid lookup binds (e.g. Material `cdb_defaultunit`) until nav property is confirmed.  
7. Order: Unit → Category → Prefecture → City → Vendor → Material → Material Vendor → Price → Project → Project Material.

### 6.3 Minimum seed counts

≥ 20 rows each for Unit, Category, Prefecture sample, City sample, Vendor, Material, Material Vendor, Project; ≥ 20–24 Material Price rows (e.g. years 2023–2025).

---

## 7. Application architecture

### 7.1 Recommended stack for “COSTDB-like” dashboard

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Data | Dataverse (`cdb_*`) | Source of truth |
| Admin / CRUD | Model-driven app **or** Canvas | Forms, views, security |
| Analytics dashboard | **Code app** (React/Vite) **or** Canvas | Charts, filters, dense UI |
| Embed | Code app inside Model-driven via **web resource + iframe** | CSP must allow frame-ancestors |

**Not supported:** Full Model-driven app embedded inside Code app.  
**Supported:** Code app (or Canvas custom page) as dashboard page inside Model-driven sitemap.

### 7.2 Dashboard feature parity (COSTDB)

- Filters: year, location/prefecture, category, search  
- Refresh, export Excel  
- Line / pie / bar charts  
- Material / price list  
- Left navigation (Home, recent, pinned, Vendor Management sections)

### 7.3 Canvas alternative

- Component library for filters, charts (or PCF for advanced charts)  
- Power Fx for sidebar navigation collections  
- Sync filter state via variables / component output properties  

### 7.4 Delete / import rules in app

| Screen | Import | Download | Delete |
|--------|--------|----------|--------|
| Materials | Yes | Yes | Soft or restrict if linked |
| Vendors | Yes | Yes | Only if no Material Vendor / Price |
| Units | — | — | Only if not linked |
| Material Vendor | — | — | Restrict if prices exist |
| Material Price | — | — | Edit preferred |

---

## 8. Project setup sequence (agent checklist)

### Step 0 — Access

- [ ] Solution **Vendor Management** unmanaged  
- [ ] Publisher prefix **cdb**  
- [ ] System Customizer / Admin  
- [ ] `pac auth` + working Dataverse token (or Node `getAccessToken`)

### Step 1 — Schema audit

- [ ] Export or screenshot columns for all 10 tables  
- [ ] Document primary name + all lookups  
- [ ] Fix missing lookups (Phase B)  
- [ ] Publish all customizations  

### Step 2 — Security

- [ ] Security roles: read/write on `cdb_*` tables  
- [ ] Business unit / team access as required  

### Step 3 — Seed

- [ ] Run seed script; resolve any Invalid property errors by aligning logical names  
- [ ] Verify row counts in maker portal  

### Step 4 — Model-driven app (CRUD shell)

- [ ] App: Vendor Management  
- [ ] Site map: Dashboard | Materials | Vendors | Vendor Materials | Prices | Units | Projects | Areas  
- [ ] Views: Active lists with search  
- [ ] Forms: Area section on Vendor/Project; Material form with category (+ unit if ready)  

### Step 5 — Dashboard UI

**Option A — Code app (preferred for COSTDB parity)**  

1. Vite/React app with Dataverse client (existing costdb-dashboard pattern).  
2. Connect tables via Web API / Power Apps SDK.  
3. Publish as Code app type in solution.  
4. Embed in Model-driven via HTML web resource iframe **or** open as standalone.  
5. CSP: Admin Center → App (code) frame-ancestors include model-driven domains if embedding.

**Option B — Canvas**  

1. Screens + component library.  
2. Charts via Power BI tile / chart controls / PCF.  
3. Optional: single PCF “dashboard” control.

### Step 6 — Business rules

- [ ] Block Vendor delete when Material Vendor exists  
- [ ] Block Unit delete when Material/Price references exist  
- [ ] Optional: unique Material Code  

### Step 7 — UAT

- [ ] CRUD each entity  
- [ ] Create Project + Project Materials  
- [ ] Assign Vendor ↔ Material + price by year  
- [ ] Dashboard filters and charts against real Dataverse data  

---

## 9. COSTDB reference UI

- Reference site: `https://costdb-dashboard.vercel.app/` (React demo; not Canvas/Model-driven).  
- Parity target: filters, multi-chart layout, searchable list, left nav.  
- Production data must come from **Dataverse**, not static demo JSON.

---

## 10. Common failures and fixes

| Symptom | Fix |
|---------|-----|
| `Invalid property 'cdb_name'` | Use table’s real primary name (e.g. `cdb_materialname`, `cdb_materialvendorname`, `cdb_newcolumn`) |
| `Cannot convert 'Ton' to Edm.Guid` | Do not POST into `…id` primary key |
| `undeclared property 'cdb_defaultunit'` | Remove bind or use correct lookup logical name from metadata |
| `Resource not found … categorys` | Use EntitySetName `cdb_materialcategories` |
| HTTP 401 | Valid Dataverse token for org URL; WhoAmI must return 200 |
| Duplicate on re-seed | Skip + load existing IDs; do not abort script |
| `Need vendors and materials first` | materials.txt empty — fix Material create first |
| CSP frame-ancestors | Configure Code app CSP for model-driven host domains |

---

## 11. Agent prompt (copy for future tasks)

```text
You are implementing Vendor Management on Power Platform (prefix cdb, solution VendorManagement).

Tables: cdb_unit, cdb_materialcategory, cdb_prefecture, cdb_city, cdb_vendor,
cdb_material, cdb_materialvendor, cdb_materialpriceperunit, cdb_project, cdb_projectmaterial.

Rules:
1. Fix lookups/relationships before UI.
2. Always use Dataverse logical names from Columns/metadata; never assume cdb_name.
3. Primary keys are GUIDs; primary name attributes vary per table (see VENDOR-MANAGEMENT-SETUP.md).
4. Seed English sample data ≥20 rows where possible; on duplicate load existing IDs.
5. Dashboard should match COSTDB-style UX (filters, charts, list) using Code app or Canvas against Dataverse.
6. Vendor delete / Unit delete only when not linked.
7. Area on Vendor/Project: postal, prefecture, city, street.
8. Do not embed Model-driven inside Code app; embed Code app dashboard into Model-driven if needed.

Follow VENDOR-MANAGEMENT-SETUP.md phases in order: schema → seed → model-driven CRUD → dashboard → UAT.
```

---

## 12. Deliverables checklist

- [ ] Schema documented and lookups fixed  
- [ ] Seed data in all core tables  
- [ ] Model-driven (or Canvas) CRUD for Materials, Vendors, Units, Prices, Projects  
- [ ] Vendor Management dashboard (Code app or Canvas) on live Dataverse  
- [ ] Security roles assigned  
- [ ] Publish solution; optional managed export for higher environments  

---

*Document generated from project history: COSTDB dashboard analysis, Dataverse table scripts, Unit/Material/Material Vendor column discovery, seed troubleshooting, and Power Apps integration constraints.*
