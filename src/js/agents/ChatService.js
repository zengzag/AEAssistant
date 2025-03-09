export default class ChatService {
    constructor(baseUrl = 'http://127.0.0.1:1221/v1',
        apiKey = 'YOUR_OPENAI_API_KEY',
        model = 'qwen2.5-coder-14b-instruct',
        model_context = {},
        system_prompt = '你是一个AI助手，你可以回答任何问题。',
        enable_history = true
    ) {
        this.onChunk = null;
        this.onError = null;
        this.onFinish = null;
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.model = model;
        this.model_context = model_context;
        this.system_prompt = system_prompt;
        this.enable_history = enable_history;
        this.chat_history = [];
    }

    setServerConfig(baseUrl, apiKey, model) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.model = model;
    }

    setCallbacks({ onChunk, onError, onFinish }) {
        this.onChunk = onChunk;
        this.onError = onError;
        this.onFinish = onFinish;
    }
    
    setSystemPrompt(system_prompt) {
        this.system_prompt = system_prompt; 
    }

    setModelContext(model_context) {
        this.model_context = model_context; 
    }

    setHistoryEnable(enable_history) {
        this.enable_history = enable_history;
    }

    getChatHistory() {
        return this.chat_history; 
    }

    addChatHistory(role, content) {
        this.chat_history.push({ role: role, content: content }); 
    }

    clearChatHistory() {
        this.chat_history = [];  
    }

    async resetMessage() {
        if (this.chat_history.length < 2) {
            return; 
        }
        const lastMessage = this.chat_history[this.chat_history.length - 2];
        this.chat_history = this.chat_history.slice(0, -2);
        await this.sendMessage(lastMessage.content);
    }

    async sendMessage(message) {
        try {
            const messages = [{ role: 'system', content: this.system_prompt }];
            if (this.enable_history) {
                messages.push(...this.chat_history);
            }
            messages.push({ role: 'user', content: message });
            
            const response = await fetch(this.baseUrl+'/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    stream: true,
                    ...this.model_context
                })
            });

            const reader = response.body.getReader();
            let responseText = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        const json = JSON.parse(data);
                        const content = json.choices[0].delta.content;
                        if (content) responseText += content;
                        if (content && this.onChunk) {
                            this.onChunk(content);
                        }
                    }
                }
            }

            if (this.onFinish) {
                this.onFinish(responseText);
                this.addChatHistory('user', message);
                this.addChatHistory('assistant', responseText);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (this.onError) {
                this.onError(errorMessage);
            }
        }
    }
}
