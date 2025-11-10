# GitHub Copilot Instructions - Winder Mobile App

## Code Quality Standards

### 1. No Redundancy (DRY Principle)
- Extract common code into reusable components, functions, or services
- Systematically search for duplicated code blocks before implementing
- Never copy-paste similar code - refactor into shared utilities
- Use composition over duplication
- Use composition over inheritance

### 2. Clean Code Principles
- Use descriptive, meaningful names for variables, functions, and components
- No magic numbers or strings - use named constants
- Functions should be self-documenting
- Keep functions small and focused

### 3. TypeScript Best Practices
- Strict typing always - avoid `any` except when absolutely necessary
- Define interfaces for complex data structures
- Use type inference where appropriate
- Prefer interfaces over types for object shapes
- Use union types and discriminated unions effectively

### 4. Performance
- Avoid unnecessary re-renders in React Native components
- Use memoization (useMemo, useCallback) appropriately
- Optimize data structures for the access patterns used
- Consider lazy loading for large components
- Be mindful of FlatList performance with large datasets

### 5. Consistency
- Follow existing code patterns in the project
- Use the same solution for the same type of problem
- Maintain consistent naming conventions across the codebase
- Follow the established project structure

### 6. Design Patterns (GoF)
- Apply Gang of Four patterns where appropriate:
  - Factory Pattern for object creation
  - Strategy Pattern for algorithms
  - Observer Pattern for event handling
  - Repository Pattern for data access (see below)
  - Builder Pattern for complex object construction
- Choose patterns that simplify, not complicate

### 7. Repository Pattern
- Abstract all data access through repository services
- Separate business logic from data access logic
- Provide uniform interface for data operations
- Example: `wineService`, `userPreferenceService`, `filterOptionsService`
- Keep repositories in `/src/services/`

### 8. File Size Limits
- **Maximum 300 lines of code per file**
- If a file exceeds 300 lines, split it into smaller, logical modules
- Separate concerns into different files
- Use barrel exports (index.ts) to maintain clean imports
- Maintain interfaces and types in separate files from the rest of the code

### 9. Robust Code
- Comprehensive error handling with try-catch blocks
- Validate all inputs and user data
- Use defensive programming techniques
- Implement graceful degradation when features fail
- Log errors with context for debugging using console.error with descriptive prefixes

### 10. Resilient Code
- Handle failures from external dependencies gracefully
- Implement retry mechanisms for transient failures
- **CRITICAL: Never use fallbacks that hide root errors**
- Errors must remain visible and loggable
- All promises must have error handlers - no unhandled rejections
- Use circuit breaker pattern for external services when appropriate

### 11. Code Quality (Zero Tolerance)
- **No ESLint errors allowed**
- Fix all TypeScript compiler warnings
- Maintain consistent code formatting (Prettier)
- Run linter before committing
- All code must pass CI/CD checks
- No unused imports accepted

### 12. SOLID Principles
#### Single Responsibility Principle
- One class/function = one responsibility
- If a function does multiple things, split it

#### Open/Closed Principle
- Open for extension, closed for modification
- Use composition and dependency injection

#### Liskov Substitution Principle
- Derived types must be substitutable for base types
- Inheritance must maintain contracts

#### Interface Segregation Principle
- Many small, focused interfaces over large ones
- Clients shouldn't depend on methods they don't use

#### Dependency Inversion Principle
- Depend on abstractions, not concrete implementations
- High-level modules shouldn't depend on low-level modules

#### Separation of Concerns
- Clear separation between UI, business logic, and data access
- React Native components: only UI and user interaction
- Services: business logic and data access
- Hooks: shared stateful logic

### 13. KISS Principle (Keep It Simple, Stupid)
- Always choose the simplest solution that works
- Avoid unnecessary complexity and over-engineering
- Readable code is better than "clever" code
- If you can make it simpler, do it
- Complexity should only exist when it solves a real problem

### 14. YAGNI Principle (You Aren't Gonna Need It)
- Only write code that is needed right now
- No features for "maybe later" or "just in case"
- No speculative functionality
- When in doubt, leave it out
- Add features when they're actually required, not before

## Project-Specific Guidelines

### React Native Component Structure
```typescript
// 1. Imports (grouped: React, React Native, UI libraries, services, types, components)
// 2. Interfaces/Types
// 3. Component function
// 4. Hooks (useState, useEffect, custom hooks)
// 5. Event handlers (useCallback)
// 6. Render helpers
// 7. Return JSX
// 8. Styles (StyleSheet.create)
```

### Service Layer Pattern
```typescript
// All services should follow this pattern:
export const myService = {
  async getEntity(id: string): Promise<Entity> { },
  async createEntity(data: EntityInput): Promise<Entity> { },
  async updateEntity(id: string, data: Partial<EntityInput>): Promise<Entity> { },
  async deleteEntity(id: string): Promise<void> { }
};
```

### Error Handling Pattern
```typescript
// Always log errors with context
try {
  // operation
} catch (error) {
  console.error('[SERVICE_NAME] Context description:', error);
  // Show user-friendly message with Alert
  Alert.alert('Error', 'User-friendly message');
  // Re-throw if caller needs to handle it
  throw error;
}
```

### Supabase Query Pattern
```typescript
// Always check for errors
const { data, error } = await supabase
  .from('table')
  .select('*');

if (error) {
  console.error('[QUERY] Failed to fetch:', error);
  throw new Error(`Failed to fetch: ${error.message}`);
}

if (!data) {
  return []; // or appropriate default
}
```

### Component Composition
- Extract reusable UI components into `/src/components/`
- Use compound components pattern for complex components
- Prefer composition over props drilling
- Example: `WineCard`, `FilterMenu`, `SwipeContainer`

### State Management
- Local state for component-specific data (useState)
- Custom hooks for shared stateful logic (`useSupabaseAuth`, `useSwipeGestures`)
- Context for global app state (use sparingly)
- Supabase real-time subscriptions for server state

### React Native Specific Rules
- **Never nest VirtualizedLists/FlatLists inside ScrollView** - Use View with .map() instead
- Use StyleSheet.create() for styles, not inline objects
- Prefer functional components over class components
- Use SafeAreaView for iOS safe area handling
- Test on both iOS and Android when possible
- Use Platform-specific code sparingly (Platform.OS === 'ios')

### File Organization
```
src/
├── components/        # Reusable UI components
│   ├── filters/      # Filter-specific components
│   └── [feature]/    # Feature-specific components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions & configuration
├── services/         # Business logic & data access
├── types/            # TypeScript type definitions
└── utils/            # Helper functions
```

## When Generating Code

1. **Always check existing patterns** - Look at similar components/services first
2. **Extract common logic** - If you write similar code twice, extract it
3. **Keep files small** - Split files that approach 300 lines
4. **Type everything** - No implicit any types
5. **Handle all errors** - Every async operation needs error handling
6. **Test your suggestions** - Ensure code compiles and follows ESLint rules
7. **Document complex logic** - Add comments for non-obvious code
8. **Consider performance** - Avoid unnecessary renders and operations
9. **Follow KISS and YAGNI** - Don't over-engineer or add unused features
10. **Never hide errors** - Fallbacks should log the original error

## Critical Rules (Non-Negotiable)

❌ **Never do this:**
- Files > 300 lines
- Unhandled promise rejections
- ESLint errors
- Code duplication
- Fallbacks that hide root errors
- Features that aren't currently needed (YAGNI)
- Complex solutions when simple ones work (KISS)
- Nested VirtualizedList/FlatList inside ScrollView

✅ **Always do this:**
- Extract shared code
- Handle all errors explicitly
- Log errors with context using [SERVICE_NAME] prefix
- Use TypeScript strictly
- Follow existing patterns
- Keep it simple
- Build only what's needed now
- Use StyleSheet.create() for all styles
- Test on iOS simulator before committing

## Winder App Specific Patterns

### Authentication Flow
- Use `useSupabaseAuth` hook for all auth operations
- Store credentials in Keychain for biometric auth
- Support guest mode (swipe without login)
- Show `AuthScreen` when user taps login

### Wine Data
- All wine queries go through `wineService` or `wineQueries`
- Use `wines_with_core_details` view for optimized queries
- Load grapes separately via `wine_grapes` junction table
- Images use Supabase storage with fallback to web app placeholder

### Filters
- Filter state managed in `WineFilter` type
- Convert to `DatabaseWineFilter` for queries
- Each filter has its own component in `/src/components/filters/`
- Filter count badge shows number of active filters

### User Preferences
- Save liked wines via `userPreferenceService`
- Only save when user is authenticated
- Guest mode allows swiping but doesn't persist

### Error Logging Convention
```typescript
console.error('[WINE_SERVICE] Failed to fetch wines:', error);
console.error('[AUTH] Login failed:', error);
console.error('[FILTER] Producer search error:', error);
```
