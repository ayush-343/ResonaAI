export const DASHBOARD_ROUTES = [
  { title: "Home", url: "/home" },
  { title: "Speech Studio", url: "/text-to-speech" },
  { title: "Projects", url: "/projects" },
  { title: "Voices", url: "/voices" },
  { title: "History", url: "/history" },
  { title: "Settings", url: "/settings" },
] as const;
export const PROFILE_PATH = "/settings/profile";
export const WORKSPACE_PATH = "/settings/workspace";
export const DEVICE_PATH = "/settings/device";
export function isActiveRoute(pathname: string, route: string) {
  return pathname === route || (route !== "/" && pathname.startsWith(`${route}/`));
}
