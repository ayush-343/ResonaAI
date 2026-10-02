# Navigation and settings repair

Sidebar destinations are real routes: `/`, `/voices`, `/text-to-speech`, `/history`, `/settings`. Settings redirects to `/settings/profile`; `/settings/workspace` contains workspace management. Both use optional catch-all routes so Clerk's nested profile security and workspace member screens survive reloads. Avatar Manage account navigates to Profile; the organization switcher's Manage organization navigates to Workspace. `/profile` and `/account` are compatible aliases to Profile, preserving nested paths.

Voices includes accessible English and Hindi/Hinglish tabs and passes the selected voice to the editor. History reuses the actual local/cloud history component and shows all retained local entries. The editor retains its Recent speech section. Full-page scrolling is restored; mobile navigation closes when a destination is chosen. Sidebar active state matches nested routes rather than comparing pathnames to fragment URLs. Expanded navigation is the initial default when no sidebar cookie exists.

Clerk components use the app's shadcn theme. App settings navigation contains only Profile and Workspace; speech synthesis controls remain in Voice & settings. Sign-in/sign-up use explicit path routing and full-height layouts.

A generated review mockup preceded page implementation. Route tests require each sidebar destination to exist and verify active state for nested settings. Authenticated browser checks and final build results are recorded below after verification.

## Verified
Signed-in browser: Home, Voices, History and Settings opened. English/Hindi voice tabs switched; Use Alpha selected Hindi/Alpha in the editor. Profile Security and Workspace Members nested routes worked; Invitations switched without changes to membership. Manage account and Manage organization opened the canonical Profile/Workspace destinations. Profile Security survived reload. Mobile sidebar opened and closed after choosing Voices; mobile Account menu opened Security. Settings had no horizontal overflow at the normal 1087 px viewport or at 390 px after clamping Clerk's default panel width. Desktop and narrow layouts were inspected together and confirmed after corrections.

Dashboard draft recovery also required a fix: consuming storage in a cancelled mount effect could discard text, and returning to a cached editor could retain an old form. The editor now consumes the draft in the active microtask and uses an opaque draft ID to remount for each handoff. The draft ID contains no script text. A fresh signed-in background tab successfully transferred “Navigation smoke test.” to the editor. Temporary verification tab closed afterwards. Refresh existing tabs once to load current development chunks.

`npm run check` passes, with the existing unused wavy-background hook warning. Production build includes all new routes. Cloud saves still require R2 configuration and database migration; History communicates that condition instead of displaying raw JSON parser errors. Account settings were inspected only; no account, security or membership data was modified.
