import { NS } from "@ns";
import { Server } from "/Classes/ServerClass";
import { SCRIPTS, LOCAL_HOST, SERVER_LIST } from "/Common/ScriptRegistry";
import { readServers, runScraper } from "/Common/utilities";

export async function main(ns:NS): Promise<void> {
    ns.disableLog('sleep');

    let server_names;
    let servers:Server[] = [];
    
    // compile server list
    runScraper(ns);
    servers = readServers(ns);

    for( let i = 0; i < servers.length; i++ ) {
        let server = servers[i];

        // wait until player is able to hack the current server
        while(!server.hasRootAccess()){
            server.hackServer();
            await ns.sleep(1000) // 1 sec
        }

        if(push_HWG_Scripts(ns, server)){
            ns.exec(SCRIPTS.weakenScript, server.getName());
            ns.exec(SCRIPTS.growScript, server.getName());
        }
        
    }

}

let push_HWG_Scripts = (ns:NS, target:Server) => {
    let HWG_ARRAY:string[] = [SCRIPTS.weakenScript, SCRIPTS.growScript];

    if(target.getRam() > 32){
        HWG_ARRAY.push(SCRIPTS.hackScript)
    }

    return (
        ns.scp(HWG_ARRAY, target.getName(), LOCAL_HOST)
    );
}