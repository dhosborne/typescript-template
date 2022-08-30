import { NS } from "@ns";
interface IServer  {
    name:string;
    serverMaxMoney:number;
    level:number;
    reqOpenPorts:number;
    isHacked:boolean;
    isBackDoored:boolean;
    hasAdminRights:boolean;
    ram: number
}

export class Server implements IServer {
    ns:NS;
    name:string;
    serverMaxMoney:number;
    level:number;
    reqOpenPorts:number;
    isHacked:boolean;
    isBackDoored:boolean = false;
    hasAdminRights:boolean = false;
    ram: number


    constructor(ns:NS, name:string){
        if(typeof name !== 'string') throw new Error(`${name} is not of type string`);
        this.ns = ns; // bring ns into classs
        this.name = name; // string name of the server
        this.serverMaxMoney = ns.getServerMaxMoney(name); // the max amount of money this server can contain
        this.level = ns.getServerRequiredHackingLevel(name); // the min hack level requried to gain admin rights
        this.reqOpenPorts = ns.getServerNumPortsRequired(name); // the min number of ports needed to gain admin rights
        this.isHacked = ns.getServer(name).hasAdminRights; // boolean, is the server hacked
        this.isBackDoored = ns.getServer(name).backdoorInstalled; // boolean, is the backdoor open for this server
        this.ram = ns.getServer(name).maxRam; // get the max ram of this server
    }

    /**@return true if the players hack skill is sufficent and the requried number of ports are open on the server */
    checkHackLevel(){
        return (this.ns.getPlayer().skills.hacking >= this.level)
    }

    checkOpenPorts(){
        if(this.ns.getServer(this.name).openPortCount >= this.reqOpenPorts){
            return true
        }
        
        return false;
    }

    /** Attempt to hack the serer by opening required ports and running nuke
     *  @returns `Boolean` True if hacking server was successful
     */
     hackServer(){
        if(this.checkHackLevel()){ // check if player is able to hack
            this.hackPorts(); // open ports
            if(this.checkOpenPorts()){ // sufficent ports are opened
                if(this.ns.fileExists("NUKE.exe", "home")){
                    this.ns.nuke(this.name);
                    
                    if(this.ns.getServer().hasAdminRights){ // check if the hack worked
                        this.hasAdminRights = true;
                        
                        // backdoor here

                        // update servers.json.txt
                        this.ns.toast(`Server Class: ${this.name} hacked`);
                        this.ns.exec("scrapeServersList.js", 'home'); // update the server list
                        
                        return true;
                    }
                }
            } else{
                this.ns.print(`Unable to open enough ports on ${this.name}: ${this.ns.getServer().openPortCount}:${this.reqOpenPorts} opened.`);
            }

        } else{
            this.ns.print(`Hack level too low for ${this.name}: ${this.level}`);
        }

        return false;
    }

    /**
     * Opens as many ports as possible with current software
     */
    hackPorts(){
        let server = this.ns.getServer(this.name);
        // open ssh port if able
        if (!server.sshPortOpen && this.ns.fileExists("BruteSSH.exe", "home")){
            this.ns.brutessh(this.name);
        }

        // open ftp port if able
        if (!server.ftpPortOpen && this.ns.fileExists("FTPCrack.exe", "home")){
            this.ns.ftpcrack(this.name);
        }

        // open http port if able
        if (!server.httpPortOpen && this.ns.fileExists("HTTPWorm.exe", "home")){
            this.ns.httpworm(this.name);
        }

        // open smtp port if able
        if (!server.smtpPortOpen && this.ns.fileExists("relaySMTP.exe", "home")){
            this.ns.relaysmtp(this.name);
        }

        // open sql port if able
        if (!server.sqlPortOpen && this.ns.fileExists("SQLInject.exe", "home")){
            this.ns.sqlinject(this.name);
        }
    }


    /** @return interger required hacking level for server */
    getLevel(){
        return this.level;
    }

    /** @return string name of Server */
    getName(){
        return this.name;
    }

    /**alias getRamAmount() */
    getRam(){
        return this.getRamAmount();
    }
    /**@return max ram on this server */
    getRamAmount(){
        return this.ram;
    }

    /**
     * Check if player has admin access on this server.
     * @returns `Boolean` True if server reports user has admin rights
     */
    hasRootAccess(){
        this.hasAdminRights = this.ns.getServer(this.name).hasAdminRights;

        return this.hasAdminRights;
    }

    /**Alis for hasRootAccess() method, calls that method */
    isServerHacked(){
        return this.hasRootAccess();
    }    
    /** Prints the name of the server */
    print() {
        this.ns.tprintf("Server name = " + this.name);
    }

    /** @return true if server has money to be hacked */
    serverHasMoney(){
        if (this.serverMaxMoney > 0){
            return true;
        }
        return false;
    }

} // end class Server