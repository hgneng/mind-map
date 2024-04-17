import { Loading } from 'element-ui';

class Ai {
  static loadingInstance = null;

  constructor({ mindMap }) {
    this.mindMap = mindMap;
    this.bindEvent()
  }

  bindEvent() {
    this.generateChildNodes = this.generateChildNodes.bind(this)
    this.getTextFromHTML = this.getTextFromHTML.bind(this)
    this.mindMap.on('ai_click', this.generateChildNodes)
    this.mindMap.keyCommand.addShortcut('Alt+Enter', this.generateChildNodes)
  }

  unBindEvent() {
  }

  getTextFromHTML(htmlString) {
    // 创建一个新的DOMParser实例
    var parser = new DOMParser();
    // 解析HTML字符串，生成一个Document对象
    var doc = parser.parseFromString(htmlString, "text/html");
    // 获取body元素
    var body = doc.body;

    // 创建一个空的TextNode对象，用于存储所有文本内容
    var textNode = doc.createTextNode("");

    // 遍历body元素下的所有子节点
    for (var i = 0; i < body.childNodes.length; i++) {
        var node = body.childNodes[i];
        //console.log(node);

        // 如果节点是文本节点，则将其内容添加到textNode中
        if (node.nodeType === Node.TEXT_NODE) {
            textNode.data += node.data;
        }
        // 如果节点是元素节点，则递归处理其子节点
        else if (node.nodeType === Node.ELEMENT_NODE) {
            textNode.data += this.getTextFromHTML(node.innerHTML);
        }
    }

    // 返回所有文本内容
    return textNode.data.trim();
  }

  generateChildNodes(node) {
    console.log('Ai.generateChildNodes');

    if (!Ai.loadingInstance) {
      Ai.loadingInstance = Loading.service({text: '思考中...'});
    }

    if (!node) {
      let activeNodeList = this.mindMap.renderer.activeNodeList
      if (activeNodeList.length <= 0) return
      node = activeNodeList[0]
    }

    let parents = '';
    let parentNode = node;
    while (!parentNode.isRoot) {
      parentNode = parentNode.parent;
      if (parents) {
        parents = '-' + parents;
      }

      parents = '[' + this.getTextFromHTML(parentNode.nodeData.data.text) + ']' +
        parents;
    }

    let question = this.getTextFromHTML(node.nodeData.data.text);
    //console.log(node)
    let mindMap = this.mindMap;
    const urlParams = new URLSearchParams(window.location.search);
    const drupalPath = urlParams.get('path');
    const id = urlParams.get('id');
    let api = window.location.origin + drupalPath +
      'ai/mindmap/?q=' + question;
    if (parents)  {
      api += '&parents=' + encodeURIComponent(parents);
    }

    fetch(api)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        let d = [];
        if (data.nodes) {
          for (let node in data.nodes) {
            d.push({ data: { text: data.nodes[node] }});
          }
          this.mindMap.execCommand('INSERT_MULTI_CHILD_NODE', [], d);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        Ai.loadingInstance.close();
        Ai.loadingInstance = null;
      });
  }

  // 插件被移除前做的事情
  beforePluginRemove() {
    this.unBindEvent()
  }

  // 插件被卸载前做的事情
  beforePluginDestroy() {
    this.unBindEvent()
  }
}

Ai.instanceName = 'ai'

export default Ai
