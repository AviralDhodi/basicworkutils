/**
 * Calculator App for Homepage
 * Handles calculator UI and functionality, displaying as a modal overlay
 */

const CalculatorApp = (function() {
    // DOM Elements
    const calculatorModal = document.getElementById('calculator-modal');
    const closeCalculatorBtn = document.getElementById('close-calculator');
    const calcHistory = document.getElementById('calc-history');
    const calcResult = document.getElementById('calc-result');
    
    // Calculator state
    let displayValue = '0';
    let pendingValue = null;
    let pendingOperator = null;
    let lastResult = null;
    let clearOnNextInput = false;
    
    // Initialize the calculator
    function init() {
      // Set up event listeners
      setupCalculatorButtons();
      closeCalculatorBtn.addEventListener('click', hideCalculator);
      
      // Add global keyboard listener
      document.addEventListener('keydown', handleKeyboardInput);
      
      console.log('Calculator App initialized');
    }
    
    // Set up calculator button event listeners
    function setupCalculatorButtons() {
      // Get all calculator buttons
      const buttons = document.querySelectorAll('.calc-btn');
      
      // Add click event listeners
      buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          const buttonText = e.target.textContent;
          
          if (e.target.classList.contains('calc-num')) {
            handleNumberInput(buttonText);
          } else if (e.target.classList.contains('calc-op')) {
            handleOperator(buttonText);
          } else if (e.target.classList.contains('calc-clear')) {
            clearCalculator();
          } else if (e.target.classList.contains('calc-equals')) {
            calculateResult();
          }
        });
      });
    }
    
    // Handle number inputs and decimal point
    function handleNumberInput(value) {
      // Handle decimal point
      if (value === '.') {
        if (displayValue.includes('.')) {
          return; // Ignore additional decimal points
        }
        
        if (clearOnNextInput) {
          displayValue = '0.';
          clearOnNextInput = false;
        } else {
          displayValue += '.';
        }
      }
      // Handle number inputs
      else {
        if (displayValue === '0' || clearOnNextInput) {
          displayValue = value;
          clearOnNextInput = false;
        } else {
          displayValue += value;
        }
      }
      
      updateDisplay();
    }
    
    // Handle operators (+, -, ×, ÷)
    function handleOperator(operator) {
      // If we have a pending operation, calculate the result first
      if (pendingOperator && !clearOnNextInput) {
        calculateResult();
      }
      
      // Store the current value and operator for later calculation
      pendingValue = parseFloat(displayValue);
      pendingOperator = operator;
      clearOnNextInput = true;
      
      // Update history display
      calcHistory.textContent = `${pendingValue} ${operatorToSymbol(operator)}`;
    }
    
    // Calculate the result when = is pressed
    function calculateResult() {
      // If no pending operation, do nothing
      if (pendingOperator === null || pendingValue === null) {
        return;
      }
      
      const currentValue = parseFloat(displayValue);
      let result = 0;
      
      // Perform the calculation based on the operator
      switch (pendingOperator) {
        case '+':
          result = pendingValue + currentValue;
          break;
        case '-':
          result = pendingValue - currentValue;
          break;
        case '×':
          result = pendingValue * currentValue;
          break;
        case '÷':
          if (currentValue === 0) {
            // Handle division by zero
            clearCalculator();
            displayValue = 'Error';
            updateDisplay();
            return;
          }
          result = pendingValue / currentValue;
          break;
        case '%':
          result = pendingValue % currentValue;
          break;
      }
      
      // Update history display
      calcHistory.textContent = `${pendingValue} ${operatorToSymbol(pendingOperator)} ${currentValue} =`;
      
      // Format the result (limit decimal places to avoid overflow)
      result = formatResult(result);
      
      // Update calculator state
      displayValue = result.toString();
      pendingValue = result;
      lastResult = result;
      pendingOperator = null;
      clearOnNextInput = true;
      
      updateDisplay();
    }
    
    // Clear the calculator
    function clearCalculator() {
      displayValue = '0';
      pendingValue = null;
      pendingOperator = null;
      calcHistory.textContent = '';
      clearOnNextInput = false;
      
      updateDisplay();
    }
    
    // Handle the ± (plus/minus) button
    function toggleSign() {
      if (displayValue !== '0') {
        displayValue = (parseFloat(displayValue) * -1).toString();
        updateDisplay();
      }
    }
    
    // Handle percentage operation
    function handlePercentage() {
      if (pendingOperator && pendingValue) {
        // Calculate percentage of the pending value
        displayValue = (pendingValue * (parseFloat(displayValue) / 100)).toString();
      } else {
        // Convert current value to percentage
        displayValue = (parseFloat(displayValue) / 100).toString();
      }
      
      updateDisplay();
    }
    
    // Update the calculator display
    function updateDisplay() {
      calcResult.textContent = displayValue;
    }
    
    // Convert operator symbol for display
    function operatorToSymbol(operator) {
      switch (operator) {
        case '×': return '×';
        case '÷': return '÷';
        case '+': return '+';
        case '-': return '-';
        case '%': return '%';
        default: return operator;
      }
    }
    
    // Format result to prevent overflow
    function formatResult(value) {
      // Check if it's a whole number
      if (Number.isInteger(value)) {
        return value;
      }
      
      // Convert to string and check length
      const valueStr = value.toString();
      
      // If the number is too long, format it
      if (valueStr.length > 10) {
        return parseFloat(value.toFixed(10));
      }
      
      return value;
    }
    
    // Show the calculator
    function showCalculator() {
      calculatorModal.classList.remove('hidden');
    }
    
    // Hide the calculator
    function hideCalculator() {
      calculatorModal.classList.add('hidden');
    }
    
    // Handle keyboard input for the calculator
    function handleKeyboardInput(e) {
      // Only handle keyboard input if calculator is not shown and no other input is focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement.tagName === 'INPUT' || 
                            activeElement.tagName === 'TEXTAREA' || 
                            activeElement.isContentEditable;
      
    
    const excalidrawModalEl = document.querySelector('.excalidraw-modal');
    const isExcalidrawOpen = excalidrawModalEl && !excalidrawModalEl.classList.contains('hidden');

    // If an input is focused or excalidraw is open, don't open calculator
    if (isInputFocused || isExcalidrawOpen) {
        return;
    }
    
    // If an input is focused or excalidraw is open, don't open calculator
    if (isInputFocused || isExcalidrawOpen) {
      return;
    }
      // If calculator is already open, handle inputs for it
      if (!calculatorModal.classList.contains('hidden')) {
        if (e.key === 'Escape') {
          hideCalculator();
          e.preventDefault();
          return;
        }
        
        // Handle calculator inputs
        if (/[0-9.]/.test(e.key)) {
          handleNumberInput(e.key);
          e.preventDefault();
        } else if (['+', '-'].includes(e.key)) {
          handleOperator(e.key);
          e.preventDefault();
        } else if (e.key === '*') {
          handleOperator('×');
          e.preventDefault();
        } else if (e.key === '/') {
          handleOperator('÷');
          e.preventDefault();
        } else if (e.key === '%') {
          handleOperator('%');
          e.preventDefault();
        } else if (e.key === '=' || e.key === 'Enter') {
          calculateResult();
          e.preventDefault();
        } else if (e.key === 'c' || e.key === 'C') {
          clearCalculator();
          e.preventDefault();
        }
      } 
      // Otherwise, check if we should open the calculator
      else if (/[0-9]/.test(e.key)) {
        showCalculator();
        clearCalculator();
        handleNumberInput(e.key);
        e.preventDefault();
      }
    }
    
    // Public API
    return {
      init,
      showCalculator,
      hideCalculator
    };
  })();
  
  // Initialize the calculator app when DOM is loaded
  document.addEventListener('DOMContentLoaded', CalculatorApp.init);