export const demoSessionCookie = "rayain_demo_session";
export const demoUserIdCookie = "rayain_user_id";
export const demoUserRoleCookie = "rayain_user_role";
export const demoUserStatusCookie = "rayain_user_status";
export const demoAdminCookie = "rayain_admin_session";

type CookieReader = { get: (name: string) => { value: string } | undefined };

export type DemoSession = {
  userId: string | null;
  role: string | null;
  status: string | null;
  isAdmin: boolean;
  isBlocked: boolean;
  isAuthenticated: boolean;
};

export function readDemoSession(cookies: CookieReader): DemoSession {
  const status = cookies.get(demoUserStatusCookie)?.value ?? null;
  const role = cookies.get(demoUserRoleCookie)?.value ?? null;
  return {
    userId: cookies.get(demoUserIdCookie)?.value ?? null,
    role,
    status,
    isAdmin: role === "admin" && cookies.get(demoAdminCookie)?.value === "active",
    isBlocked: status === "blocked",
    isAuthenticated: cookies.get(demoSessionCookie)?.value === "active",
  };
}
