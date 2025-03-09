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
        } else {
            this.baseUrlChat = 'http://127.0.0.1:1221/v1';
            this.apiKeyChat = 'YOUR_OPENAI_API_KEY';
            this.modelChat = 'qwen2.5-coder-14b-instruct';
            this.baseUrlGen = 'http://127.0.0.1:1221/v1';
            this.apiKeyGen = 'YOUR_OPENAI_API_KEY';
            this.modelGen = 'qwen2.5-coder-14b-instruct';
        }
    }

    saveToStorage() {
        const config = {
            baseUrlChat: this.baseUrlChat,
            apiKeyChat: this.apiKeyChat,
            modelChat: this.modelChat,
            baseUrlGen: this.baseUrlGen,
            apiKeyGen: this.apiKeyGen,
            modelGen: this.modelGen
        };
        localStorage.setItem(this.storageKey, JSON.stringify(config));
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

