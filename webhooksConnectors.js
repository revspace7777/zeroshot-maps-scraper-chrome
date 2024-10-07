// webhooksConnectors.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'sendToWebhook') {
      const data = message.data;
      const webhookUrl = "https://n8n-webhook-url.com";  // Replace with actual webhook URL
  
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        sendResponse({ status: 'success', data: data });
      })
      .catch((error) => {
        console.error('Error:', error);
        sendResponse({ status: 'error', error: error });
      });
      return true; // Keeps the message channel open for async response
    }
  });
  