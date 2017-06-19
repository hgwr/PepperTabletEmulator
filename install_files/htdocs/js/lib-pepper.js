// lib-pepper.js
//
// 参考元: PepperをJavaScriptで動かそう！ http://qiita.com/ExA_DEV/items/dd4bda65dfab1e7f5d07
//
$(function(){

  var PepperIP = null;  // ここで Pepper の IP を文字列で直接指定できます。
  var qis, ip, als = {};

  function console_log(msg) {
    console.log(msg);
    if ($("#log").length > 0) {
      $("#log").prepend('<div>' + '[' + Date().toLocaleString() + '] ' + msg + '</div>');
    }
    if (als.alMemory) {
      als.alMemory.raiseEvent("PepperQiMessaging/fromtablet", msg);
    }
  }

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
      qis.service('ALAnimatedSpeech').done(function(ins){
        als.alAnimatedSpeech = ins;
      });
      qis.service('ALAnimationPlayer').done(function(ins){
        als.alAnimationPlayer = ins;
      });
      qis.service('ALTabletService').done(function(ins){
        als.alTabletService = ins;
      });
      qis.service("ALMemory").done(function (ins) {
        console_log("ALMemory 取得成功");
        als.alMemory = ins
        als.alMemory.raiseEvent("PepperQiMessaging/fromtablet", "JavaScript が ALMemory 取得成功");
      });

      qis.service('ALMemory').done(function(alMemory){
        alMemory.subscriber('HandLeftBackTouched').done(function(subscriber){
          subscriber.signal.connect(function(val){
            // イベントが発生すると呼び出される
            console_log('[EVENT]HandLeftBackTouched:' + val);
          });
        });

        alMemory.subscriber('ALAnimatedSpeech/EndOfAnimatedSpeech').done(function(subscriber){
          subscriber.signal.connect(function(val){
            // イベントが発生すると呼び出される
            console_log('[EVENT]ALAnimatedSpeech/EndOfAnimatedSpeech:' + val);
          });
        });

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
    if (als.alAnimatedSpeech) {
      console_log('calling als.alAnimatedSpeech.say');
      $('.speech').each(function() {
        console_log('data-text = ' + $(this).data('text'));
        console_log('data-gesture = ' + $(this).data('gesture'));
        if ($(this).data('text')) {
          als.alAnimatedSpeech.say($(this).data('text'));
        } else {
          als.alAnimatedSpeech.say($(this).text());
        }
        if ($(this).data('gesture')) {
          als.alAnimationPlayer.run("animations/Stand/Gestures/" + $(this).data('gesture'));
        }
      });
    } else {
      console_log('Error: ALAnimatedSpeech が取得できていません。');
    }
  }

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
    if (als.alAnimatedSpeech) {
      console_log('calling als.alAnimatedSpeech.say');
      als.alAnimatedSpeech.say($('#text-for-reading').val());
    } else {
      console_log('Error: ALAnimatedSpeech が取得できていません。');
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

  // ログ出力のテスト
  $('#send-log').on('click', function() {
    console_log('20160619 1522 ログ出力ボタンが押されました。');
    console_log($('#log-for-choregraphe').val());
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
