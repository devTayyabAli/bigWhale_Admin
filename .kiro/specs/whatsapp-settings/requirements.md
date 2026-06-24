# Requirements Document

## Introduction

This feature adds a WhatsApp Settings page to the bw-admin panel, allowing the admin to view and update two contact settings: the WhatsApp phone number and the WhatsApp channel URL. Both values are stored as key-value pairs in the existing `Setting` collection on the backend and are intended to be consumed by the client-facing app.

No blockchain or wallet interaction is required. The feature reuses existing backend infrastructure (`Setting` model, `setting.controller.js`, `/setting` routes) and follows the existing admin frontend patterns (React Hook Form + Yup, react-hot-toast, Axios via `api.js`, Framer Motion, Card/Input/Button/PageHeader components).

## Glossary

- **Admin**: An authenticated administrator using the bw-admin panel.
- **WhatsApp_Settings_Page**: The bw-admin React page at `/whatsapp-settings` that displays and allows editing of WhatsApp contact settings.
- **WhatsApp_Settings_Service**: The thin Axios wrapper in `src/services/whatsappSettings.js` that communicates with the backend settings API.
- **Settings_API**: The existing Express backend endpoints at `GET /setting`, `POST /setting`, and `PUT /setting/:id`.
- **WhatsApp_Number**: The stored contact phone number, identified by the key `whatsapp_number` in the `Setting` collection.
- **WhatsApp_Channel_URL**: The stored channel link, identified by the key `whatsapp_channel_url` in the `Setting` collection.
- **Setting**: A MongoDB document with fields `key: String` and `value: String` in the existing `Setting` model.

---

## Requirements

### Requirement 1: Display Current WhatsApp Settings

**User Story:** As an Admin, I want to see the current WhatsApp number and WhatsApp channel URL when I open the settings page, so that I know what values are currently configured before making changes.

#### Acceptance Criteria

1. WHEN the Admin navigates to the WhatsApp Settings page, THE WhatsApp_Settings_Page SHALL fetch all settings from the Settings_API (`GET /setting`).
2. WHEN the Settings_API returns a successful response and the key `whatsapp_number` is present in the response, THE WhatsApp_Settings_Page SHALL pre-populate the WhatsApp Number input field with the corresponding value.
3. WHEN the Settings_API returns a successful response and the key `whatsapp_channel_url` is present in the response, THE WhatsApp_Settings_Page SHALL pre-populate the WhatsApp Channel URL input field with the corresponding value.
4. WHILE the Settings_API request is in-flight, THE WhatsApp_Settings_Page SHALL display a loading state that prevents form submission.
5. IF the Settings_API returns an error response, THEN THE WhatsApp_Settings_Page SHALL display a toast notification with the message "Failed to load settings".
6. WHEN the Settings_API returns a successful response but the key `whatsapp_number` or `whatsapp_channel_url` is absent, THE WhatsApp_Settings_Page SHALL leave the corresponding input field empty and remain fully functional.

---

### Requirement 2: Validate WhatsApp Settings Input

**User Story:** As an Admin, I want the form to validate my input before submission, so that I cannot save an invalid phone number or a malformed URL.

#### Acceptance Criteria

1. IF the Admin attempts to submit the form with an empty WhatsApp Number field, THEN THE WhatsApp_Settings_Page SHALL prevent submission and display the inline validation message "WhatsApp number is required" adjacent to the WhatsApp Number field.
2. IF the Admin attempts to submit the form with an empty WhatsApp Channel URL field, THEN THE WhatsApp_Settings_Page SHALL prevent submission and display the inline validation message "WhatsApp channel URL is required" adjacent to the WhatsApp Channel URL field.
3. WHEN the Admin submits the form with an empty WhatsApp Number field, THE WhatsApp_Settings_Page SHALL display the inline validation message "WhatsApp number is required".
4. WHEN the Admin submits the form with an empty WhatsApp Channel URL field, THE WhatsApp_Settings_Page SHALL display the inline validation message "WhatsApp channel URL is required".
5. WHEN the Admin submits the form with a WhatsApp Channel URL that does not begin with `http://` or `https://`, or has an empty host, THE WhatsApp_Settings_Page SHALL display the inline validation message "Enter a valid URL" adjacent to the WhatsApp Channel URL field.
6. WHEN the Admin submits the form with a WhatsApp Number that does not match the E.164-compatible format (an optional leading `+` followed by 7 to 15 digits), THE WhatsApp_Settings_Page SHALL prevent submission and display the inline validation message "Enter a valid phone number" adjacent to the WhatsApp Number field.

---

### Requirement 3: Update WhatsApp Settings

**User Story:** As an Admin, I want to save updated values for the WhatsApp number and WhatsApp channel URL, so that the client-facing app receives the correct contact information.

#### Acceptance Criteria

1. WHEN the Admin submits valid form data, THE WhatsApp_Settings_Service SHALL send a `PUT /setting/:id` request for the `whatsapp_number` Setting with the new value.
2. WHEN the Admin submits valid form data, THE WhatsApp_Settings_Service SHALL send a `PUT /setting/:id` request for the `whatsapp_channel_url` Setting with the new value.
3. IF the Admin submits form data that fails validation, THEN THE WhatsApp_Settings_Page SHALL display inline validation errors and SHALL NOT send any API request.
4. WHILE the update requests are in-flight, THE WhatsApp_Settings_Page SHALL display a loading state on the submit button and prevent resubmission.
5. WHEN both update requests succeed, THE WhatsApp_Settings_Page SHALL display a success toast notification.
6. IF one or both update requests return an error, THEN THE WhatsApp_Settings_Page SHALL display an error toast notification; any successfully updated setting SHALL be retained and not rolled back.
7. WHEN the Settings_API returns a record-not-found response for `whatsapp_number` or `whatsapp_channel_url`, THE WhatsApp_Settings_Service SHALL send a `POST /setting` request to create the missing record.

---

### Requirement 4: Navigation and Routing

**User Story:** As an Admin, I want a dedicated navigation entry for WhatsApp settings, so that I can reach the page from the sidebar without manually typing the URL.

#### Acceptance Criteria

1. THE bw-admin navigation SHALL include a sidebar item with `id: 'whatsapp-settings'`, title "WhatsApp Settings", the Feather icon `MessageCircle`, and the path `/whatsapp-settings`.
2. THE bw-admin router SHALL render the WhatsApp_Settings_Page at the protected route `/whatsapp-settings` within the authenticated main layout (including sidebar and navbar).
3. WHEN an unauthenticated user navigates to `/whatsapp-settings`, THE bw-admin router SHALL redirect the user to `/login`.

---

### Requirement 5: Backend — Retrieve WhatsApp Settings

**User Story:** As a client application, I want to retrieve the stored WhatsApp number and channel URL from a single API call, so that I can display the correct contact links to end users.

#### Acceptance Criteria

1. WHEN a request is sent to `GET /setting`, THE Settings_API SHALL return a successful response with all Setting documents as an array, where each document exposes at minimum a `key` field and a `value` field.
2. WHEN the `Setting` collection contains a document with key `whatsapp_number`, THE Settings_API SHALL include that document in the `GET /setting` response.
3. WHEN the `Setting` collection contains a document with key `whatsapp_channel_url`, THE Settings_API SHALL include that document in the `GET /setting` response.
4. WHEN the `Setting` collection is empty, THE Settings_API SHALL return a successful response with an empty array.
5. IF the Settings_API encounters a server error while processing `GET /setting`, THEN it SHALL return an error response with HTTP status 500.

---

### Requirement 6: Backend — Create or Update WhatsApp Settings

**User Story:** As an Admin, I want the backend to persist changes to WhatsApp settings reliably, so that updated values survive server restarts and are available to all clients.

#### Acceptance Criteria

1. WHEN a `POST /setting` request is received with a non-empty `key` string (≤ 255 characters) and a non-empty `value` string (≤ 255 characters), THE Settings_API SHALL create a new Setting document and return it in the response with HTTP status 201.
2. WHEN a `PUT /setting/:id` request is received with a non-empty `value` string (≤ 255 characters), THE Settings_API SHALL update the matching Setting document and return the updated document in the response with HTTP status 200.
3. IF a `PUT /setting/:id` request is received with an `id` that does not match any Setting document, THEN THE Settings_API SHALL return an error response with HTTP status 404.
4. WHEN a `POST /setting` request is received without the `key` field, THE Settings_API SHALL return a validation error response with HTTP status 400.
5. WHEN a `POST /setting` request is received without the `value` field, THE Settings_API SHALL return a validation error response with HTTP status 400.
6. IF a `PUT /setting/:id` request is received with a missing or empty `value` field, THEN THE Settings_API SHALL return a validation error response with HTTP status 400.
7. IF a `POST /setting` request is received with a `key` that already exists in the `Setting` collection, THEN THE Settings_API SHALL return a conflict error response with HTTP status 409.
