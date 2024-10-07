// regexSelect.js

document.addEventListener('click', function (event) {
    const target = event.target;
    event.preventDefault();
    event.stopPropagation();
  
    target.style.outline = '2px solid rgba(30, 144, 255, 0.7)';
    const xpath = generateXPath(target);
    const fullPath = getFullPath(target);
  
    const displayBox = document.getElementById('pathDisplay') || createPathDisplay();
    displayBox.innerHTML = `
      <p>XPath: <button onclick="copyToClipboard('${xpath}')">Copy XPath</button></p>
      <p>Full Path: <button onclick="copyToClipboard('${fullPath}')">Copy Full Path</button></p>
      <button onclick="generateRegex('${xpath}')">Identify a Regex for the Current Selection?</button>
    `;
  }, true);
  
  function createPathDisplay() {
    const displayBox = document.createElement('div');
    displayBox.id = 'pathDisplay';
    displayBox.style.position = 'fixed';
    displayBox.style.bottom = '20px';
    displayBox.style.right = '20px';
    displayBox.style.backgroundColor = '#333';
    displayBox.style.color = 'white';
    displayBox.style.padding = '10px';
    displayBox.style.zIndex = '10000';
    document.body.appendChild(displayBox);
    return displayBox;
  }
  
  function generateXPath(element) {
    // Code for generating XPath here...
  }
  
  function getFullPath(element) {
    // Code for generating full path here...
  }
  
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }
  
  function generateRegex(xpath) {
    chrome.runtime.sendMessage({ action: 'generateRegex', xpath: xpath });
  }
  