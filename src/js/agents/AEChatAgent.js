import ChatService from './ChatService';
import ApiKeyManager from '../ApiKeyManager';

class AEChatAgent {
    constructor() {
        const ApiKeyManagerInstance = new ApiKeyManager();
        this.chatService = new ChatService(
            ApiKeyManagerInstance.getBaseUrlChat(),
            ApiKeyManagerInstance.getApiKeyChat(),
            ApiKeyManagerInstance.getModelChat(),
            {},
            '你是一个精通after effects软件的专家，请用你的专业性指导用户解决问题。请尽量用最简洁的方式回答问题。',
            false,
        );
        this.onChunk = null;
        this.onError = null;
        this.onFinish = null;
    }

    setCallbacks({ onChunk, onError, onFinish }) {
        this.onChunk = onChunk;
        this.onError = onError;
        this.onFinish = onFinish;
        this.chatService.setCallbacks({ onChunk, onError, onFinish });
    }

    resetApiKey() {
        const ApiKeyManagerInstance = new ApiKeyManager();
        this.chatService.setServerConfig(
            ApiKeyManagerInstance.getBaseUrlChat(),
            ApiKeyManagerInstance.getApiKeyChat(),
            ApiKeyManagerInstance.getModelChat()
        );
    }

    clearChatHistory(){
        this.chatService.clearChatHistory();
    }
    
    async resetMessage() {
        this.resetApiKey();
        await this.chatService.resetMessage();
    }

    async sendMessage(message) {
        this.resetApiKey();
        await this.chatService.sendMessage(message);
    }
}

let AEChatAgentInstance = new AEChatAgent();

export default AEChatAgent;
export const getAEChatAgentInstance = () => AEChatAgentInstance;