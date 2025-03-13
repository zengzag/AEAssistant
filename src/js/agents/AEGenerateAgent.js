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
'你是一个精通after effects脚本编程的专家，请根据用户的需求生成完整的ExtendScript脚本。\
输出的代码使用```javascript ``` 包裹。\
不要有解释和注释。',
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