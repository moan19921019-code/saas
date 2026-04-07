/* 报告点评功能 */
(function(){
  var meta = document.querySelector('meta[name="report-id"]');
  var REPORT_ID = meta ? meta.getAttribute('content') : (window.__REPORT_ID__ || 'default-report');
  var COMMENTS = [];

  var style = document.createElement('style');
  style.textContent = [
    '#cp-toggle{position:fixed;right:20px;bottom:20px;z-index:9999;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:50%;width:50px;height:50px;font-size:20px;cursor:pointer;box-shadow:0 4px 16px rgba(102,126,234,.4);transition:all .2s;}',
    '#cp-toggle:hover{transform:scale(1.1);}',
    '#cp-toggle .cp-count{position:absolute;top:-6px;right:-6px;background:#f5576c;border-radius:50%;width:22px;height:22px;font-size:11px;display:none;align-items:center;justify-content:center;}',
    '#cp-panel{position:fixed;right:0;top:0;width:380px;height:100vh;background:#fff;box-shadow:-4px 0 24px rgba(0,0,0,.15);z-index:9998;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,"Microsoft YaHei",Arial,sans-serif;}',
    '#cp-panel.open{display:flex;}',
    '#cp-panel-header{padding:16px 18px;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between;background:#f9f9ff;flex-shrink:0;}',
    '#cp-panel-header h3{font-size:15px;color:#333;margin:0;}',
    '#cp-panel-close{background:none;border:none;font-size:22px;cursor:pointer;color:#888;padding:0 4px;line-height:1;}',
    '#cp-panel-close:hover{color:#333;}',
    '#cp-author-bar{padding:10px 16px;border-bottom:1px solid #eee;display:flex;align-items:center;gap:8px;background:#fafafa;font-size:13px;flex-shrink:0;}',
    '#cp-author-bar label{color:#666;white-space:nowrap;}',
    '#cp-author-bar input{border:1px solid #ddd;border-radius:4px;padding:5px 10px;font-size:13px;flex:1;outline:none;}',
    '#cp-author-bar input:focus{border-color:#667eea;}',
    '#cp-list{flex:1;overflow-y:auto;padding:12px 0;}',
    '.cp-empty{text-align:center;color:#bbb;padding:50px 0;font-size:13px;}',
    '.cp-item{margin:0 12px 12px;border:1px solid #eee;border-radius:10px;overflow:hidden;}',
    '.cp-item:hover{box-shadow:0 2px 10px rgba(0,0,0,.08);}',
    '.cp-item-header{display:flex;align-items:center;padding:10px 14px 8px;background:#f8f9ff;font-size:12px;color:#667eea;font-weight:600;}',
    '.cp-item-header .cp-time{color:#aaa;font-size:11px;font-weight:400;margin-left:auto;}',
    '.cp-item-body{padding:10px 14px 8px;font-size:13px;color:#333;line-height:1.7;white-space:pre-wrap;}',
    '.cp-item-body .cp-content{color:#444;}',
    '.cp-item-footer{padding:6px 14px 10px;display:flex;gap:6px;border-top:1px solid #f0f0f0;}',
    '.cp-item-footer button{background:#f5f5fa;border:1px solid #e0e0ee;border-radius:4px;padding:3px 10px;font-size:11px;cursor:pointer;color:#666;}',
    '.cp-item-footer button:hover{border-color:#667eea;color:#667eea;}',
    '.cp-item-footer button.del:hover{border-color:#f5576c;color:#f5576c;}',
    '.cp-replies{margin:8px 14px 0 28px;border-left:2px solid #e8e8f8;padding-left:12px;}',
    '.cp-reply-item{margin-bottom:8px;}',
    '.cp-reply-header{font-size:11px;color:#888;margin-bottom:3px;}',
    '.cp-reply-author{color:#667eea;font-weight:600;}',
    '.cp-reply-time{color:#bbb;margin-left:8px;}',
    '.cp-reply-body{font-size:12px;color:#444;line-height:1.5;white-space:pre-wrap;}',
    '.cp-reply-footer{display:flex;gap:6px;}',
    '.cp-reply-footer button{background:#f8f8fc;border:1px solid #e8e8f0;border-radius:3px;padding:2px 8px;font-size:10px;cursor:pointer;color:#999;}',
    '.cp-reply-footer button:hover{border-color:#667eea;color:#667eea;}',
    '.cp-reply-footer button.del:hover{border-color:#f5576c;color:#f5576c;}',
    '#cp-editor-bar{flex-shrink:0;border-top:1px solid #eee;background:#fafafa;padding:12px;}',
    '#cp-editor-bar textarea{width:100%;border:1px solid #ddd;border-radius:8px;padding:10px 12px;font-size:13px;resize:none;height:80px;outline:none;font-family:inherit;box-sizing:border-box;background:#fff;}',
    '#cp-editor-bar textarea:focus{border-color:#667eea;}',
    '#cp-editor-bar .cp-btn-row{display:flex;justify-content:flex-end;margin-top:8px;}',
    '#cp-editor-bar .cp-btn-row button{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:6px;padding:8px 20px;font-size:13px;cursor:pointer;}',
    '#cp-reply-editor{display:none;margin:8px 12px 0;padding:10px 12px;background:#f8f9ff;border-radius:8px;border:1px solid #e0e0f0;}',
    '#cp-reply-editor.show{display:block;}',
    '#cp-reply-editor textarea{width:100%;border:1px solid #ddd;border-radius:6px;padding:8px 10px;font-size:12px;resize:none;height:60px;outline:none;font-family:inherit;box-sizing:border-box;background:#fff;}',
    '#cp-reply-editor .cp-btn-row{display:flex;justify-content:flex-end;gap:8px;margin-top:8px;}',
    '#cp-reply-editor .cp-btn-row button{background:#667eea;color:#fff;border:none;border-radius:5px;padding:5px 14px;font-size:12px;cursor:pointer;}',
    '#cp-reply-editor .cp-btn-row button.cancel{background:#e0e0e0;color:#666;}',
    '.cp-toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 20px;border-radius:20px;font-size:13px;opacity:0;transition:opacity .3s;pointer-events:none;z-index:99999;}',
    '.cp-toast.show{opacity:1;}'
  ].join('');
  document.head.appendChild(style);

  var toggleBtn = document.createElement('button');
  toggleBtn.id = 'cp-toggle';
  toggleBtn.innerHTML = '<span style="font-size:20px;">💬</span><span class="cp-count" id="cp-count"></span>';
  toggleBtn.title = '点评面板';
  toggleBtn.onclick = function(){ document.getElementById('cp-panel').classList.toggle('open'); };
  document.body.appendChild(toggleBtn);

  var panel = document.createElement('div');
  panel.id = 'cp-panel';
  panel.innerHTML = [
    '<div id="cp-panel-header">',
      '<h3>📝 报告点评</h3>',
      '<button id="cp-panel-close" onclick="document.getElementById(\'cp-panel\').classList.remove(\'open\')">×</button>',
    '</div>',
    '<div id="cp-author-bar">',
      '<label>我的昵称：</label>',
      '<input type="text" id="cp-author-input" placeholder="匿名" maxlength="20">',
    '</div>',
    '<div id="cp-list"><div class="cp-empty">暂无点评，写下第一条吧~</div></div>',
    '<div id="cp-editor-bar">',
      '<textarea id="cp-main-textarea" placeholder="写下你的点评..."></textarea>',
      '<div class="cp-btn-row">',
        '<button onclick="cpSubmitComment()">发布点评</button>',
      '</div>',
    '</div>',
    '<div id="cp-reply-editor">',
      '<textarea id="cp-reply-textarea" placeholder="写下你的回复..."></textarea>',
      '<div class="cp-btn-row">',
        '<button class="cancel" onclick="cpCancelReply()">取消</button>',
        '<button onclick="cpSubmitReply()">发送回复</button>',
      '</div>',
    '</div>'
  ].join('');
  document.body.appendChild(panel);

  var toast = document.createElement('div');
  toast.id = 'cp-toast';
  document.body.appendChild(toast);

  window._cpToast = function(msg){
    var t = document.getElementById('cp-toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function(){ t.classList.remove('show'); }, 2000);
  };

  window.cpSubmitComment = function(){
    var ta = document.getElementById('cp-main-textarea');
    var content = ta.value.trim();
    if(!content){ window._cpToast('内容不能为空'); return; }
    var author = document.getElementById('cp-author-input').value.trim() || '匿名';
    fetch('/api/comments/' + REPORT_ID, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({content:content, author:author})
    }).then(function(r){ return r.json(); })
      .then(function(){
        ta.value = '';
        window._cpToast('点评已发布 ✓');
        loadComments();
      })
      .catch(function(){ window._cpToast('保存失败，请重试'); });
  };

  window.cpReplyId = null;
  window.cpOpenReply = function(id){
    cpReplyId = id;
    document.getElementById('cp-reply-editor').classList.add('show');
    document.getElementById('cp-reply-textarea').focus();
  };
  window.cpCancelReply = function(){
    cpReplyId = null;
    document.getElementById('cp-reply-editor').classList.remove('show');
    document.getElementById('cp-reply-textarea').value = '';
  };
  window.cpSubmitReply = function(){
    var ta = document.getElementById('cp-reply-textarea');
    var content = ta.value.trim();
    if(!content){ window._cpToast('回复内容不能为空'); return; }
    var author = document.getElementById('cp-author-input').value.trim() || '匿名';
    fetch('/api/comments/' + REPORT_ID, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({content:content, author:author, parent_id:cpReplyId})
    }).then(function(r){ return r.json(); })
      .then(function(){
        cpCancelReply();
        window._cpToast('回复已发送 ✓');
        loadComments();
      })
      .catch(function(){ window._cpToast('发送失败，请重试'); });
  };

  window.cpDelete = function(cid){
    if(!confirm('确定删除这条点评？')) return;
    fetch('/api/comments/item/' + cid, {method:'DELETE'})
      .then(function(r){ return r.json(); })
      .then(function(){ loadComments(); window._cpToast('已删除'); })
      .catch(function(){ window._cpToast('删除失败'); });
  };

  function escHtml(s){ if(!s) return ''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function escAttr(s){ if(!s) return ''; return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }

  function _countAll(){
    var n = COMMENTS.length;
    for(var i=0; i<COMMENTS.length; i++){
      n += (COMMENTS[i].replies ? COMMENTS[i].replies.length : 0);
    }
    return n;
  }

  function renderList(){
    var list = document.getElementById('cp-list');
    var count = document.getElementById('cp-count');
    if(!COMMENTS.length){
      list.innerHTML = '<div class="cp-empty">暂无点评，写下第一条吧~</div>';
      count.style.display = 'none';
      return;
    }
    count.style.display = 'flex';
    count.textContent = _countAll();
    list.innerHTML = COMMENTS.map(function(c){ return _renderItem(c); }).join('');
  }

  function _renderItem(c){
    var time = c.created_at ? c.created_at.slice(5,16) : '';
    var repliesHtml = '';
    if(c.replies && c.replies.length){
      repliesHtml = '<div class="cp-replies">' + c.replies.map(function(r){
        var rtime = r.created_at ? r.created_at.slice(5,16) : '';
        return '<div class="cp-reply-item">' +
          '<div class="cp-reply-header">' +
            '<span class="cp-reply-author">' + escHtml(r.author||'匿名') + '</span>' +
            '<span class="cp-reply-time">' + rtime + '</span>' +
          '</div>' +
          '<div class="cp-reply-body">' + escHtml(r.content) + '</div>' +
          '<div class="cp-reply-footer">' +
            '<button onclick="cpDelete(\'' + escAttr(r.id) + '\')" class="del">删除</button>' +
          '</div>' +
        '</div>';
      }).join('') + '</div>';
    }
    return '<div class="cp-item">' +
      '<div class="cp-item-header">' +
        '<span>' + escHtml(c.author||'匿名') + '</span>' +
        '<span class="cp-time">' + time + '</span>' +
      '</div>' +
      '<div class="cp-item-body">' +
        '<div class="cp-content">' + escHtml(c.content) + '</div>' +
      '</div>' +
      '<div class="cp-item-footer">' +
        '<button onclick="cpOpenReply(\'' + escAttr(c.id) + '\')">💬 回复</button>' +
        '<button onclick="cpDelete(\'' + escAttr(c.id) + '\')" class="del">🗑 删除</button>' +
      '</div>' +
      repliesHtml +
    '</div>';
  }

  function loadComments(){
    fetch('/api/comments/' + REPORT_ID)
      .then(function(r){ return r.json(); })
      .then(function(data){ COMMENTS = data; renderList(); })
      .catch(function(){ });
  }

  var authorInput = document.getElementById('cp-author-input');
  authorInput.value = localStorage.getItem('cp_author') || '';
  authorInput.addEventListener('change', function(){
    localStorage.setItem('cp_author', this.value);
  });

  loadComments();
})();
