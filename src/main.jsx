import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// ファビコンとタイトルを動的に設定
document.title = "KAKU2";

// 既存のファビコンを削除
const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
existingFavicons.forEach((favicon) => favicon.remove());

// 新しいファビコンを追加（ローカル画像ファイルを使用）
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/png"; // 画像形式に応じて変更
favicon.href = "/favicon.jpg"; // publicフォルダ内のファイルパス
document.head.appendChild(favicon);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
