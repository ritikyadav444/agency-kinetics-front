# Frontend Fixes - Agency Kinetics

## Priority Legend
- **P0** - Critical / Security risk
- **P1** - High - Causes bugs or data issues in production
- **P2** - Medium - Bad patterns that will bite you as the app grows
- **P3** - Low - Code quality / cleanup

---

## P0 - Critical

### 1. Redux-Persist is persisting the ENTIRE store to localStorage

**Files:** `src/store_new.jsx`, `src/index.js`, `src/localStorage.jsx`, `src/persistConfig.js`

**Problem:** You're right - this is wrong. Right now:
- `store_new.jsx` has `persistConfig` with NO whitelist/blacklist (lines 93-98, both are commented out), so **every single reducer** gets serialized to localStorage on every state change.
- On top of that, `index.js:15-17` adds a SECOND manual persistence layer via `store.subscribe(() => saveState(store.getState()))` that dumps the entire store into a separate `state` key.
- So you have **two copies** of the entire Redux state in localStorage (`persist:root` + `state`).
- A separate `persistConfig.js` file exists with `whitelist: ['memberLogin']` but it's **never imported** - `store_new.jsx` defines its own inline config instead.

**Why this is bad:**
- localStorage has a ~5MB limit per origin. With orders, invoices, tasks, comments, etc. all being persisted, you'll hit that limit and the app will crash silently.
- Stale data: When you refresh the page, you see **old** data from localStorage first, then it gets overwritten by the API response - causing flicker and potential race conditions.
- Performance: `JSON.stringify` on the entire store fires on EVERY dispatch. With 50+ reducers, that's expensive.
- Data that should be fetched fresh (orders, invoices, tickets) is instead loaded from a potentially hours-old cache.

**Fix:**
- Only persist what actually needs to survive a page refresh: auth state (`logMember`) and maybe UI preferences (`showSidebar`).
- Use the existing `persistConfig.js` whitelist approach, but import it into `store_new.jsx`.
- Delete `localStorage.jsx` entirely - it's the redundant manual layer.
- Remove the `store.subscribe(saveState)` call from `index.js`.
- Remove `crossBrowserListener` / `rp-listener.jsx` - redundant with redux-persist's built-in sync.

```js
// store_new.jsx - fixed
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['logMember'], // ONLY persist login state
}
```

---

### 2. JWT token stored in localStorage (XSS vulnerability)

**Files:** `src/actions/loginAction.jsx:63-64`, 40+ component files

**Problem:** `localStorage.setItem("jwt", data.token)` stores the auth token where any XSS attack can read it. Every component then reads it with `localStorage.getItem('jwt')`.

**Fix (requires backend change too):** Move JWT to an HttpOnly cookie set by the backend. The browser will automatically send it with requests. For now, at minimum:
- Create a centralized `getToken()` utility instead of 40+ raw `localStorage.getItem('jwt')` calls scattered across components.
- This makes it easier to migrate later.

---

### 3. No route protection - ProtectedRoute is entirely commented out

**File:** `src/Login/ProtectedRoute.jsx`

**Problem:** The entire ProtectedRoute component is commented out (all 37 lines). Any user can navigate directly to `/orders`, `/invoices`, `/clients`, etc. by typing the URL. The only "protection" is `showSidebar` which hides the navigation UI but doesn't block route access.

**Fix:** Implement a working ProtectedRoute that checks `isAuthenticated` from Redux state and redirects to `/login` if false.

---

### 4. Session checker has inverted logic - sets auth to TRUE on logout

**File:** `src/sessionChecker.jsx:28-29`

**Problem:**
```js
dispatch(setSidebarVisibility(true));   // Should be false
dispatch(setAuthentication(true));       // Should be false
```
When the session expires, this sets `isAuthenticated` to `true` instead of `false`, then does `window.location.href = '/'` - so the user appears logged in with an expired token.

**Fix:** Change both to `false`.

---

## P1 - High

### 5. Session checker interval is 30 seconds, not 10 minutes

**File:** `src/sessionChecker.jsx:49`

**Problem:** `setInterval(checkSession, 3 * 10000)` = 30,000ms = 30 seconds, not 10 minutes. This fires an API call to `/test/v1/checkSession` every 30 seconds. Comment says "10 mins" but math is wrong.

**Fix:** `setInterval(checkSession, 10 * 60 * 1000)` for actual 10 minutes.

---

### 6. Session checker doesn't send auth token

**File:** `src/sessionChecker.jsx:19`

**Problem:** `axios.get(url)` is called without the auth config headers. The backend can't identify which session to check.

**Fix:** Add `getConfig()` to the request.

---

### 7. Session extension only adds 1 minute

**File:** `src/actions/sessionManager.jsx:105`

**Problem:** `const newExpiry = Date.now() + 60 * 1000` - when the user clicks "Stay logged in", they only get 60 more seconds. Then the warning fires again. This creates an infinite confirm-dialog loop.

**Fix:** Extend by a meaningful duration (e.g., 30 minutes) and call the backend to actually refresh the session.

---

### 8. `window.confirm()` blocks the UI thread

**File:** `src/actions/sessionManager.jsx:102`

**Problem:** `window.confirm()` is a blocking call. While it's open, no timers, API calls, or React updates can run. If the user doesn't respond, the logout timer callback that was set before the confirm won't fire.

**Fix:** Replace with a React modal component.

---

### 9. Hardcoded localhost API URL

**File:** `src/http.js:2`

**Problem:** `const baseURL = "http://127.0.0.1:4001"` is hardcoded. The production URL is commented out. This means the build won't work in production.

**Fix:** Use environment variables:
```js
const baseURL = process.env.REACT_APP_API_URL || "http://127.0.0.1:4001";
```

---

### 10. Login dispatches 7+ parallel API calls with no error handling

**File:** `src/actions/loginAction.jsx:75-101`

**Problem:** On login, up to 7 actions are dispatched simultaneously (`getOrders`, `getQuote`, `getTickets`, `getTeams`, `getClient`, `getInvoice`, `getService`). None are awaited. If any fail, the user sees a partially loaded app with no indication of what's missing.

**Fix:**
- Use `Promise.allSettled()` to batch them and handle partial failures.
- Or better: don't pre-fetch everything on login. Let each page fetch its own data on mount.

---

### 11. `handleLogout` in App.jsx has a race condition

**File:** `src/App.jsx:314-317`

**Problem:**
```js
dispatch(logoutMember({ isAuthenticated: false })).then(
  window.location.href = '/login'  // This executes IMMEDIATELY, not in .then()
);
```
`window.location.href = '/login'` is evaluated immediately as the argument to `.then()`, not as a callback. The redirect happens before logout completes.

**Fix:**
```js
dispatch(logoutMember()).then(() => {
  window.location.href = '/login';
});
```

---

## P2 - Medium

### 12. Three different data-fetching patterns coexist

**Files:** `src/actions/*.jsx`, `src/slices/orderApi.js`, 40+ component files

**Problem:**
1. **Redux Thunk + Axios** (13 action files) - the main pattern
2. **RTK Query + fetch** (`slices/orderApi.js`) - only 1 file uses this
3. **Raw fetch()** in components - 40+ components call `fetch()` directly, bypassing Redux entirely

This means the same data can be out of sync across different parts of the app.

**Fix:** Pick one pattern and migrate. RTK Query is the modern choice since you already have `@reduxjs/toolkit`. Migrate the Thunk actions to RTK Query slices and remove direct `fetch()` calls from components.

---

### 13. Mixing MUI v4 (`@material-ui`) and MUI v5 (`@mui`)

**File:** `package.json:9-16`

**Problem:** Both `@material-ui/core` (v4) and `@mui/material` (v5) are installed. They bundle different versions of the same components, roughly doubling your bundle size for UI components. `App.jsx` imports from both.

**Fix:** Migrate everything to `@mui/material` v5 and remove `@material-ui/core` and `@material-ui/icons`.

---

### 14. `logoutMember` action accepts a parameter it ignores

**File:** `src/actions/loginAction.jsx:133`

**Problem:** `logoutMember` is called as `logoutMember({ isAuthenticated: false })` in many places, but the function signature is `() => async (dispatch)` - the parameter is silently ignored. The function already dispatches `SET_AUTHENTICATION: false` internally.

**Fix:** Remove the parameter from all call sites, or actually use it.

---

### 15. Dead/commented-out code everywhere

**Files:** `src/App.jsx` (first 214 lines), `src/Login/ProtectedRoute.jsx` (entire file), `src/actions/sessionManager.jsx` (first 42 lines)

**Problem:** Over 250 lines of commented-out code in core files. This makes the codebase hard to read and maintain.

**Fix:** Delete all commented-out code. It's in git history if you ever need it.

---

### 16. `package.json` proxy conflicts with baseURL

**File:** `package.json:81`

**Problem:** `"proxy": "http://app.agencykinetics.com"` is set, but every API call uses the full `baseURL` (`http://127.0.0.1:4001`). The proxy only works for relative URLs, so this setting does nothing in dev but could cause confusion.

**Fix:** Either use relative URLs with the proxy, or remove the proxy setting.

---

### 17. `http.js` exports a React component for no reason

**File:** `src/http.js:4-6`

**Problem:**
```js
const Config = async () => {
  return <></>;
};
export default Config;
```
This is an async function returning JSX, exported as the default. It's never used. The file should just export `baseURL`.

**Fix:** Remove the Config component. Just `export const baseURL = ...`.

---

### 18. No error boundaries

**Problem:** There are no React Error Boundaries anywhere. If a component throws during render, the entire app white-screens.

**Fix:** Add an Error Boundary wrapper at least around the main content area in `App.jsx`.

---

### 19. `react-router-dom` v5 is outdated

**File:** `package.json:45`

**Problem:** Using `react-router-dom@^5.2.0`. This version uses `<Switch>`, `<Route component={}>`, `useHistory()` etc. which are all deprecated. v6 has been stable since 2021.

**Fix:** Migrate to react-router-dom v6 (`<Routes>`, `<Route element={}>`, `useNavigate()`). This is a significant migration but worth doing.

---

### 20. `useEffect` missing dependencies in App.jsx

**File:** `src/App.jsx:322-335`

**Problem:** `useEffect(() => { ... }, [])` fetches subscription details but depends on `combined?.user?._id` which isn't in the dependency array. If the user changes (e.g., re-login), the subscription data won't update.

**Fix:** Add `combined?.user?._id` to the dependency array.

---

## P3 - Low

### 21. `redux-logger` is included in production bundle

**File:** `src/store_new.jsx:14`, `package.json:50`

**Problem:** `redux-logger` is a `dependency` (not `devDependency`) and is imported unconditionally. It logs every action to the console in production, leaking state data and hurting performance.

**Fix:** Move to `devDependencies` and only add it to middleware in development:
```js
middleware: (getDefaultMiddleware) => {
  const middleware = getDefaultMiddleware({ serializableCheck: false });
  if (process.env.NODE_ENV === 'development') {
    const { logger } = require('redux-logger');
    middleware.push(logger);
  }
  return middleware;
}
```

---

### 22. Disabled serializableCheck and immutableCheck

**File:** `src/store_new.jsx:105-107`

**Problem:** Both RTK safety checks are disabled. These exist to catch bugs like putting non-serializable values (Promises, class instances, DOM nodes) in Redux state. Disabling them hides real bugs.

**Fix:** Re-enable them. If specific actions fail the check (like redux-persist's internal actions), use the `ignoredActions` option instead of disabling globally.

---

### 23. `IdleTimer` adds listeners on every mouse move

**File:** `src/idleTimer.jsx:10-14`

**Problem:** `resetTimer` calls `clearTimeout` and `setTimeout` on every single `mousemove` event. At 60fps mouse movement, that's 60 timeout resets per second.

**Fix:** Throttle the `resetTimer` function (e.g., once per second).

---

### 24. Multiple date libraries installed

**File:** `package.json:6,28-29`

**Problem:** Three date libraries: `@date-io/dayjs`, `dayjs`, and `date-fns`. Pick one.

**Fix:** Standardize on `dayjs` (since MUI date pickers use it) and remove `date-fns`.

---

### 25. Duplicate imports in App.jsx

**File:** `src/App.jsx:254,263`

**Problem:** `VerifyingPage` is imported twice (line 263 is a duplicate of the commented import structure).

**Fix:** Remove the duplicate import.

---

### 26. `redux-devtools-extension` package is unnecessary

**File:** `package.json:49`

**Problem:** `redux-devtools-extension` is installed but `@reduxjs/toolkit`'s `configureStore` already includes DevTools support automatically. The import in `index.js:10` is unused.

**Fix:** Remove the package and the unused import.

---

---

## How to Remove redux-persist Entirely (Fix #1 in detail)

### How normal login/auth works (without redux-persist)

```
LOGIN:
  User submits email + password
    → Backend returns { token, expiresAt, user }
    → Store ONLY the JWT token in localStorage: localStorage.setItem('jwt', token)
    → Populate Redux state from the API response (LOGIN_MEMBER_SUCCESS)
    → Redux state now has user data, isAuthenticated=true, etc.

PAGE REFRESH:
  App mounts
    → Check if localStorage has a JWT token
    → If YES: call a backend endpoint (e.g. /me or /getAll) with that token
      → If API succeeds: dispatch LOAD_MEMBER_SUCCESS → Redux is populated again
      → If API fails (401): token is expired/invalid → redirect to /login
    → If NO token: user is not logged in → redirect to /login

LOGOUT:
  → Call backend /logout
  → localStorage.removeItem('jwt')
  → dispatch LOGOUT_MEMBER_SUCCESS → Redux is cleared
  → Redirect to /login
```

The key insight: **only the JWT token survives a page refresh via localStorage**. All actual data (user info, orders, invoices, etc.) is fetched fresh from the API every time. Redux is just in-memory cache for the current session.

### Files to change

#### 1. `src/store_new.jsx`
- Remove imports: `persistReducer`, `persistStore`, `storage` from redux-persist
- Remove `persistConfig` object
- Remove `persistedReducer` — use `rootReducer` directly in `configureStore`
- Remove `persistor` variable
- Export only `store` (not `persistor` or `persistConfig`)

#### 2. `src/index.js`
- Remove `PersistGate` import and wrapper
- Remove `import { loadState, saveState } from './localStorage'`
- Remove `import crossBrowserListener from './rp-listener'`
- Remove `store.subscribe(() => saveState(...))` — this is the double-persistence layer
- Remove `window.addEventListener('storage', crossBrowserListener(...))`
- Import and dispatch a new `loadMember()` action on startup (see #4 below)

#### 3. `src/actions/loginAction.jsx`
- Remove `import { getStoredState } from "redux-persist"`
- Remove `import { persistor } from "../store_new"` (just import `store`)
- Remove all `persistor.purge()` and `persistor.persist()` calls
- Remove `import { saveState } from "../localStorage"`
- In `loginMember`: keep `localStorage.setItem("jwt", data.token)` and `localStorage.setItem("expiresAt", data.expiresAt)` — this is correct, only the token should be stored
- Remove `persistor.purge()` from login (line 52) — not needed without redux-persist
- Remove `saveState(currentState)` call (line 103-104)
- In `logoutMember`: replace `persistor.purge()` + `localStorage.removeItem("persist:root")` + `localStorage.removeItem("state")` + `localStorage.clear()` with just:
  ```js
  localStorage.removeItem("jwt");
  localStorage.removeItem("expiresAt");
  ```
- Remove `persistStateBeforeLogout` action entirely — it only called `persistor.persist()`
- **Add new `loadMember` action** for page refresh:
  ```js
  export const loadMember = () => async (dispatch) => {
    try {
      const token = localStorage.getItem("jwt");
      const expiresAt = localStorage.getItem("expiresAt");

      if (!token || (expiresAt && Date.now() > Number(expiresAt))) {
        localStorage.removeItem("jwt");
        localStorage.removeItem("expiresAt");
        return;
      }

      dispatch({ type: LOAD_MEMBER_REQUEST });

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      // Use an existing backend endpoint to get user data
      const { data } = await axios.get(`${baseURL}/test/v1/getAll`, config);

      dispatch({
        type: LOAD_MEMBER_SUCCESS,
        payload: data,
      });
    } catch (error) {
      localStorage.removeItem("jwt");
      localStorage.removeItem("expiresAt");
      dispatch({ type: LOAD_MEMBER_FAIL, payload: error.response?.data?.message });
    }
  };
  ```

#### 4. `src/actions/sessionManager.jsx`
- Remove `import { persistor } from '../store_new'`
- Remove `localStorage.removeItem('persist:root')`
- Remove `persistor.purge()`
- In `handleSessionExpiration`, just do:
  ```js
  localStorage.removeItem('jwt');
  localStorage.removeItem('expiresAt');
  ```

#### 5. `src/components/layout/DrawerAppBar/Appbar1.jsx`
- Remove `import { persistor } from "../../../store_new"`
- Remove `localStorage.removeItem('persist:root')`
- Remove `persistor.purge()`
- Fix bug: change `SET_AUTHENTICATION, payload: true` to `payload: false` (line 157)

#### 6. `src/components/User/UserProfile.jsx`
- Remove `localStorage.removeItem('persist:root')`
- Fix bug: change `SET_AUTHENTICATION, payload: true` to `payload: false` (line 121)

#### 7. Delete these files (no longer needed)
- `src/localStorage.jsx` — manual saveState/loadState, replaced by loadMember action
- `src/persistConfig.js` — unused even now (store_new.jsx has its own config)
- `src/rp-listener.jsx` — cross-tab rehydration for redux-persist

#### 8. Uninstall the package
```bash
npm uninstall redux-persist
```

#### 9. Also remove unused packages from this cleanup
```bash
npm uninstall redux-devtools-extension redux-state-sync
```

### Backend note

The `loadMember` action above uses `/test/v1/getAll` which already exists and is protected by `isAuthenticatedUser`. If the response shape from `/getAll` doesn't match what `LOGIN_MEMBER_SUCCESS` expects, you may need to either:
- Adjust the reducer to handle both shapes, OR
- Add a simple `/me` endpoint to the backend that returns just the current user's data in the same shape as the login response

---

## Summary - Recommended Fix Order

1. **Remove redux-persist entirely** (P0 #1) - follow the plan above
2. **Fix sessionChecker inverted logic** (P0 #4) - active bug
3. **Implement ProtectedRoute** (P0 #3) - security gap
4. **Fix handleLogout race condition** (P1 #11) - active bug
5. **Fix session checker interval** (P1 #5) - unnecessary API spam
6. **Use environment variables for baseURL** (P1 #9) - blocks deployment
7. **Delete commented-out code** (P2 #15) - readability
8. **Everything else** - incremental improvements
