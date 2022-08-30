import { NS } from "@ns";

export const MIN_FUNDS = 1.0e+6;
export const DEFAULT_WH_CAPACITY = 2000;

export const DEFAULT_MAX_PRODUCTS = 3;
export const MIN_WH_UPGRADES = 5;
export const MAX_EMPLOYEES = 300;
export const CORPORATION_NAME = 'Tesser-Ashpool'
export const PROD_PREFIX = 'V'

export const CITIES = [
    "Aevum", 
    "Chongqing", 
    "Sector-12", 
    "New Tokyo", 
    "Ishima", 
    "Volhaven"
]
export const INDUSTRY_TYPES = {
    // Energy: "Energy",
    // Utilities: "Water Utilities",
    Agriculture: "Agriculture",
    // Fishing: "Fishing",
    // Mining: "Mining",
    Food: "Food",
    Tobacco: "Tobacco",
    // Chemical: "Chemical",
    // Pharmaceutical: "Pharmaceutical",
    // Computer: "Computer Hardware",
    // Robotics: "Robotics",
    // Software: "Software",
    // Healthcare: "Healthcare",
    // RealEstate: "RealEstate",
}

export const DIVISION_NAMES = {
    Agriculture: 'ConAg',
    Tobacco: 'RichmondCo',
    // Chemical: 'OxyChemical',
    // Computer: 'Microtek',
    // Energy: 'Zeus-Electricity',
    // Fishing: 'Seamen\'s-Dream',
    Food: 'Stuffers-Shack',
    // HealthCare: 'Doc-Wagon',
    // Pharmaceutical: 'Tri-Helix',
    // Robotics: 'General Atomics',
    // RealEstate: 'Landbarger',
    // Utilities: 'Prometheus',
    // Software: 'SimSense',
    // Mining: 'Kennicot'
}

export const PRODUCT_PREFIX = {
    Food: "StuffersShackV",
    Tobacco: "CoffinNailsV",
    Pharmaceutical: "StimPackV",
    Computer: "OsborneV",
    Robotics: "DroneV",
    Software: "SimSenseV",
    Healthcare: "MembershipV",
    RealEstate: "DevelopmentV",
}

export const MATERIALS = [
    "Water",
    "Energy",
    "Food",
    "Plants",
    "Metal",
    "Hardware",
    "Chemicals",
    "Drugs",
    "Robots",
    "AI Cores",
    "Real Estate",
]

export const DIVSION_PROD_MATERIALS = {
    Agriculture: ['Food', 'Plants']
}

const materialSizes = {
    "Water":0.05,
    "Energy":0.01,
    "Food":0.03,
    "Plants":0.05,
    "Metal":0.1,
    "Hardware":0.06,
    "Chemicals":0.05,
    "Drugs":0.02,
    "Robots":0.5,
    "AI Cores":0.1,
    "Real Estate":0.005,
  }

export const CORP_UNLOCKS = {
    SmartSupply: "Smart Supply",
    ShadyAccounting: "Shady Accounting",
    GovtPartnership: "Government Partnership",
    WarehouseAPI: "Warehouse API",
    OfficeAPI: "Office API"
}

export const CORP_UPGRADES = {
    SmartFactories: "Smart Factories",
    SmartStorage: "Smart Storage",
    DreamSense: "DreamSense",
    WilsonAnalytics: "Wilson Analytics",
    NNII: "Nuoptimal Nootropic Injector Implants",
    SpeechProcessor: "Speech Processor Implants",
    NeuralAcc: "Neural Accelerators",
    FocusWires: "FocusWires",
    SalesBots: "ABC SalesBots",
    ProjectInsight: "Project Insight",
}

export const JOB_TYPE = {
    operations: "Operations",
    engineer: "Engineer",
    business: "Business",
    management: "Management",
    development: "Research & Development"
}

export const RESEARCH_NAMES = {
    lab: "Hi-Tech R&D Laboratory",
    MTA1: "Market-TA.I",
    MTA2: "Market-TA.II",
    Drones: 'Drones',
    Assembly: 'Drones - Assembly',
    Overclock: 'Overclock',
    Transport: 'Drones - Transport',
    fulcrum: "uPgrade: Fulcrum",
    cap1: "uPgrade: Capacity.I",
    cap2: "uPgrade: Capacity.II",
    SCA: 'Self-Correcting Assemblers'

}

export const SCRIPT_NAMES = {
    hr: '/Corp/corp-hr.js',
    aquisitions: '/Corp/corp-aquisitions.js'
}


/**
 * @param {NS} ns
 * @param {String} divisionName 
 * @returns true if division name is already in use
 */
export let checkIfDivisionExists = (ns:NS, divisionName:string) => {
    return ns.corporation.getCorporation().divisions.find(div => div.name === divisionName);
}


/**
 *  Waits until the corporation has the desired amount of funds
 * @param {import("..").NS} ns 
 * @param {Double} amount 
 * @returns void
 */
export async function waitForFunds(ns, amount) {
    ns.print(`Waiting for ${ns.corporation.getCorporation().name} to accrue ${ns.nFormat(amount, '$00.0a')}`)
    while(true) {
        const funds = ns.corporation.getCorporation().funds - MIN_FUNDS;
        if(funds > amount){
            return;
        }
        await ns.sleep(2000); // 2sec
    }        
}

/**
 * Checks if company has already purchased industry
 * @param {import("..").NS} ns 
 * @param {String} industry 
 * @returns Boolean true if industry is already purchased
 */
export function checkIfIndustryPurchased(ns, industry) {
let allIndustries = ns.corporation.getCorporation().divisions.map(division=>division.type);

return allIndustries.includes(industry);
}


export let getUnlock = (ns, unlockName) => {
    if(!checkForUnlock(ns, unlockName)){
        if(ns.corporation.getCorporation().funds >= ns.corporation.getUnlockUpgradeCost(unlockName)){
            ns.corporation.unlockUpgrade(unlockName);
            
            if(checkForUnlock(ns, unlockName)){
                return true;
            }

        } else {
            ns.alert(`You do not have and cannot afford the ${unlockName}`);
        }
    }

    return false;
}

/**
 * 
 * @param {import("..").NS} ns 
 * @param {*} unlockName 
 * @returns 
 */
export let checkForUnlock = (ns, unlockName) => {
    return(
        ns.corporation.hasUnlockUpgrade(unlockName)
    )
}


/**
 * 
 * @param {import("..").NS} ns  
 */
export let checkFunds = (ns) => {
    return(
        ns.corporation.getCorporation().funds
    )
}