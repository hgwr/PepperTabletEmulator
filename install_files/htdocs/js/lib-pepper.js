// lib-pepper.js
//
// 参考元: PepperをJavaScriptで動かそう！ http://qiita.com/ExA_DEV/items/dd4bda65dfab1e7f5d07
//
$(function(){

  function console_log(msg) {
    console.log(msg);
    if ($("#log").length > 0) {
      $("#log").prepend('<div>' + '[' + Date().toLocaleString() + '] ' + msg + '</div>');
    }
  }

  var PepperIP = null;  // ここで Pepper の IP を文字列で直接指定できます。

  function connectToPepper() {
    console_log('connecting');
    // 入力IP取得
    ip = $('#ip').val() || PepperIP || 'pepper.local';
    // NAOqi Session 生成
    qis = new QiSession(ip);
    // 接続
    qis.socket().on('connect', function() {
        // 接続成功
        console_log('[CONNECTED]');
        qis.service('ALTextToSpeech').done(function(ins){
          als.alTextToSpeech = ins;
        });
        qis.service('ALAnimationPlayer').done(function(ins){
          als.alAnimationPlayer = ins;
        });
        qis.service('ALTabletService').done(function(ins){
          als.alTabletService = ins;
        });

      }).on('disconnect', function() {
        // 接続断
        console_log('[DISCONNECTED]');
      }).on('error', function() {
        // 接続エラー
        console_log('[CONNECTION ERROR] でも10秒くらい待つと [CONNECTED] になることもあります。');
      });
  }

  function runSpeech() {
    console_log('start runSpeech()');
    if (als.alTextToSpeech) {
      console_log('calling als.alTextToSpeech.say');
      $('.speech').each(function() {
        if ($(this).data('text')) {
          als.alTextToSpeech.say($(this).data('text'));
        } else {
          als.alTextToSpeech.say($(this).text());
        }
        if ($(this).data('gesture')) {
          als.alAnimationPlayer.run("animations/Stand/Gestures/" + $(this).data('gesture'));
        }
      });
    } else {
      console_log('Error: ALTextToSpeech が取得できていません。');
    }
  }

  var qis, ip, als = {};

  console_log('start');
  // ページロード後、自動で接続し読み上げをはじめます。
  setTimeout(function() {
    connectToPepper();
    setTimeout(function() { runSpeech(); }, 1000);
  }, 1000);

  // 接続ボタンclickイベント
  $('#connect-btn').on('click', connectToPepper);

  // 読み上げボタン click イベント
  $('#reading-btn').on('click', function() {
    console_log('reading button pushed');
    if (als.alTextToSpeech) {
      console_log('calling als.alTextToSpeech.say');
      als.alTextToSpeech.say($('#text-for-reading').val());
    } else {
      console_log('Error: ALTextToSpeech が取得できていません。');
    }
  });

  // タブレットに URL 表示
  $('#load-url-btn').on('click', function() {
    console_log('タブレットに表示ボタンが押されました。');
    if (als.alTabletService) {
      console_log('calling als.alTabletService');
      als.alTabletService.showWebview();
      als.alTabletService.loadUrl($('#url-for-tablet').val());
    } else {
      console_log('Error: AlTabletService が取得できていません。');
    }
  });

  // Hey ボタン
  $('#hey-btn').on('click', function() {
    console_log('reading button pushed');
    if (als.alAnimationPlayer) {
      console_log('calling als.alAnimationPlayer.run')
      als.alAnimationPlayer.run("animations/Stand/Gestures/Hey_1");
    } else {
      console_log('AlAnimationPlayer が取得できていません。');
    }
  });

  // ジェスチャー細目メニューの設定
  function setSubGestureMenu(index) {
    var narrowedGestures = Gestures[index].list;
    $('#gesture-menu').html("");
    for (var i = 0; i < narrowedGestures.length; i++) {
      var optionHtml = $('<option>' + narrowedGestures[i] + '</option>');
      $('#gesture-menu').append(optionHtml);
    }
  }

  // ジェスチャーメニューの作成
  if ($('#gesture-group-menu').length > 0) {
    for (var i = 0; i < Gestures.length; i++) {
      var optionHtml = $('<option data-index=' + i + '>' + Gestures[i].key + '</option>');
      $('#gesture-group-menu').append(optionHtml);
    }
    setSubGestureMenu(0);
  }

  // ジェスチャーグループメニューが選択されたら、ジェスチャー細目メニューの内容を更新します。
  $('#gesture-group-menu').on('change', function() {
    setSubGestureMenu(this.selectedIndex);
  });

  $('#run-gesture-btn').on('click', function() {
    var gesture = $('#gesture-menu option:selected').text();
    console_log(gesture);
    als.alAnimationPlayer.run("animations/Stand/Gestures/" + gesture);
  });

});
