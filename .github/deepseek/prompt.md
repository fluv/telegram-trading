## Project context

Personal homelab Telegram bot. Trades securities based on sentiment analysis of messages
in a Telegram channel. Uses CommonJS, Express, GramJS, and the Trading 212 API.

## Style

The existing code is intentionally informal and direct. Flag new code that introduces
patterns out of place against it — the goal is that new code looks like it was written
by the same hand as the old code, not like it was reviewed and upgraded.

Concrete markers of the existing style:

- CommonJS throughout (`require`/`module.exports`); no ES modules
- Arrow functions everywhere; no `function` declarations
- `async`/`await` for all async operations
- `console.log` / `console.error` with plain string literals and inline values;
  no structured logging objects, no log levels, no log libraries
- Flat `if` chains; not method chains or functional pipelines
- Short variable names (`e`, `res`, `x`, `acc`, `instr`)
- Minimal comments — only where intent is genuinely non-obvious
- No JSDoc; the existing JSDoc on some functions is the high-water mark, not the norm

Flag code that looks noticeably cleaner, more defensive, or more abstracted than the
surrounding file. The right fix is usually to simplify to match, not to upgrade the
surrounding code to match the new addition.

## Version bump — blocker

Docker images are tagged with `v{version}` from `package.json` (e.g. `v1.0.1`) so that
kube deployments reference a human-readable version rather than a commit SHA.

**Raise as a blocker** if the patch modifies any `.js` file but `package.json`'s
`version` field is not incremented. Check the patch for a hunk touching `package.json`
that changes the version string. If no such hunk is present, `REQUEST CHANGES`.

Exception: patches that only touch non-code files — `.md`, `.yml`, `.github/`, test
fixtures, `package.json` itself — do not require a version bump.
