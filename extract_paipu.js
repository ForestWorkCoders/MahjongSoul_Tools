async function fetchSingleRecord(uuid) {
    // Function just to grab raw data
    return new Promise((resolve, reject) => {
        app.NetAgent.sendReq2Lobby(
            "Lobby",
            "fetchGameRecord",
            {
                game_uuid: uuid,
                client_version_string: GameMgr.Inst.getClientVersion()
            },
            (i, record) => resolve(record), // Resolve first, process later
            (err) => reject(err)
        );
    });
}

function transformRecordToRows(record) {
    // return empty to handle possible Error
    const accounts = record?.head?.accounts;
    if (!Array.isArray(accounts)) return [];

    return accounts.map(acc => [
        acc.account_id ?? "", 
        `"${(acc.nickname ?? "").replace(/"/g, '""')}"` // , and ; thingy
    ]);
}

async function processRecords(recordUUIDs) {
    // Use map to save, and accountID is ALWAYS unique.
    const uniqueAccounts = new Map();

    for (const [index, uuid] of recordUUIDs.entries()) {
        try {
            console.log(`[${index + 1}/${recordUUIDs.length}] Processing: ${uuid}`);
            
            const record = await fetchSingleRecord(uuid);
            
            // Check repeat
            const accounts = record?.head?.accounts || [];
            accounts.forEach(acc => {
                if (acc.account_id) {
                    // Replace old row if account id exists
                    uniqueAccounts.set(acc.account_id, acc.nickname || "");
                }
            });

            // Delay for API Limit
            if (index < recordUUIDs.length - 1) {
                await new Promise(r => setTimeout(r, 2000));
            }
        } catch (e) {
            console.error(`Skipping ${uuid} due to error:`, e.message);
        }
    }

    // Map to Csv
    const finalData = Array.from(uniqueAccounts.entries());
    
    if (finalData.length > 0) {
        exportCsv(finalData);
    } else {
        console.warn("No valid data found. CSV export aborted.");
    }
}

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

// Put the paipu list here, as array
processRecords(
    [
        "231122-1423c494-e6f6-4c99-9d58-4427d03c0922",
        "231122-cc41679f-1903-4830-8e5a-1bed69fbb786",
        "231129-eb7648f3-cd08-4eab-a550-8cd7cdb0ffa3",
        "231129-f9eaf4db-951d-4930-a53b-5eca0b4d4fb6"
    ]
);
