import { NS } from '@ns';

const UPGRADES = {
    cash:'Sell for Money',
    bladeSP:'Exchange for Bladeburner SP'
};

export async function main(ns: NS): Promise<Boolean> {
    const hnf = ns.hacknet;

    if(ns.args.length < 1){
        ns.tprintf(`Spend hashes requires an activity argument (i.e., 'cashOut')`)
        ns.exit();
    }
    let max;
    switch(ns.args[0]){
        case UPGRADES.cash:
            max = calculateMaxPurchasePower(ns, UPGRADES.cash);
            return (makePurchase(ns, UPGRADES.cash, 'home', max))
        case UPGRADES.bladeSP:
            max = calculateMaxPurchasePower(ns, UPGRADES.bladeSP);
            return(makePurchase(ns, UPGRADES.bladeSP, 'home', max));
        default:
            ns.tprintf(`${ns.args[0]} upgrade does not exist`);
            return false;
    }

    
}
/**
 * Calculates the max number of an item that can be purchased with hashes
 * 
 * @param ns 
 * @param _item - string of upgrade to be purchaseds
 * @returns max number of upgrades that can be purchased
 */
let calculateMaxPurchasePower = (ns:NS, _item:string) => {

    let hashes = ns.hacknet.numHashes();
    let costForOne = ns.hacknet.hashCost(_item);
    
    return(Math.floor(hashes / costForOne));
}

/**
 * Attempt to make a purchase with hashes
 * @param ns 
 * @param _item - item to be purchased with hashes
 * @param _target - target of the purchase, defaults to `Home` if not supplied
 * @param _count - number of specified items to be purchased, defaults to 1
 * @returns true if the purchase was successful, otherwise false
 */
let makePurchase = (ns:NS, _item:string, _target:string = 'home', _count:number = 1) => {
    
    return(ns.hacknet.spendHashes(_item, _target, _count))
}