import { 
    DARKWEB_SERVER, 
    HACKNET_NODE_PRFX, 
    PURCHASED_SERVER_PRFX,
    OLD_PURCHASED_PREFIX 
} from "/Common/ScriptRegistry";
import { NS } from "/../my_NetscriptDefinitions";
import { Server } from "/Classes/ServerClass";


export async function main(ns: NS): Promise<void> {

    let results:Server[] = sortListByLevel(scanBranch(ns, "home"));
    
    if (results){
        ns.write("servers.json.txt", JSON.stringify(results), "w");
    }


    // sort list of servers by hack level
    function sortListByLevel(list:Server[]){
        for(let i = 0; i < list.length - 1; i++){
            for(let j = (i + 1); j < list.length; j++){
                if (list[j].getLevel() < list[i].getLevel()){
                    let temp = list[i];
                    list[i] = list[j];
                    list[j] = temp;
                }
            }
        }

        return list;
    }
}


/**
 * Creates a list of servers in the game as Server Objects
 * @param ns 
 * @param parent - The root node to be scanned 
 * @param found - list of results from recursive calls
 * @returns `Server[]` list of server objects
 */
let scanBranch = (ns:NS, parent:string, found:Server[]=[]) =>{

    // children of the parent node 
    let nextBranch = ns.scan(parent);

    // The first reference of a node that is not the top will always be
    // back to the parent. Remove it to avoid circular reference.
    if (parent !== "home"){
        nextBranch.shift();
    }

    // arrived at a childless node return the list
    if (nextBranch.length === 0){
        return found;
    }else{

        nextBranch.forEach( (child:string) => {
            
            if(!child.includes(PURCHASED_SERVER_PRFX) &&
                !child.includes(OLD_PURCHASED_PREFIX) && 
                !child.includes(HACKNET_NODE_PRFX) &&
                !child.includes(DARKWEB_SERVER)){ // don't scan owned nodes
                found.push(new Server(ns, child));
                return scanBranch(ns, child, found);
            }
            return;

        });
        return found;          
    }
}