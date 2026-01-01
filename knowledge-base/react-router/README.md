# React Router DOM Knowledge Base

## Overview

React Router DOM is the standard routing library for React web applications. It enables client-side routing, allowing navigation between different views without full page reloads.

**Official Documentation**: https://reactrouter.com/

**Version Used**: 6.x

**Philosophy**: Declarative routing with component-based route definitions and nested routes support.

---

## When We Use It

In the Zach.ai codebase, React Router DOM is used for:

1. **Dashboard Navigation**: Client-side routing to `/codebase-analysis` route
2. **Single Page Application (SPA)**: Navigation without page reloads
3. **Route-Based Code Splitting**: Potential for lazy loading routes (not yet implemented)

### Current Routes

```
/ - Home landing page
/codebase-analysis - Codebase Analysis Dashboard
```

---

## Quick Reference

### Basic Setup

#### 1. Install

```bash
npm install react-router-dom
npm install --save-dev @types/react-router-dom
```

#### 2. Configure Routes (App.tsx)

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './features/home/Home';
import { CodebaseAnalysisDashboard } from './features/codebase-analysis/CodebaseAnalysisDashboard';

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/codebase-analysis" element={<CodebaseAnalysisDashboard />} />
      </Routes>
    </Router>
  );
};
```

#### 3. Navigation Links

```typescript
import { Link } from 'react-router-dom';

<Link to="/codebase-analysis">Go to Dashboard</Link>
```

---

## Core Concepts

### BrowserRouter

Wraps your app and provides routing context. Uses HTML5 history API.

```typescript
import { BrowserRouter as Router } from 'react-router-dom';

<Router>
  <App />
</Router>
```

**Alternative**: `HashRouter` for static file serving (uses `#` in URLs)

### Routes and Route

Define your application's routes.

```typescript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/users/:id" element={<UserProfile />} />
  <Route path="*" element={<NotFound />} />  {/* Catch-all */}
</Routes>
```

### Link and NavLink

Navigate without page reloads.

```typescript
// Link - Basic navigation
<Link to="/dashboard">Dashboard</Link>

// NavLink - Active state styling
<NavLink
  to="/dashboard"
  className={({ isActive }) => isActive ? 'active' : ''}
>
  Dashboard
</NavLink>
```

### useNavigate Hook

Programmatic navigation.

```typescript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dashboard');
  };

  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

### useParams Hook

Access URL parameters.

```typescript
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { id } = useParams<{ id: string }>();
  return <div>User ID: {id}</div>;
}

// URL: /users/123 → id = "123"
```

### useLocation Hook

Access current location object.

```typescript
import { useLocation } from 'react-router-dom';

function CurrentRoute() {
  const location = useLocation();

  return (
    <div>
      <p>Path: {location.pathname}</p>
      <p>Search: {location.search}</p>
      <p>Hash: {location.hash}</p>
    </div>
  );
}
```

---

## Best Practices

### 1. Route Organization

```typescript
// Good: Centralized route definitions
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/codebase-analysis',
  SETTINGS: '/settings',
} as const;

<Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
```

### 2. Nested Routes

```typescript
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<DashboardHome />} />
  <Route path="coverage" element={<Coverage />} />
  <Route path="health" element={<Health />} />
</Route>
```

### 3. Protected Routes

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

### 4. Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));

<Route
  path="/dashboard"
  element={
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  }
/>
```

---

## Common Patterns

### Tab-Based Navigation (Our Use Case)

**Current Implementation**: State-based tabs within a route

```typescript
// CodebaseAnalysisDashboard.tsx
const [activeTab, setActiveTab] = useState<'coverage' | 'health'>('coverage');

{activeTab === 'coverage' && <CoverageTab />}
{activeTab === 'health' && <HealthTab />}
```

**Alternative**: URL-based tabs (shareable links)

```typescript
// Could refactor to:
<Routes>
  <Route path="/codebase-analysis" element={<Dashboard />}>
    <Route path="coverage" element={<CoverageTab />} />
    <Route path="health" element={<HealthTab />} />
  </Route>
</Routes>

// URLs: /codebase-analysis/coverage, /codebase-analysis/health
```

**Tradeoff**: URL-based tabs allow sharing direct links but add routing complexity.

---

## TypeScript Integration

### Typed Params

```typescript
import { useParams } from 'react-router-dom';

type UserParams = {
  id: string;
};

function UserProfile() {
  const { id } = useParams<UserParams>();
  // id is typed as string | undefined

  return <div>User {id}</div>;
}
```

### Typed Navigate

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Type-safe navigation with routes object
navigate(ROUTES.DASHBOARD);
```

---

## Performance Considerations

### Code Splitting

React Router works seamlessly with React.lazy():

```typescript
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

<Route path="/dashboard" element={<Suspense><Dashboard /></Suspense>} />
```

**Benefit**: Only load route code when user navigates to it.

### Avoid Nested Re-renders

```typescript
// Bad: Creates new component on every render
<Route path="/users" element={<UsersLayout>{children}</UsersLayout>} />

// Good: Stable component reference
<Route path="/users" element={<UsersLayout />} />
```

---

## Common Issues and Solutions

### Issue 1: Routes Not Matching

**Problem**: Route doesn't render  
**Solution**: Check route order (specific routes before catch-alls)

```typescript
// Bad
<Route path="*" element={<NotFound />} />
<Route path="/dashboard" element={<Dashboard />} />  // Never matches

// Good
<Route path="/dashboard" element={<Dashboard />} />
<Route path="*" element={<NotFound />} />
```

### Issue 2: Page Refresh 404s

**Problem**: `/dashboard` works in dev but 404s on production refresh  
**Solution**: Configure server to serve `index.html` for all routes

```nginx
# nginx example
location / {
  try_files $uri /index.html;
}
```

### Issue 3: Active Link Styling

**Problem**: Need to style active navigation  
**Solution**: Use `NavLink` instead of `Link`

```typescript
<NavLink
  to="/dashboard"
  className={({ isActive }) => isActive ? styles.active : styles.link}
>
  Dashboard
</NavLink>
```

---

## Migration from v5 to v6

Key changes if upgrading from React Router v5:

1. `<Switch>` → `<Routes>`
2. `component={Dashboard}` → `element={<Dashboard />}`
3. `useHistory()` → `useNavigate()`
4. No more `exact` prop (v6 routes are exact by default)
5. Nested routes simplified with `<Outlet />`

---

## Resources

- Official Docs: https://reactrouter.com/
- Tutorial: https://reactrouter.com/en/main/start/tutorial
- GitHub: https://github.com/remix-run/react-router
- TypeScript Support: Built-in with `@types/react-router-dom`

---

## Summary

React Router DOM is the industry standard for React routing. Key takeaways:

1. ✅ **Declarative**: Routes are components
2. ✅ **Type-Safe**: Full TypeScript support
3. ✅ **Performant**: Works with code splitting
4. ✅ **Flexible**: Nested routes, protected routes, URL params
5. ✅ **Simple**: Hooks-based API is intuitive

For most React SPAs, React Router DOM is the default choice. Alternative libraries like TanStack Router exist but add complexity.

**Next Steps**:

1. Consider URL-based tabs for shareable links
2. Implement lazy loading for code splitting
3. Add protected routes if authentication is needed

---

**Last Updated**: January 1, 2026  
**Used In**: Zach.ai Codebase Analysis Dashboard
