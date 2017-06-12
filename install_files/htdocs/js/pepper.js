//
// 参考元: PepperをJavaScriptで動かそう！ http://qiita.com/ExA_DEV/items/dd4bda65dfab1e7f5d07
//
$(function(){

  function console_log(msg) {
    console.log(msg);
    if ($("#log").length > 0) {
      $("#log").append('<div>' + '[' + Date().toLocaleString() + '] ' + msg + '</div>');
    }
  }

  var qis, ip, als = {};

  console_log('start');

  // 接続ボタンclickイベント
  $('#connect-btn').on('click', function(){
    // 入力IP取得
    ip = $('#ip').val();
    // NAOqi Session 生成
    qis = new QiSession(ip);
    // 接続
    qis.socket()
      .on('connect', function(){
        // 接続成功
        console_log('[CONNECTED]');
        qis.service('ALTextToSpeech').done(function(ins){
          als.alTextToSpeech = ins;
        });

        console_log("### set timeout to speak");
        setTimeout(function() {
          console_log("### trigger click test-btn");
          $('#test-btn').trigger('click');
        }, 5000);

        // TODO
        qis.service('ALMemory').done(function(alMemory){
          alMemory.subscriber('HandLeftBackTouched').done(function(subscriber){
            subscriber.signal.connect(function(val){
              // イベントが発生すると呼び出される
              console.log('[EVENT]HandLeftBackTouched:' + val);
            });
          });
        });

      })
      .on('disconnect', function(){
        // 接続断
        console_log('[DISCONNECTED]');
      })
      .on('error', function(){
        // 接続エラー
        console_log('[CONNECTION ERROR] でも10秒くらい待つと [CONNECTED] になることもあります。');
      });
  });

  // テストボタンclickイベント
  $('#test-btn').on('click', function(){
    // TODO: ここに動作確認のコードを書く
    console_log('[TEST]');
    if (als.alTextToSpeech) {
      console_log('calling als.alTextToSpeech.say');
      als.alTextToSpeech.say('こんにちは、僕はペッパー！' + '[' + Date().toLocaleString() + '] ');

      $('.speech').each(function() {
        if ($(this).data('text')) {
          als.alTextToSpeech.say($(this).data('text'));
        } else {
          als.alTextToSpeech.say($(this).text());
        }
      });
    }
  });

  console_log("### set timeout");
  setTimeout(function() {
    console_log("### trigger click connect-btn");
    $('#connect-btn').trigger('click');
  }, 5000);
});
