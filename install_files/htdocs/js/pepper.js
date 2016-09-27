//
// 参考元: PepperをJavaScriptで動かそう！ http://qiita.com/ExA_DEV/items/dd4bda65dfab1e7f5d07
//
$(function(){
  var qis, ip, als = {};

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
        console.log('[CONNECTED]');
        qis.service('ALTextToSpeech').done(function(ins){
          als.alTextToSpeech = ins;
        });
      })
      .on('disconnect', function(){
        // 接続断
        console.log('[DISCONNECTED]');
      })
      .on('error', function(){
        // 接続エラー
        console.log('[CONNECTION ERROR] でも10秒くらい待つと [CONNECTED] になることもあります。');
      });
  });

  // テストボタンclickイベント
  $('#test-btn').on('click', function(){
    // TODO: ここに動作確認のコードを書く
    console.log('[TEST]');
    if (als.alTextToSpeech) {
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
});
