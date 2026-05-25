# CLAUDE.md — telegram-trading

Personal homelab Telegram bot. Trades securities based on sentiment analysis of messages
in a Telegram channel. Uses CommonJS, Express, GramJS, and the Trading 212 API.

## Style

Write new code to match the existing style — the goal is that it looks like it was written
by the same hand, not reviewed and upgraded. If new code looks noticeably cleaner, more
defensive, or more abstracted than the surrounding file, simplify it to match rather than
upgrading the surrounding code.

Concrete markers:

- CommonJS throughout (`require`/`module.exports`); no ES modules
- Arrow functions everywhere; no `function` declarations
- `async`/`await` for all async operations
- `console.log` / `console.error` with plain string literals and inline values;
  no structured logging objects, no log levels, no log libraries
- Flat `if` chains; not method chains or functional pipelines
- Short variable names (`e`, `res`, `x`, `acc`, `instr`)
- Minimal comments — only where intent is genuinely non-obvious
- No JSDoc; the existing JSDoc on some functions is the high-water mark, not the norm

## Version bump — required for every JS change

Docker images are tagged `v{version}` from `package.json`. Any commit that modifies a
`.js` file must increment the `version` field. Bump patch for routine changes.

Exception: commits that only touch non-code files (`.md`, `.yml`, `.github/`, test
fixtures, `package.json` itself) do not require a bump.
