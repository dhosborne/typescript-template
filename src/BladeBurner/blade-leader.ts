import { NS } from "@ns";

const ACTION_TYPES = {
    general: 'General',
    contract:'Contract',
    ops: 'Operation',
    blackOps: 'Blackops'
};

const CONTRACT_TYPES = [
    'Tracking',
    'Bounty Hunter',
    'Retirement'
];

const OPERATION_TYPES = [
    'Investigation',
    'Undercover Operation',
    'Sting Operation',
    'Raid',
    'Stealth Retirement Operation',
    'Assassination'
];

const GENERAL_TYPES = {
    chamber: 'Hyperbolic Regeneration Chamber',
    diplomacy: 'Diplomacy',
    training: 'Training',
    violence: 'Incite Violence'
}

const SKILLS_SCRIPT = '/BladeBurner/blade-skills.js';

export async function main(ns:NS): Promise<void> {
    ns.disableLog('sleep');
    ns.run(SKILLS_SCRIPT);

    const bbf = ns.bladeburner;

    while(true){
        let foundWork = false;
        let riskTooHigh = true;
        let needsToRest = false;

        
        if(isAbleToWork(ns)){
            
            // check for black ops
            let blackOps:string[] = bbf.getBlackOpNames().filter(op =>
                bbf.getActionCountRemaining(ACTION_TYPES.blackOps, op) > 0
            )

            if(blackOps.length > 0) {
                ns.print(`Checking for BlackOps`)
                
                for(let i = 0; i < blackOps.length; i++) {
                    
                    if(readyForBlackOp(ns, blackOps[i])){
                        if(bbf.startAction(ACTION_TYPES.blackOps, blackOps[i])){
                            foundWork = true;
                            await awaitCompletion(ns, ACTION_TYPES.blackOps, blackOps[i]);
                        }
                    } else {
                        ns.print(`Player is not ready for any black ops at this time.`)
                    }
                }
                

            }


            // check for operations
            if(anyOperationsAvailable(ns) && !needsToRest){
                
                if(isAbleToWork(ns)){
                    ns.print(`Checking for available ${ACTION_TYPES.ops}`)
                    for(let i = OPERATION_TYPES.length - 1; i > 0; i--){
                        
                        if(evaluateRisk(ns, ACTION_TYPES.ops, OPERATION_TYPES[i])){
                            riskTooHigh = false;
                            
                            if(bbf.startAction(ACTION_TYPES.ops, OPERATION_TYPES[i])){
                                foundWork = true;
                                await awaitCompletion(ns, ACTION_TYPES.ops, OPERATION_TYPES[i])
                            }
                        } else {
                            riskTooHigh = true;
                            ns.print(`All ${ACTION_TYPES.ops}s too risky.`)
                        }
                    }

                } else {
                    needsToRest = true;
                    ns.print(`Player needs to rest`);
                }
            }


            if(anyContractsAvailable(ns) && !needsToRest){

                if(isAbleToWork(ns)) {
                    ns.print(`Checking for ${ACTION_TYPES.contract}`)

                    for(let i = CONTRACT_TYPES.length - 1; i > 0; i--){
                        
                        if(evaluateRisk(ns, ACTION_TYPES.contract, CONTRACT_TYPES[i])){
                            riskTooHigh = false;

                            if(actionIsAvailable(ns, ACTION_TYPES.contract, CONTRACT_TYPES[i])) {
                                foundWork = true;
                                await awaitCompletion(ns, ACTION_TYPES.contract, OPERATION_TYPES[i]);
                            }
                        } else {
                            ns.print(`All ${ACTION_TYPES.contract}s too risky.`);
                        }
                    }

                } else {
                    needsToRest = true;
                    ns.print(`Player needs to rest`);
                }
            }


            // could not work because injured or low stamina
            if(needsToRest){
                await restPlayer(ns);
            }

            // could not find work because risk was too high
            if(!foundWork && riskTooHigh){
                ns.print(`Could not find work with acceptable risk. Reducing risk by half`);
                const city = bbf.getCity();
                const startChaos = bbf.getCityChaos(city);
                let endChaos = Math.floor(startChaos * 0.5);

                if(endChaos > 1){
                    bbf.startAction(ACTION_TYPES.general, GENERAL_TYPES.diplomacy);

                    while(bbf.getCityChaos(city) > endChaos) {
                        await ns.sleep(1000) // 1 sec
                    }
                } else {
                    ns.print(`Risk is low. Training to raise stats`)
                    bbf.startAction(ACTION_TYPES.general, GENERAL_TYPES.training);

                    await ns.sleep(1000 * 300) // 5 minutes
                }
                
            } else if (!foundWork && !riskTooHigh) { 
                ns.print(`Risk is acceptable but there is no work available. Inciting violence to generate work`)
                // no work found, scare some up
                bbf.startAction(ACTION_TYPES.general, GENERAL_TYPES.violence);

                await ns.sleep(1000 * 120) // 2 minutes
            }

        }

        await ns.sleep(1000); // 1 sec
    } // end while
}

/**
 * Checks to see if bb stamina is gte 66% and hp gte 20%
 * @param  ns
 * @return {Boolean} - true if current stamina gte 55% total stamina
 */
let isAbleToWork = (ns:NS): boolean => {
    let stamina = ns.bladeburner.getStamina();
    let health = ns.getPlayer().hp;
    return(stamina[0] >= (stamina[1] * 0.55) || health.current >= health.max * 0.2 );
}

/**
 * Checks if player HP and BB Stamina are 100%
 * @param {import("..").NS} ns 
 * @returns {Boolean} true if health and stamina are full, false otherwise
 */
let isReadyToWork = (ns:NS): boolean => {
    let stamina = ns.bladeburner.getStamina();
    let health = ns.getPlayer().hp;
    // true if 100% stamina and full hp
    return (stamina[0] === stamina[1] && health.current === health.max);
}

/**
 *  Checks if there are any contracts available
 *  @param {import("..").NS} ns
 *  @return - true if any contracts of any type are available
 */
let anyContractsAvailable = (ns:NS):boolean => {
    let contracts = ns.bladeburner.getContractNames();
    return (
        contracts.some(contract => {
            return ns.bladeburner.getActionCountRemaining(ACTION_TYPES.contract, contract) > 0;
        })
    )
}

/**
 *  checks if there are any operations available
 *  @param {import("..").NS} ns  
 */
let anyOperationsAvailable = (ns:NS):boolean => {
    let operations = ns.bladeburner.getOperationNames();
    return (
        operations.some(operation => {
            return ns.bladeburner.getActionCountRemaining(ACTION_TYPES.ops, operation) > 0;
        })
    )
}


/**
 *  Checks the count of a given action
 *  @param ns  
 *  @return true if the count of the action is gt 0
 */
let actionIsAvailable = (ns:NS, type:string, name:string):boolean => {
    return (
        ns.bladeburner.getActionCountRemaining(type, name) > 0
    )
}


/**
 * 
 * @param ns 
 * @param {string} type 
 * @param {string} action 
 */
let awaitCompletion = async (ns:NS, type:string, action:string) => {
    if(typeof action !== 'string' || typeof type !== 'string') {
        throw new Error(`Action ${action} or type ${type} is not of type string`)
    }

    await ns.sleep(ns.bladeburner.getActionTime(type, action));
}


/**
 * Check that estimated success chance is gte 55% for the given task
 * 
 * @param ns
 * @param {String} type - type of action
 * @param {String} task - name of the task to be evaluated
 * @return true if chance of success lower end is greater than 90%
 */
let evaluateRisk = (ns:NS, type:string, task:string): boolean => {
    if(typeof task !== 'string') throw new Error(`Task '${task}' is not of type string`);
    return (ns.bladeburner.getActionEstimatedSuccessChance(type, task)[0] >= 0.55);
}



let restPlayer = async (ns:NS) => {
    let health = ns.getPlayer().hp;
    let stam = ns.bladeburner.getStamina();

    // if healt is less than 25% or stamina is less than half the max, enter HRC and stay until both are max
    if(health.current < health.max * 0.25 || stam[0] < (stam[1] *  0.5)){
        ns.bladeburner.startAction(ACTION_TYPES.general, GENERAL_TYPES.chamber);
        
        while(!isReadyToWork(ns)) {
            await ns.sleep(1000) // 1 sec
        }
    }    
}



/**
 * Check if player rank, and success chance gte 90% on the low end.
 * @param ns 
 * @return {boolean} true if player level is sufficent and chance of success > 50%
 */
let readyForBlackOp = (ns:NS, op:string): boolean => {
 
    return ( 
        ns.bladeburner.getBlackOpRank(op) <= ns.bladeburner.getRank() &&
        ns.bladeburner.getActionEstimatedSuccessChance(ACTION_TYPES.blackOps, op)[0] >= 0.5
    )
}