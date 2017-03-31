# Input-Mask
An input mask with undo, paste and cut, and rudimentary undo/redo support. Should work everywhere.

### Tested on:

- Chrome (mac and windows 7 same behaviour): Issues with redo (works, mostly).

- Firefox (mac and windows 7 same behaviour): Issues with undo and redo(works, mostly, but cursor pos is not good).

- Safari (Same behaviour as Chrome)

- iOS 10.1 safari: Undo and redo broken. Rest is fine.

- Internet explorer 10: no undo or redo. Rest is fine.

- Internet explorer <= 9: DOES NOT WORK


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

demo: https://bn-l.github.io/Input-Mask/
