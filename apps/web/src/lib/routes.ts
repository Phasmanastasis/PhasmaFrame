// Role landing routes for the web app. Kept in one place so the chooser
// buttons, the per-role pages, and the "change role" actions all agree, and
// so the mapping can be unit-tested without rendering the React island.
//
// Path note: the barangay health worker (BHW) role lands on `/bhw`.
export const ROUTES = {
  chooser: '/',
  patient: '/patient',
  bhw: '/bhw',
} as const;

export type RoleWorkspace = 'patient' | 'bhw';

// The route a given role workspace lands on.
export const routeForWorkspace = (workspace: RoleWorkspace): string => ROUTES[workspace];
