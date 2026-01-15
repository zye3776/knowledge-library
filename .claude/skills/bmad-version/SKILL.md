---
name: bmad-version
description: Check installed BMAD version from manifest.yaml. Use when needing to verify installation, check version, or understand installed modules.
---

# BMAD Version Detection

Check the installed BMAD version and configuration from the manifest file.

## Manifest Location

The installed BMAD version is stored in:

```
_bmad/_config/manifest.yaml
```

## Manifest Structure

```yaml
installation:
  version: "6.0.0-alpha.22"
  installDate: "2025-01-15T10:30:00.000Z"
  lastUpdated: "2025-01-15T10:30:00.000Z"
modules:
  - core
  - bmm
ides:
  - claude-code
```

## Reading the Version

To check the installed BMAD version:

```bash
cat _bmad/_config/manifest.yaml
```

Or extract just the version:

```bash
grep "version:" _bmad/_config/manifest.yaml | head -1
```

## Manifest Fields

| Field | Description |
|-------|-------------|
| `installation.version` | Installed BMAD version (e.g., "6.0.0-alpha.22") |
| `installation.installDate` | When BMAD was first installed |
| `installation.lastUpdated` | When BMAD was last updated |
| `modules` | List of installed modules (core, bmm, bmb, cis, etc.) |
| `ides` | List of configured IDEs (claude-code, cursor, etc.) |

## Checking Installation Status

If the manifest file exists at `_bmad/_config/manifest.yaml`, BMAD is installed. The version field indicates which release is active.

## When to Use

- Verify BMAD is installed before using BMAD workflows
- Check version compatibility for features
- Understand which modules are available
- Troubleshoot installation issues
