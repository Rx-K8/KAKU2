# かくかく

## 導入方法

以下は計算機サーバー内で実行してください。

### Step1: Docker イメージの作成

Docker イメージを作成します。Dockerfile のあるディレクトリで実行してください。

```sh
$ docker build -t kaku2-app .
```

以下のようにイメージが作成されます。

```sh
$ docker images

REPOSITORY   TAG       IMAGE ID       CREATED          SIZE
kaku2-app    latest    a2ecf148985f   23 minutes ago   673MB
```

### Step2: Docker コンテナの作成

イメージが作成されていることが確認できれば、コンテナを作成します。

```sh
$ docker run -d --name kaku2-app -p 3000:3000 -v $(pwd):/app -v /app/node_modules kaku2-app
```

以下のようにコンテナが作成されています。

```sh
$ docker ps

CONTAINER ID   IMAGE       COMMAND                  CREATED          STATUS          PORTS                    NAMES
ec9ea3a9f017   kaku2-app   "docker-entrypoint.s…"   26 seconds ago   Up 25 seconds   0.0.0.0:3000->3000/tcp   kaku2-app
```

### Step3: Ollama コンテナの作成

Ollama の docker コンテナを作成します。

```sh
$ docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

### Step4: モデルのダウンロード

今回は、vlm として gemma3:27b を使っています。

```sh
$ docker exec -it ollama ollama pull gemma3:27b
```

## ブラウザにアクセスする

計算機サーバーでサーバーが立ち上がっているので、研究室の PC からアクセスできるようにする必要があります。
事前に ssh の設定をしておく必要があります。
そちらは各自で調べてください。

```sh
$ ssh cappuccino -L 3000:localhost:3000
$ ssh cappuccino -L 11434:localhost:11434
```

これを実行すると、計算機サーバーのポート番号 3000 番を研究室の PC のポート番号 3000 番でアクセスできるようになっています。
試しに、起動した PC 上のブラウザで、http://localhost:3000 にアクセスしてみてください。
