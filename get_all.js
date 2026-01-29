async function exportRecord() {
    return new Promise((resolve, reject) => {
        app.NetAgent.sendReq2Lobby(
            "Lobby",
            "fetchGameRecord", {
            game_uuid: GameMgr.Inst.record_uuid,
            client_version_string: GameMgr.Inst.getClientVersion()
        },
            function (i, record) {
                if (record) { 
                    console.log(record);
                }
            })
    })
}

exportRecord()
