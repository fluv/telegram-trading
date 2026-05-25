# CLAUDE.md — telegram-trading

Personal homelab Telegram bot. Trades securities based on sentiment analysis of messages
in a Telegram channel. Uses CommonJS, Express, GramJS, and the Trading 212 API.

## Matching the existing style

The original author knows ES6-era JavaScript well and writes direct, working code. They
haven't necessarily kept up with everything since — no strong opinions on newer patterns,
no enterprise habits, no defensive programming for cases that haven't bitten them yet.
The code does what it needs to and stops there.

New code should feel like it came from the same person. The failure mode is code that's
conspicuously better: more abstracted, more defensive, more structured than the surrounding
file. If your addition looks like a reviewed, upgraded version of the adjacent code, simplify
it until it doesn't.

Concretely, the author:

- Uses CommonJS (`require`/`module.exports`); never reached for ES modules
- Writes arrow functions by default; no `function` declarations
- Does `async`/`await` throughout; no raw `.then()` chains
- Logs with `console.log` / `console.error` and plain strings; no log libraries, no levels
- Writes flat `if` chains, not method chains or pipelines
- Keeps variable names short (`e`, `res`, `x`, `acc`, `instr`)
- Adds comments only when the intent would genuinely surprise a reader
- Has some JSDoc on older functions — the high-water mark, not the target

## Version bump — required for every JS change

Docker images are tagged `v{version}` from `package.json`. Any commit that modifies a
`.js` file must increment the `version` field. Bump patch for routine changes.

Exception: commits that only touch non-code files (`.md`, `.yml`, `.github/`, test
fixtures, `package.json` itself) do not require a bump.
