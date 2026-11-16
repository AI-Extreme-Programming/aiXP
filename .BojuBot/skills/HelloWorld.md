---
name: HelloWorld
description: Prompts for test input and echoes it back as a reply
autorun: true
inputs:
  - name: message
    type: text
    label: Test Input
    placeholder: Type something here...
---

Echo the following test input back to the user as a reply:

{{message}}
