import { NS } from "@ns";
import { SCRIPTS, SERVER_LIST, LOCAL_HOST } from "./ScriptRegistry";
import { Server } from "/Classes/ServerClass";

export let awaitPlayerFunds = async (ns:NS, _target:number):Promise<void> =>{
    
    while(ns.getPlayer().money < _target){
        ns.print(`Waiting for player to accumulate funds ${ns.getPlayer().money}/${_target}`);
        await ns.sleep(1000);
    }
}




export let calculateThreads = (ns:NS, hostName:string, totalScriptsRam:number, percentage=1) =>{
    let threads = 0;

    // get specified percentage of server available ram
    let memoryAvalableOnHost = (ns.getServerMaxRam(hostName) - ns.getServerUsedRam(hostName)) * percentage;
    

    // the number of threads that can be dedicated to each instance of the script
    threads = Math.floor(memoryAvalableOnHost/(totalScriptsRam));
    
    // threads must be greater than zero
    if(threads < 1){
        threads = 1;
    }

    //ns.tprint(`HostName: ${hostName}, MemoryAvailable: ${memoryAvalableOnHost}, TotalServerCost(Ram): ${totalScriptsRam}, Threads per script: ${threads} `);

    return threads; 
}




export let getHackedServers = (ns:NS) => {
    let serverList = readServers(ns);

    return(
        serverList.filter(x => x.isHacked === true)
    )
}




export let readServers = (ns:NS):Server[] => {
    let serverList:Server[] = []
    
    if(ns.fileExists(SERVER_LIST, LOCAL_HOST)){
        let servers = JSON.parse(ns.read(SERVER_LIST));

        for(let i = 0; i < servers.length; i++){
            servers.push(new Server(ns, servers[i].name))
        }

        ns.tprintf(`Read ${servers.length} from ${SERVER_LIST}`);
        
    } else {
        throw new Error(`${SERVER_LIST} not found on ${LOCAL_HOST}`);
    }

    return serverList;
}



export let runScraper = (ns:NS) => {
    // call scraper to complie a list of server names
    if(ns.fileExists(SCRIPTS.scraper, LOCAL_HOST)){
        ns.run(SCRIPTS.scraper);
    } else {
        throw new Error(`${SCRIPTS.scraper} does not exist on home. Try again`);
    }    
}


