let resultContainer = {
    tables: []
};

// Sleep function to add delay
function sleep(ms) {
    console.log("accountID generating... Please wait...")
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function exportRecord(uuid) {
    return new Promise((resolve, reject) => {
        app.NetAgent.sendReq2Lobby(
            "Lobby",
            "fetchGameRecord",
            {
                game_uuid: uuid,
                client_version_string: GameMgr.Inst.getClientVersion()
            },
            async function (i, record) {
                if (record) {
                    const csvArray = await extractCsvArray(record); // Await the result from extractCsvArray
                    resultContainer.tables.push(csvArray); // Push the result to resultContainer.tables
                    resolve(); // Resolve the promise once the record is processed
                } else {
                    reject(new Error('Record is null')); // Handle null records
                }
            },
            function (error) {
                console.error("Error fetching game record:", error);
                reject(error); // Reject the promise if there's an error
            }
        );
    });
}

async function extractCsvArray(record) {
    const accountData = [];

    // Extract account_id and nickname from the accounts array
    record.head.accounts.forEach(account => {
        const account_id = account.account_id || null;
        const nickname = account.nickname || null;

        accountData.push([account_id, nickname]);
    });

    return accountData;
}

async function processRecords(recordUUIDs) {

    for (const uuid of recordUUIDs) {
        await exportRecord(uuid); // Await each record export
        await sleep(2000); // Add 2-second delay between calls
    }

    // After all calls, flatten the resultContainer.tables array
    const flattenedResults = resultContainer.tables.flat(); // Flatten array of arrays

    // Convert to CSV and trigger download
    await exportCsv(flattenedResults);
}

// Function to export CSV in the browser
function exportCsv(data) {
    const headers = ["account_id", "nickname"];

    // Combine headers and data
    const csvContent = [headers, ...data].map(e => e.join(",")).join("\n");

    // Create a Blob and download it as a file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "records.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Start processing records and output CSV
processRecords(
    [
        "231122-1423c494-e6f6-4c99-9d58-4427d03c0922",
        "231122-cc41679f-1903-4830-8e5a-1bed69fbb786",
        "231129-eb7648f3-cd08-4eab-a550-8cd7cdb0ffa3",
        "231129-f9eaf4db-951d-4930-a53b-5eca0b4d4fb6"
    ]
);
