import { NS } from "@ns";
import { LOCAL_HOST, PURCHASED_SERVER_PRFX, SCRIPTS } from "/Common/ScriptRegistry";
import { awaitPlayerFunds } from "/Common/utilities";



export async function main(ns: NS) {
    ns.disableLog('sleep');
    
    const MAX_P_SERVER_COUNT:number = ns.getPurchasedServerLimit();
    const MAX_SERVER_RAM = ns.getPurchasedServerMaxRam();
    const MIN_RAM = 8;
    

    if(ns.getPurchasedServers().length !== MAX_P_SERVER_COUNT){
        while(ns.getPurchasedServers().length < MAX_P_SERVER_COUNT) {
            
            let server_count = ns.getPurchasedServers().length;
            let new_server_name = PURCHASED_SERVER_PRFX + (server_count + 1)
            
            // wait until player can afford new server
            if(canAffordPurchase(ns, ns.getPurchasedServerCost(MIN_RAM))){
                let new_server = ns.purchaseServer(new_server_name, MIN_RAM);
                
                if(new_server !== ""){
                    ns.print(`Purchased new server ${new_server}`);

                    await handleNewServer(ns, new_server);
                }
                
            } else {
                await awaitPlayerFunds(ns, ns.getPurchasedServerCost(MIN_RAM));
            }
        }
    } else {
        ns.print(`Purchase servers limit ${MAX_P_SERVER_COUNT} has been reached. Starting upgrades`);
    }

    let p_servers = ns.getPurchasedServers();

    // if all servers purchased, start upgrading servers to MAX_SERVER_RAM
    if(p_servers.length === MAX_P_SERVER_COUNT){

        let p_servers_count = p_servers.length;
        let servers_full_upgraded = 0;

        while(servers_full_upgraded != p_servers_count){
            
            for(let i = 0; i < p_servers_count; i++) {

                let server = ns.getServer(p_servers[i]);

                if(server.maxRam !== MAX_SERVER_RAM){

                    let server_name = server.hostname
                    let double_ram  = server.maxRam * 2;
                    let double_current_ram_cost = ns.getPurchasedServerCost(double_ram);

                    if(canAffordPurchase(ns, double_current_ram_cost)){
                        
                        try {
                            deleteServer(ns, server_name)
                        } catch (error) {
                            throw new Error(`Could not delete server ${server_name}`);
                        } finally {
                            let new_server = ns.purchaseServer(server_name, double_ram);
                            if(new_server !== ""){
                                ns.print(`Upgraded ${new_server} to ${ns.nFormat(double_ram*1000000000,  '0.00b')} of 
                                    ${ns.nFormat(MAX_SERVER_RAM*1000000000,  '0.00b')}`
                                );

                                await handleNewServer(ns, new_server);

                            } else {
                                ns.print(`Could not double ram for  ${server_name} something went wrong`);
                            }
                        }
                    }

                } else {
                    // current server is fully upgraded
                    servers_full_upgraded++;
                }
            }

            await ns.sleep(1000) // 1sec

        } // end while
    }
}


/**
 * 
 * @param ns 
 * @param cost - `number` const of the server to be purchased
 * @return true if cost is lte to 75% of players current funds
 */
let canAffordPurchase = (ns:NS, cost:number) => {
    return(
        ns.getPlayer().money * 0.75 >= cost
    )
}

/**
 * 
 * @param ns 
 * @param server_name 
 */
let deleteServer = (ns:NS, server_name:string):boolean => {
    ns.killall(server_name);
    
    return(
        ns.deleteServer(server_name)
    )
}


let handleNewServer = async (ns:NS, _new_server:string) => {
    // copy over hackscript
    ns.print(`Copying hackscript to ${_new_server}`)
    await ns.scp(SCRIPTS.hackScript, _new_server);

    // run hackscript on new server
    ns.print(`Starting all hacks on ${_new_server}`);
    ns.run(SCRIPTS.startHacks, 1, _new_server);
}