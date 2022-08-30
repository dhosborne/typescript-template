import { NS } from "@ns";
import { SCRIPTS } from "/Common/ScriptRegistry";
const UPGRADES = {
    cash:'Sell for Money',
    bladeSP:'Exchange for Bladeburner SP'
};

export async function main(ns:NS): Promise<void> {
    ns.disableLog('sleep');
    
    while(true){
        if(ns.hacknet.numHashes() > ns.hacknet.hashCost(UPGRADES.cash)){
            ns.run(SCRIPTS.spendHashes, 1, UPGRADES.cash)
        }

        await ns.sleep(1000) // 1 sec
    }
}