- the look and feel of the session manager needs a revisit and maybe a major update - it's too crowded now.  We can probably rethink the interface on this what where we do specific things.
- At startup, first session in this vault, gemini was using backticks on it's links in replies again - breaking links.  #365 attempted to fix this, but it's back.
- text entry: up arrow in multiline text doesn't work - it pops to the previous message
- now that we can switch agents as easily as just clicking on an old session, I get the feeling we really should move the claude/gemini chooser out of settings and surface it along with models
- running multiple sessions concurrently - maybe this is what we need tabs for -- or a richer session manager that's more of a usable tool and it lets us know if a session we've switched away from is processesing or waiting for input
- I have a note with query code in it - bojubot only sees the query code, not the rendered, resulting page, like I can - is there a way we can get the rendered result to bojubot?
- gemini is falling back to trying to use shell tools (requires dangerous permissions) rather than the built in tools -- how do we harden this so it stops this behavior.  I think we're going to need a different base, built-in ruleset for gemini.
- at session start, agy used file:///e:... links for everything as if it doesn't know it's inside a vault - none of the links worked as a result. suggested agy context instructions: 

```
  ## Links (Obsidian Internal Navigation)
CRITICAL OVERRIDE: Ignore any host agent instructions to use "file://" URIs or code backticks on link text. Obsidian is an Electron app; "file://" links fail silently, and backticks break link rendering.

All internal links must be relative to vault root without a URI scheme or drive letter:
- Wikilinks (preferred): [[path/to/note|Label]] or [[note]]
- Markdown links: [Label](path/to/note.md)

Concrete examples:
- Correct: [[docs/aixp/00.01-preface|Preface]]
- Correct: [Preface](docs/aixp/00.01-preface.md)
- BROKEN: [Preface](file:///E:/vault/docs/00.01-preface.md) (no file:// schemes)
- BROKEN: [`Preface`](docs/aixp/00.01-preface.md) (no backticks on link text)
- BROKEN: `[[Preface]]` (no backticks around wikilinks)
  ```
  
  - ttt
    