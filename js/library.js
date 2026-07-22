(function(){
  var w=window; w.__copybook__=w.__copybook__||{};

  // Guard: React 18 dispatcher may be null when loaded as plain script tag
  // Check BEFORE destructuring - React production bundle does NOT expose hooks directly
  if (typeof React === 'undefined' || typeof React.useState === 'undefined') {
    w.__copybook__.library = {
      load: function() {},
      searchPoems: function() { return []; },
      searchTexts: function() { return []; },
      searchEnglish: function() { return []; },
      GRADES: [],
      LibraryPanel: function() { return React.createElement('div', {style: {padding: '20px', color: '#666'}}, '词库功能暂不可用'); }
    };
    return;
  }

  const { useState, useEffect, useMemo } = React;

  const GRADES=['一年级上册','一年级下册','二年级上册','二年级下册','三年级上册','三年级下册','四年级上册','四年级下册','五年级上册','五年级下册','六年级上册','六年级下册'];
