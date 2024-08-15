// const beatPattern = document.getElementById('beatPattern');
const teclas = document.querySelectorAll('.teclado button.boton');

teclas.forEach(button => {
  button.addEventListener('click', () => {
    const buttonValue = button.innerText;
    const cursorPosition = beatPattern.selectionStart;
    
    switch (button.id) {
      case 'left':
      beatPattern.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
      break;
      case 'right':
      beatPattern.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
      break;
      case 'backspace':
      beatPattern.value = beatPattern.value.substring(0, cursorPosition - 1) + beatPattern.value.substring(cursorPosition, beatPattern.value.length);
      beatPattern.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
      break;
      case 'supr':
      beatPattern.value = beatPattern.value.substring(0, cursorPosition) + beatPattern.value.substring(cursorPosition + 1, beatPattern.value.length);
      beatPattern.setSelectionRange(cursorPosition, cursorPosition);
      break;
      default:
      beatPattern.value = beatPattern.value.substring(0, cursorPosition) + buttonValue + beatPattern.value.substring(cursorPosition, beatPattern.value.length);
      beatPattern.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
    }
    beatPattern.focus();
  });
});