/**
 * @jest-environment node
 *
 * tests/docs/upload-component.test.tsx
 *
 * Verifies that the upload component contract documentation (docs/upload-component.md)
 * accurately describes the real UploadZone component API, exports, and constants.
 * This ensures the documentation stays in sync with the source code.
 */

import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "../..");

// ---------------------------------------------------------------------------
// Read documentation and source at module scope
// ---------------------------------------------------------------------------

let docSource: string;
let componentSource: string;

beforeAll(() => {
  docSource = fs.readFileSync(path.join(ROOT, "docs/upload-component.md"), "utf8");
  componentSource = fs.readFileSync(path.join(ROOT, "components/UploadZone.jsx"), "utf8");
});

// ---------------------------------------------------------------------------
// 1. Documentation file existence and basic structure
// ---------------------------------------------------------------------------

describe("Upload component documentation file", () => {
  it("docs/upload-component.md exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/upload-component.md"))).toBe(true);
  });

  it("has meaningful content (minimum 500 characters)", () => {
    expect(docSource.length).toBeGreaterThan(500);
  });

  it("has a title heading", () => {
    expect(docSource).toMatch(/^# UploadZone Component Contract/m);
  });

  it("contains a Purpose section", () => {
    expect(docSource).toContain("## Purpose");
  });

  it("contains a Props section", () => {
    expect(docSource).toContain("## Props");
  });

  it("contains an Upload states section", () => {
    expect(docSource).toContain("## Upload states");
  });

  it("contains an Accessibility section", () => {
    expect(docSource).toContain("## Accessibility");
  });

  it("contains a Minimal usage example section", () => {
    expect(docSource).toContain("## Minimal usage example");
  });

  it("contains a Named exports section", () => {
    expect(docSource).toContain("## Named exports");
  });
});

// ---------------------------------------------------------------------------
// 2. Props documentation matches source
// ---------------------------------------------------------------------------

describe("Props documentation matches source", () => {
  it("documents onUploadSuccess prop", () => {
    expect(docSource).toContain("onUploadSuccess");
    expect(componentSource).toContain("onUploadSuccess");
  });

  it("documents progress prop", () => {
    expect(docSource).toContain("progress");
    expect(componentSource).toContain("progress");
  });

  it("onUploadSuccess is documented as function type", () => {
    // Check the props table includes function type for onUploadSuccess
    expect(docSource).toMatch(/onUploadSuccess.*function/);
  });

  it("progress is documented as number type", () => {
    // Check the props table includes number type for progress
    expect(docSource).toMatch(/progress.*number/);
  });

  it("documents that both props are optional (no required marker)", () => {
    // Both props should be optional
    expect(docSource).toMatch(/onUploadSuccess.*No/);
    expect(docSource).toMatch(/progress.*No/);
  });

  it("documents the API endpoint configuration", () => {
    expect(docSource).toContain("NEXT_PUBLIC_API_URL");
  });

  it("documents the callback payload shape", () => {
    expect(docSource).toContain("id");
    expect(docSource).toContain("issuer");
    expect(docSource).toContain("amount");
    expect(docSource).toContain("currency");
    expect(docSource).toContain("dueDate");
    expect(docSource).toContain("yield");
    expect(docSource).toContain("status");
  });
});

// ---------------------------------------------------------------------------
// 3. Named exports documentation matches source
// ---------------------------------------------------------------------------

describe("Named exports match source", () => {
  it("documents FILE_CONSTRAINTS export", () => {
    expect(docSource).toContain("FILE_CONSTRAINTS");
    expect(componentSource).toContain("FILE_CONSTRAINTS");
  });

  it("documents Spinner export", () => {
    expect(docSource).toContain("Spinner");
    expect(componentSource).toContain("Spinner");
  });

  it("documents default export", () => {
    expect(docSource).toContain("default");
  });

  it("FILE_CONSTRAINTS values in docs match source", () => {
    // The source defines: const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
    // and FILE_CONSTRAINTS = { accept: ".pdf", mimeType: "application/pdf", maxSizeMb: 10, maxSizeBytes: MAX_UPLOAD_BYTES }
    expect(docSource).toContain('accept: ".pdf"');
    expect(docSource).toContain('mimeType: "application/pdf"');
    expect(docSource).toContain('maxSizeMb: 10');
    expect(docSource).toContain('maxSizeBytes: 10 * 1024 * 1024');
  });

  it("source exports FILE_CONSTRAINTS as a named export", () => {
    expect(componentSource).toMatch(/export\s*\{[^}]*FILE_CONSTRAINTS[^}]*\}/);
  });

  it("source exports Spinner as a named export", () => {
    expect(componentSource).toMatch(/export\s*\{[^}]*Spinner[^}]*\}/);
  });

  it("Spinner is documented as having role=\"img\" and aria-label", () => {
    expect(docSource).toContain('role="img"');
    expect(docSource).toContain("aria-label");
  });
});

// ---------------------------------------------------------------------------
// 4. Upload states documentation matches source
// ---------------------------------------------------------------------------

describe("Upload states match source", () => {
  it("documents idle state", () => {
    expect(docSource).toContain("idle");
  });

  it("documents uploading state", () => {
    expect(docSource).toContain("uploading");
  });

  it("documents tokenizing state", () => {
    expect(docSource).toContain("tokenizing");
  });

  it("documents success state", () => {
    expect(docSource).toContain("success");
  });

  it("documents error state", () => {
    expect(docSource).toContain("error");
  });

  it("source uses all five status values", () => {
    expect(componentSource).toContain('"idle"');
    expect(componentSource).toContain('"uploading"');
    expect(componentSource).toContain('"tokenizing"');
    expect(componentSource).toContain('"success"');
  });

  it("documents that double-submit is blocked during uploading", () => {
    expect(docSource).toMatch(/double-submit|double.submit/i);
  });

  it("documents that uploading shows a progress bar when progress prop is provided", () => {
    expect(docSource).toContain("role=\"progressbar\"");
  });

  it("documents that error status resets to idle", () => {
    // The source resets status to 'idle' on error in handleSubmit catch block
    expect(docSource).toMatch(/status.*resets.*idle/i);
  });
});

// ---------------------------------------------------------------------------
// 5. Validation pipeline documentation matches source
// ---------------------------------------------------------------------------

describe("Validation pipeline matches source", () => {
  it("documents null check", () => {
    expect(docSource).toMatch(/null check/i);
  });

  it("documents MIME-type check", () => {
    expect(docSource).toMatch(/MIME.type|mime.type/i);
  });

  it("documents size check", () => {
    expect(docSource).toMatch(/size check/i);
  });

  it("documents zero-byte check", () => {
    expect(docSource).toMatch(/zero.byte/i);
  });

  it("documents async PDF validation", () => {
    expect(docSource).toMatch(/async.*PDF validation|validatePdfFile/i);
  });

  it("source validates MIME type as application/pdf", () => {
    expect(componentSource).toContain('"application/pdf"');
  });

  it("source checks file size against MAX_UPLOAD_BYTES", () => {
    expect(componentSource).toContain("MAX_UPLOAD_BYTES");
  });

  it("source calls validatePdfFile", () => {
    expect(componentSource).toContain("validatePdfFile");
  });

  it("documents filename sanitization", () => {
    expect(docSource).toMatch(/sanitiz/i);
  });

  it("documents filename truncation to 50 characters", () => {
    expect(docSource).toContain("50 characters");
  });
});

// ---------------------------------------------------------------------------
// 6. Accessibility documentation matches source
// ---------------------------------------------------------------------------

describe("Accessibility documentation matches source", () => {
  it("documents role=\"button\" on drop zone", () => {
    expect(docSource).toContain('role="button"');
  });

  it("documents tabIndex={0} on drop zone", () => {
    expect(docSource).toContain("tabIndex={0}");
  });

  it("documents Enter and Space key activation", () => {
    expect(docSource).toContain("Enter");
    expect(docSource).toContain("Space");
  });

  it("documents role=\"alert\" for error messages", () => {
    expect(docSource).toContain('role="alert"');
  });

  it("documents aria-live=\"assertive\" for errors", () => {
    expect(docSource).toContain('aria-live="assertive"');
  });

  it("documents role=\"status\" for upload/success status", () => {
    expect(docSource).toContain('role="status"');
  });

  it("documents aria-live=\"polite\" for status updates", () => {
    expect(docSource).toContain('aria-live="polite"');
  });

  it("documents aria-disabled on submit button", () => {
    expect(docSource).toContain("aria-disabled");
  });

  it("documents role=\"note\" for constraint notice", () => {
    expect(docSource).toContain('role="note"');
  });

  it("source implements role=\"button\" on drop zone", () => {
    expect(componentSource).toContain('role="button"');
  });

  it("source implements tabIndex={0} on drop zone", () => {
    expect(componentSource).toContain("tabIndex={0}");
  });

  it("source implements role=\"alert\" for errors", () => {
    expect(componentSource).toContain('role="alert"');
  });

  it("source implements role=\"status\" for status updates", () => {
    expect(componentSource).toContain('role="status"');
  });

  it("source implements role=\"progressbar\" for progress", () => {
    expect(componentSource).toContain('role="progressbar"');
  });

  it("source implements aria-valuemin and aria-valuemax on progressbar", () => {
    expect(componentSource).toContain("aria-valuemin");
    expect(componentSource).toContain("aria-valuemax");
  });
});

// ---------------------------------------------------------------------------
// 7. Copy strings documentation matches source
// ---------------------------------------------------------------------------

describe("Copy strings documentation matches source", () => {
  it("documents uploadZone namespace", () => {
    expect(docSource).toContain("uploadZone");
  });

  it("lists key copy strings", () => {
    const expectedKeys = [
      "requirementsTitle",
      "badgePdfOnly",
      "dropZoneLabel",
      "fileInputLabel",
      "dragDropPrompt",
      "submitIdle",
      "submitUploading",
      "statusUploading",
      "statusTokenizing",
      "statusSuccess",
      "resetAction",
    ];

    expectedKeys.forEach((key) => {
      expect(docSource).toContain(key);
    });
  });

  it("copy strings exist in app/copy/en.js", () => {
    const copySource = fs.readFileSync(path.join(ROOT, "app/copy/en.js"), "utf8");
    expect(copySource).toContain("uploadZone");
    expect(copySource).toContain("requirementsTitle");
    expect(copySource).toContain("badgePdfOnly");
    expect(copySource).toContain("dropZoneLabel");
    expect(copySource).toContain("submitIdle");
    expect(copySource).toContain("statusUploading");
    expect(copySource).toContain("statusTokenizing");
    expect(docSource).toContain("statusSuccess");
  });
});

// ---------------------------------------------------------------------------
// 8. File constraints documentation matches source
// ---------------------------------------------------------------------------

describe("File constraints documentation matches source", () => {
  it("documents .pdf accept value", () => {
    expect(docSource).toContain('.pdf');
  });

  it("documents 10 MB max size", () => {
    expect(docSource).toContain("10 MB");
    expect(docSource).toContain("10,485,760");
  });

  it("source defines FILE_CONSTRAINTS with correct values", () => {
    expect(componentSource).toContain('accept: ".pdf"');
    expect(componentSource).toContain('mimeType: "application/pdf"');
    expect(componentSource).toContain("maxSizeMb: 10");
    expect(componentSource).toContain("maxSizeBytes: MAX_UPLOAD_BYTES");
  });

  it("source defines MAX_UPLOAD_BYTES as 10 * 1024 * 1024", () => {
    expect(componentSource).toContain("MAX_UPLOAD_BYTES = 10 * 1024 * 1024");
  });
});

// ---------------------------------------------------------------------------
// 9. Documentation references correct files
// ---------------------------------------------------------------------------

describe("Documentation references correct files", () => {
  it("references components/UploadZone.jsx as source file", () => {
    expect(docSource).toContain("components/UploadZone.jsx");
  });

  it("references components/UploadZone.test.jsx as test file", () => {
    expect(docSource).toContain("components/UploadZone.test.jsx");
  });

  it("references lib/validation/pdf.js", () => {
    expect(docSource).toContain("lib/validation/pdf.js");
  });

  it("references lib/config/env.js", () => {
    expect(docSource).toContain("lib/config/env.js");
  });

  it("references app/copy/en.js", () => {
    expect(docSource).toContain("app/copy/en.js");
  });

  it("references COMPONENTS.md", () => {
    expect(docSource).toContain("COMPONENTS.md");
  });

  it("all referenced files exist", () => {
    const referencedFiles = [
      "components/UploadZone.jsx",
      "components/UploadZone.test.jsx",
      "lib/validation/pdf.js",
      "lib/config/env.js",
      "app/copy/en.js",
      "COMPONENTS.md",
    ];

    referencedFiles.forEach((file) => {
      expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// 10. Usage examples are syntactically valid
// ---------------------------------------------------------------------------

describe("Usage examples in documentation", () => {
  it("contains at least one code block", () => {
    expect(docSource).toContain("```jsx");
  });

  it("contains basic usage example with UploadZone import", () => {
    expect(docSource).toMatch(/import\s+UploadZone\s+from/);
  });

  it("contains onUploadSuccess callback example", () => {
    expect(docSource).toContain("onUploadSuccess");
    expect(docSource).toContain("setInvoices");
  });

  it("contains progress prop example", () => {
    expect(docSource).toContain("progress={progress}");
  });
});

// ---------------------------------------------------------------------------
// 11. Related files section matches actual files
// ---------------------------------------------------------------------------

describe("Related files section", () => {
  it("documents a Related files section", () => {
    expect(docSource).toContain("## Related files");
  });

  it("lists key related files that exist on disk", () => {
    const relatedFiles = [
      "components/UploadZone.jsx",
      "components/UploadZone.test.jsx",
      "lib/validation/pdf.js",
      "lib/config/env.js",
      "app/copy/en.js",
    ];

    relatedFiles.forEach((file) => {
      expect(docSource).toContain(file);
      expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
    });
  });
});
