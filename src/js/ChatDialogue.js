/* global CSInterface */
/* global SystemPath */
import React, { useState } from 'react';
import {
  Provider,
  TextField,
  Button,
  ListBox,
  Item,
  Divider,
  defaultTheme,
  View
} from '@adobe/react-spectrum';

const ChatDialogue = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    var csInterface = new CSInterface();
    var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/";
    console.log("DOMContentLoaded, extension root path = ", extensionRoot);

    var cepScript = '\
        var result = "处理完成";\
        result;\
    ';
    // 调用evalScript执行ExtendScript代码
    window.__adobe_cep__.evalScript(cepScript, function(result) {
        try {
            console.log(result);
        } catch (error) {
            console.error('解析ExtendScript响应失败:', error);
        }
    });

    console.log('messages');
    if (inputValue.trim() !== '') {
      setMessages([...messages, inputValue]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Provider theme={defaultTheme}>
      <Button variant="primary" onPress={handleSendMessage}>Send</Button>
    </Provider>
  );
};

export default ChatDialogue;
