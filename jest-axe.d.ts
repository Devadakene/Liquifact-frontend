declare module "jest-axe" {
  export function axe(element: Element | Document): Promise<{ violations: unknown[] }>;
  export const toHaveNoViolations: jest.ExpectExtendMap;
}

declare namespace jest {
  interface Matchers<R> {
    toHaveNoViolations(): R;
  }
}

declare module "react-dom/server.node" {
  export { renderToString, renderToStaticMarkup } from "react-dom/server";
}
