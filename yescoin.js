const {readfiledata,readquerydata,readproxydata,readtokendata,savetokendata,httpsapi,cmdtitle,sleep,waiting,countdown,nowlog,fNumber,readbotdata} = require('./aapi_request.js')
const proxyfile = 'proxy.txt'
const proxylist = readfiledata(proxyfile)

const botname = "YESCOIN"
const {queryfile,tokenfile}  = readbotdata(botname)
const queryids = readfiledata(queryfile)

class BOT{
    constructor(){
        this.maxLevel = 10;
        this.headers = {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "Referer": "https://www.yescoin.gold/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            'sec-ch-ua': '"Microsoft Edge";v="125", "Chromium";v="125", "Not.A/Brand";v="24", "Microsoft Edge WebView2";v="125"',
            'sec-Ch-Ua-Mobile': '?1',
            'sec-Ch-Ua-Platform': '"iOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        }
    }
    async login(callHeaders,proxy,queryid,user) {
        const url = 'https://api-backend.yescoin.gold/user/login';
        const payload = {code: decodeURIComponent(queryid)}
        try{
            const response = await httpsapi("POST",url,callHeaders,proxy,payload); 
            nowlog("Get New Refresh Successfull!",'success');
            savetokendata(tokenfile,user.id,response.data.data.token)
            return response.data.data.token;
        }catch(error){
            nowlog(`Error to Get New Token!, ${error.message}`,'error');
            return null
        }
    }
    async collectCoin(callHeaders,proxy,amount) {
        const url = 'https://api-backend.yescoin.gold/game/collectCoin';
        try{
            const response = await httpsapi("POST",url,callHeaders,proxy,amount);
            nowlog(`Collect Coins Success!`,'success');
            return response.data.data
        }catch(error){
            nowlog(`Error Collect Coins! ${error.message}`,'error');
            return null
        }
    }
    async getAccountInfo(callHeaders,proxy) {
        const url = 'https://api-backend.yescoin.gold/account/getAccountInfo';
        try{
            const response = await httpsapi("GET",url,callHeaders,proxy);
            return response.data
        }catch(error){
            nowlog(`Error Get User Data!, ${error.message}`,'error');
            return null
        }
    }
    async getGameInfo(callHeaders,proxy) {
        const url = 'https://api-backend.yescoin.gold/game/getGameInfo';
        try{
            const response = await httpsapi("GET",url,callHeaders,proxy);
            return response.data.data
        }catch(error){
            nowlog(`Error Get Game Data!, ${error.message}`,'error');
            return false
        }
    }
    async joinTribe(callHeaders,proxy,tribeId) {
        const url = `https:///tribe-domain.blum.codes/api/v1/tribe/${tribeId}/join`;
        try{
            await httpsapi("POST",url,callHeaders,proxy);
            nowlog(`Join Tribe Success!`,'success');
            return true
        }catch(error){
            nowlog(`Error Joined Tribe!, ${error.message}`,'warning');
            return false
        }
    } 
    async useSpecialBox(callHeaders,proxy){
        const url = 'https://api-backend.yescoin.gold/game/recoverSpecialBox';
        try{
            const response = await httpsapi("POST",url,callHeaders,proxy);
            if (response.data.code === 0) {
                nowlog('Open Chest...', 'success');
                return true;
            } else {
                nowlog('False Chest!', 'error');
                return false;
            }
        }catch(error){
            nowlog(`Error Open Chest!, ${error.message}`,'error');
            return false
        }
    }
    async getSpecialBox(callHeaders,proxy) {
        const url = 'https://api-backend.yescoin.gold/game/getSpecialBoxInfo';
        try{
            const response = await httpsapi("GET",url,callHeaders,proxy);
            return response.data
        }catch(error){
            nowlog(`Error Get Chest!, ${error.message}`,'error');
            return null
        }
    }
    async getuser(callHeaders,proxy) {
        const url = 'https://api-backend.yescoin.gold/account/getRankingList?index=1&pageSize=1&rankType=1&userLevel=1';
        try{
            const response = await httpsapi("GET",url,callHeaders,proxy);
            return response.data;
        }catch(error){
            nowlog(`Error Get User!, ${error.message}`,'error');
            return null
        }
    }
    async collectFromSpecialBox(callHeaders, proxy, boxType, coinCount) {
        const url = 'https://api-backend.yescoin.gold/game/collectSpecialBoxCoin';
        const payload = { boxType, coinCount };
        try{
            const response = await httpsapi("POST",url,callHeaders,proxy,payload);
            if (response.data.code === 0) {
                if (response.data.data.collectStatus) {
                    nowlog(`Open Chest Claim ${response.data.data.collectAmount} Coins`, 'success');
                    return { success: true, collectedAmount: response.data.data.collectAmount };
                } else {
                    nowlog('Empty Chest! Waiting Next Round...', 'warning');
                    return { success: true, collectedAmount: 0 };
                }
            } else {
                return { success: false, collectedAmount: 0 };
            }
        } catch (error) {
            return { success: false, collectedAmount: 0 };
        }
    }
    async attemptCollectSpecialBox(callHeaders, proxy, boxType, initialCoinCount) {
        let coinCount = initialCoinCount;
        while (coinCount > 0) {
            const result = await this.collectFromSpecialBox(callHeaders, proxy, boxType, coinCount);
            if (result.success) {
                return result.collectedAmount;
            }
            coinCount -= 20;
            await sleep(2)
        }
        return 0;
    }
    async getAccountBuildInfo(callHeaders,proxy) {
        const url = 'https://api-backend.yescoin.gold/build/getAccountBuildInfo';
        try{
            const response = await httpsapi("GET",url,callHeaders,proxy);
            return response.data.data;
        }catch(error){
            nowlog(`Error Get User!, ${error.message}`,'error');
            return false;
        }
    }
    async getSquadInfo(callHeaders,proxy) {
        const url = 'https://api-backend.yescoin.gold/squad/mySquad';
        try{
            const response = await httpsapi("GET",url,callHeaders,proxy);
            return response.data;
        }catch(error){
            nowlog(`Error Get User!, ${error.message}`,'error');
            return false;
        }
    }
    async joinSquad(callHeaders,proxy,squadLink) {
        const url = 'https://api-backend.yescoin.gold/squad/joinSquad';
        const payload = { squadTgLink: squadLink };
        try{
            const response = await httpsapi("GET",url,callHeaders,proxy,payload);
            return response.data;
        }catch(error){
            nowlog(`Error Get User!, ${error.message}`,'error');
            return false;
        }
    }
    async getTaskList(callHeaders,proxy) {
        const url = 'https://api-backend.yescoin.gold/task/getTaskList';
        try{
            const response = await httpsapi("GET",url,callHeaders,proxy);
            return response.data.data.taskList;
        }catch(error){
            nowlog(`Error Get User!, ${error.message}`,'error');
            return false;
        }
    }
    async finishTask(callHeaders,proxy,taskId) {
        const url = 'https://api-backend.yescoin.gold/task/finishTask';
        try{
            const response = await httpsapi("POST",url,callHeaders,proxy,taskId);
            nowlog(`Task ${taskId} Done - Amount: ${response.data.data.bonusAmount}`, 'success');
            return true;
        }catch(error){
            nowlog(`Error Get User!, ${error.message}`,'error');
            return false
        }
    }
    async processTasks(callHeaders,proxy) {
        const tasks = await this.getTaskList(callHeaders,proxy);
        if (tasks) {
            for (const task of tasks) {
                if (task.taskStatus === 0) {
                    await this.finishTask(callHeaders,proxy, task.taskId);
                }
            }
            nowlog("All Task Has Done!",'warning')
        }
    }
    async upgradeLevel(callHeaders,proxy,currentLevel,upgradeType) {
        const url = 'https://api-backend.yescoin.gold/build/levelUp';
        const upgradeTypeName = upgradeType === '1' ? 'Multi Value' : 'Fill Rate';
        while (currentLevel <= this.maxLevel) {
            try {
                await httpsapi("POST",url,callHeaders,proxy,upgradeType);
                currentLevel++;
                nowlog(`Upgrade ${upgradeTypeName} Success: lvl ${currentLevel}`, 'success');
            }catch{
                break;
            }
        }
    }
    async handleSwipeBot(callHeaders,proxy) {
        let url = 'https://api-backend.yescoin.gold/build/getAccountBuildInfo';
        try {
            let response = await httpsapi("GET",url,callHeaders,proxy);
            const accountBuildInfo = response.data;
            if (accountBuildInfo.code === 0) {
                const { swipeBotLevel, openSwipeBot } = accountBuildInfo.data;
                if (swipeBotLevel < 1) {
                    url = 'https://api-backend.yescoin.gold/build/levelUp';
                    response = await httpsapi("POST",url,callHeaders,proxy,4)
                    if (response.data.code === 0) {
                        nowlog('Buy SwipeBot success', 'success');
                    } else {
                        nowlog('Buy SwipeBot false', 'warning');
                    }
                }
                if (swipeBotLevel >= 1 && !openSwipeBot) {
                    url = 'https://api-backend.yescoin.gold/build/toggleSwipeBotSwitch';
                    response = await httpsapi("POST",url,callHeaders,proxy,true)
                    if (response.data.code === 0) {
                        nowlog('Run SwipeBot success', 'success');
                    } else {
                        nowlog('Run SwipeBot false', 'warning');
                    }
                }
                if (swipeBotLevel >= 1 && openSwipeBot) {
                    url = 'https://api-backend.yescoin.gold/game/getOfflineYesPacBonusInfo';
                    response = await httpsapi("GET",url,callHeaders,proxy)
                    const offlineBonusInfo = response.data;
                    if (offlineBonusInfo.code === 0 && offlineBonusInfo.data.length > 0) {
                        url = 'https://api-backend.yescoin.gold/game/claimOfflineBonus';
                        const payload = {
                            id: offlineBonusInfo.data[0].transactionId,
                            createAt: Math.floor(Date.now() / 1000),
                            claimType: 1,
                            destination: ""
                        };
                        response = await httpsapi("POST",url,callHeaders,proxy,payload)
                        if (response.data.code === 0) {
                            nowlog(`Claim offline = ${response.data.data.collectAmount} coins`, 'success');
                        } else {
                            nowlog('Claim offline false', 'error');
                        }
                    }
                }
            } else {
                nowlog('SwipeBot Unavailable', 'error');
            }
        } catch (error) {
            nowlog(`Error Run SwipeBot: ${error.message}`, 'error');
        }
    }
    async main() {
        console.clear()
        await countdown(5,botname)
        while (true) {
            for(let i = 0; i < queryids.length; i++){
                const {user,queryid}= readquerydata(queryids,i);
                const proxy = await readproxydata(proxylist,i)
                nowlog(`${botname} BOT: Run User[${i+1}] - ID: ${user.id}`,'special')
                cmdtitle(user.id,botname)

                let token = readtokendata(tokenfile,user.id)
                try{
                    const callHeaders = {...this.headers, "token" : token}
                    const nickname = await this.getuser(callHeaders,proxy);
                    if(!nickname){
                        token = await this.login(callHeaders,proxy,queryid,user)
                    }

                    callHeaders["token"] = token               
                    const squadInfo = await this.getSquadInfo(callHeaders,proxy);
                    if (squadInfo && squadInfo.data.isJoinSquad) {
                        const squadTitle = squadInfo.data.squadInfo.squadTitle;
                        nowlog(`Squad ${squadTitle}`, 'warning');
                    } else {
                        const joinResult = await this.joinSquad(callHeaders,proxy, "t.me/tainocrypto");
                        if (joinResult) {
                            nowlog(`Joined Squad: ${nickname} Success!`, 'success');
                        }
                    }

                    await waiting(5,botname)
                    const balance = await this.getAccountInfo(callHeaders,proxy);
                    await sleep(2)
                    let gameInfo = await this.getAccountBuildInfo(callHeaders,proxy);
                    await sleep(2)
                    if (!balance || !gameInfo) {
                        continue;
                    }
                    const currentAmount = balance.data.currentAmount;
                    let {specialBoxLeftRecoveryCount, coinPoolLeftRecoveryCount, singleCoinValue, singleCoinLevel, coinPoolRecoverySpeed, swipeBotLevel} = gameInfo;

                    nowlog(`Balance: ${fNumber(currentAmount).green}`);
                    nowlog(`Booster: Chest ${specialBoxLeftRecoveryCount} | Recovery ${coinPoolLeftRecoveryCount}`,'warning');
                    nowlog(`Multi: Lvl ${singleCoinValue} | Limit: Lvl ${singleCoinLevel}`,'warning')
                    nowlog(`FillRate: Lvl ${coinPoolRecoverySpeed} | Swipe: Lvl ${swipeBotLevel}`,'warning')

                    await waiting(5,botname)
                    await this.handleSwipeBot(callHeaders,proxy);
                    await this.processTasks(callHeaders,proxy);
                    await waiting(5,botname)
                    await this.upgradeLevel(callHeaders,proxy,singleCoinLevel, '1');
                    await this.upgradeLevel(callHeaders,proxy,coinPoolRecoverySpeed,this.maxLevel, '2');

                    await waiting(5,botname)
                    if(coinPoolLeftRecoveryCount>0){
                        const collectInfo = await this.getGameInfo(callHeaders,proxy);
                        if (collectInfo){
                            const {singleCoinValue,coinPoolLeftCount} = collectInfo
                            nowlog(`Energy: ${coinPoolLeftCount}`);
                            if(coinPoolLeftCount>0){
                                const amount = Math.floor(coinPoolLeftCount/singleCoinValue);
                                const collectResult = await this.collectCoin(callHeaders,proxy,amount);
                                if (collectResult) {
                                    const collectedAmount = collectResult.collectAmount;
                                    nowlog(`Tap Collect ${collectedAmount} coins`, 'success');
                                }
                            }
                        }
                        await sleep(2)
                    }
                    nowlog('Out of recovery!', 'warning');
                    
                    nowlog(`Checking... Free Chest`, 'warning');
                    const freeChestCollectedAmount = await this.attemptCollectSpecialBox(callHeaders,proxy, 1, 200);
                    if(freeChestCollectedAmount){
                        nowlog(`Tap Collect ${freeChestCollectedAmount} coins`, 'success');
                    }

                    if (specialBoxLeftRecoveryCount > 0) {
                        if (await this.useSpecialBox(callHeaders,proxy)) {
                            const collectedAmount = await this.attemptCollectSpecialBox(callHeaders,proxy, 2, 240);
                            nowlog(`Quest Collect ${collectedAmount} coins`, 'success');
                        }
                    }
                }catch(error) {
                    nowlog(`Error Get Data User ${user.id}!, ${error.message}`,'error');
                    await waiting(10,botname)
                }
            }
            await countdown(600,botname)
        }
    }
}
   
if (require.main === module) {
    const bot = new BOT();
    bot.main().catch(error => {
        nowlog(`${error.message}`,'error');
    });
}