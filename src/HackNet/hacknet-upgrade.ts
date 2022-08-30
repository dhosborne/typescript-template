import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
    ns.disableLog('sleep')
    const MAX_NODES = ns.hacknet.maxNumNodes();
    const LRC_ARRAY = ['Level', 'Ram', 'Core']
    const hnf = ns.hacknet;

    while(true){
        
        let node_count = hnf.numNodes();
               

        // check can afford new node. Checkingn before max hashcount because
        // new nodes add capacity
        while(canAffordNewNode(ns) && node_count < MAX_NODES){
            if(hnf.purchaseNode() > -1){
                ns.print(`Hacknet node purchased`);
                node_count++;
            }

            await ns.sleep(1000) // 1sec
        }

        // if after buying new node hash capacity is full, expand capacity
        if(atHashCapacity(ns)) {
            const upgrade = 'Cache';
            for(let i = 0; i < node_count; i++) {
                if(canAffordUpgrade(ns, i, upgrade)) {
                    if(purchaseUpgrade(ns, i, upgrade)){
                        ns.print(`Purchased ${upgrade} for Hacknet-node-${i}`)
                    }
                }
            }
        }
        


        // iterate nodes
        for(let i = 0; i < node_count; i++){
            // find the most advantageous upgrade. Need Forumlas.exes

            // find any upgrade and buy it
            LRC_ARRAY.forEach(upgrade => {
                if(canAffordUpgrade(ns, i, upgrade)){
                    if(purchaseUpgrade(ns, i, upgrade)){
                        ns.print(`Purchased ${upgrade} for Hacknet-Node-${i}`)
                    }
                }
            });
        }

        await ns.sleep(1000) // 1 secs
    
    } // end while
    
}

/**
 * 
 * @param ns 
 * @returns true if at hash storage capacity, false otherwise
 */
let atHashCapacity = (ns: NS) => {
    let capacity = ns.hacknet.hashCapacity();
    
    return(ns.hacknet.numHashes() === capacity);
}


/**
 * Checks if player can afford to purchase a new Hacknet Node
 * 
 * @param ns 
 * @returns true if player can afford upgradel, false otherwise
 */
let canAffordNewNode = (ns:NS) => {
    let upgradeCost = ns.hacknet.getPurchaseNodeCost();

    return (
        ns.getPlayer().money >= upgradeCost
    )
}



/**
 * 
 * @param ns 
 * @param _index - Hacknet node to be upgraeded 
 * @param _upgrade - the string name of the the upgrade to be purchased
 * @param _count - the number of times to purchase the specified upgrade
 * @returns true if the purchase was successful, false otherwise
 */
let canAffordUpgrade = (ns:NS, _index:number, _upgrade:string, _count:number = 1) => {
    let upgrade_cost;
    const hnf = ns.hacknet;

    switch (_upgrade){

        case 'Level':
            upgrade_cost = hnf.getLevelUpgradeCost(_index, _count);
            break;

        case 'Ram':
            upgrade_cost = hnf.getRamUpgradeCost(_index, _count);
            break;
        
        case 'Core':
            upgrade_cost = hnf.getCoreUpgradeCost(_index, _count);
            break;
        case 'Cache':
            upgrade_cost = hnf.getCacheUpgradeCost(_index, _count);
            break;

        default:
            ns.print(`${_upgrade} upgrade does not exist`);
            return false;
    }
    
    return(
        ns.getPlayer().money > upgrade_cost
    )
}


/**
 * 
 * @param ns 
 * @param _index - Hacknet node to be upgraded 
 * @param _upgrade - the name of the upgrade to be purchased
 * @param _count - number of times to purchase the upgrade
 * @returns - true if the purchase was successful, false otherwise
 */
let purchaseUpgrade = (ns: NS, _index:number, _upgrade:string, _count:number = 1) => {
    const hnf = ns.hacknet;

    switch (_upgrade){
        case 'Level':
            return (hnf.upgradeLevel(_index, _count))

        case 'Ram':
            return(hnf.upgradeRam(_index, _count))
        
        case 'Core':
            return (hnf.upgradeCore(_index, _count))
        
        case 'Cache':
            return(hnf.upgradeCache(_index, _count))
        
        default:
            ns.print(`${_upgrade} upgrade does not exist`);
            return false;
    }
}