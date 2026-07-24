# Theme Component Reference

The `ThemeToggle` component manages the application's light/dark/system theme preference. It cycles through three theme states, persists the preference to `localStorage`, and ensures zero flash of unstyled/incorrect theme by running an inline pre-paint script during server hydration.

---

## Overview

**File:** `components/ThemeToggle.jsx`

The theme system works through a combination of:

1. **The `ThemeToggle` React component** — a button that cycles user preferences (light → dark → system) and syncs them to `localStorage` and the DOM.
2. **Exported utility functions** — `resolveTheme()`, `readStoredTheme()`, `applyTheme()` — for SSR-safe theme resolution and DOM application.
3. **An inline pre-paint script** in `app/layout.js` — reads the stored preference from `localStorage` **before React hydrates** to prevent the flash of incorrect theme (FOIT-equivalent for themes).
4. **CSS theme variables** in `app/globals.css` — two color palettes (dark and light) are defined via `@theme` blocks and applied by the `data-theme` attribute on `<html>`.

---

## Supported Theme States

The component cycles through **exactly three states**, stored in the `THEMES` constant:

| Theme | Value    | Description                                                          | Visual result (`data-theme`)                                |
| ----- | -------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| Light | `"light"` | User explicitly chose light mode                                     | `data-theme="light"` activates light palette in globals.css |
| Dark  | `"dark"`  | User explicitly chose dark mode                                      | `data-theme="dark"` activates dark palette in globals.css   |
| System| `"system"`| Use the OS/browser color-scheme preference (default on first visit) | `data-theme` resolves to `"light"` or `"dark"` based on OS  |

The preference cycles in this order: **system** → light → dark → system → ...

---

## Exported API

### Component

#### `<ThemeToggle />`

The main React component. Renders a button that cycles through theme states.

**Props:**

| Prop        | Type     | Required | Default | Description                                          |
| ----------- | -------- | -------- | ------- | ---------------------------------------------------- |
| `className` | `string` | No       | `""`    | Additional Tailwind classes forwarded to the button. |

**Attributes set on the rendered `<button>`:**

| Attribute          | Value(s)                           | Description                                                           |
| ------------------ | ---------------------------------- | --------------------------------------------------------------------- |
| `id`               | `"theme-toggle"`                   | Fixed ID for targeting in tests and styles                            |
| `type`             | `"button"`                         | Prevents form submission if placed inside a `<form>`                  |
| `aria-label`       | Dynamic based on preference        | e.g. `"Theme: Light (click for Dark)"` — updates as preference changes |
| `aria-pressed`     | `"true"` \| `"false"`              | `"true"` when pref is `"light"` or `"dark"`; `"false"` when `"system"` |
| `title`            | e.g. `"Current theme: System"`     | Tooltip showing capitalized current preference                        |
| `data-theme-pref`  | `"light"` \| `"dark"` \| `"system"` | Current preference; updated on every click                            |
| `data-theme-next`  | `"light"` \| `"dark"` \| `"system"` | Next preference in the cycle; useful for visual hints                 |

**Behaviour:**

- On mount, reads the stored preference from `localStorage[THEME_STORAGE_KEY]`, falling back to `"system"` if nothing is stored or `localStorage` is unavailable.
- Calls `applyTheme()` immediately after reading localStorage to sync `data-theme` on the `<html>` element.
- On every click, advances to the next theme in the cycle (`THEMES` array).
- After each preference change, writes the new value to `localStorage` and updates `data-theme` on `<html>`.
- Listens for OS color-scheme changes when preference is `"system"` and re-applies `data-theme` accordingly (via `matchMedia` listener).

**Accessibility:**

- `aria-label` announces the current theme and the next action (e.g. _"Theme: Light (click for Dark)"_).
- `aria-pressed` correctly reflects non-system preferences so assistive technologies treat the button as a toggle.
- All icon SVGs inside the button are `aria-hidden="true"` and `focusable="false"` so they don't interfere with screen readers or keyboard focus.
- Includes a `.focus-ring` class for high-contrast keyboard focus outline (cyan-400 on dark, cyan-600 on light, validated by contrast tests).

---

### Constants

#### `THEMES`

Readonly array of valid theme preference values, in cycle order.

```javascript
export const THEMES = ["light", "dark", "system"];
```

**Type:** `readonly string[]`

Use this to validate preferences or iterate through cycle states. The array is frozen (`Object.freeze`) so it cannot be mutated at runtime.

#### `THEME_STORAGE_KEY`

The `localStorage` key where the user preference is persisted.

```javascript
export const THEME_STORAGE_KEY = "liquifact-theme";
```

**Type:** `string`

Value: `"liquifact-theme"`

Used by:
- `ThemeToggle` component (reads on mount, writes on every click)
- The pre-paint inline script in `app/layout.js` (reads during SSR)
- E2E tests in `tests/e2e/theme-persistence.spec.ts`

---

### Helper Functions

All helpers are side-effect-free and SSR-safe (they check for `typeof window`).

#### `resolveTheme(pref)`

Maps a preference string to the effective visual theme (`"light"` or `"dark"`).

**Signature:**

```javascript
export function resolveTheme(pref: string): "light" | "dark"
```

**Parameters:**

| Param | Type     | Description                           |
| ----- | -------- | ------------------------------------- |
| `pref` | `string` | One of `THEMES`: `"light"`, `"dark"`, or `"system"` |

**Returns:**

- `"light"` if `pref === "light"`
- `"dark"` if `pref === "dark"`
- `"light"` or `"dark"` if `pref === "system"` — determined by `window.matchMedia("(prefers-color-scheme: light)").matches`

**SSR behaviour:**

- When called on the server (or in tests without `window.matchMedia`), `"system"` defaults to `"dark"`.
- Always use this function instead of hardcoding logic, so the OS preference detection is centralized.

**Example:**

```javascript
resolveTheme("light")   // → "light"
resolveTheme("dark")    // → "dark"
resolveTheme("system")  // → "light" (if OS prefers light) or "dark" (if OS prefers dark)
```

---

#### `readStoredTheme()`

Reads the user's stored theme preference from `localStorage`, validating that it is one of the supported `THEMES`.

**Signature:**

```javascript
export function readStoredTheme(): string
```

**Returns:**

- The stored preference (one of `THEMES`) if `localStorage[THEME_STORAGE_KEY]` exists and is valid.
- `"system"` (fallback) if:
  - `localStorage` is empty or unavailable (e.g. in private browsing mode)
  - The stored value is not in `THEMES`
  - `localStorage` access throws an error

**SSR behaviour:**

- Safe to call from the browser only. The function wraps `localStorage` access in a try-catch.

**Example:**

```javascript
// After user clicks the theme toggle and "dark" is stored
readStoredTheme()  // → "dark"

// On a fresh browser or when localStorage is blocked
readStoredTheme()  // → "system"

// If an invalid value somehow ends up in localStorage
readStoredTheme()  // → "system" (falls back)
```

---

#### `applyTheme(pref)`

Writes the `data-theme` attribute to `<html>` and applies the corresponding CSS theme.

**Signature:**

```javascript
export function applyTheme(pref: string): void
```

**Parameters:**

| Param | Type     | Description                           |
| ----- | -------- | ------------------------------------- |
| `pref` | `string` | One of `THEMES`: `"light"`, `"dark"`, or `"system"` |

**Side effects:**

- Resolves `pref` to an effective theme via `resolveTheme()`.
- Sets `document.documentElement.setAttribute("data-theme", effective)`.
- The CSS selectors `[data-theme="light"]` and `[data-theme="dark"]` in `app/globals.css` activate the corresponding color palette.

**SSR behaviour:**

- Safe to call from the browser only. The function accesses `document.documentElement`.

**Example:**

```javascript
applyTheme("light")   // → <html data-theme="light">
applyTheme("dark")    // → <html data-theme="dark">
applyTheme("system")  // → <html data-theme="light"> or <html data-theme="dark">
```

---

## CSS Theme Variables

The theme system defines colour tokens in `app/globals.css` via a `@theme` block. Two palettes are provided: dark (the default) and light.

**Dark theme (default):**

```css
:root,
[data-theme="dark"] {
  --color-bg: #020617;         /* slate-950 */
  --color-fg: #f1f5f9;         /* slate-100 */
  --color-muted: #94a3b8;      /* slate-400 */
  --color-surface: #0f172a;    /* slate-900 */
  --color-border: #1e293b;     /* slate-800 */
  --color-primary: #22d3ee;    /* cyan-400  */
  --color-focus-ring: #22d3ee; /* cyan-400 — high-contrast focus outline */
}
```

**Light theme:**

```css
[data-theme="light"] {
  --color-bg: #f8fafc;         /* slate-50  */
  --color-fg: #0f172a;         /* slate-900 */
  --color-muted: #64748b;      /* slate-500 */
  --color-surface: #ffffff;    /* white     */
  --color-border: #e2e8f0;     /* slate-200 */
  --color-primary: #0891b2;    /* cyan-600 — adjusted for light BG */
  --color-focus-ring: #0891b2; /* cyan-600 — 3.5:1 against slate-50 */
}
```

All values meet WCAG 2.1 AA contrast ratios. See [`docs/design-tokens.md`](./design-tokens.md) for the full contrast validation matrix.

---

## Server-Side Rendering (SSR) & Hydration

### The Pre-Paint Inline Script

To prevent the flash of incorrect theme (FOIT-equivalent), `app/layout.js` embeds an inline script that runs **before React hydrates**:

```javascript
const THEME_SCRIPT = `(function(){
  var key = '${THEME_STORAGE_KEY}';
  var themes = ${JSON.stringify(THEMES)};
  var pref = 'system';
  try { var s = localStorage.getItem(key); if (s && themes.indexOf(s) !== -1) pref = s; } catch(e){}
  var effective = pref;
  if (pref === 'system') {
    effective = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
  }
  document.documentElement.setAttribute('data-theme', effective);
})();`;
```

**How it works:**

1. **Synchronous execution** — The script runs in `<head>` before any `<body>` content is parsed, so the `data-theme` attribute is set before the user sees any pixels.
2. **Preference lookup** — Reads the user's preference from `localStorage`. If unavailable, defaults to `"system"`.
3. **OS resolution** — If the preference is `"system"`, queries `matchMedia('(prefers-color-scheme: light)')` to determine the effective theme.
4. **Early DOM write** — Sets `<html data-theme="light|dark">` immediately, activating the correct CSS palette.
5. **Zero flash** — By the time React renders and the `ThemeToggle` component mounts, the theme is already applied. No white flash on dark-mode users.

### Hydration mismatch (SSR → Client)

- The server cannot read `localStorage` and does not know the client's preference. The initial `<html>` render from the server always uses the default theme (dark, because `[data-theme="dark"]` is paired with `:root`).
- The pre-paint script runs **immediately after** the `<head>` is parsed (before the server's default `:root` styles are rendered), so the browser never shows the default theme.
- After React hydrates, the `ThemeToggle` component reads `localStorage` and ensures the preference is in sync. If the preference differs from the pre-paint value (which should not happen in normal operation), `ThemeToggle` will correct it on mount.

---

## Usage Example

### Basic: Wrap your app and render the toggle

In `app/layout.js`, the `ThemeToggle` is already mounted at the top-right:

```jsx
import ThemeToggle from "../components/ThemeToggle";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        {/* other components */}
        <div className="fixed top-3 right-16 z-50 md:right-20">
          <ThemeToggle />
        </div>
      </body>
    </html>
  );
}
```

No action needed for most pages — the toggle is already wired up globally.

### Advanced: Read the current theme preference programmatically

If you need to know the user's preference in a component or utility:

```javascript
import { readStoredTheme, resolveTheme } from "@/components/ThemeToggle";

function MyComponent() {
  // Read the stored preference (returns one of THEMES)
  const pref = readStoredTheme();

  // Or resolve to the effective visual theme ('light' or 'dark')
  const effective = resolveTheme(pref);

  if (effective === "dark") {
    // dark-mode-specific logic
  }

  return <div>Current theme: {effective}</div>;
}
```

### Advanced: Manually set the theme

Ordinarily, only the `ThemeToggle` component should update the theme. If you need to programmatically set it (e.g. in a preference/settings panel):

```javascript
import { applyTheme, THEMES, THEME_STORAGE_KEY } from "@/components/ThemeToggle";

function SettingsPanel() {
  const handleThemeSelect = (newPref) => {
    // Validate the preference
    if (!THEMES.includes(newPref)) {
      console.error(`Invalid theme: ${newPref}`);
      return;
    }

    // Apply to DOM
    applyTheme(newPref);

    // Persist to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newPref);
    } catch (e) {
      // localStorage unavailable
    }
  };

  return (
    <fieldset>
      {THEMES.map((theme) => (
        <label key={theme}>
          <input
            type="radio"
            name="theme"
            value={theme}
            onChange={(e) => handleThemeSelect(e.target.value)}
          />
          {theme}
        </label>
      ))}
    </fieldset>
  );
}
```

---

## Gotchas & Edge Cases

### Private Browsing Mode

In private/incognito browsing, `localStorage` is usually blocked or cleared on every session. The theme preference will not persist across page reloads in these cases. The system will always fall back to `"system"` (OS preference), which is acceptable UX.

### System Preference Changes During Session

If the user changes their OS theme preference while the app is open **and** the `ThemeToggle` preference is set to `"system"`, the theme will automatically re-apply via the `matchMedia` change listener.

If the user switches to an explicit preference (`"light"` or `"dark"`), OS changes are ignored (as intended).

### iOS Safari & matchMedia Support

Very old browsers may not support `window.matchMedia`. The code checks for this and defaults to `"dark"` in SSR/test environments. Modern Safari (iOS 13+) supports it.

### Component Re-renders

The `ThemeToggle` component uses `useState` to track the preference. Every click triggers a re-render and a useEffect to sync `localStorage` and `data-theme`. This is efficient and intentional.

### localStorage Quota Exceeded

If the browser's localStorage quota is exceeded when writing the preference, the write silently fails (caught in a try-catch). The preference is still applied to the DOM for the current session but will not persist to the next reload. This is graceful fallback behavior.

---

## Testing

### Unit Tests

Comprehensive tests live in `components/ThemeToggle.test.tsx`. Coverage includes:

- `THEMES` constant shape and order
- `resolveTheme()` with all three preferences and both OS scenarios
- `readStoredTheme()` with stored, invalid, and missing values
- `applyTheme()` setting `data-theme` on `<html>`
- Component rendering, clicking, and state cycling
- `localStorage` persistence
- `aria-pressed` and `aria-label` accessibility
- className forwarding
- SVG icons are decorative (`aria-hidden`, `focusable="false"`)

Run tests:

```bash
npm test -- ThemeToggle
```

### E2E Tests

End-to-end smoke tests in `tests/e2e/theme-persistence.spec.ts` verify:

- Toggle cycles through all three themes on successive clicks
- Preferences persist across page reloads (via `localStorage`)
- No flash of incorrect theme on page load (via pre-paint script)
- Keyboard accessibility (focus management after reload)
- No console errors during the flow

Run E2E tests:

```bash
npm run test:e2e
```

---

## Related Documentation

- **[Design Tokens Reference](./design-tokens.md)** — Colour palette, spacing, typography, and contrast validation.
- **[Architecture & Data Flow](./architecture.md)** — High-level app structure and state management (including where theme state lives).
- **[Accessibility Guide](./accessibility.md)** — WCAG compliance strategy and patterns used across the app (e.g., focus-ring, aria-current, live regions).

---

## Frequently Asked Questions

**Q: Can I add more than three themes?**

A: The current design supports exactly three states (light/dark/system). Adding more would require:
1. Extending the `THEMES` array.
2. Adding new CSS theme blocks in `app/globals.css`.
3. Updating the pre-paint script in `app/layout.js`.
4. Updating tests and the E2E flow.

This is out of scope for the current implementation but straightforward to extend if needed.

**Q: How do I style components based on the theme?**

A: Use the CSS custom properties (e.g., `var(--color-primary)`) defined in `app/globals.css`. All colour tokens are theme-aware and automatically switch when `data-theme` changes.

```css
.my-component {
  background: var(--color-surface);
  color: var(--color-fg);
  border: 1px solid var(--color-border);
}
```

**Q: What if localStorage is blocked by a browser policy?**

A: The preference will not persist across sessions. On every reload, it will default to `"system"` (OS preference). This is acceptable and graceful.

**Q: Can I detect theme changes in JavaScript?**

A: Yes. Listen for mutations on `document.documentElement`:

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((m) => {
    if (m.attributeName === "data-theme") {
      const newTheme = document.documentElement.getAttribute("data-theme");
      console.log("Theme changed to:", newTheme);
    }
  });
});

observer.observe(document.documentElement, { attributes: true });
```

Or, monitor the preference in the `ThemeToggle` component's local state (if you need to coordinate with the toggle).

