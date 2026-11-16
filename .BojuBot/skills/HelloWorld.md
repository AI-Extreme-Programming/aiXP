---
category: General
description: Echo test input back as a reply
autorun: true
params:
  - id: message
    type: input
    label: Test Input
    placeholder: Type your message here...
    validations:
      required: true
---
Echo the following test input back to the user as a reply:

<test_input>
{{message}}
</test_input>
