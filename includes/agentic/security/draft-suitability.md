## Agentic-workflow suitability review

In addition to drafting the GitHub issue, evaluate whether the raw Alpaca report
(title, description, comments, captured context, errors, or screenshot URLs) is
a suitable candidate for the GitHub agentic coding workflow.

Suitable means the expected outcome is a **bounded change in the connected
GitHub repository** (theme, plugin, build, tests, config, or copy that lives in
repo files such as templates, block markup, or hardcoded UI strings).

Mark `suitable_for_agent` as **false** when the request is primarily:

- Not software work at all (jokes, chitchat, "make me a coffee", unrelated asks)
- Work that belongs in WordPress admin or the CMS, not git (publish a post,
  edit a page in the database, change a site setting with no code change)
- Ambiguous with no repo artifact to change (e.g. "update the homepage copy"
  with no theme/template/content-in-code signal)

Mark `suitable_for_agent` as **true** when the ask is a real bug, enhancement,
refactor, test, config, or **content/copy that clearly lives in the repo**.

Do not decline merely because the report is informal, incomplete, or low
complexity. Prefer `true` when unsure but there is a plausible code change.

Still produce a best-effort draft `title` and `body` even when unsuitable, so a
human can review and override if the classifier was wrong.

Extend the required JSON output with these fields (always include both):

```
"suitable_for_agent": true | false,
"unsuitable_reason": "Short user-facing explanation when suitable_for_agent is false; empty string when true"
```

The full JSON shape is:

```
{
  "title": "...",
  "body": "...",
  "complexity": "low" | "medium" | "high",
  "labels": ["bug" or "enhancement", "complexity:..."],
  "suspicious": false,
  "suspicious_reason": "",
  "suitable_for_agent": true,
  "unsuitable_reason": ""
}
```
