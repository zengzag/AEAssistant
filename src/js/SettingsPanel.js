import React, { useState, useRef } from 'react';
import { Form, Button, Typography, Space } from '@douyinfe/semi-ui';
import ApiKeyManager from './ApiKeyManager.js';

const { Title } = Typography;

function SettingsPanel() {
    const formRef = useRef();
    const apiKeyManager = new ApiKeyManager();
    const [formValues, setFormValues] = useState({
        baseUrlChat: apiKeyManager.getBaseUrlChat(),
        apiKeyChat: apiKeyManager.getApiKeyChat(),
        modelChat: apiKeyManager.getModelChat(),
        baseUrlGen: apiKeyManager.getBaseUrlGen(),
        apiKeyGen: apiKeyManager.getApiKeyGen(),
        modelGen: apiKeyManager.getModelGen(),
        supportToolCallsChat: apiKeyManager.getSupportToolCallsChat(),
        supportToolCallsGen: apiKeyManager.getSupportToolCallsGen()
    });

    const handleSubmit = (values) => {
        apiKeyManager.setBaseUrlChat(values.baseUrlChat);
        apiKeyManager.setApiKeyChat(values.apiKeyChat);
        apiKeyManager.setModelChat(values.modelChat);
        apiKeyManager.setBaseUrlGen(values.baseUrlGen);
        apiKeyManager.setApiKeyGen(values.apiKeyGen);
        apiKeyManager.setModelGen(values.modelGen);
        apiKeyManager.setSupportToolCallsChat(values.supportToolCallsChat);
        apiKeyManager.setSupportToolCallsGen(values.supportToolCallsGen);
    };

    const handleReset = () => {
        formRef.current.formApi.setValues({
            baseUrlChat: apiKeyManager.getBaseUrlChat(),
            apiKeyChat: apiKeyManager.getApiKeyChat(),
            modelChat: apiKeyManager.getModelChat(),
            baseUrlGen: apiKeyManager.getBaseUrlGen(),
            apiKeyGen: apiKeyManager.getApiKeyGen(),
            modelGen: apiKeyManager.getModelGen(),
            supportToolCallsChat: apiKeyManager.getSupportToolCallsChat(),
            supportToolCallsGen: apiKeyManager.getSupportToolCallsGen()
        });
    };

    return (
        <div style={{ padding: '10px', maxWidth: '400px', margin: '0 auto' }}>
            <Title level={3} style={{ marginBottom: '20px' }}>API 设置</Title>
            <Form
                ref={formRef} 
                onValueChange={(values) => setFormValues(values)}
                onSubmit={handleSubmit}
                initValues={formValues}
            >
                <Title level={4} style={{ marginTop: '20px' }}>聊天模式设置</Title>
                <Form.Input
                    field="baseUrlChat"
                    label="Base URL"
                    style={{ width: '100%' }}
                />
                <Form.Input
                    field="apiKeyChat"
                    label="API Key"
                    style={{ width: '100%' }}
                    mode="password"
                />
                <Form.Input
                    field="modelChat"
                    label="Model Name"
                    style={{ width: '100%' }}
                />
                <Form.Switch
                    field="supportToolCallsChat"
                    label="支持 Tool Calls"
                />

                <Title level={4} style={{ marginTop: '20px' }}>生成模式设置</Title>
                <Form.Input
                    field="baseUrlGen"
                    label="Base URL"
                    style={{ width: '100%' }}
                />
                <Form.Input
                    field="apiKeyGen"
                    label="API Key"
                    style={{ width: '100%' }}
                    mode="password"
                />
                <Form.Input
                    field="modelGen"
                    label="Model Name"
                    style={{ width: '100%' }}
                />
                <Form.Switch
                    field="supportToolCallsGen"
                    label="支持 Tool Calls"
                />

                <Space style={{ marginTop: '20px' }}>
                    <Button htmlType="submit" type="primary">保存设置</Button>
                    <Button onClick={handleReset}>重置</Button>
                </Space>
            </Form>
        </div>
    );
}

export default SettingsPanel;
