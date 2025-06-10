import React from "react";
import { Stage, Layer, Line, Circle } from "react-konva";
import {
  FaPen,
  FaEraser,
  FaTrash,
  FaDownload,
  FaRobot,
  FaPalette,
  FaTimes,
} from "react-icons/fa";
import { Ollama } from "ollama";

const App = () => {
  const [tool, setTool] = React.useState("pen");
  const [lines, setLines] = React.useState([]);
  const [brushSize, setBrushSize] = React.useState(5);
  const [penColor, setPenColor] = React.useState("#000000");
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState("");
  const [showResult, setShowResult] = React.useState(false);
  const isDrawing = React.useRef(false);
  const stageRef = React.useRef();

  // プリセット色
  const presetColors = [
    "#000000", // 黒
    "#df4b26", // 赤
    "#ff0000", // 赤
    "#00ff00", // 緑
    "#0000ff", // 青
    "#ffff00", // 黄色
    "#ff00ff", // マゼンタ
    "#00ffff", // シアン
    "#ffa500", // オレンジ
    "#800080", // 紫
    "#008000", // 深緑
    "#000080", // 紺
  ];

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([
      ...lines,
      { tool, points: [pos.x, pos.y], size: brushSize, color: penColor },
    ]);
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    // カーソル位置を更新
    setCursorPos({ x: point.x, y: point.y });

    if (!isDrawing.current) {
      return;
    }
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  // ...existing code...
  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleMouseEnter = () => {
    setShowCursor(true);
  };

  const handleMouseLeave = () => {
    setShowCursor(false);
  };

  const handleClearAll = () => {
    setLines([]);
  };

  const handleAnalyzeImage = async () => {
    try {
      setIsAnalyzing(true);
      setShowResult(false);
      setAnalysisResult("");

      // Canvasから画像データを取得
      const uri = stageRef.current.toDataURL({
        mimeType: "image/png",
        quality: 1,
        pixelRatio: 2,
      });

      // Base64データからprefixを除去
      const base64Data = uri.replace(/^data:image\/png;base64,/, "");

      // Ollamaインスタンスを作成
      const ollama = new Ollama({ host: "http://127.0.0.1:11434" });

      // 画像分析を実行
      const response = await ollama.chat({
        model: "gemma3:27b", // 画像認識に対応したモデル
        messages: [
          {
            role: "user",
            content:
              "この手描きイラストには何が描かれていますか？単語だけを簡潔に出力してください。不必要な出力は絶対にしないでください。",
            images: [base64Data],
          },
        ],
      });

      // 結果を状態に保存して表示
      setAnalysisResult(response.message.content);
      setShowResult(true);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setAnalysisResult(
        "画像分析中にエラーが発生しました。Ollamaが起動していることを確認してください。"
      );
      setShowResult(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      {/* 上部の表示領域（常に確保） */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-lg z-50">
        {showResult ? (
          <div className="flex items-center justify-between max-w-4xl mx-auto h-full px-4">
            <div className="flex items-center gap-3">
              <FaRobot className="text-purple-600 text-lg" />
              <span className="font-medium text-gray-700">分析結果:</span>
              <span className="text-lg font-semibold text-gray-900">
                {analysisResult}
              </span>
            </div>
            <button
              onClick={() => setShowResult(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="閉じる"
            >
              <FaTimes />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400 text-sm">
              画像を描いて分析ボタンを押してください
            </span>
          </div>
        )}
      </div>

      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight - 64} // 上部領域分を引く
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        style={{
          cursor: tool === "eraser" ? "none" : "crosshair",
          marginTop: "64px", // 上部領域分のマージン
        }}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color || "#df4b26"}
              strokeWidth={line.size || 5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
          {/* 消しゴムカーソル */}
          {tool === "eraser" && showCursor && (
            <Circle
              x={cursorPos.x}
              y={cursorPos.y}
              radius={brushSize / 2}
              stroke="#666"
              strokeWidth={1}
              dash={[4, 4]}
              listening={false}
            />
          )}
        </Layer>
      </Stage>

      {/* サイズスライダーとプレビュー */}
      <div className="absolute left-5 top-20 bg-white p-4 rounded-lg shadow-lg z-50 border border-gray-200">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 min-w-40">
              {tool === "pen" ? "ペン" : "消しゴム"}のサイズ: {brushSize}px
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          {/* サイズプレビュー - 固定領域 */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">プレビュー</span>
            <div className="w-16 h-16 flex items-center justify-center border border-gray-200 rounded bg-gray-50">
              <div
                className="rounded-full"
                style={{
                  backgroundColor: tool === "pen" ? penColor : "#9ca3af",
                  width: `${brushSize}px`,
                  height: `${brushSize}px`,
                  minWidth: "1px",
                  minHeight: "1px",
                }}
              />
            </div>
          </div>
        </div>

        {/* 色選択セクション */}
        {tool === "pen" && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-gray-700">色:</label>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
              >
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: penColor }}
                />
                <FaPalette className="text-xs" />
              </button>
            </div>

            {showColorPicker && (
              <div className="grid grid-cols-6 gap-2 p-2 border border-gray-200 rounded bg-gray-50">
                {presetColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setPenColor(color);
                      setShowColorPicker(false);
                    }}
                    className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                      penColor === color ? "border-gray-800" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                {/* カスタム色選択 */}
                <input
                  type="color"
                  value={penColor}
                  onChange={(e) => setPenColor(e.target.value)}
                  className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                  title="カスタム色"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 p-3 rounded-full shadow-lg flex gap-3 z-50 border-1 border-black">
        <button
          onClick={() => setTool("pen")}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-200 ${
            tool === "pen"
              ? "bg-blue-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-200"
          } `}
          title="ペン"
        >
          <FaPen />
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-200 ${
            tool === "eraser"
              ? "bg-blue-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-200"
          } `}
          title="消しゴム"
        >
          <FaEraser />
        </button>
        <button
          onClick={handleAnalyzeImage}
          disabled={isAnalyzing}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-200 ${
            isAnalyzing
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
          }`}
          title={isAnalyzing ? "分析中..." : "画像分析"}
        >
          {isAnalyzing ? "⏳" : <FaRobot />}
        </button>
        <button
          onClick={handleClearAll}
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-200 text-gray-600 hover:bg-red-50 hover:text-red-600"
          title="全消し"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default App;
