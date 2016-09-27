Choregraphe の バーチャルロボットで Pepper のタブレットをエミュレートするための設定例やサンプルコードなど

# はじめに<a id="sec-1" name="sec-1"></a>

hgwr/PepperTabletEmulator では、 [バーチャルロボットで Pepper のタブレットをエミュレート](http://tkawata.hatenablog.com/entry/2015/04/27/010050) で紹介されていた [tkawata1025/PepperTabletEmulator](https://github.com/tkawata1025/PepperTabletEmulator) を基に、 Apache の設定例を加えたりサンプルコードを追加していたりします。 
セットアップ手順で紹介しているソフトウェアのバージョンは 2016年9月頃のものです。
id:takuji\_kawata さんの情報は大変参考になりました。ありがとうございます。

# Mac 向け Pepper Tablet Emulator セットアップ手順<a id="sec-2" name="sec-2"></a>

## 前提条件<a id="sec-2-1" name="sec-2-1"></a>

-   テストは Mac OS X El Capitan 10.11.6 で行いました。
-   Python は Mac OS X に付属の /usr/bin/python を使用します。すなわち Python 2.7.10 です。これは NAOqi Python SDK による [制限](http://doc.aldebaran.com/2-1/dev/python/install_guide.html#mac) です。

## Choregraph のインストール<a id="sec-2-2" name="sec-2-2"></a>

-   <https://developer.softbankrobotics.com/jp-ja/downloads/nao-v5-v4> からダウンロードし、インストールします。
-   セットアッププログラムを実行すると、 /Applications/Aldebaran Robotics/Choregraphe Suite 2.1 にインストールされます。
-   2016年9月ごろですと、 Choregraphe Suite 2.1.4 がインストールされました。

## NAOqi Python SDK をインストール<a id="sec-2-3" name="sec-2-3"></a>

ダウンロードと設置の方法は次のとおりです。

[Python SDK Install Guide](http://doc.aldebaran.com/2-1/dev/python/install_guide.html) に従い、 Python SDK をインストールします。
[Retrieving software](http://doc.aldebaran.com/2-1/dev/community_software.html#retrieving-software) にあるとおり、ユーザ登録が必要になるかもしれません。

Python 2.7 SDK 2.1.4 Mac 64 を [Aldebaran Community](https://community.aldebaran.com/en/resources/software) からダウンロードします(注: いまは community.ald.softbankrobotics.com へのリダイレクトになっています)。
2016年9月現在では、 pynaoqi-python2.7-2.1.4.13-mac64.tar.gz が手に入ります。

ダウンロードしたファイルを適切な場所に展開します。

    cd ~/lib
    tar xzvf ~/Downloads/pynaoqi-python2.7-2.1.4.13-mac64.tar.gz

この場合では、インストールディレクトリは $HOME/lib/pynaoqi-python2.7-2.1.4.13-mac64 となります。

python コードから使用する場合は、下記のように環境変数を設定します。
(注: PepperTabletEmulator のシェルスクリプト内で環境変数を設定しているので、必ずしも ~/.bashrc などに設定を追加する必要はありません。)

    export PYTHONPATH=${PYTHONPATH}:${HOME}/lib/pynaoqi-python2.7-2.1.4.13-mac64
    export DYLD_LIBRARY_PATH=${DYLD_LIBRARY_PATH}:${HOME}/lib/pynaoqi-python2.7-2.1.4.13-mac64

Mac OS X El Capitan では System Integrity Protection(SIP) という新しいセキュリティー機能が原因で、NAOqi Python SDK が使えないようなので、 
[Mac OS X El Capitanで NAOqi 2.4.2 Python SDK を使う](http://qiita.com/tkawata1025/items/31dd49bcef04c85b3047) に従ってパッチを当てます。

## Web server のインストール、セットアップ<a id="sec-2-4" name="sec-2-4"></a>

オリジナルの [tkawata1025/PepperTabletEmulator](https://github.com/tkawata1025/PepperTabletEmulator)  では homebrew と nginx を使ったセットアップ例が紹介されていました。
わたしは以前より MacPorts で Apache を使用していたので、それをそのまま使った設定をしました。ここではその方法を紹介します。
nginx を使った設定については [オリジナルのドキュメント](https://github.com/tkawata1025/PepperTabletEmulator/blob/master/%25E3%2582%25A4%25E3%2583%25B3%25E3%2582%25B9%25E3%2583%2588%25E3%2583%25BC%25E3%2583%25AB%25E6%2589%258B%25E9%25A0%2586) をご覧ください。

### インストール<a id="sec-2-4-1" name="sec-2-4-1"></a>

Apache httpd がインストールされてなければ、インストールします。

    sudo port install apache2

### 設定ファイル<a id="sec-2-4-2" name="sec-2-4-2"></a>

install\_files/apache/sample.conf を参考にして VirtualHost を設定します。

### サンプルの html と js ファイルをブラウザから見れるようにします<a id="sec-2-4-3" name="sec-2-4-3"></a>

DocumentRoot から install\_files/htdocs へシンボリックリンクを張ります。
たとえば DocumentRoot が /opt/local/apache2/htdocs でしたら、下ののようにします。

    ln -s /somewhere/PepperTabletEmulator/install_files/htdocs /opt/local/apache2/htdocs/pepper

そしてブラウザから <http://127.0.0.1/pepper/> で、 install\_files/htdocs/index.html が見れるようにします。

index.html などのファイルがシンボリックリンクで参照できるように、 Options FollowSymLinks の設定の追加が必要になるかもしれません。
加えて、 Apache httpd プロセスが index.html などのファイルを閲覧可能になっているように、パーミッションの設定変更が必要かもしれません。
面倒な場合は、 DocumentRoot 以下に pepper 等ディレクトリを作成し、そこに install\_files/htdocs/ 以下のファイルを cp -r して置くのがいいかもしれません。

## libqi-js のセットアップ<a id="sec-2-5" name="sec-2-5"></a>

### libqi-js の入手と展開<a id="sec-2-5-1" name="sec-2-5-1"></a>

<https://github.com/aldebaran/libqi-js/> ページの [Download ZIP] ボタンを押して libqi-js のアーカイブを入手します。

### ファイルを展開し libqi-js の libs ディレクトリをブラウザから見れるようにします<a id="sec-2-5-2" name="sec-2-5-2"></a>

DocumentRoot が /opt/local/apache2/htdocs の場合は、展開したフォルダーの中に入って次を実行するなどします。

    cp -r libs /opt/local/apache2/htdocs

### qimessaging-json を /usr/local/bin に保存<a id="sec-2-5-3" name="sec-2-5-3"></a>

    cp qimessaging-json  /usr/local/bin

## tornadoのインストール<a id="sec-2-6" name="sec-2-6"></a>

### sudo pip install tornado<a id="sec-2-6-1" name="sec-2-6-1"></a>

pip をまだ設定していない場合、次のコマンドを実行してまず pip をインストールします。

    sudo easy_install pip

## tornadio2 のインストール<a id="sec-2-7" name="sec-2-7"></a>

-   <https://github.com/MrJoes/tornadio2> 右下 [Downlad ZIP]ボタンを押して、tornadio2 アーカイブファイルを入手
-   ファイルを展開して、展開したフォルダーの中に入って次を実行

    sudo ./setup.py install

## Pepper Tablet Emulator のセットアップ<a id="sec-2-8" name="sec-2-8"></a>

-   作業用ディレクトリを作成、移動
-   次のコマンドを実行

    git clone https://github.com/hgwr/PepperTabletEmulator.git
    cd PepperTabletEmulator
    cp install_files/PepperTabletEmulator.py /usr/local/bin/

### sh\_settings の編集<a id="sec-2-8-1" name="sec-2-8-1"></a>

ファイル sh\_settings.sample を sh\_settings としてコピーします。
ファイル sh\_settings を編集し、  NAOqi Python SDK を保存した場所 と Choregraphe のインストールディレクトリを設定します。

# Mac 向け Pepper Tablet Emulator 起動手順<a id="sec-3" name="sec-3"></a>

## Apache を起動<a id="sec-3-1" name="sec-3-1"></a>

[howto/Apache2 – MacPorts](https://trac.macports.org/wiki/howto/Apache2) に従うなどして、 Apache httpd  を起動します。

## シェルスクリプト群を使用し、次の手順で Pepper Tablet Emulator を起動します<a id="sec-3-2" name="sec-3-2"></a>

Choregraphe が起動してないことを確かめます。

PepperTabletEmulator のディレクトリに cd してあるターミナルを4つ用意します。つまり Terminal.app を 4つ開きます。

それぞれで PepperTabletEmulator ディレクトリにある以下の4つのシェルスクリプトを順に起動します。

### ターミナル1<a id="sec-3-2-1" name="sec-3-2-1"></a>

    $ ./01_run_naoqi-bin.sh
    ... ログ出力がたくさんでます ...
    [I] 48131 core.naoqi: NAOqi is ready...

上のように NAOqi is ready&#x2026; になったら、ターミナル2に移動します。

### ターミナル2<a id="sec-3-2-2" name="sec-3-2-2"></a>

    $ ./02_run_qimessaging-json.sh

上を実行すると、ファイアウォール警告のダイアログ「アプリケーション "Python.app" へのネットワーク受信接続を許可しますか？」が表示されると思います。
その場合は許可します。

### ターミナル3<a id="sec-3-2-3" name="sec-3-2-3"></a>

    $ ./03_run_PepperTabletEmulator.sh

こちらもファイアウォール警告が表示された場合、許可します。

### ターミナル4<a id="sec-3-2-4" name="sec-3-2-4"></a>

    $ ./04_run_choregraphe.sh

上を実行すると、 Choregraphe が起動します。
Choregraphe で PepperTabletEmulator/choregraphe/start-web-interface/start-web-interface.pml を開いてください。
すると、 Say と Hello と Show Web View のボックスがつながっているダイアグラムのソースが表示されます。

### Choregraphe を操作し、ヴァーチャルロボットに喋らせるデモを実行します<a id="sec-3-2-5" name="sec-3-2-5"></a>

Choregraphe の Play ボタンを押すと、 Say ボックスにより「Please wait, Loading&#x2026;」のような発話が「ダイアログ」の部分に表示され、次に Hello ボックスによって手を振る挨拶の動作表示が、ロボットビューで表示されます。

そして Show Web View ボックスに実行が至ると Safari (もしくはデフォルトのブラウザ)が起動し、 <http://127.0.0.1/pepper/> が表示されます。
ここで表示されるページの html ソースは install\_files/htdocs/index.html で、 JavaScript ソースは install\_files/htdocs/js/pepper.js です。
ここでブラウザで開発者コンソールを表示しておいてください。
pepper.js から console.log(&#x2026;) で出力されるログを確認するためです。

04\_run\_choregraphe.sh によって、 Choregraphe が起動中のはずです。これによって 127.0.0.1 でヴァーチャルロボットが立ち上げられていると思います。
Choregraphe 画面右下のロボットビューに表示されている Pepper のことです。接続状況は Choregraphe の接続ボタンまたは接続メニューの「接続&#x2026;」で確認できます。
ブラウザで表示されているペッパーの IP アドレス欄は、デフォルト値の 127.0.0.1 のまま接続ボタンを押します。

ブラウザの開発者コンソールに、次のように表示されるかもしれません。

    [CONNECTION ERROR] でも10秒くらい待つと [CONNECTED] になることもあります。

その場合は10秒ほど待つと、 [CONNECTED] と表示され、 qimessaging.js による JavaScript からヴァーチャルロボットへの接続が完了します。
その後ブラウザ上の「テスト」ボタンを押してください。

Choregraphe の 「ダイアログ」の部分に、「Please wait, Loading&#x2026;」のような発話が表示されていましたが、それに追加されて html 中のテキストが発話されるはずです。

    ロボット：Please wait, Loading...
    ロボット：Please wait, Loading...
    ロボット：こんにちは、僕はペッパー！[Wed Sep 29 2016 09:48:10 GMT+0900 (JST)]
    ロボット：ペッパーに話させるテキスト
    ロボット：ペッパーに話させる属性値テキスト

これらの発話は install\_files/htdocs/js/pepper.js によって行われています。

## 終了手順<a id="sec-3-3" name="sec-3-3"></a>

Choregraphe を終了させます。そのあと ターミナル3、ターミナル2、ターミナル1 で Ctrl-C を押し、プロセスを終了させます。
