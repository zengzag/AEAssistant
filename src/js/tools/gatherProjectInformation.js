/* global CSInterface */

export const gatherProjectInformation = async () => {
    try {
        const executeScript = `
var __result__ = {status:'error', message: '未执行'};
try {
    var info = $._zag.gatherProjectInformation();
    __result__ = {status: "success", message: info};
} catch (error) {
    __result__ = {status: "error", message: error.message};
}
JSON.stringify(__result__);
        `;

        let evalResult = {status:'start', message: '未知错误'};
        function callbackFun(result) {
            try {
                evalResult = JSON.parse(result);
            } catch (error) {
                evalResult = {status:'error', message: '未知错误'}; 
            }
        };
        let csInterface = new CSInterface();
        csInterface.evalScript(executeScript, callbackFun);
        while ( evalResult.status === 'start') {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return evalResult;
    } catch (error) {
        return {status:'error', message: '未知错误'};
    }
};
