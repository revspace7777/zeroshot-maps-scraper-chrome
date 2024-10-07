// regexFinder.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'generateRegex') {
      const xpath = message.xpath;
      const regexPattern = xpathToRegex(xpath);
  
      const displayBox = document.getElementById('pathDisplay');
      displayBox.innerHTML = `
        <p>Regex Pattern: <button onclick="copyToClipboard('${regexPattern}')">Copy Regex</button></p>
      `;
  
      highlightElementsMatchingRegex(regexPattern);
    }
  });
  
  function xpathToRegex(xpath) {
    // Function to convert XPath to Regex here...
  }
  
  function highlightElementsMatchingRegex(regex) {
    // Function to highlight elements by regex here...
  }
  
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }
  