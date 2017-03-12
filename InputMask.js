    
    
    
var inputMask = function (_input, _mask, _initialValue, _delimiter, _chunkSize, _maxSize, _coerceValidDate, _regexMatcher) {

    // -------------- OPTIONS --------------- //


    var input = _input

    
    
    var mask = _mask || "  /  /    "
    var initialValue = _initialValue || "" // default ""
    var delimiter = _delimiter || "/"
    var chunkSize = _chunkSize || [2,2,4]
    var maxSize = _maxSize || 10
    var coerceValidDate = !!_coerceValidDate
    var regexMatcher = _regexMatcher || "^[0-9]+$"


    // ------------ GLOBALS ------------ //

    var okCharsRegex = new RegExp(regexMatcher, "i")

    input.value = initialValue || mask

    var americanDateSystem = !!Date.parse('2000-30-12')

    var currentChar

    var currentKeyCode

    var valuePriorToPaste

    var initialStart
    var initialEnd
    var pasteHappened = false
    var cutHappened = false

    // Indexcies of delimiters array to be pushed to in the while loop below
    var indicies = []

    var position = input.value.indexOf(delimiter);

    // Get positions of delimiters
    while (position !== -1) {
        indicies.push(input.value.indexOf(delimiter, position));
        position = input.value.indexOf(delimiter, position + 1);
    }

    var undid = false
    var undoStore = []


    // ---------- MISC EVENTS ------------- ///


    input.onkeypress = function (event) {

        currentChar = String.fromCharCode(event.charCode)
    }

    ///3333


    input.onpaste = function (event) {
        pasteHappened = true
    }

    input.oncut = function (event) {
        cutHappened = true
    }


    input.onkeydown = function (event) {


        initialStart = this.selectionStart
        initialEnd = this.selectionEnd

        valuePriorToPaste = (' ' + event.target.value).slice(1)


        // to be used later in "oninput"
        currentKeyCode = event.which

        var start = this.selectionStart,
            end = this.selectionEnd;

        var value = event.target.value

        // Hacky. Predeclaring input.maxLength was interferring with the oninput event (likely
        // preventing it from firing).
        if (event.target.value.length === maxSize && start === maxSize && event.which >= 48 && event.which <= 90) {
            input.maxLength = maxSize
        } else {
            input.maxLength = 200
        }
    }


    // ------------ HELPER FUNCTION ----------///

    // fixes date mistake
    var fixDateMistake = (dateString) => {

        var regex = new RegExp(delimiter, "g")

        dateString = dateString.replace(regex, "")

        var dateArray = []

        chunkSize.reduce((total, sizeNumber, index) => {

            var chunkString = dateString.substr(total, sizeNumber)


            if (chunkString.length === 0)
                chunkString = valuePriorToPaste.split(delimiter)[index]

            dateArray.push(chunkString)

            return total + sizeNumber
        }, 0)


        var numbersArray = dateArray.map(dateFrag => ( !!dateFrag.trim() ? parseInt(dateFrag) : "" ))


        if (typeof numbersArray[0] === 'number') {

            if (!americanDateSystem && numbersArray[0] > 31)
                dateArray[0] = "31"
            else if (americanDateSystem && numbersArray[0] > 12)
                dateArray[0] = "12"

            if (numbersArray[0] < 1)
                dateArray[0] = "01"
        }

        if (typeof numbersArray[1] === 'number') {

            if (!americanDateSystem && numbersArray[1] > 12)
                dateArray[1] = "12"
            else if (americanDateSystem && numbersArray[1] > 31)
                dateArray[1] = "31"

            if (numbersArray[1] < 1)
                dateArray[1] = "01"
        }


        if (typeof numbersArray[2] === 'number') {

            if (numbersArray[2] < 1)
                dateArray[2] = "0001"

        }


        return dateArray.join('/')
    }


    //---------------  MAIN ONINPUT FUNCITON -----------------///


    input.oninput = function (event) {

        // excuted before input changes. Chance to affect the end result in the input. Is
        // called after the misc events above (hence why many global vars are set at this stage)

        // store current positions in variables
        var start = this.selectionStart,
            end = this.selectionEnd;

        // currentValue is value just after paste but just before display in the input. 

        var currentValue = this.value

        // Correcting the left and right index of the selection. If you start at the end and go
        // back or vica versa the left and right side index of the selection can change, using
        // this the left and right index will be the same either way.
        var leftIndex = initialStart > initialEnd ? initialEnd : initialStart
        var rightIndex = initialStart < initialEnd ? initialEnd : initialStart


        /// --------------------------- if paste  --------------------------- ///

        if (pasteHappened) {

            pasteHappened = false
            var lengthOfRightSide = mask.length - rightIndex

            var newRightIndex = currentValue.length - lengthOfRightSide

            var rawPaste = currentValue.substr(leftIndex, newRightIndex - leftIndex)

            var pasteArray =
                rawPaste.split("").filter(char => ( char.match(okCharsRegex) ))

            // Used to adjust the cursor position for when a delimiter has been hit on a paste.
            var cursorOffset = 0

            currentValue = valuePriorToPaste.replace(/./g, (match, index, string) => {
                var retVal
                if (rightIndex !== leftIndex) {

                    if (index > leftIndex - 1 && index < rightIndex && pasteArray.length)
                        cursorOffset++

                    retVal =
                        index > leftIndex - 1 && index < rightIndex && pasteArray.length && match !== delimiter ?
                            pasteArray.shift() : match
                }

                else if (rightIndex === leftIndex) {

                    if (index > leftIndex - 1 && pasteArray.length)
                        cursorOffset++

                    retVal = index > leftIndex - 1 && pasteArray.length && match !== delimiter ?
                        pasteArray.shift() : match

                }
                return retVal
            })


            // this.value = mask


            undid ? (undoStore = [valuePriorToPaste], undid = false) : (undoStore.push(valuePriorToPaste))

            this.value = coerceValidDate ? fixDateMistake(currentValue) : currentValue

            this.setSelectionRange(leftIndex + cursorOffset, leftIndex + cursorOffset)

            return

        }
        //2222

        /// --------------------------- if key press  --------------------------- ///

        // Back space key press
        if (currentKeyCode === 8 || cutHappened) {
            // reset the cutHappened switch after reading it
            if (cutHappened) cutHappened = false

            // when backspacing, just replace the input with the mask. I.e. "clearing it". If
            // you make a selection in the input then backspace, replace only that selection
            // with the same bit from the mask.
            currentValue = valuePriorToPaste.replace(/./g, (match, index, string) => {
                var retVal
                if (rightIndex !== leftIndex)
                    retVal = index > leftIndex - 1 && index < rightIndex ? mask[index] : match
                else
                    retVal = index > leftIndex - 2 && index < rightIndex ? mask[index] : match

                return retVal
            })

            undid ? (undoStore = [valuePriorToPaste], undid = false) : (undoStore.push(valuePriorToPaste))

            this.value = currentValue

            // restore from variables...
            this.setSelectionRange(start, end);

            return

            // current char is only truthy if a printable char key has been pressed. It is false
            // otherwise (see above event "onkeypress")    
        } else if (currentChar) {

            currentValue = valuePriorToPaste.replace(/./g, (match, index, string) => {

                var replaceValue = currentChar.match(okCharsRegex) ? currentChar : match

                var retVal = index < end && index > leftIndex - 1 && match !== delimiter ?
                    replaceValue : match

                return retVal
            })

            undid ? (undoStore = [valuePriorToPaste], undid = false) : (undoStore.push(valuePriorToPaste))

            this.value = coerceValidDate ? fixDateMistake(currentValue) : (' ' + currentValue).slice(1)

            // restore from variables... Skip ahead if at a delimiter
            indicies.indexOf(start) >= 0 ?
                this.setSelectionRange(start + 1, end + 1) :
                this.setSelectionRange(start, end)
            // Hack to detect if a char key was pressed and help with detecting undo
            currentChar = false

            return
        }
        


        // undo or redo happened
        if (!pasteHappened && !currentChar) {
                

            undoStore.length ? 
                (this.value = undoStore.pop(), this.setSelectionRange(start, end)) : 
                (this.value = [mask], this.setSelectionRange(0, 0))

            undid = true
        }

    }

}
  
