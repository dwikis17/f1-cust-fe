# Animation plans

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Add restrained interaction motion](001-interaction-motion.md) | MEDIUM | DONE |
| 002 | [Bridge product gallery image changes](002-gallery-crossfade.md) | MEDIUM | DONE |

## Execution order

1. Execute plan 001 first because it defines the shared `--ease-out` token.
2. Execute plan 002 after plan 001 and reuse that token.

The plans intentionally reject decorative page entrances, animated cart quantity
changes, and a looping hero treatment: those surfaces are high-frequency or
information-focused, so extra motion would hinder rather than help.
