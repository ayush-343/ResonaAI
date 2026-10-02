// Only workspace destinations may survive organization selection.
export function workspaceReturnPath(value: unknown): string {
  if (typeof value !== "string" || !/^\/(home|text-to-speech|voices|history|settings)(\?|\/|$)/.test(value) || /[\\\r\n]/.test(value)) return "/home";
  return value;
}
