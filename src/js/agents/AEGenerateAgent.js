import ChatService from './ChatService';
import ApiKeyManager from '../ApiKeyManager';
import { executeAEScript, AEUndo } from '../tools/executeAEScript.js';
import { gatherActivedCompInfo } from '../tools/gatherProjectInformation.js';


class AEGenerateAgent {
    constructor() {
        const ApiKeyManagerInstance = new ApiKeyManager();
        this.chatService = new ChatService(
            ApiKeyManagerInstance.getBaseUrlGen(),
            ApiKeyManagerInstance.getApiKeyGen(),
            ApiKeyManagerInstance.getModelGen(),
            {},
`
角色：
你是一个精通after effects脚本编程的专家，

目标：
请根据用户的需求生成完整的ExtendScript脚本。

要求：
1. 生成的脚本使用\`\`\`javascript \`\`\` 包裹。
2. 生成的脚本应该是完整有效的，能够在after effects中运行。
3. 生成的脚本应该是简洁的，尽可能少的代码。

示例：
用户：
在当前合成中创建一个文字上下跳动的效果，文字内容为“你好”。
你：
\`\`\`javascript
var comp = project.activeItem;
if (!(comp instanceof CompItem)) {
    alert("请选择一个合成");
    return;
}
var textLayer = comp.layers.addText("你好");
textLayer.position.setValue([comp.width / 2, comp.height / 2]);
var startValue = textLayer.position.value;
var endValue = [startValue[0], startValue[1] - 100];
var fps = comp.frameRate;
var duration = comp.duration;
textLayer.position.setValueAtTime(0, startValue);
textLayer.position.setValueAtTime(duration / 2, endValue);
textLayer.position.setValueAtTime(duration, startValue);
\`\`\`

用户：
创建一个新合成并打开
你：
\`\`\`javascript
var comp = app.project.items.addComp("新合成", 1920, 1080, 24, 30, 25);
newComp.openInViewer();
\`\`\`

用户：
对合成中的图层，加一个旋转入场的效果，最终铺满合成。
你：
\`\`\`javascript
var activeComp = app.project.activeItem;
if (activeComp && activeComp instanceof CompItem) {
    for (var i = 1; i <= activeComp.numLayers; i++) {
        var currentLayer = activeComp.layer(i);
        currentLayer.transform.rotation.setValueAtTime(0, 180);
        currentLayer.transform.rotation.setValueAtTime(activeComp.duration, 0);
        currentLayer.transform.scale.setValueAtTime(0, [0, 0]);
        currentLayer.transform.scale.setValueAtTime(activeComp.duration, [100, 100]);
    }
} else {
    alert("请确保当前选中一个合成");
}
\`\`\`
`,
            true,
        );
        this.onChunk = null;
        this.onError = null;
        this.onFinish = null;
    }

    setCallbacks({ onChunk, onError, onFinish }) {
        this.onChunk = onChunk;
        this.onError = onError;
        this.onFinish = onFinish;
    }

    resetApiKey() {
        const ApiKeyManagerInstance = new ApiKeyManager();
        this.chatService.setServerConfig(
            ApiKeyManagerInstance.getBaseUrlGen(),
            ApiKeyManagerInstance.getApiKeyGen(),
            ApiKeyManagerInstance.getModelGen()
        );
    }

    notifyChunk(message) {
        if (this.onChunk) {
            this.onChunk(message);
        }
    }

    notifyFinish(message) {
        if (this.onFinish) {
            this.onFinish(message);
        }
    }

    notifyError(message) {
        if (this.onError) {
            this.onError(message);
        }
    }

    async genScript(message) {
        this.resetApiKey();
        let responseText = "Error";
        this.chatService.setCallbacks({ 
            onChunk: this.onChunk, 
            onError: this.onError, 
            onFinish: (response) => {
                responseText = response;
            }, 
        });
        await this.chatService.sendMessage(message);
        if (responseText === "Error") {
            return "Error";
        }
        // 去除被<think></think>包围的字符串
        responseText = responseText.replace(/<think>[\s\S]*?<\/think>/g, '');
        // 提取被```javascript ```包围的字符串
        const codeMatch = responseText.match(/```javascript([\s\S]*?)```/);
        responseText = codeMatch ? codeMatch[1].trim() : responseText;
        return responseText;
    }
    async getScript(message) {
        const responseText = await this.genScript(message);
        if (responseText === "Error") {
            return null;
        }
        return responseText;
    }

    async getActivedCompInfo() {
        const activedComp = await gatherActivedCompInfo();
        if (activedComp.status === "success") {
            return JSON.stringify(activedComp.message);
        }
        return null;
    }

    async executeScript(script) {
        this.notifyChunk("\n脚本执行中...\n");
        let executeResult = await executeAEScript(script);

        if (executeResult.status === "success") {
            this.notifyFinish("执行完成\n");
            return;
        }

        this.handleScriptError(executeResult);
    }

    async handleScriptError(executeResult) {
        AEUndo();
        this.notifyChunk("\n脚本执行失败，error: " + executeResult.message + "\n");

        let retryCount = 0;
        while (executeResult.status === "error" && retryCount < 10) {
            this.notifyChunk("\n重新生成脚本中\n");
            const newMessage = "脚本执行失败，error: " + executeResult.message + "\n请重新生成脚本。";
            const newScript = await this.getScript(newMessage);
            if (!newScript) return;

            this.notifyChunk("\n脚本执行中...\n");
            executeResult = await executeAEScript(newScript);

            if (executeResult.status === "success") {
                this.notifyFinish("执行完成\n");
                return;
            }

            AEUndo();
            this.notifyChunk("\n脚本执行失败，error: " + executeResult.message + "\n");
            retryCount++;
        }

        this.notifyError("多次重试仍执行失败\n");
    }

    
    async sendMessage(message) {
        this.resetApiKey();
        this.notifyChunk("生成脚本中...\n");
        this.chatService.clearChatHistory();

        const compInfo = await this.getActivedCompInfo();
        if (compInfo !== null) {
            message = "AE中当前正打开的合成信息：\n" + compInfo + "\n\n用户需求：" + message;
        }

        const script = await this.getScript(message);
        if (!script) return;

        await this.executeScript(script);
    }
}

let AEGenerateAgentInstance = new AEGenerateAgent();

export default AEGenerateAgent;
export const getAEGenerateAgentInstance = () => AEGenerateAgentInstance;