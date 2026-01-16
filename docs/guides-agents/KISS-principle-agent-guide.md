# KISS Principle: Agent Decision Guide

**Core Rule**: Every line of code, abstraction, and architectural decision must earn its complexity. Default to the simplest solution that meets requirements.

---

## Decision Framework

### Before Adding Complexity, Ask:

1. **Is this solving a current problem or a hypothetical future one?** → If hypothetical, don't build it (YAGNI)
2. **Can this be achieved with fewer abstractions?** → If yes, use fewer
3. **Will another developer understand this immediately?** → If no, simplify
4. **Is this in the core domain or peripheral?** → Peripheral = simpler solution
5. **Has complexity been proven necessary by measurement?** → If not measured, don't optimize

### Complexity Is Justified For:

- Core domain functionality central to the application's purpose
- Proven performance bottlenecks (measured, not assumed)
- Multiple disparate consumers requiring flexible APIs
- Inherently complex problems (concurrency, distributed transactions)

### Complexity Is NOT Justified For:

- Features not yet requested (speculative generality)
- "What if we need this later" scenarios
- Making code "more extensible" without concrete requirements
- Demonstrating technical sophistication

---

## Code-Level Guidelines

### Metrics to Enforce

| Metric | Target | Action Threshold |
|--------|--------|------------------|
| Cyclomatic complexity | ≤10 per function | Refactor at 11+ |
| Function length | 5-20 lines ideal | Split at 50+ lines |
| Parameter count | ≤3 parameters | Group into object at 4+ |
| Nesting depth | ≤3 levels | Flatten with guard clauses |
| Class methods | ≤30 methods | Split responsibilities |

### DO ✓

```typescript
// Discriminated union for Result type - forces handling both cases
type Result<T, E = string> = 
  | { ok: true; data: T } 
  | { ok: false; error: E };

// Guard clauses with proper Result type
function processOrder(order: Order | null): Result<number> {
  if (!order) return { ok: false, error: "No order" };
  if (!order.items.length) return { ok: false, error: "Empty order" };
  if (!order.payment) return { ok: false, error: "No payment" };
  
  return { ok: true, data: calculateTotal(order) };
}

// Composition: small interfaces, combine only what's needed
interface CanSwim { swim(): void; }
interface CanFly { fly(): void; }

class Duck implements CanSwim, CanFly {
  swim() { console.log("Swimming"); }
  fly() { console.log("Flying"); }
}

class Penguin implements CanSwim {
  swim() { console.log("Swimming"); }
  // No fly - Penguin simply doesn't have it
}

// Options object for multiple parameters
interface CreateUserOptions {
  name: string;
  email: string;
  role?: string;
  sendWelcome?: boolean;
}

function createUser(options: CreateUserOptions): User {
  const { name, email, role = "user", sendWelcome = true } = options;
  // ...
}

// Factory function instead of class when no state needed
function createValidator(rules: Rule[]) {
  return {
    validate: (data: unknown) => rules.every(r => r.check(data)),
    addRule: (rule: Rule) => rules.push(rule),
  };
}

// as const for type-safe constants (instead of enum)
const Status = {
  Pending: "pending",
  Active: "active",
  Closed: "closed",
} as const;
type Status = typeof Status[keyof typeof Status];

// Let TypeScript infer - don't over-annotate
const users = await fetchUsers();    // Inferred as User[]
const count = items.length;          // Inferred as number
const isValid = count > 0;           // Inferred as boolean
```

### DON'T ✗

```typescript
// ❌ Over-abstracted - single implementation doesn't need interface
interface IUserService { getUser(id: string): Promise<User>; }
abstract class AbstractUserService implements IUserService { /*...*/ }
class UserServiceImpl extends AbstractUserService { /*...*/ }
class UserServiceFactory { static create(): IUserService { /*...*/ } }
// ✓ When all you need is:
class UserService { 
  async getUser(id: string): Promise<User> { /*...*/ } 
}

// ❌ Deep nesting - hard to follow
function process(data: Data) {
  if (data) {
    if (data.valid) {
      if (data.items) {
        for (const item of data.items) {
          if (item.active) {
            // Actual logic buried 5 levels deep
          }
        }
      }
    }
  }
}
// ✓ Use guard clauses instead:
function process(data: Data) {
  if (!data?.valid) return;
  const activeItems = data.items?.filter(i => i.active) ?? [];
  for (const item of activeItems) { /* flat logic */ }
}

// ❌ God class - too many responsibilities
class UserManager {
  createUser() { /*...*/ }
  deleteUser() { /*...*/ }
  sendEmail() { /*...*/ }        // Email responsibility
  generateReport() { /*...*/ }  // Reporting responsibility
  validatePayment() { /*...*/ } // Payment responsibility
}

// ❌ Inheritance for code reuse - creates tight coupling
class Animal { move() { /*...*/ } }
class Bird extends Animal { fly() { /*...*/ } }
class Penguin extends Bird { 
  fly() { throw new Error("Can't fly"); } // Awkward override
}

// ❌ Speculative generality - unused flexibility
class DataProcessor<T, U, V extends Serializable, W extends Comparable<W>> {
  // Only ever instantiated as DataProcessor<string, number, JSON, Date>
}

// ❌ Over-specified types - redundant annotations
const name: string = "hello";
const items: Array<Item> = getItems();
const active: boolean = true;

// ❌ Using any - defeats type safety
function process(data: any) { return data.foo.bar; }
// ✓ Use unknown and narrow:
function process(data: unknown) {
  if (isValidData(data)) { return data.foo.bar; }
}

// ❌ Enums - add runtime overhead, have quirks
enum Status { Pending, Active, Closed }
// ✓ Use as const instead (shown in DO section)
```

---

## Anti-Patterns to Reject

| Anti-Pattern | Symptom | Resolution |
|--------------|---------|------------|
| **Premature Abstraction** | Interface with 1 implementation | Delete interface, use concrete class or function |
| **Speculative Generality** | Generic<T,U,V> used with one type | Remove generics, use concrete types |
| **Gold Plating** | Features no one requested | Delete unrequested code |
| **Wrong Abstraction** | Shared code with many conditionals | Inline and re-duplicate |
| **God Class** | Class with 10+ responsibilities | Split into focused modules/classes |
| **Deep Inheritance** | 3+ levels of inheritance | Flatten with composition |
| **Static-Only Class** | Class with only static methods | Convert to module exports |

### Wrong Abstraction Recovery

When shared code accumulates conditionals for edge cases:

1. Inline the abstraction back into each caller
2. Delete the parts each caller doesn't need
3. Each caller now has simple, specific code
4. Only re-abstract if clear pattern emerges with 3+ duplicates

**Duplication is cheaper than the wrong abstraction.**

---

## Architecture-Level Guidelines

### Default Choices

| Decision | Default Choice | Upgrade When |
|----------|---------------|--------------|
| Architecture | Modular monolith | Multiple teams need independent deployment |
| Database | Single database | Proven scaling limits hit |
| Communication | Direct function calls | Services need independent scaling |
| State management | Local/simple | Distributed coordination proven necessary |
| Caching | None | Measured performance problem |

### Monolith vs Microservices Decision

**Choose Monolith When:**
- Single team or small team (<10 developers)
- Strong consistency requirements
- Startup/MVP phase
- Domain boundaries unclear
- No proven need for independent scaling

**Consider Microservices Only When:**
- Multiple teams need deployment autonomy
- Different components have vastly different scaling needs
- Mature DevOps practices already exist
- Domain boundaries are well-understood
- You can afford the operational overhead

### Architecture Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Distributed Monolith** | Microservices tightly coupled via shared DB or sync calls | Keep as monolith or properly decouple |
| **Premature Microservices** | Splitting before understanding domain | Start monolith, split when boundaries clear |
| **Resume-Driven Development** | Choosing tech for career growth, not fit | Choose boring technology that fits |
| **Serverless Everything** | Functions for stateful, long-running work | Use appropriate compute model |

---

## Refactoring Toward Simplicity

### Priority Order

1. **Extract Method** - Break functions >50 lines into focused pieces
2. **Replace Conditionals with Guard Clauses** - Flatten nesting with early returns
3. **Replace Conditional with Polymorphism** - Eliminate switch/case chains
4. **Inline Class** - Remove classes that do almost nothing
5. **Collapse Hierarchy** - Remove unnecessary abstract classes

### When to Refactor

- Cyclomatic complexity >10
- Function >50 lines
- Class >500 lines
- Parameter count >4
- Nesting depth >3
- Duplicate code blocks >3 occurrences

---

## TypeScript-Specific Rules

### Prefer

```typescript
// Functions over classes when no state needed
export function validateEmail(email: string): boolean { /*...*/ }
export function formatUser(user: User): string { /*...*/ }

// Object literals over single-instance classes
const config = { apiUrl: "...", timeout: 5000 } as const;

// Discriminated unions over class hierarchies
type ApiResponse<T> = 
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function handleResponse(res: ApiResponse<User>) {
  switch (res.status) {
    case "loading": return <Spinner />;
    case "success": return <UserCard user={res.data} />;
    case "error": return <ErrorMsg error={res.error} />;
  }
}

// Utility types over manual derivations
type UserUpdate = Partial<User>;
type UserSummary = Pick<User, "id" | "name">;
type PublicUser = Omit<User, "password" | "ssn">;

// unknown over any - forces type narrowing
function parseInput(input: unknown): Config {
  if (!isConfig(input)) throw new Error("Invalid config");
  return input;
}

// Composition via dependency injection
class OrderService {
  constructor(
    private readonly db: Database,
    private readonly mailer: Mailer
  ) {}
}
```

### Avoid

```typescript
// ❌ any - disables type checking
function process(data: any) { /*...*/ }

// ❌ Namespaces - use ES modules instead
namespace Utils { export function helper() {} }

// ❌ Static-only classes - use module exports
class StringUtils {
  static capitalize(s: string) { return s.toUpperCase(); }
}

// ❌ Enums - use as const objects
enum Color { Red, Green, Blue }

// ❌ Complex type gymnastics for internal code
type DeepPartial<T> = T extends object 
  ? { [P in keyof T]?: DeepPartial<T[P]> } 
  : T;
// Only justified if reused across multiple public APIs

// ❌ Abstract class with single concrete implementation
abstract class AbstractRepository<T> { /*...*/ }
class UserRepository extends AbstractRepository<User> { /*...*/ }

// ❌ Interface with only one implementation
interface ILogger { log(msg: string): void; }
class Logger implements ILogger { /*...*/ }
// Just use: class Logger { log(msg: string): void { /*...*/ } }

// ❌ Function type - loses parameter info
function execute(fn: Function) { fn(); }
// ✓ Use specific signature:
function execute(fn: () => void) { fn(); }
```

---

## Quick Reference Checklist

Before committing code, verify:

- [ ] Each function does one thing
- [ ] No function exceeds complexity of 10
- [ ] No nesting deeper than 3 levels
- [ ] No more than 3 parameters per function (use options object if more)
- [ ] No interface with single implementation
- [ ] No abstract class without multiple concrete subclasses
- [ ] No generic types used with only one concrete type
- [ ] No features built for hypothetical future needs
- [ ] No `any` types (use `unknown` and narrow)
- [ ] No enums (use `as const` objects)
- [ ] No static-only classes (use module exports)
- [ ] Inheritance depth ≤2 levels (prefer composition)

Before architectural decisions, verify:

- [ ] Simplest solution considered first
- [ ] Complexity justified by measured need, not assumption
- [ ] No distributed system without proven scaling requirement
- [ ] No microservices without team autonomy requirement
- [ ] Technology chosen for fit, not novelty
