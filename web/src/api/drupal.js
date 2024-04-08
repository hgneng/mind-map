// 在main.js里引用
// 所有服务器后端相关的逻辑都写在这个文件里

import { getData } from './index'
import { Message } from 'element-ui';

const Drupal = {
  mindMapData: null,

  // 从服务器加载数据
  async loadData() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const drupalPath = urlParams.get('path');
      const id = urlParams.get('id');
      const api = window.location.origin + drupalPath +
        'pbl/mindmap/load-data/' + id;
      const response = await fetch(api);

      // 确保响应成功
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // 解析 JSON 数据
      const json = await response.json();
      if (json && json.data) {
        this.mindMapData = json.data;
        // 更新组件数据
        return {
          mindMapData: this.mindMapData,
          lang: 'zh',
          localConfig: null
        };
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    return null;
  },

  // 保存数据到服务器
  pendingSaveEvent: null,
  hasShownAutoSaveMessage: false,

  // 1分钟保存1次
  saveDataLater(data) {
    let hasDiff = false;
    for (const [key, value] of Object.entries(data)) {
      if (JSON.stringify(this.mindMapData[key]) != JSON.stringify(value)) {
        this.mindMapData[key] = value;
        hasDiff = true;
      }
    }

    if (!hasDiff) {
      return;
    }

    if (this.pendingSaveEvent) {
      clearTimeout(this.pendingSaveEvent);
    }

    this.pendingSaveEvent = setTimeout(() => {
      Drupal.saveData();
      Drupal.pendingSaveEvent = null;
      if (!Drupal.hasShownAutoSaveMessage) {
        Message.success('已自动保存（每分钟保存一次，仅第一分钟显示消息提示）');
        Drupal.hasShownAutoSaveMessage = true;
      }
    }, 60000);
  },

  async saveData() {
    const mindMapData = getData()
    console.log('saveData', mindMapData);
    //console.log('this.mindMapData', this.mindMapData);

    const urlParams = new URLSearchParams(window.location.search);
    const drupalPath = urlParams.get('path');
    const id = urlParams.get('id');
    const api = window.location.origin + drupalPath +
      'pbl/mindmap/save-data/' + id;

    const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mindMapData)
      });


    // 确保响应成功
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // 解析 JSON 数据
    const json = await response.json();
    if (json && json.code && json.code == 200) {
      return true;
    }

    return false;
  }
}

export default Drupal