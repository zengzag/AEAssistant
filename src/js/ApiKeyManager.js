export default class ApiKeyManager {
    constructor() {
        if (ApiKeyManager.instance) {
            return ApiKeyManager.instance;
        }
        this.storageKey = 'ae_assistant_model_config';
        this.loadFromStorage();
        ApiKeyManager.instance = this;
    }

    loadFromStorage() {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
            const config = JSON.parse(data);
            this.baseUrlChat = config.baseUrlChat || 'http://127.0.0.1:1221/v1';
            this.apiKeyChat = config.apiKeyChat || 'YOUR_OPENAI_API_KEY';
            this.modelChat = config.modelChat || 'qwen2.5-coder-14b-instruct';
            this.baseUrlGen = config.baseUrlGen || 'http://127.0.0.1:1221/v1';
            this.apiKeyGen = config.apiKeyGen || 'YOUR_OPENAI_API_KEY';
            this.modelGen = config.modelGen || 'qwen2.5-coder-14b-instruct';
            this.supportToolCallsChat = config.supportToolCallsChat || false;
            this.supportToolCallsGen = config.supportToolCallsGen || false;
        } else {
            this.baseUrlChat = 'http://127.0.0.1:1221/v1';
            this.apiKeyChat = 'YOUR_OPENAI_API_KEY';
            this.modelChat = 'qwen2.5-coder-14b-instruct';
            this.baseUrlGen = 'http://127.0.0.1:1221/v1';
            this.apiKeyGen = 'YOUR_OPENAI_API_KEY';
            this.modelGen = 'qwen2.5-coder-14b-instruct';
            this.supportToolCallsChat = false;
            this.supportToolCallsGen = false;
        }
    }

    saveToStorage() {
        const config = {
            baseUrlChat: this.baseUrlChat,
            apiKeyChat: this.apiKeyChat,
            modelChat: this.modelChat,
            baseUrlGen: this.baseUrlGen,
            apiKeyGen: this.apiKeyGen,
            modelGen: this.modelGen,
            supportToolCallsChat: this.supportToolCallsChat,
            supportToolCallsGen: this.supportToolCallsGen
        };
        localStorage.setItem(this.storageKey, JSON.stringify(config));
    }

    // 新增：获取和设置支持 tool_calls 的方法
    getSupportToolCallsChat() {
        return this.supportToolCallsChat;
    }

    setSupportToolCallsChat(support) {
        this.supportToolCallsChat = support;
        this.saveToStorage();
    }

    getSupportToolCallsGen() {
        return this.supportToolCallsGen;
    }

    setSupportToolCallsGen(support) {
        this.supportToolCallsGen = support;
        this.saveToStorage();
    }

    setBaseUrlChat(baseUrl) {
        this.baseUrlChat = baseUrl;
        this.saveToStorage();
    }

    setApiKeyChat(apiKey) {
        this.apiKeyChat = apiKey;
        this.saveToStorage();
    }

    setModelChat(model) {
        this.modelChat = model;
        this.saveToStorage();
    }

    setBaseUrlGen(baseUrl) {
        this.baseUrlGen = baseUrl;
        this.saveToStorage();
    }

    setApiKeyGen(apiKey) {
        this.apiKeyGen = apiKey;
        this.saveToStorage();
    }

    setModelGen(model) {
        this.modelGen = model;
        this.saveToStorage();
    }

    getBaseUrlChat() {
        return this.baseUrlChat;
    }

    getApiKeyChat() {
        return this.apiKeyChat;
    }

    getModelChat() {
        return this.modelChat;
    }

    getBaseUrlGen() {
        return this.baseUrlGen;
    }

    getApiKeyGen() {
        return this.apiKeyGen;
    }

    getModelGen() {
        return this.modelGen;
    }
}

