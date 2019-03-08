// ==UserScript==
// @name         Anki_Search
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  同步搜索Anki上的内容
// @author       Yekingyan
// @run-at       document-start
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @match        https://www.google.com/
// @include      https://www.google.com/*
// @include      https://www.bing.com/*
// @include      http://www.bing.com/*
// @include      https://cn.bing.com/
// @include      https://www.baidu.com/*
// @include      http://www.baidu.com/*
// @include      https://search.yahoo.com/*
// @include      http://search.yahoo.com/*
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        document.querySelector
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_addStyle
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';
    // Your code here...

    function getJSON(url, callback) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            headers: {
                'Accept': 'application/json'
            },
            onload: function (response) {
                if (response.status >= 200 && response.status < 400) {
                    callback(JSON.parse(response.responseText), url);
                } else {
                    callback(false, url);
                }
            }
        });
    }
//---------------------------------------------------------------------------------
let local_url = 'http://127.0.0.1:8765'


let getHostSearchInput = () => {
  /**
   * 获取当前网站的搜索输入框
   *  */
  let host = window.location.host
  let searchInput = undefined
  if (host.includes('google')) {
    searchInput = $('.gLFyf')
  } else if (host.includes('bing')) {
    searchInput = $('.b_searchbox')
  } else if (host.includes('baidu')) {
    searchInput = $('#kw')
  } else if (host.includes('yahoo')) {
    searchInput = $('#yschsp')
  }

  return searchInput
}

let commonData = (action, params) => {
  /**
   * 请求的共同数据结构
   * action: str findNotes notesInfo
   * params: dict
   * return: dict
   */
  return {
    "action": action,
    "version": 6,
    "params": params
  }
}


const searchByTest =  (searchText, from='-deck:English') => {
  const _searchByTest = new Promise( (resolve, reject) => {
    /**
     * 搜索文字返回含卡片ID的数组
     * searchText: str 要搜索的内容
     * from:    str 搜索特定的牌组
     * return:   array noteIds
     */
    let query = `${from} ${searchText}`
    let data = commonData('findNotes', {'query': query})
    data = JSON.stringify(data)
    $.post(local_url, data)
      .done((res) => {
        console.log('promise', res.result)
        resolve(res.result)
      })
      .fail((err) => {
        reject(err)
      })
  })
  return _searchByTest
}



let searchByIds = (ids) => {
  /**
   * 通过卡片Id获取卡片列表
   */
  let notes = ids
  let data = commonData('notesInfo', {'notes': notes})
  data = JSON.stringify(data)
  console.log('data', data)
  $.post(local_url, data)
    .done((res) => {
      console.log('done', res)
    })
    .fail((err) => {
      console.log('err', err)
    })
}


$(document).ready(() => {
  // 获取输入框
  let searchInput = getHostSearchInput()
  // 监听事件
  if (searchInput) {
    searchInput.on('keyup', () => {
      let searchValue = searchInput.val()
      console.log(searchValue)
      searchByTest(searchValue)
        .then((ids)=> {
          let result = searchByIds(ids)
        })

    })
  }

})
//-----------------------------------------------------------------------

})();