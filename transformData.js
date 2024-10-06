function getSearchQuery() {
    // 1. Try to get the query from an element with role="search"
    const searchElement = document.querySelector('[role="search"] input');
    if (searchElement && searchElement.value) {
        return searchElement.value.trim();
    }

    // 2. Try to get the query from a div with id="searchbox"
    const searchBox = document.getElementById('searchbox');
    if (searchBox && searchBox.innerText) {
        return searchBox.innerText.trim();
    }

    // 3. Fallback: Extract the query from the URL (Google Maps query parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q'); // Assuming 'q' is the search query parameter
    if (queryParam) {
        return queryParam.trim();
    }

    // Default fallback if no query is found
    return 'default-search-query';
}

function exportToCSV(data) {
    let csv = [];
    let rows = document.querySelectorAll("table tr");
    
    for (let i = 0; i < rows.length; i++) {
        let row = [], cols = rows[i].querySelectorAll("td, th");
        for (let j = 0; j < cols.length; j++) {
            row.push('"' + cols[j].innerText + '"');
        }
        csv.push(row.join(","));
    }
    
    let csvContent = csv.join("\n");
    const searchQuery = getSearchQuery();
    downloadFile(csvContent, searchQuery, 'csv');
}

function exportToJSON(data) {
    let jsonArray = [];
    let headers = [];
    let rows = document.querySelectorAll("table tr");

    // Extract headers
    let headerCols = rows[0].querySelectorAll("th");
    for (let i = 0; i < headerCols.length; i++) {
        headers.push(headerCols[i].innerText);
    }

    // Extract rows
    for (let i = 1; i < rows.length; i++) {
        let obj = {};
        let cols = rows[i].querySelectorAll("td");
        for (let j = 0; j < cols.length; j++) {
            obj[headers[j]] = cols[j].innerText;
        }
        jsonArray.push(obj);
    }

    let jsonContent = JSON.stringify(jsonArray, null, 2);
    const searchQuery = getSearchQuery();
    downloadFile(jsonContent, searchQuery, 'json');
}

function downloadFile(content, searchQuery, extension) {
    let filename = searchQuery.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.' + extension;
    let blob = new Blob([content], {type: 'text/' + extension});
    let downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename;
    downloadLink.click();
}

document.getElementById('csvButton').addEventListener('click', function() {
    const searchQuery = getSearchQuery(); // Dynamically get the search query
    exportToCSV(resultsTable, searchQuery);
});

document.getElementById('googleSheetButton').addEventListener('click', function() {
    const searchQuery = getSearchQuery(); // Dynamically get the search query
    exportToGoogleSheet(resultsTable, searchQuery);
});

document.getElementById('jsonButton').addEventListener('click', function() {
    const searchQuery = getSearchQuery(); // Dynamically get the search query
    exportToJSON(resultsTable, searchQuery);
});

document.getElementById('xmlButton').addEventListener('click', function() {
    const searchQuery = getSearchQuery(); // Dynamically get the search query
    exportToXML(resultsTable, searchQuery);
});

document.getElementById('htmlButton').addEventListener('click', function() {
    const searchQuery = getSearchQuery(); // Dynamically get the search query
    exportToHTML(resultsTable, searchQuery);
});
