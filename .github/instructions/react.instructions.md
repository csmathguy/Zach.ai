---
name: React guidelines
applyTo: '**/*.tsx'
---

## Component Structure

### Functional Components Only

```typescript
// ✅ Use functional components with TypeScript
import { FC, ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <button onClick={onClick} disabled={disabled} className={`btn-${variant}`}>
      {children}
    </button>
  );
};
```

## Hooks

### State Management

```typescript
// useState for simple state
const [count, setCount] = useState<number>(0);

// useReducer for complex state
type State = { count: number; step: number };
type Action = { type: 'increment' } | { type: 'setStep'; step: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'setStep':
      return { ...state, step: action.step };
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });
```

### Performance Optimization

```typescript
// useMemo for expensive computations
const sortedUsers = useMemo(() => users.sort((a, b) => a.name.localeCompare(b.name)), [users]);

// useCallback for event handlers
const handleClick = useCallback((id: string) => {
  console.log('Clicked:', id);
}, []);
```

### Effects

```typescript
// useEffect with cleanup
useEffect(() => {
  const controller = new AbortController();

  async function fetchData() {
    try {
      const response = await fetch('/api/data', {
        signal: controller.signal,
      });
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error(error);
      }
    }
  }

  fetchData();

  return () => controller.abort();
}, []);
```

## Component Composition

```typescript
// Small, focused components
export const Card: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="card">{children}</div>
);

export const CardHeader: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="card-header">{children}</div>
);

export const CardBody: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="card-body">{children}</div>
);

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

## Custom Hooks

```typescript
// Extract reusable logic
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const response = await fetch(url);
        const json = await response.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}
```

## Best Practices

- **One component per file** (exception: small related components)
- **Props interface above component** for clarity
- **Destructure props** in function signature
- **Default values** for optional props
- **Memoize expensive operations** with useMemo
- **Memoize callbacks** passed to child components with useCallback
- **Clean up effects** with return function
- **Handle loading and error states** in data fetching
- **Avoid prop drilling** - use composition or context
- **Keep components pure** - same props = same output

## Common Anti-Patterns to Avoid

- ❌ Class components (use functional)
- ❌ `any` types (use proper types)
- ❌ Mutating state directly (use setState)
- ❌ Missing dependency arrays in hooks
- ❌ Creating functions inside JSX (`onClick={() => handle()}`)
- ❌ Prop drilling deeply nested components

## Naming Conventions

- `PascalCase` - Components, interfaces, types
- `camelCase` - Hooks (must start with `use`), functions, variables
- `handleEventName` - Event handlers (e.g., `handleClick`)
- Files named after main export: `Button.tsx` exports `Button`

## Pre-Commit

- Component renders without errors
- Props properly typed with interfaces
- No unused props or variables
- Hooks have correct dependencies
- Loading and error states handled
- Tests written for component behavior

---

**For detailed patterns**: See [knowledge-base/react/README.md](../../knowledge-base/react/README.md) (when documented)  
**For design patterns**: See [knowledge-base/codebase/development-guide.md](../../knowledge-base/codebase/development-guide.md)
