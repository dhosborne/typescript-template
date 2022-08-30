import { GangGenInfo, GangOtherInfo, GangOtherInfoObject, NS } from "@ns";

const JOB_TYPES = {
    training: 'Train Combat',
    justice: 'Vigilante Justice',
    terrorism: 'Terrorism',
    war: 'Territory Warfare',
    work: 'Human Trafficking'
}

const RECURUITER_SCIRPT = '/Gang/gang-recruiter.js';
const SGT_AT_ARMS_SCRIPT = '/Gang/gang-equip.js'
const ASCEND_THRESHOLD = 1.25;
const WANTED_LVL = 200; // 25%
const MAX_GANG_MEMBERS = 12;


export async function main(ns:NS): Promise<void> {
    ns.disableLog('sleep');

    ns.run(RECURUITER_SCIRPT)
    ns.run(SGT_AT_ARMS_SCRIPT)
    
    const gf = ns.gang;
    let gang = ns.gang.getMemberNames();

    let otherGangsInfo:GangOtherInfo = gf.getOtherGangInformation();

    if(gf.inGang()){

        while(true) {
            ascendMembers(ns, ASCEND_THRESHOLD);


            if(isChanceToWinClashes(ns) && !gf.getGangInformation().territoryWarfareEngaged) {
                ns.print(`Chances against all factions > 50% engaging in Territory Warfare`)
                ns.gang.setTerritoryWarfare(true);
            }




            let gangInfo = gf.getGangInformation();

            // check if wanted level is too high and lower it
            if(gangInfo.wantedLevel > WANTED_LVL) {
                ns.print(`Wanted level too high. Switching to vigilantie justice`);
                gang.forEach( member => {
                    gf.setMemberTask(member, JOB_TYPES.justice);                
                });

                while(gf.getGangInformation().wantedLevel > 5){
                    await ns.sleep(100) // .1min
                }
            }



            
            // if 100% of territory belongs to gang start making money
            if(gangInfo.territory === 1){
                gang.forEach(memeber =>{
                    gf.setMemberTask(memeber, JOB_TYPES.work);
                })
            }
            
        


            // 
            if(detectTerritoryTick(ns, otherGangsInfo) 
                && ns.gang.getGangInformation().territory < 1
                && gf.getMemberNames().length !== MAX_GANG_MEMBERS) {
                await ns.sleep(1000 * 18) // 18sec

                gang.forEach(member =>{
                    let stats = gf.getMemberInformation(member);

                    if(stats.def > 600) {
                        gf.setMemberTask(member, JOB_TYPES.war);
                    }
                });

                await ns.sleep(1000 * 2) // 2 sec

                gang.forEach(member => {
                    let stats = gf.getMemberInformation(member);

                    if(stats.def > 600){
                        gf.setMemberTask(member, JOB_TYPES.terrorism);
                    } else {
                        gf.setMemberTask(member, JOB_TYPES.training)
                    }
                })
            }

            await ns.sleep(1000) // 1 sec
        }
    } else {
        ns.tprintf(`You're not in a gang loser`);
    }
}

/**
 * Iterates over memebers and ascends memebers whose stat increases
 * meet the threshold requirements.
 * 
 * @param {NS} ns 
 * @param {number} threshold 
 */
 let ascendMembers = (ns:NS, threshold:number) => {
    let gang = ns.gang.getMemberNames();

    gang.forEach(member => {
        let potential = ns.gang.getAscensionResult(member);

        if(typeof(potential) !== 'undefined')
        {
            if( potential.str > threshold &&
                potential.def > threshold &&
                potential.dex > threshold){
                    ns.toast(`Ascending ${member}`);
                    ns.gang.ascendMember(member);
                }
        }
    });    
}

/**
 * 
 * @param {NS} ns 
 */
 let isChanceToWinClashes = (ns:NS) => {
    let otherGangsInfo = ns.gang.getOtherGangInformation()
    let couldWin = false;

    Object.entries(otherGangsInfo).forEach(([key, value]) => {
        if(ns.gang.getGangInformation().faction !== key &&
            value.territory > 0){
            couldWin = ns.gang.getChanceToWinClash(key) > 0.5;
        }
    })

    return couldWin;
}
 
/**
 * 
 * @param {NS} ns
 */
let detectTerritoryTick = (ns:NS, otherGangsInfoPrevCycle:GangOtherInfo) => {
    let otherGangsInfo = ns.gang.getOtherGangInformation();
    let newTick = false;
    for(let i = 0; i < Object.keys(otherGangsInfo).length; i++){
        const gangName = Object.keys(otherGangsInfo)[i];
        let gi = Object.values(otherGangsInfo)[i];
        let ogi = otherGangsInfoPrevCycle ? Object.values(otherGangsInfoPrevCycle)[i] : gi;
        let powerChanged = gi.power != ogi.power;
        let territoryChanged = gi.territory != ogi.territory;
        newTick = powerChanged || territoryChanged;
    }

    if (newTick) {
        return true;
    }
    return false;
}