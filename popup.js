document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var currentTab = tabs[0];
        var actionButton = document.getElementById('actionButton');
        var downloadCsvButton = document.getElementById('downloadCsvButton');
        var resultsTable = document.getElementById('resultsTable');
        var filenameInput = document.getElementById('filenameInput');

        if (currentTab && currentTab.url.includes("://www.google.com/maps/search")) {
            document.getElementById('message').textContent = "Let's scrape Google Maps!";
            actionButton.disabled = false;
            actionButton.classList.add('enabled');
        } else {
            var messageElement = document.getElementById('message');
            messageElement.innerHTML = '';
            var linkElement = document.createElement('a');
            linkElement.href = 'https://www.google.com/maps/search/';
            linkElement.textContent = "Go to Google Maps Search.";
            linkElement.target = '_blank'; 
            messageElement.appendChild(linkElement);

            actionButton.style.display = 'none'; 
            downloadCsvButton.style.display = 'none';
            filenameInput.style.display = 'none'; 
        }

        actionButton.addEventListener('click', function() {
            // Disable the button to prevent multiple clicks
            actionButton.disabled = true;

            chrome.scripting.executeScript({
                target: {tabId: currentTab.id},
                function: scrapeData
            }, function(results) {
                // Re-enable the button after scraping is complete
                actionButton.disabled = false;

                while (resultsTable.firstChild) {
                    resultsTable.removeChild(resultsTable.firstChild);
                }

                // Define and add headers to the table
                const headers = ['Title', 'Rating', 'Reviews', 'Phone', 'Industry', 'Address', 'Website', 'Google Maps Link'];
                const headerRow = document.createElement('tr');
                headers.forEach(headerText => {
                    const header = document.createElement('th');
                    header.textContent = headerText;
                    headerRow.appendChild(header);
                });
                resultsTable.appendChild(headerRow);

                // Add new results to the table
                if (!results || !results[0] || !results[0].result) return;
                results[0].result.forEach(function(item) {
                    var row = document.createElement('tr');
                    ['title', 'rating', 'reviewCount', 'phone', 'industry', 'address', 'companyUrl', 'href'].forEach(function(key) {
                        var cell = document.createElement('td');
                        
                        if (key === 'reviewCount' && item[key]) {
                            item[key] = item[key].replace(/\(|\)/g, ''); 
                        }
                        
                        cell.textContent = item[key] || ''; 
                        row.appendChild(cell);
                    });
                    resultsTable.appendChild(row);
                });

                if (results && results[0] && results[0].result && results[0].result.length > 0) {
                    downloadCsvButton.disabled = false;
                }
            });
        });

        downloadCsvButton.addEventListener('click', function() {
            var csv = tableToCsv(resultsTable); 
            var filename = filenameInput.value.trim();
            if (!filename) {
                filename = 'google-maps-data.csv'; 
            } else {
                filename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.csv';
            }
            downloadCsv(csv, filename); 
        });

    });
});


function scrapeData() {
    // Identify the container with search results
    var resultsContainer = document.querySelector('div[aria-label*="Results for"]');
    if (!resultsContainer) return [];

    // Create a loader overlay
    var loaderOverlay = document.createElement('div');
    loaderOverlay.style.position = 'fixed';
    loaderOverlay.style.top = '0';
    loaderOverlay.style.left = '0';
    loaderOverlay.style.width = '100%';
    loaderOverlay.style.height = '100%';
    loaderOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    loaderOverlay.style.zIndex = '1000';
    loaderOverlay.style.display = 'flex';
    loaderOverlay.style.flexDirection = 'column';
    loaderOverlay.style.alignItems = 'center';
    loaderOverlay.style.justifyContent = 'center';
    loaderOverlay.style.color = '#fff';
    loaderOverlay.style.fontFamily = 'Poppins, sans-serif';
    loaderOverlay.style.fontSize = '18px';

    var loaderImage = document.createElement('img');
    loaderImage.src = 'https://drive.google.com/drive-viewer/AKGpihbru3fBbTSYHAkpXZyasR7ooaDOD3GKWC2XaaG93OCmFNosnRyNncFeiNA3alpkHR5lO2UF3BNGYtZNVMRzRMuuueS0-gwAog=w1920-h917';
    loaderImage.style.width = '100px';
    loaderImage.style.marginBottom = '20px';
    loaderOverlay.appendChild(loaderImage);

    var loaderText = document.createElement('div');
    loaderText.textContent = 'Waiting for all search results to load inside the DOM...';
    loaderOverlay.appendChild(loaderText);

    var resultsCountText = document.createElement('div');
    loaderOverlay.appendChild(resultsCountText);

    document.body.appendChild(loaderOverlay);

    // Simulate scrolling to load all results
    function loadAllResults() {
        return new Promise((resolve) => {
            let currentResultsTally = document.querySelectorAll('a[href^="https://www.google.com/maps/place"]').length;
            let lastHeight = 0;
            let unchangedCount = 0;

            const interval = setInterval(() => {
                resultsContainer.scrollBy(0, 1000); // Scroll down
                const newHeight = resultsContainer.scrollHeight;
                const newResultsTally = document.querySelectorAll('a[href^="https://www.google.com/maps/place"]').length;

                if (newResultsTally === currentResultsTally) {
                    unchangedCount += 500;
                } else {
                    unchangedCount = 0;
                    currentResultsTally = newResultsTally;
                }

                resultsCountText.textContent = `${currentResultsTally} results loaded`;

                if (unchangedCount >= 6000) {
                    clearInterval(interval);
                    document.body.removeChild(loaderOverlay);
                    resolve();
                }

                lastHeight = newHeight;
            }, 500);
        });
    }

    return loadAllResults().then(() => {
        var links = Array.from(document.querySelectorAll('a[href^="https://www.google.com/maps/place"]'));
        return links.map(link => {
            var container = link.closest('[jsaction*="mouseover:pane"]');
            var titleText = container ? container.querySelector('.fontHeadlineSmall').textContent : '';
            var rating = '';
            var reviewCount = '';
            var phone = '';
            var industry = '';
            var address = '';
            var companyUrl = '';

            // Rating and Reviews
            if (container) {
                var roleImgContainer = container.querySelector('[role="img"]');
                
                if (roleImgContainer) {
                    var ariaLabel = roleImgContainer.getAttribute('aria-label');
                
                    if (ariaLabel && ariaLabel.includes("stars")) {
                        var parts = ariaLabel.split(' ');
                        var rating = parts[0];
                        var reviewCount = '(' + parts[2] + ')'; 
                    } else {
                        rating = '0';
                        reviewCount = '0';
                    }
                }
            }

            // Address and Industry
            if (container) {
                var containerText = container.textContent || '';
                var addressRegex = /\d+ [\w\s]+(?:#\s*\d+|Suite\s*\d+|Apt\s*\d+)?/;
                var addressMatch = containerText.match(addressRegex);

                if (addressMatch) {
                    address = addressMatch[0];

                    // Extract industry text based on the position before the address
                    var textBeforeAddress = containerText.substring(0, containerText.indexOf(address)).trim();
                    var ratingIndex = textBeforeAddress.lastIndexOf(rating + reviewCount);
                    if (ratingIndex !== -1) {
                        // Assuming industry is the first significant text after rating and review count
                        var rawIndustryText = textBeforeAddress.substring(ratingIndex + (rating + reviewCount).length).trim().split(/[\r\n]+/)[0];
                        industry = rawIndustryText.replace(/[·.,#!?]/g, '').trim();
                    }
                    var filterRegex = /\b(Closed|Open 24 hours|24 hours)|Open\b/g;
                    address = address.replace(filterRegex, '').trim();
                    address = address.replace(/(\d+)(Open)/g, '$1').trim();
                    address = address.replace(/(\w)(Open)/g, '$1').trim();
                    address = address.replace(/(\w)(Closed)/g, '$1').trim();
                } else {
                    address = '';
                }
            }

            // Company URL
            if (container) {
                var allLinks = Array.from(container.querySelectorAll('a[href]'));
                var filteredLinks = allLinks.filter(a => !a.href.startsWith("https://www.google.com/maps/place/"));
                if (filteredLinks.length > 0) {
                    companyUrl = filteredLinks[0].href;
                }
            }

            // Phone Numbers
            if (container) {
                var containerText = container.textContent || '';
                var phoneRegex = /(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
                var phoneMatch = containerText.match(phoneRegex);
                phone = phoneMatch ? phoneMatch[0] : '';
            }

            // Return the data as an object
            return {
                title: titleText,
                rating: rating,
                reviewCount: reviewCount,
                phone: phone,
                industry: industry,
                address: address,
                companyUrl: companyUrl,
                href: link.href,
            };
        });
    });
}

// Convert the table to a CSV string
function tableToCsv(table) {
    var csv = [];
    var rows = table.querySelectorAll('tr');
    
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll('td, th');
        
        for (var j = 0; j < cols.length; j++) {
            row.push('"' + cols[j].innerText + '"');
        }
        csv.push(row.join(','));
    }
    return csv.join('\n');
}

// Download the CSV file
function downloadCsv(csv, filename) {
    var csvFile;
    var downloadLink;

    csvFile = new Blob([csv], {type: 'text/csv'});
    downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

document.addEventListener('DOMContentLoaded', function() {
    const downloadCsvButton = document.getElementById('downloadCsvButton');
    const buttons = document.querySelectorAll('.secondary-button');

    downloadCsvButton.addEventListener('click', function() {
        buttons.forEach(button => {
            button.disabled = !button.disabled;
            button.classList.toggle('enabled');
        });
    });
});

