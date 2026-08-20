# Web tab navigation stability

Runbook for diagnosing and fixing tab freezes / unresponsive UI on the Expo web app.

**Fixed in:** PR #6 (`cursor/fix-tab-navigation-freeze-80de`), Aug 2026.

---

## Symptoms

- Bottom tabs (Home, Stories, Italian, Profile) stop responding after initial load
- UI feels stuck; rapid tab clicks do nothing
- Browser reload can hang or take abnormally long
- Not a broken tab button — the JS main thread is blocked or focus handlers are looping

---

## Root causes (two compounding issues)

### 1. Initial load thundering herd

`(tabs)/_layout.tsx` had `lazy: false`, which mounted **all four tabs at once**. Each tab immediately ran mount/focus effects:

- `getAccount()` (root layout + Home + Profile)
- `hydrateLearnerIfNeeded()` (cloud sync, possible duplicate without dedup)
- `useReadingProgress` / `useYourItalian` / `useVocabulary` refreshes
- `ensureLearnerMigrations()` on first vocabulary access

On web, AsyncStorage uses **synchronous `localStorage`**. Heavy concurrent reads/writes block the main thread during first paint.

### 2. Focus refresh loop on every tab switch (primary remaining bug)

Tab screens use `useFocusEffect(() => { void refresh(); }, [refresh])`.

Data hooks defined `refresh` with **state in `useCallback` deps** (`progress`, `target`, `chapterStatuses`, etc.). AsyncStorage returns **new object references** on every read, so:

```
Tab click → focus → refresh() → setState
→ refresh callback identity changes
→ useFocusEffect cleanup + re-run
→ refresh() again → …
```

This loop stacked heavy work on every switch:

- Duplicate mount + focus refreshes
- Vocabulary: full chapter status scan + `buildAdaptiveProfile()` + parse up to 8000 reading events
- Stories: `loadBeforeRome` + `loadA2Plus` (6 story bundle/progress loads) at `setTimeout(0)` before navigation finished
- `buildProfile()` persisting adaptive state to localStorage on UI-only refreshes

---

## Execution chain when stuck

```
Page load or tab click
→ useFocusEffect runs refresh()
→ AsyncStorage/localStorage I/O + JSON.parse/stringify (sync on web)
→ setState with new progress object
→ refresh useCallback recreated (unstable deps)
→ useFocusEffect re-runs (loop)
→ Main thread blocked → tab presses dropped
→ Reload waits on pending localStorage writes
```

---

## Fixes applied

| Change | File(s) | Why |
|--------|---------|-----|
| `lazy: true` | `app/(tabs)/_layout.tsx` | Mount only the active tab |
| `freezeOnBlur: false` | `app/(tabs)/_layout.tsx` | Avoid extra blur/focus churn |
| Coalesce `getAccount()` | `src/account/storage.ts` | One in-flight account load |
| Coalesce `hydrateLearnerIfNeeded()` | `src/sync/learnerSession.ts` | Prevent duplicate cloud hydration |
| `buildProfile(..., { persist: false })` for UI | `AdaptiveVocabularyService.ts`, vocab hooks | No localStorage write on display refresh |
| Stable `refresh` callbacks (refs, not state in deps) | `useReadingProgress.ts`, `useContinueReading.ts`, `useVocabulary.ts`, `useYourItalian.ts` | **Stops focus loop** |
| `autoRefresh: false` by default | Same hooks | Tabs refresh on focus only, not mount+focus |
| `usePeekProgress()` on Vocabulary tab | `usePeekProgress.ts`, `vocabulary.tsx` | Lightweight progress read; no chapter scan |
| `deferAfterNavigation()` for Stories secondary loads | `deferAfterNavigation.ts`, `stories.tsx` | Heavy work after tab transition |
| Coalesce `getContinueReadingTarget()` | `continueReading.ts` | Avoid concurrent story scans |
| In-memory cache for reading events | `ReadingEventStore.ts` | Parse event log once |
| Stale-while-revalidate loading | Data hooks | `setLoading(true)` only when no cached data |
| `homeGateComplete` module guard | `home.tsx` | Skip account/onboarding gate on Home remount |
| Dev `[Navigation]` diagnostics | `src/navigation/diagnostics.ts` | Trace click → focus → async lifecycle |

---

## Diagnostics (development)

With `__DEV__` enabled, the console logs:

```
[Navigation] click: …
[Navigation] activeTab changing: home → stories
[Navigation] stories focus
[Navigation] reading-progress refresh (luca-a-roma) started
[Navigation] reading-progress refresh (luca-a-roma) completed { ms: N }
```

**Healthy:** one focus + one refresh per tab switch.

**Broken (loop):** same tab logs focus/refresh **multiple times in a row** without another click.

---

## If it regresses — checklist

1. **Check for unstable `refresh` in `useFocusEffect` deps**
   - `refresh` must not depend on state that it updates (`progress`, `target`, etc.)
   - Use refs for “has cached data?” checks; keep `[run, storyId]` / `[progressKey, run]` deps only

2. **Check for duplicate refresh paths**
   - Avoid both `useEffect([refresh])` auto-load **and** `useFocusEffect` refresh on the same hook in tab screens
   - Tab screens: focus-only. Stack screens (e.g. Practice): `autoRefresh: true` if needed

3. **Check tab layout**
   - Do not set `lazy: false` unless there is a strong reason
   - Avoid mounting heavy hooks in all tabs simultaneously

4. **Check AsyncStorage writes on read paths**
   - UI refreshes must not call `buildProfile()` with default persist
   - Progress reads should not trigger unnecessary saves

5. **Check Stories deferred loads**
   - Secondary story rows must use `deferAfterNavigation()`, not `setTimeout(0)` on focus

6. **Check Vocabulary tab**
   - Use `usePeekProgress()`, not full `useReadingProgress()`, unless chapter list is required

7. **Hard-refresh browser** after deploy (`Ctrl+Shift+R`) to rule out stale bundles

---

## Anti-patterns (do not reintroduce)

```tsx
// BAD: state in refresh deps + useFocusEffect → focus loop
const refresh = useCallback(async () => {
  const data = await loadProgress();
  setProgress(data);
}, [progress]); // ← progress changes every read

useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

// BAD: mount + focus double refresh on tabs
useEffect(() => { void refresh(); }, [refresh]);        // in hook, always on
useFocusEffect(useCallback(() => { void refresh(); }, [refresh])); // in screen

// BAD: all tabs mount at once
<Tabs screenOptions={{ lazy: false }}>

// BAD: heavy secondary work before navigation completes
useFocusEffect(() => {
  void loadAllStories(); // 6+ bundle loads immediately
});
```

---

## Key files

- `mobile/app/(tabs)/_layout.tsx` — tab navigator options
- `mobile/app/(tabs)/home.tsx`, `stories.tsx`, `vocabulary.tsx`, `profile.tsx` — focus handlers
- `mobile/src/navigation/diagnostics.ts` — dev logging
- `mobile/src/navigation/deferAfterNavigation.ts` — defer heavy work
- `mobile/src/navigation/useRefreshGuard.ts` — discard stale async results
- `mobile/src/navigation/progressKey.ts` — stable progress dependency key
- `mobile/src/progress/useReadingProgress.ts`, `useContinueReading.ts`, `usePeekProgress.ts`
- `mobile/src/vocabulary/useVocabulary.ts`, `useYourItalian.ts`
- `mobile/src/account/storage.ts`, `mobile/src/sync/learnerSession.ts`
- `mobile/src/adaptive/AdaptiveVocabularyService.ts`
- `mobile/src/telemetry/ReadingEventStore.ts`
