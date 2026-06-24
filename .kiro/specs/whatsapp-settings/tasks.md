# Implementation Plan: WhatsApp Settings

## Overview

Implement the WhatsApp Settings feature end-to-end: fix the backend service layer and validation middleware, add the frontend Axios service and React page, then wire the new route and navigation entry into the admin shell. The implementation follows the existing bw-admin patterns (react-hook-form + Yup, react-hot-toast, Framer Motion, Card/Input/Button/PageHeader components).

## Tasks

- [x] 1. Backend fixes — validation, service layer, and route
  - [x] 1.1 Fix `config.validation.js` — correct schema and add `updateConfigValidation`
    - Remove `id: Joi.number()` and change `value: Joi.number()` to `value: Joi.string().max(255)` in `createConfigValidation`
    - Add `key: Joi.string().max(255).required()` to `createConfigValidation`
    - Export a new `updateConfigValidation` middleware that validates only `value: Joi.string().max(255).required()`
    - File: `Server/middleware/validations/config.validation.js`
    - _Requirements: 6.1, 6.4, 6.5, 6.6_

  - [x] 1.2 Fix `setting.js` service — `updateSetting` new-doc return + 404, `addSetting` 409 on duplicate
    - In `updateSetting`: add `{ new: true }` option to `findOneAndUpdate`; if result is `null`, set `response.status = 404`, `response.success = false`, `response.message = 'Setting not found'` and return early
    - In `addSetting`: call `Setting.findOne({ key: payload.key })` before creating; if a document is found, set `response.status = 409`, `response.success = false`, `response.message = 'Setting with this key already exists'` and return without creating
    - File: `Server/services/setting.js`
    - _Requirements: 6.2, 6.3, 6.7_

  - [x] 1.3 Apply `updateConfigValidation` middleware to the `PUT /:id` route
    - Import `updateConfigValidation` from `config.validation.js` in `Server/routes/setting.js`
    - Add `updateConfigValidation` as middleware on the `PUT /:id` route, before `SettingController.update`
    - File: `Server/routes/setting.js`
    - _Requirements: 6.2, 6.6_

- [x] 2. Frontend service — `whatsappSettings.js`
  - [x] 2.1 Create `src/services/whatsappSettings.js` with three Axios wrappers
    - `fetchSettings()` → `api.get('/setting')`
    - `createSetting(payload)` → `api.post('/setting', payload)`
    - `updateSetting(id, payload)` → `api.put(\`/setting/${id}\`, payload)`
    - Mirror the JSDoc + named-export style of `setRate.js`
    - File: `src/services/whatsappSettings.js`
    - _Requirements: 1.1, 3.1, 3.2, 3.7_

  - [ ]* 2.2 Write property test for `fetchSettings` key-to-field mapping (Property 1)
    - Set up Vitest + `@testing-library/react` + `fast-check` in `bw-admin` (`vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check` as devDependencies; add `vitest.config.js`)
    - File: `src/services/__tests__/whatsappSettings.service.test.js`
    - **Property 1: Settings key-to-field mapping** — for any array of Setting objects, the field for a given key is pre-populated with the matching value and left empty when absent
    - **Validates: Requirements 1.2, 1.3, 1.6**

  - [ ]* 2.3 Write property test for PUT→POST fallback (Property 5)
    - File: `src/services/__tests__/whatsappSettings.service.test.js`
    - **Property 5: PUT→POST fallback for absent records** — for any setting key, when `PUT /setting/:id` returns 404 the service sends a `POST /setting` with that key and the new value
    - **Validates: Requirements 3.7**

- [ ] 3. Backend property-based tests for the setting service
  - [ ]* 3.1 Set up Jest + `fast-check` in the `Server` project
    - Add `jest`, `@types/jest`, `fast-check` as devDependencies; add a minimal `jest.config.js` targeting `**/__tests__/**/*.test.js`
    - File: `Server/jest.config.js`

  - [ ]* 3.2 Write property test for `GET /setting` (Property 6)
    - File: `Server/services/__tests__/setting.service.test.js`
    - **Property 6: GET /setting returns all documents faithfully** — for any N setting documents (0–50), the response `data` array has exactly N elements each with a `key` and `value` field
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

  - [ ]* 3.3 Write property test for `POST /setting` round-trip (Property 7)
    - File: `Server/services/__tests__/setting.service.test.js`
    - **Property 7: POST /setting round-trip preserves key and value** — for any valid key/value string pair (≤ 255 chars), the response has HTTP 201 and `data.key`/`data.value` equal the submitted values
    - **Validates: Requirements 6.1**

  - [ ]* 3.4 Write property test for `PUT /setting/:id` returns updated value (Property 8)
    - File: `Server/services/__tests__/setting.service.test.js`
    - **Property 8: PUT /setting/:id returns the updated value** — for any existing document and any new valid value string, the response has HTTP 200 and `data.value` equals the new value
    - **Validates: Requirements 6.2**

- [x] 4. Frontend page — `WhatsAppSettings.jsx`
  - [x] 4.1 Create `src/pages/whatsapp-settings/WhatsAppSettings.jsx` — fetch and pre-populate form
    - Add `isFetching` / `isSaving` / `settingIds` state; call `fetchSettings()` in `useEffect` on mount
    - Scan response array for `whatsapp_number` and `whatsapp_channel_url`; store `_id` values in `settingIds`; call `form.reset()` with matched values
    - Display loading state (`isFetching`) that disables form submission during initial fetch
    - Show `toast.error('Failed to load settings')` on fetch error
    - File: `src/pages/whatsapp-settings/WhatsAppSettings.jsx`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 4.2 Add Yup validation schema to `WhatsAppSettings.jsx`
    - `whatsapp_number`: required string, regex `/^\+?[0-9]{7,15}$/`, message "Enter a valid phone number"; required message "WhatsApp number is required"
    - `whatsapp_channel_url`: required string, Yup `.url()` or custom `test` checking `http://` or `https://` prefix and non-empty host, message "Enter a valid URL"; required message "WhatsApp channel URL is required"
    - Wire schema to `useForm` via `yupResolver`; display `errors.*?.message` inline beneath each `<Input>`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 4.3 Add `handleSubmit` / `saveSettings` logic to `WhatsAppSettings.jsx`
    - For each setting key: if `settingIds[key]` is set → call `updateSetting(id, { value })`; if null → call `createSetting({ key, value })`
    - Run both calls in parallel via `Promise.allSettled`; set `isSaving` true before and false in `finally`
    - On all fulfilled → `toast.success('WhatsApp settings updated successfully')`; on any rejection → `toast.error('Failed to update some settings')`
    - If a PUT call returns 404 (service throws with `err.response?.status === 404`), fall back to `createSetting({ key, value })` for that field
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 5. Checkpoint — ensure backend fixes and service compile cleanly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Frontend validation and component tests
  - [ ]* 6.1 Write property test for URL validation schema (Property 2)
    - File: `src/pages/whatsapp-settings/__tests__/validationSchema.test.js`
    - **Property 2: URL validation rejects non-http(s) or missing host** — for any string without `http://`/`https://` prefix or with empty host the schema is invalid; for any string with a valid scheme and non-empty host the schema is valid
    - **Validates: Requirements 2.5**

  - [ ]* 6.2 Write property test for E.164 phone validation (Property 3)
    - File: `src/pages/whatsapp-settings/__tests__/validationSchema.test.js`
    - **Property 3: E.164 phone validation** — for any string matching `/^\+?[0-9]{7,15}$/` the schema is valid; for any non-matching string the schema is invalid with message "Enter a valid phone number"
    - **Validates: Requirements 2.6**

  - [ ]* 6.3 Write property test for invalid input never reaching the API (Property 4)
    - File: `src/pages/whatsapp-settings/__tests__/WhatsAppSettings.component.test.jsx`
    - **Property 4: Invalid input never reaches the API** — for any form submission where either field fails Yup validation, zero API calls are dispatched
    - **Validates: Requirements 3.3**

  - [ ]* 6.4 Write unit tests for `WhatsAppSettings.jsx` — mount, loading state, error toast, success toast, unauthenticated redirect
    - File: `src/pages/whatsapp-settings/__tests__/WhatsAppSettings.component.test.jsx`
    - Test: component mounts and calls `GET /setting` (Req 1.1); loading state disables submit (Req 1.4, 3.4); `toast.error('Failed to load settings')` on fetch error (Req 1.5); `toast.success(...)` on save success (Req 3.5); `toast.error(...)` on partial failure (Req 3.6)
    - _Requirements: 1.1, 1.4, 1.5, 3.4, 3.5, 3.6_

- [x] 7. Wire navigation and route
  - [x] 7.1 Add WhatsApp Settings entry to `NAV_ITEMS` in `src/constants/index.js`
    - Append `{ id: 'whatsapp-settings', title: 'WhatsApp Settings', icon: 'MessageCircle', path: '/whatsapp-settings' }` after the `support` entry
    - _Requirements: 4.1_

  - [x] 7.2 Add lazy import and protected route in `src/routes/index.jsx`
    - Add `const WhatsAppSettings = lazy(() => import('@/pages/whatsapp-settings/WhatsAppSettings'))` to the lazy imports block
    - Add `<Route path="/whatsapp-settings" element={<WhatsAppSettings />} />` inside the `ProtectedRoute` block
    - _Requirements: 4.2, 4.3_

- [x] 8. Final checkpoint — ensure all tests pass and routing works
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Backend fixes in Task 1 are prerequisites for all API calls from the frontend
- `Promise.allSettled` is intentional — a failure on one setting should not prevent the other from being saved (Req 3.6)
- `settingIds` tracks MongoDB `_id` values in component state; this is not persisted
- The 404 PUT→POST fallback (Req 3.7) handles first-time setup when DB records don't yet exist
- No new npm dependencies are needed on the frontend (fast-check and vitest are test-only devDependencies)
- The backend does not have a test runner yet; Task 3.1 sets up Jest as a devDependency
- Each task references specific requirements for full traceability

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.1", "4.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "4.2"] },
    { "id": 4, "tasks": ["4.3"] },
    { "id": 5, "tasks": ["6.1", "6.2", "6.3", "6.4", "7.1"] },
    { "id": 6, "tasks": ["7.2"] }
  ]
}
```
