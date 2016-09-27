# -*- mode: org -*-
#+TITLE: Choregraphe の バーチャルロボットで Pepper のタブレットをエミュレートするための設定例やサンプルコードなど
#+AUTHOR: Shigeru Hagiwara
#+EMAIL: hgwr@moreslowly.jp
#+DATE: 2016-09-29 ごろ

Choregraphe の バーチャルロボットで Pepper のタブレットをエミュレートするための設定例やサンプルコードなど

* はじめに

[[http://tkawata.hatenablog.com/entry/2015/04/27/010050][バーチャルロボットで Pepper のタブレットをエミュレート]] で紹介されていた [[https://github.com/tkawata1025/PepperTabletEmulator][tkawata1025/PepperTabletEmulator]] を基に、 Apache の設定例を加えたり、サンプルコードを追加していたりします。 
セットアップ手順で紹介しているソフトウェアのバージョンなどは、 2016年9月頃のものです。
id:takuji_kawata さんの情報は大変参考になりました。ありがとうございます。

* Mac 向け Pepper Tablet Emulator セットアップ手順

** 前提条件

- テストは Mac OS X El Capitan 10.11.6 で行いました。
- python は Mac OS X に付属の /usr/bin/python を使用します。すなわち Python 2.7.10 です。これは NAOqi Python SDK による制限です。

** Choregraph のインストール

- https://developer.softbankrobotics.com/jp-ja/downloads/nao-v5-v4 からダウンロードし、インストールします。
- セットアッププログラムを実行すると、 /Applications/Aldebaran Robotics/Choregraphe Suite 2.1 にインストールされます。
- 2016年9月ごろですと、 Choregraphe Suite 2.1.4 がインストールされます。

** NAOqi Python SDK をインストール

ダウンロードと設置の方法は次のとおりです。

[[http://doc.aldebaran.com/2-1/dev/python/install_guide.html][Python SDK Install Guide]] に従い、 Python SDK をインストールします。
[[http://doc.aldebaran.com/2-1/dev/community_software.html#retrieving-software][Retrieving software]] に従い、ユーザ登録などが必要になるかもしれません。

Python 2.7 SDK 2.1.4 Mac 64 を [[https://community.aldebaran.com/en/resources/software][Aldebaran Community]] からダウンロードします(注: いまは community.aldebaran.com へのリダイレクトになっています)。
2016年9月頃ですと、 pynaoqi-python2.7-2.1.4.13-mac64.tar.gz が手に入ります。

ダウンロードしたファイルを適切な場所に展開します。

例：
: cd ~/lib
: tar xzvf ~/Downloads/pynaoqi-python2.7-2.1.4.13-mac64.tar.gz 

この場合では、インストールディレクトリは $HOME/lib/pynaoqi-python2.7-2.1.4.13-mac64 となります。

python コードから使用する場合は、下記のように環境変数を設定します。
注) PepperTabletEmulator のシェルスクリプト内で環境変数を設定しているので、必ずしも ~/.bashrc などに設定を追加する必要はありません。

: $ export PYTHONPATH=${PYTHONPATH}:${HOME}/lib/pynaoqi-python2.7-2.1.4.13-mac64
: $ export DYLD_LIBRARY_PATH=${DYLD_LIBRARY_PATH}:${HOME}/lib/pynaoqi-python2.7-2.1.4.13-mac64

Mac OS X El Capitan では System Integrity Protection(SIP) という新しいセキュリティー機能が原因で、NAOqi Python SDK が使えないようなので、 
[[http://qiita.com/tkawata1025/items/31dd49bcef04c85b3047][Mac OS X El Capitanで NAOqi 2.4.2 Python SDK を使う]] に従ってパッチを当てます。

** web server のインストール、セットアップ

オリジナルの [[https://github.com/tkawata1025/PepperTabletEmulator][tkawata1025/PepperTabletEmulator]]  では homebrew と nginx を使ったセットアップ例が紹介されていました。
わたしは以前より MacPorts で Apache を使用していたので、それをそのまま使った設定をしました。

Apache httpd をインストールします。

: port install apache2 

install_files/apache/sample.conf を参考にして VirtualHost を設定します。

DocumentRoot から install_files/htdocs へシンボリックリンクを張ります。
たとえば DocumentRoot が /opt/local/apache2/htdocs でしたら、下ののようにします。

: ln -s /somewhere/PepperTabletEmulator/install_files/htdocs /opt/local/apache2/htdocs/pepper 

そしてブラウザから http://127.0.0.1/pepper/ で、 install_files/htdocs/index.html が見れるようにします。

シンボリックリンクでファイルを参照できるように、 Options FollowSymLinks の設定の追加が必要になるかもしれません。
加えて index.html 等のファイルを、 apache プロセスが閲覧可能になっているようパーミッションの設定変更が必要かもしれません。
面倒な場合は、 DocumentRoot 以下に pepper 等ディレクトリを作成し、そこに install_files/htdocs/ 以下のファイルを cp して置くのがいいかもしれません。

** libqi-js のセットアップ

*** https://github.com/aldebaran/libqi-js/ ページの [Download ZIP] ボタンを押して libqi-js のアーカイブを入手

*** ファイルを展開し libqi-js の libs ディレクトリをブラウザから見れるようにします

DocumentRoot が /opt/local/apache2/htdocs の場合は、展開したフォルダーの中に入って次を実行するなどします。

: cp -r libs /opt/local/apache2/htdocs

*** qimessaging-json を /usr/local/bin に保存

cp qimessaging-json  /usr/local/bin

** tornadoのインストール

*** sudo pip install tornado

pip をまだ設定していない場合、次のコマンドを実行してまず pip をインストールします

: sudo easy_install pip

** tornadio2 のインストール

-  https://github.com/MrJoes/tornadio2 右下 [Downlad ZIP]ボタンを押して、tornadio2 アーカイブファイルを入手
- ファイルを展開して、展開したフォルダーの中に入って次を実行

** Pepper Tablet Emulatorのセットアップ

- 作業用ディレクトリを作成、移動
- 次のコマンドを実行

: git clone https://github.com/tkawata1025/PepperTabletEmulator.git
: cd PepperTabletEmulator
: cp install_files/PepperTabletEmulator.py /usr/local/bin/
: cp install_files/nginx/nginx.conf /usr/local/etc/nginx/

*** Choregraphe2.4_te.sh をテキストエディタで開き３行目を変更を環境に合わせて任意に変更

: NAOQISDK="$HOME/naoqi/pynaoqi-python2.7-2.1.4.26-mac64" # <--- NAOqi Python SDK を保存した場所で書き換える

** Mac OS X El Capitan の場合 - SDK へのパッチ

Mac OS X El Capitan を使っている場合、次を参考に Python SDK にパッチを当てます

http://qiita.com/tkawata1025/items/31dd49bcef04c85b3047

* # Mac 向け Pepper Tablet Emulator 起動手順

** nginx を起動

: sudo nginx

** ターミナルから次を起動

./Choregraphe2.4_te.sh

