---
paths:
  - "**/*.{ts,tsx}"
---

# Effect.js Standards

## Error Type Definitions

- Define explicit error types with `_tag` discriminator
- Use union types for exhaustive matching
- DO NOT use generic `Error` or string errors

```typescript
// Correct
class AnthropicApiError {
  readonly _tag = 'AnthropicApiError';
  constructor(
    readonly message: string,
    readonly statusCode: number,
    readonly retryable: boolean
  ) {}
}

type AgentError = AnthropicApiError | AgentNotFoundError | TimeoutError;

// Incorrect
throw new Error('API failed');
return Effect.fail('something went wrong');
```

## Effect Composition

- Use generator syntax (`Effect.gen`) for readability
- Use pipe syntax for simple transformations
- DO NOT mix async/await with Effect

```typescript
// Correct - Generator syntax (preferred)
const invokeAgent = (agentId: string, message: string) =>
  Effect.gen(function* (_) {
    yield* _(Effect.log(`Invoking agent: ${agentId}`));
    const agent = yield* _(getAgent(agentId));
    const response = yield* _(sendMessage(agent, message));
    return response;
  });

// Acceptable - Pipe for simple transformations
const getAgentName = (agentId: string) =>
  pipe(
    getAgent(agentId),
    Effect.map(agent => agent.name),
    Effect.orElse(() => Effect.succeed('Unknown'))
  );

// Incorrect - Don't mix paradigms
const invokeAgent = async (agentId: string) => {
  const agent = await Effect.runPromise(getAgent(agentId));
};
```

## Retry Policies

- Use `Schedule` for typed retry policies
- DO NOT implement manual retry loops

```typescript
// Correct
const retryPolicy = pipe(
  Schedule.exponential(Duration.seconds(1)),
  Schedule.compose(Schedule.recurs(3)),
  Schedule.whileInput((error: AgentError) =>
    error._tag === 'AnthropicApiError' && error.retryable
  )
);

const invokeWithRetry = (agentId: string, message: string) =>
  pipe(
    invokeAgent(agentId, message),
    Effect.retry(retryPolicy)
  );
```

## Resource Management

- Use `acquireRelease` for resources needing cleanup
- Use `Effect.scoped` for automatic cleanup

```typescript
const withDatabaseConnection = Effect.acquireRelease(
  Effect.tryPromise(() => database.connect()),
  (connection) => Effect.sync(() => connection.close())
);

const queryDatabase = (sql: string) =>
  Effect.scoped(
    Effect.gen(function* (_) {
      const connection = yield* _(withDatabaseConnection);
      return yield* _(Effect.tryPromise(() => connection.query(sql)));
    })
  );
```

## Service Pattern (Dependency Injection)

- Use `Context.Tag` for service interfaces
- Use `Layer` for testability
- Provide layers at application edge

```typescript
class AnthropicClient extends Context.Tag('AnthropicClient')<
  AnthropicClient,
  {
    sendMessage: (agentId: string, content: string) => Effect.Effect<Response, AnthropicApiError>;
  }
>() {}

const invokeAgent = (agentId: string, message: string) =>
  Effect.gen(function* (_) {
    const client = yield* _(AnthropicClient);
    return yield* _(client.sendMessage(agentId, message));
  });
```

## Interruption Handling

- Design workflows with interruption boundaries at each `yield*`
- Use `Fiber.interrupt` for graceful shutdown

```typescript
const researchWorkflow = Effect.gen(function* (_) {
  const plan = yield* _(createResearchPlan);
  const sources = yield* _(selectSources(plan));  // Can interrupt here
  const content = yield* _(scrapeSources(sources));  // Can interrupt here
  return content;
});
```
