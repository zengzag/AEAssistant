export default class ChatService {
    constructor(baseUrl = 'http://127.0.0.1:1221/v1',
        apiKey = 'YOUR_OPENAI_API_KEY',
        model = 'qwen2.5-coder-14b-instruct',
        model_context = {},
        system_prompt = '你是一个AI助手，你可以回答任何问题。',
        enable_history = true,
        tools = {tools:[], function_call: {}} 
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
        this.tools = tools; 
    }

    setTools(tools) {
        this.tools = tools;
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
        // console.log("chat_history", this.chat_history)
        try {
            const messages = [{ role: 'system', content: this.system_prompt }];
            if (this.enable_history) {
                messages.push(...this.chat_history);
            }
            messages.push({ role: 'user', content: message });
            this.addChatHistory('user', message);
            const response = await this.makeRequest(messages);
            const responseText = await this.processResponse(response, messages);

            if (this.onFinish) {
                this.onFinish(responseText);
                this.addChatHistory('assistant', responseText);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (this.onError) {
                this.onError(errorMessage);
            }
        }
    }

    async makeRequest(messages) {
        // console.log('messages', messages);
        return await fetch(this.baseUrl + '/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: messages,
                stream: true,
                tools: this.tools.tools,
                ...this.model_context
            })
        });
    }

    async processResponse(response, messages) {
        const reader = response.body.getReader();
        let responseText = '';
        let final_tool_calls = {};
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
                    const delta = json.choices[0].delta;
                    const content = delta.content;
                    if (content) responseText += content;
                    if (content && this.onChunk) {
                        this.onChunk(content);
                    }

                    if (delta.tool_calls && delta.tool_calls.length > 0) {
                        for( let j = 0; j < delta.tool_calls.length; j++) {
                            const toolCall = delta.tool_calls[j];
                            const index = toolCall.index;
                            if (!(index in final_tool_calls)) {
                                final_tool_calls[index] = toolCall;
                            }else if (toolCall.function) {
                                if (toolCall.function.name) 
                                    final_tool_calls[index].function.name += toolCall.function.name;
                                if (toolCall.function.arguments)
                                    final_tool_calls[index].function.arguments += toolCall.function.arguments;
                            }
                        }
                    }
                }
            }
        }
        if (Object.keys(final_tool_calls).length > 0) {
            console.log('final_tool_calls', final_tool_calls);
            let findCallFunction = false;
            for (const index in final_tool_calls)
            {
                const toolCall = final_tool_calls[index];
                const { name, parameters } = toolCall.function;
                const tool_func = this.tools.function_call[name];
                if (tool_func) {
                    try {
                        const result = await tool_func(parameters);
                        if (!findCallFunction) {
                            this.chat_history.push({role: 'assistant', final_tool_calls: final_tool_calls});
                            messages = [...messages, {role: 'assistant', final_tool_calls: final_tool_calls}];
                            findCallFunction = true;
                        }
                        const toolResults = { role: 'tool', name: name, tool_call_id: toolCall.id, content: JSON.stringify(result) }
                        this.chat_history.push(toolResults); 
                        messages = [...messages, toolResults];
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        console.error('Tool call error:', errorMessage);
                        if (this.onError) {
                            this.onError(`Tool call error: ${errorMessage}`);
                        }
                    }
                }
            }
            if (findCallFunction) {
                const newResponse = await this.makeRequest(messages);
                responseText = await this.processResponse(newResponse, messages);
            }
        }
        return responseText;
    }

}
