import React, { useState, useCallback } from 'react';
import { Chat } from '@douyinfe/semi-ui';
import { getAEGenerateAgentInstance } from './agents/AEGenerateAgent.js';

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

function GeneratePanel() {
    const [message, setMessage] = useState([]);
    const chatService = getAEGenerateAgentInstance();

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
                        content:  lastMessage.content + error,
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
                        content:  lastMessage.content + response,
                        status: 'complete'
                    }
                    return [...message.slice(0, -1), newMessage]
                });
            }
        });
        chatService.sendMessage(content);
    }, [chatService]);  // 添加 chatService 到依赖数组

    const onChatsChange = useCallback((chats) => {
        setMessage(chats);
    }, []);

    return (
        <Chat
            style={commonOuterStyle}
            mode='bubble'
            align='leftAlign'
            chats={message}
            roleConfig={roleInfo}
            onChatsChange={onChatsChange}
            onMessageSend={onMessageSend}
            uploadProps={uploadProps}
        />
    )
}

export default GeneratePanel;
