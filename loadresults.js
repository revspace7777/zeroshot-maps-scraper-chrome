document.getElementById('loadResultsButton').addEventListener('click', function() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.color = 'white';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    overlay.style.fontSize = '24px';
    overlay.style.fontFamily = 'Poppins, sans-serif';
    document.body.appendChild(overlay);

    let dots = 0;
    const loadingText = document.createElement('div');
    loadingText.textContent = 'Waiting for all results to load into the DOM';
    overlay.appendChild(loadingText);

    const dotAnimation = setInterval(() => {
        dots = (dots + 1) % 4;
        loadingText.textContent = 'Waiting for all results to load into the DOM' + '.'.repeat(dots);
    }, 500);

    function scrollToResults() {
        const resultsElement = Array.from(document.querySelectorAll('*')).find(el => el.textContent.includes('results for'));
        if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return resultsElement;
        }
        return null;
    }

    function simulateScrolling(resultsElement) {
        let attempts = 0;
        const scrollInterval = setInterval(() => {
            resultsElement.scrollBy(0, 1000);
            setTimeout(() => {
                if (document.body.innerHTML.includes('end of the list')) {
                    clearInterval(scrollInterval);
                    clearInterval(dotAnimation);
                    document.body.removeChild(overlay);
                    showSuccessMessage();
                } else if (attempts >= 2) {
                    clearInterval(scrollInterval);
                    clearInterval(dotAnimation);
                    document.body.removeChild(overlay);
                    showSuccessMessage();
                } else {
                    attempts++;
                }
            }, 4000);
        }, 5000);
    }

    function showSuccessMessage() {
        const successBox = document.createElement('div');
        successBox.style.position = 'fixed';
        successBox.style.bottom = '20px';
        successBox.style.left = '50%';
        successBox.style.transform = 'translateX(-50%)';
        successBox.style.backgroundColor = '#32CD32';
        successBox.style.color = 'black';
        successBox.style.padding = '10px 20px';
        successBox.style.borderRadius = '5px';
        successBox.style.zIndex = '1001';
        successBox.style.fontSize = '18px';
        successBox.style.fontFamily = 'Poppins, sans-serif';
        successBox.textContent = 'All results loaded in DOM';
        document.body.appendChild(successBox);

        setTimeout(() => {
            successBox.style.transition = 'opacity 1.5s';
            successBox.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(successBox);
            }, 1500);
        }, 3500);
    }

    const resultsElement = scrollToResults();
    if (resultsElement) {
        simulateScrolling(resultsElement);
    } else {
        clearInterval(dotAnimation);
        document.body.removeChild(overlay);
        alert('Could not find the results section.');
    }
});
