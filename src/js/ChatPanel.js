import React, { useState, useCallback } from 'react';
import { Chat } from '@douyinfe/semi-ui';
import { getAEChatAgentInstance } from './agents/AEChatAgent.js';

const roleInfo = {
    user: {
        name: 'User',
    },
    assistant: {
        name: 'Assistant',
    }
}

const commonOuterStyle = {
    border: '1px solid var(--semi-color-border)',
    borderRadius: '16px',
    height: 500,
}

const uploadProps = { action: '' }

let id = 0;
function getId() { return `id-${id++}` }

function ChatPanel() {
    const [message, setMessage] = useState([]);
    const chatService = getAEChatAgentInstance();

    const onMessageSend = useCallback((content, attachment) => {
        const newAssistantMessage = {
            role: 'assistant',
            status: 'loading',
            content: '',
            createAt: Date.now(),
            id: getId()
        }  
        setMessage((message) => {
            return [...message, newAssistantMessage];
        });
        chatService.setCallbacks({
            onChunk: (content) => {
                setMessage((message) => {
                    const lastMessage = message[message.length - 1];
                    let newMessage = { ...lastMessage };
                    newMessage = {
                        ...newMessage,
                        content: lastMessage.content + content,
                        status: 'incomplete'
                    }
                    return [...message.slice(0, -1), newMessage]
                });
            },
            onError: (error) => {
                setMessage((message) => {
                    const lastMessage = message[message.length - 1];
                    let newMessage = { ...lastMessage };
                    newMessage = {
                        ...newMessage,
                        content: error,
                        status: 'error'
                    }
                    return [...message.slice(0, -1), newMessage]
                });
            },
            onFinish: (response) => {
                setMessage((message) => {
                    const lastMessage = message[message.length - 1];
                    let newMessage = { ...lastMessage };
                    newMessage = {
                        ...newMessage,
                        content: response,
                        status: 'complete'
                    }
                    return [...message.slice(0, -1), newMessage]
                });
            }
        });
        chatService.sendMessage(content);
    }, [chatService]);

    const onChatsChange = useCallback((chats) => {
        setMessage(chats);
    }, []);

    const onClear = useCallback(() => {
        chatService.clearChatHistory();
    }, [chatService]);

    const onMessageReset = useCallback(() => {
        chatService.setCallbacks({
            onChunk: (content) => {
                setMessage((message) => {
                    const lastMessage = message[message.length - 1];
                    let newMessage = { ...lastMessage };
                    newMessage = {
                        ...newMessage,
                        content: lastMessage.content + content,
                        status: 'incomplete'
                    }
                    return [...message.slice(0, -1), newMessage]
                });
            },
            onError: (error) => {
                setMessage((message) => {
                    const lastMessage = message[message.length - 1];
                    let newMessage = { ...lastMessage };
                    newMessage = {
                        ...newMessage,
                        content: error,
                        status: 'error'
                    }
                    return [...message.slice(0, -1), newMessage]
                });
            },
            onFinish: (response) => {
                setMessage((message) => {
                    const lastMessage = message[message.length - 1];
                    let newMessage = { ...lastMessage };
                    newMessage = {
                        ...newMessage,
                        content: response,
                        status: 'complete'
                    }
                    return [...message.slice(0, -1), newMessage]
                });
            }
        });
        chatService.resetMessage();
    }, [chatService]);
    return (
        <Chat
            style={commonOuterStyle}
            chats={message}
            roleConfig={roleInfo}
            onChatsChange={onChatsChange}
            onMessageSend={onMessageSend}
            onMessageReset={onMessageReset}
            onClear={onClear}
            uploadProps={uploadProps}
            showClearContext
        />
    )
}

export default ChatPanel;
