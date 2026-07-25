# UploadZone Component Contract

## Purpose

This document defines the complete API contract for the `UploadZone` component — the drag-and-drop PDF invoice upload form used on the Invoices page (`/invoices`). It covers props, internal states, validation rules, accessibility semantics, exported constants, and a minimal usage example.

**File:** `components/UploadZone.jsx`

---

## Props

| Prop              | Type       | Default     | Required | Description                                                                                                                                                           |
| ----------------- | ---------- | ----------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onUploadSuccess` | `function` | `undefined` | No       | Callback fired when the invoice upload and tokenization completes successfully. Receives an invoice metadata object (see **Callback payload** below).                 |
| `progress`        | `number`   | `undefined` | No       | Upload progress percentage (`0`–`100`). When provided during the `uploading` state, renders a determinate progress bar (`role="progressbar"`). Otherwise, indeterminate spinner. |

### Callback payload

When `onUploadSuccess` is provided and the upload completes, it is called with:

```js
{
  id: `upload-${Date.now()}-${sanitizedFilename}`,
  issuer: sanitizedFilename,   // user-selected filename (sanitized, truncated to 50 chars)
  amount: "Pending",
  currency: "USD",
  dueDate: "Pending",
  yield: "Pending",
  status: "Pending tokenization",
}
```

### API endpoint

The component reads the backend URL from `env.apiUrl` (validated in `lib/config/env.js`). It does **not** accept a URL prop — the endpoint is configured via `NEXT_PUBLIC_API_URL` environment variable (default: `http://localhost:3001`).

---

## Named exports

| Export             | Type     | Description                                                                 |
| ------------------ | -------- | --------------------------------------------------------------------------- |
| `default`          | Component| The `UploadZone` React component                                            |
| `FILE_CONSTRAINTS` | `object` | `{ accept: ".pdf", mimeType: "application/pdf", maxSizeMb: 10, maxSizeBytes: 10485760 }` |
| `Spinner`          | Component| Inline SVG spinner with `role="img"` and accessible `aria-label`            |

---

## Upload states

The component manages an internal `status` state with five values:

| Status        | Visual                                                  | Submit button                    | Description                                              |
| ------------- | ------------------------------------------------------- | -------------------------------- | -------------------------------------------------------- |
| `idle`        | Constraint badges + empty drop zone (or file info)      | Enabled (if valid file selected) | Waiting for file selection or ready to submit            |
| `uploading`   | Spinner or progress bar + status text                   | Disabled                         | `POST /invoices` in flight; double-submit blocked        |
| `tokenizing`  | Spinner + status text                                   | Disabled                         | Upload succeeded; awaiting server tokenization delay      |
| `success`     | Green success banner + "Upload another invoice" button  | Enabled (label reverts)          | Invoice queued; `onUploadSuccess` invoked                |
| error         | Red `role="alert"` banner below drop zone               | Disabled (no valid file)         | Validation or network failure; `status` resets to `idle` |

---

## Validation pipeline

Every file (via click-to-browse **or** drag-and-drop) passes this pipeline before acceptance:

1. **Null check** — rejects if no file present.
2. **MIME-type check** — only `application/pdf` accepted.
3. **Size check** — must be ≤ 10 MB (`FILE_CONSTRAINTS.maxSizeBytes`).
4. **Zero-byte check** — empty files (0 bytes) rejected.
5. **Async PDF validation** (`validatePdfFile` from `lib/validation/pdf.js`) — verifies magic bytes (`%PDF-`), file extension (`.pdf`, case-insensitive), and content–extension consistency.

After validation, filenames are sanitized for display and callback data:
- HTML special characters escaped (XSS prevention).
- Displayed filenames truncated to 50 characters.

---

## File constraints

```js
FILE_CONSTRAINTS = {
  accept: ".pdf",
  mimeType: "application/pdf",
  maxSizeMb: 10,
  maxSizeBytes: 10 * 1024 * 1024,  // 10,485,760 bytes
};
```

---

## Accessibility

| Feature                        | Implementation                                                                |
| ------------------------------ | ----------------------------------------------------------------------------- |
| Drop zone activation           | `role="button"`, `tabIndex={0}`, responds to `Enter` and `Space` keys        |
| Hidden file input              | Linked via `<label className="sr-only">`, `aria-label` for screen readers    |
| Error messages                 | `role="alert"` with `aria-live="assertive"`                                  |
| Upload/tokenizing/success status | `role="status"` with `aria-live="polite"`                                  |
| Progress bar (when `progress` prop provided) | `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` |
| Submit button                  | `aria-disabled` alongside native `disabled` attribute                        |
| Constraint notice              | `role="note"` with `aria-label="File upload requirements"`                   |
| Spinner                        | `role="img"` with `aria-label` (screen-reader-accessible loading indicator)  |

---

## Copy strings

All user-visible text is sourced from `app/copy/en.js` under the `uploadZone` namespace. Key strings include:

| Key                      | Purpose                             |
| ------------------------ | ----------------------------------- |
| `requirementsTitle`      | Heading for constraint notice       |
| `badgePdfOnly`           | "PDF only" badge                    |
| `badgeMaxSize`           | "Max {maxSizeMb} MB" badge          |
| `dropZoneLabel`          | Accessible label for drop zone      |
| `fileInputLabel`         | Accessible label for hidden input   |
| `dragDropPrompt`         | Main drop zone heading text         |
| `submitIdle`             | Submit button label (idle)          |
| `submitUploading`        | Submit button label (uploading)     |
| `statusUploading`        | Status text during upload           |
| `statusTokenizing`       | Status text during tokenization     |
| `statusSuccess`          | Success message                     |
| `resetAction`            | "Upload another invoice" button     |
| `errorInvalidType`       | MIME-type validation error          |
| `errorOversize`          | Size validation error               |
| `errorEmpty`             | Zero-byte validation error          |
| `errorInvalidPdf`        | PDF validation error                |
| `errorUploadFailed`      | Network error                       |

---

## Minimal usage example

```jsx
import UploadZone from "@/components/UploadZone";

export default function InvoicePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Upload Invoice</h1>
      <UploadZone />
    </main>
  );
}
```

### With `onUploadSuccess` callback

```jsx
import { useState } from "react";
import UploadZone from "@/components/UploadZone";

function InvoicePage() {
  const [invoices, setInvoices] = useState([]);

  return (
    <>
      <UploadZone
        onUploadSuccess={(newInvoice) => {
          setInvoices((prev) => [newInvoice, ...prev]);
        }}
      />
      {/* Render invoices list below */}
    </>
  );
}
```

### With determinate progress bar

```jsx
import { useState } from "react";
import UploadZone from "@/components/UploadZone";

function InvoicePage() {
  const [progress, setProgress] = useState(undefined);

  return (
    <UploadZone
      progress={progress}
      onUploadSuccess={(invoice) => {
        setProgress(undefined);
      }}
    />
  );
}
```

---

## Related files

| File                            | Purpose                                          |
| ------------------------------- | ------------------------------------------------ |
| `docs/upload-component.md`      | This document                                    |
| `components/UploadZone.jsx`     | Component source                                 |
| `components/UploadZone.test.jsx`| Unit tests (states, validation, accessibility)   |
| `lib/validation/pdf.js`         | PDF validation helpers (`validatePdfFile`, `sanitizeFilename`) |
| `lib/config/env.js`             | Environment variable validation and API URL       |
| `app/copy/en.js`                | All user-facing strings (`uploadZone` namespace)  |
| `COMPONENTS.md`                 | Full component library reference (includes UploadZone section) |
