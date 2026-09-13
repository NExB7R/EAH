# EAH Release Process

Git is the source of truth. Do not maintain parallel project copies.

## Normal work

1. Make changes in this repository.
2. Update `WORKLOG.md` and `07-changelog/CHANGELOG.md` when a meaningful milestone is reached.
3. Commit the change with a clear message.

## Versioning

- `v0.1.x`: foundation / database hardening
- `v0.2.x`: discovery, UX, PWA, recommendations
- `v0.3.x`: merchant workflows
- `v0.5.x`: stronger recommendations
- `v0.9.x`: beta hardening
- `v1.0.0`: public launch

## Release

A release means:
- CI passes.
- Security advisor has no unresolved findings.
- `VERSION` is updated.
- Changelog is updated.
- Git tag is created.
- A compressed archive is generated only as a convenient snapshot.

The archive is disposable; Git history is authoritative.
