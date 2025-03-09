import ChatService from './ChatService';
import ApiKeyManager from '../ApiKeyManager';
import { executeAEScript, AEUndo } from '../tools/executeAEScript.js';


class AEGenerateAgent {
    constructor() {
        const ApiKeyManagerInstance = new ApiKeyManager();
        this.chatService = new ChatService(
            ApiKeyManagerInstance.getBaseUrlGen(),
            ApiKeyManagerInstance.getApiKeyGen(),
            ApiKeyManagerInstance.getModelGen(),
            {},
'你是一个精通after effects脚本编程的专家，请根据用户的需求生成对应脚本代码，请直接生成可运行的代码。\
输出的代码为ExtendScript，需要符合ECMAScript 3的标准。\
输出的代码使用```javascript ``` 包裹。\
请整体输出一个可执行代码，不要分段，不要有解释和注释。',
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

    // TODO: 解耦逻辑，拆解为多个子节点执行
    async sendMessage(message) {
        this.resetApiKey();
        if (this.onChunk) {
            this.onChunk("生成脚本中...\n");
        }
        this.chatService.clearChatHistory();
        const responseText = await this.genScript(message);
        if (responseText === "Error") {
            return;
        }
        if (this.onChunk) {
            this.onChunk("\n脚本执行中...\n");
        }
        let executeResult = await executeAEScript(responseText);
        if (executeResult.status === "success") {
            if (this.onFinish) {
                this.onFinish("执行完成\n" );
            } 
            return;
        } else {
            AEUndo();
        }
        if (this.onChunk) {
            this.onChunk("\n脚本执行失败，error: " + executeResult.message + "\n");
        }
        let retryCount = 0;
        while (executeResult.status === "error" && retryCount < 5) {
            if (this.onChunk) {
                this.onChunk("\n重新生成脚本中\n");
            }
            message = "脚本执行失败，error: " + executeResult.message + "\n请重新生成脚本。";
            const responseText = await this.genScript(message);
            if (responseText === "Error") {
                return; 
            }
            if (this.onChunk) {
                this.onChunk("\n脚本执行中...\n"); 
            }
            executeResult = await executeAEScript(responseText);
            if (executeResult.status === "success") {
                if (this.onFinish) {
                    this.onFinish("执行完成\n");
                }
                return;
            } else {
                AEUndo();
            }
            if (this.onChunk) {
                this.onChunk("\n脚本执行失败，error: " + executeResult.message + "\n");
            }
            retryCount++;
        }
        if (this.onError) {
            this.onError("多次重试仍执行失败\n");
        }
    }

}

let AEGenerateAgentInstance = new AEGenerateAgent();

export default AEGenerateAgent;
export const getAEGenerateAgentInstance = () => AEGenerateAgentInstance;