// 在main.js里引用
// 所有服务器后端相关的逻辑都写在这个文件里

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
      Drupal.saveData(data);
      Drupal.pendingSaveEvent = null;
    }, 60000);
  },

  saveData(data) {
    console.log('saveData', data);
    //console.log('this.mindMapData', this.mindMapData);

    const urlParams = new URLSearchParams(window.location.search);
    const drupalPath = urlParams.get('path');
    const id = urlParams.get('id');
    const api = window.location.origin + drupalPath +
      'pbl/mindmap/save-data/' + id;

    fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.mindMapData)
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        // @todo: show success result
      })
      .catch(error => {
        // 请求失败时处理错误
        console.error(error);

        // @todo: show fail result
      });
  }
}

export default Drupal