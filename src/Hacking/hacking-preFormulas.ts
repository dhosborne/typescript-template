import { NS } from "@ns";
import { SCRIPTS } from "/Common/ScriptRegistry";

const TRAVEL_COST = 200_000;


export async function main(ns: NS): Promise<void> {
    ns.disableLog('sleep');
    // start cracking servers
    ns.run(SCRIPTS.serverCracker);
    
    // run hacknodes scripts
    ns.run(SCRIPTS.hackNodesUpgrade);
    ns.run(SCRIPTS.hackNodeHashSpend);

    // run purchaseServers script
    ns.run(SCRIPTS.purchaseServers);

    ns.run(SCRIPTS.sleeves);

    ns.run(SCRIPTS.contracts);

    // start gang scripts
    if(ns.gang.inGang()){
        ns.run(SCRIPTS.gangLeader);
    }else{
        ns.tprintf(`Player not in a gang. Skipping gang scripts`);
    }


    // start BladeBurner scripts
    if(ns.getPlayer().inBladeburner){
        ns.run(SCRIPTS.bladeBurner);
    } else {
        ns.tprintf(`Player is not in bladeburners yet. Skipping scripts.`);
    }

    // start stock trader
    if(ns.stock.hasTIXAPIAccess()){
        ns.run(SCRIPTS.stocks);
    }

    // run casino cheat if we have enough money to go to Aevum
    if(ns.getPlayer().money > 200_000) {
        ns.run(SCRIPTS.casinoCheat);
    } else {
        ns.tprintf(`Player does not have ${TRAVEL_COST} to travel to Aevum`)
    }

    


}