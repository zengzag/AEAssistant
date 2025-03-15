/* global CSInterface */
let id = 0;

export const executeAEScript = async (script) => {
    id++;
    try {
        const executeScript = `
app.beginUndoGroup("Script-${id}");
var TempComp = app.project.items.addComp("Temp Comp", 10, 10, 1, 10, 25);
TempComp && TempComp.remove();
var __result__ = {status:'error', message: '未执行'};
(function () {
try {
    ${script} 
    __result__ = {status: "success", message: "脚本执行成功"};
} catch (error) {
    __result__ = {status: "error", message: JSON.stringify({message: error.message, line: error.line-7})};
}
}());
app.endUndoGroup();
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
        evalResult.undoID = id;
        return evalResult;
    } catch (error) {
        return {status:'error', message: '未知错误', undoID: id};
    }
};

export const AEUndo = async () => {
    let executeScript = "app.executeCommand(16);"  // Undo的command id为16
    let status = 'start';
    function callbackFun(result) {
        status = 'success'
    };
    let csInterface = new CSInterface();
    csInterface.evalScript(executeScript, callbackFun);
    while ( status === 'start') {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
};