import { NS } from "@ns";
import { LOCAL_HOST, SCRIPTS } from "/Common/ScriptRegistry";
import { Server } from "/Classes/ServerClass";
import { getHackedServers } from "/Common/utilities";




export async function main(ns:NS):Promise<void>{
    const hackScriptCost = ns.getScriptRam(SCRIPTS.hackScript);
    const growScriptCost = ns.getScriptRam(SCRIPTS.growScript);
    const weakenScriptCost = ns.getScriptRam(SCRIPTS.weakenScript);

    

    if(!ns.args[0] || typeof ns.args[0] !== 'string'){
        throw new Error(`This script requires a single server name argument. Recieved ${ns?.args[0] || undefined}`)
    }

    const server_name = ns.args[0];
    
    if(!ns.serverExists(server_name)){
        throw new Error(`No server with the name ${server_name} exists.`);
    }


    // get a list of hacked servers
    let hackedServers = getHackedServers(ns);
    

}


let readServers = (ns:NS):Server[] => [

]