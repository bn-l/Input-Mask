

export default function (optionsObject) {

    // -------------- OPTIONS --------------- //


    var input = optionsObject.input

    
    
    var mask = optionsObject.mask || "  /  /    "
    var initialValue = optionsObject.initialValue || ""
    var delimiter = optionsObject.delimiter || mask.match(/[^ ]/g)[0]
    var chunkSize = optionsObject.chunkSize || mask.split(delimiter)[0].length
    var maxSize = optionsObject.maxSize || mask.length
    var coerceValidDate = !!optionsObject.coerceValidDate
    var regexMatcher = optionsObject.regexMatcher || "^[0-9]+$"

    
    
// ------------ GLOBALS ------------ //

var okCharsRegex = new RegExp(regexMatcher, "i")

input.value = initialValue || mask

var americanDateSystem = !!Date.parse('2000-30-12')

var currentChar

var currentKeyCode = []

var valuePriorToInput

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
var redoStore = []

var undoKeyCombo = false
var redoKeyCombo = false

var contextPaste = false


// ---------- MISC EVENTS ------------- ///


input.onkeypress = function (event) {
    
    currentChar = String.fromCharCode(event.charCode)
}




input.onpaste = function (event) {
    pasteHappened = true
}

input.oncut = function (event) {
    cutHappened = true
}

input.oncontextmenu = function (event) {
   
    valuePriorToInput = event.target.value
    initialStart = this.selectionStart
    initialEnd = this.selectionEnd
    contextPaste = true
}

input.onkeydown = function (event) {
    
    initialStart = this.selectionStart
    initialEnd = this.selectionEnd
    
    valuePriorToInput = (' ' + event.target.value).slice(1)
    
    
    // to be used later in "oninput"
    currentKeyCode = event.which
    
    // Experimentation. Will get these from the KB:
    undoKeyCombo = 
        (event.ctrlKey && event.which === 90) || 
        (event.metaKey && !event.shiftKey && event.which === 90)

    redoKeyCombo =
        (event.ctrlKey && event.which === 89) || 
        (event.metaKey && event.shiftKey && event.which === 90) ||
        (event.ctrlKey && event.shiftKey && event.which === 90)
    
    
    
    var start = this.selectionStart,
        end = this.selectionEnd;
    
    
    // Hacky. Predeclaring input.maxLength was interferring with the oninput event (likely
    // preventing it from firing).
    if(event.target.value.length === maxSize && start === maxSize && event.which >= 48 && event.which <= 90) {
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

    chunkSize.reduce( (total, sizeNumber, index)  => {

        var chunkString = dateString.substr(total, sizeNumber)


        if (chunkString.length === 0)
            chunkString = valuePriorToInput.split(delimiter)[index]

        dateArray.push(chunkString )

        return total + sizeNumber
    }, 0)

    
    var numbersArray = dateArray.map( dateFrag => ( !!dateFrag.trim()? parseInt(dateFrag) : "" ) )
    
    
    
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

        if (numbersArray[2] < 1 )
            dateArray[2] = "0001"
        
    }
    
    
    return dateArray.join('/')
}


//---------------  MAIN ONINPUT FUNCITON -----------------///


input.oninput = function(event) {
    
    // excuted before input changes. Chance to affect the end result in the input. Is
    // called after the misc events above (hence why many global vars are set at this stage)
    
    // store current positions in variables
    var start = this.selectionStart,
        end = this.selectionEnd;

    // valuePriorToInput set on a keypress? No? Then it must be a right mouse on a virgin
    // input. Use the mask instead.
    // valuePriorToInput = !!valuePriorToInput? valuePriorToInput : mask
    
    // currentValue is value just after paste but just before display in the input. 
    
    var currentValue = this.value
    
    // necessary for some browsers.
    contextPaste && initialEnd-1 > initialStart?
        contextPaste = false :
        contextPaste = true

    // Correcting the left and right index of the selection. If you start at the end and go
    // back or vica versa the left and right side index of the selection can change, using
    // this the left and right index will be the same either way.
    var leftIndex = initialStart > initialEnd ? initialEnd : initialStart
    var rightIndex = initialStart < initialEnd ? initialEnd : initialStart
    

    /// --------------------------- if paste  --------------------------- ///
    
    if (pasteHappened) {
        
        
        
        var lengthOfRightSide = mask.length - rightIndex

        var newRightIndex = currentValue.length - lengthOfRightSide
   
        
        var rawPaste = currentValue.substr(leftIndex, newRightIndex - leftIndex)
        
        
        var pasteArray = 
            rawPaste.split("").filter(char => ( char.match(okCharsRegex) ))
        
        // Used to adjust the cursor position for when a delimiter has been hit on a paste.
        var cursorOffset = 0
        
        
        currentValue = valuePriorToInput.replace(/./g, (match, index, string) => {
            var retVal
            if (rightIndex !== leftIndex && !contextPaste) {

                if(index > leftIndex-1 && index < rightIndex && pasteArray.length) 
                    cursorOffset++
                
                retVal =
                    index > leftIndex-1 && index < rightIndex && pasteArray.length && match !== delimiter ?
                        pasteArray.shift() : match
            }

            else if (rightIndex === leftIndex || contextPaste) {
                
                if (index > leftIndex-1 && pasteArray.length)
                    cursorOffset++
                
                retVal = index > leftIndex-1 && pasteArray.length && match !== delimiter ?
                    pasteArray.shift() : match
                
            }
            return retVal
        })
        
        
        // this.value = mask
        pasteHappened = false
        contextPaste = false
        
        undid? (undoStore = [valuePriorToInput], undid = false) : (undoStore.push(valuePriorToInput))
            
        this.value = coerceValidDate? fixDateMistake(currentValue) : currentValue
        
        this.setSelectionRange(leftIndex + cursorOffset, leftIndex + cursorOffset)
        
        return
   
    }
    //2222
    
    /// --------------------------- if key press  --------------------------- ///
    // Back space key press
    if ((currentKeyCode === 8 || cutHappened) && !(undoKeyCombo || redoKeyCombo)) {
        
        // reset the cutHappened switch after reading it
        if (cutHappened) cutHappened = false
        
        // when backspacing, just replace the input with the mask. I.e. "clearing it". If
        // you make a selection in the input then backspace, replace only that selection
        // with the same bit from the mask.
        currentValue = valuePriorToInput.replace(/./g, (match, index, string) => {
            var retVal
            if (rightIndex !== leftIndex)
                retVal = index > leftIndex-1 && index < rightIndex ? mask[index] : match 
            else
                retVal = index > leftIndex-2 && index < rightIndex ? mask[index] : match
            
            return retVal
        })

        undid? (undoStore = [valuePriorToInput], undid = false) : (undoStore.push(valuePriorToInput))
        
        this.value = currentValue

        // restore from variables...
        this.setSelectionRange(start, end);
        
        return
        
    // current char is only truthy if a printable char key has been pressed. It is false
        // otherwise (see above event "onkeypress")    
    } else if(currentChar && !(undoKeyCombo || redoKeyCombo)) {
        currentValue = valuePriorToInput.replace(/./g, (match, index, string) => {
            
            var replaceValue = currentChar.match(okCharsRegex) ? currentChar : match
            
            var retVal = index < end && index > leftIndex-1 && match !== delimiter ? 
                replaceValue : match
            
            return retVal
        })

        undid? (undoStore = [valuePriorToInput], undid = false) : (undoStore.push(valuePriorToInput))
        
        this.value = coerceValidDate? fixDateMistake(currentValue) : (' ' + currentValue).slice(1)

        // restore from variables... Skip ahead if at a delimiter
        indicies.indexOf(start) >= 0 ?
            this.setSelectionRange(start+1, end+1) :
            this.setSelectionRange(start, end)
        // Hack to detect if a char key was pressed and help with detecting undo
        currentChar = false
        
        return
    }
    
    // undo or redo happened
    if(!pasteHappened && !currentChar || undoKeyCombo || redoKeyCombo) {
        // Have to detect if undo or redo then, when popping undo, push on redo. Clear redo
        // and undo at same time.
        
        
        if (leftIndex >= start || undoKeyCombo) {
            if (undoStore.length) {
                
                var undoAction = undoStore.pop()
                redoStore.push(valuePriorToInput)
      
                this.value = undoAction
                
                
                this.setSelectionRange(start, end)
                
                undid = true
                    
            } else {
                this.value = [mask]
                this.setSelectionRange(0, 0)
            }
                // 121123121
        } else {
            if (redoStore.length) {
                
                var redoAction = redoStore.pop()
                
                
                undoStore.push(valuePriorToInput)
                
                this.value = redoAction
                this.setSelectionRange(start, end)
                
                undid = true
                
            } else {
                this.value = [mask]
                this.setSelectionRange(0, 0)
            }
            
        }
        
    }
}
  
