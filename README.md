# Input-Mask
An input mask with undo, paste and cut (but not redo) support. Should work everywhere.

### How to use:

import or require InputMask.
<br>
The imported function takes an object {} with the following keys and their settings as values:
<br>

**input**: Required. A DOM reference to the input you would like to apply the mask to

**mask**: Required. The input template / mask.

**initialValue**: Optional. The inital value of the input. Must have the same template as "mask"

**delimiter**: Required. The character used to breakup the input

**chunkSize**: Required. The size of the individual chunks in the template broken up by a delimiter

**coerceValidDate**: Optional. If the input is a date, make sure it always shows the right date

**regexMatcher**: Required. The regex string for allowed characters in the input.

<br>

### Example usage:
```javascript
import InputMask from 'some/specified/path/' (or InputMask = require('path/to/InputMask')

var inputMaskOptions = {
  input: document.getElementById('theInput'),
  mask: "  /  /    ",
  initialValue: "25/12/2011",
  delimiter: '/',
  chunkSize: [2, 2, 4],
  coerceValidDate = true,
  regexMatcher: "^[0-9]+$" // this will only match numeric characters

}
```
<br>

demo: https://blueredcat.github.io/Input-Mask/
