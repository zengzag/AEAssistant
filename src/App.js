import './App.css';
import React, { useState } from 'react';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import ChatPanel from './js/ChatPanel.js';
import GeneratePanel from './js/GeneratePanel.js';
import SettingsPanel from './js/SettingsPanel.js';

function App() {
  const body = document.body;
  body.setAttribute('theme-mode', 'dark');

  return (
    <Tabs type="card">
      <TabPane tab="聊天模式" itemKey="1">
        <ChatPanel />
      </TabPane>
      <TabPane tab="生成模式" itemKey="2">
        <GeneratePanel />
      </TabPane>
      <TabPane tab="设置" itemKey="3">
        <SettingsPanel />
      </TabPane>
    </Tabs>
  );
}



export default App;
