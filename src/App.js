import React from "react";
import { useEffect, useState } from "react";
import "./App.css";
//import Module from "./wasm/pong_react.mjs";
import MyWebWorkerExport from "./wasm/pong_threaded.mjs";

// When we use -s MODULARIZE=1, we must instantiate the Module through a constructor

const BLACK = "rgb(0,0,0)";
const RED = "rgb(230,100,250)";
const BLUE = "rgb(90,100,255)";
const WHITE = "rgb(255,255,255)";

var gameState;
var move, timings, fps, totalFrames, time, _frames, timing;

const App = () => {
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    // load the instance and set as state
    (async () => {
      setInstance(await initializeInstance());
    })();
  }, []);

  async function initializeInstance() {
    //const instance = await Module();
    const instance = await MyWebWorkerExport();
    return instance;
  }

  function buttonClick() {
    setupGameState();
    document.getElementById("name").remove();
    document.getElementById("btn").remove();
    document.getElementById("title").remove();
    render();
  }

  function setupGameState() {
    var MOVE = instance.Move;
    var name = document.getElementById("name").value;
    gameState = instance.createInitialGameState(name);

    move = MOVE.STATIONARY;
    timings = new Array(1000);

    fps = 0;
    _frames = 0;
    totalFrames = 0;
    time = Date.now();

    window.addEventListener("keydown", function (event) {
      var key = Number(event.keyCode);
      console.log(key);
      if (key == 40) {
        // down arrow
        gameState.move = MOVE.DOWN;
      }
      if (key == 38) {
        // up arrow
        gameState.move = MOVE.UP;
      }
    });

    window.addEventListener("keyup", function (event) {
      gameState.move = MOVE.STATIONARY;
    });
  }

  function render() {
    var lastTiming = Date.now();
    calculateFps();
    update();
    draw();
    timings[totalFrames % timings.length] = Date.now() - lastTiming;
    setTimeout(render, 0);
  }

  function calculateFps() {
    _frames += 1;
    totalFrames += 1;
    if (Date.now() - time > 1000) {
      fps = _frames / ((Date.now() - time) / 1000);
      _frames = 0;
      time = Date.now();
    }
  }

  function update() {
    gameState = instance.updatePosition(gameState);
  }

  function draw() {
    var ctx = document.getElementById("canvas").getContext("2d");
    drawBlackBackground(ctx);
    drawDottedLine(ctx);
    drawPaddles(ctx);
    drawBall(ctx);
    drawScore(ctx);
    drawFps(ctx);
    drawTimings(ctx);
  }

  function drawScore(ctx) {
    ctx.font = "60px Arial";
    ctx.strokeStyle = RED;
    ctx.strokeText(gameState.leftScore, 250, 50);
    ctx.strokeStyle = BLUE;
    ctx.strokeText(gameState.rightScore, 550, 50);
  }

  function drawBlackBackground(ctx) {
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, 800, 600);
  }

  function drawDottedLine(ctx) {
    ctx.strokeStyle = WHITE;
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.moveTo(400, 0);
    ctx.lineTo(400, 600);
    ctx.lineWidth = 10;
    ctx.stroke();

    // reset line
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
  }

  function drawPaddles(ctx) {
    ctx.fillStyle = RED;
    ctx.fillRect(gameState.left.xpos, gameState.left.ypos - 50, 25, 100);
    ctx.fillStyle = BLUE;
    ctx.fillRect(gameState.right.xpos, gameState.right.ypos - 50, 25, 100);
  }

  function drawBall(ctx) {
    ctx.fillStyle = WHITE;
    ctx.fillRect(gameState.ball.xpos, gameState.ball.ypos, 10, 10);
  }

  function drawFps(ctx) {
    ctx.font = "16px Arial";
    ctx.fillStyle = WHITE;
    ctx.fillText(fps.toFixed() + " Frames/Second", 650, 560);
  }

  function drawTimings(ctx) {
    ctx.font = "16px Arial";
    ctx.fillStyle = WHITE;
    timing =
      timings.reduce((a, b) => {
        return a + b;
      }, 0) / timings.length;
    ctx.fillText(timing.toFixed(2) + " ms render", 650, 580);
  }

  return (
    <div id="tableTennis" style={styles.container}>
      {instance && (
        <div style={styles.input}>
          <h5 id={"title"} style={styles.title}>
            Sonora Wasm React Integration
          </h5>
          <input
            style={styles.input}
            id="name"
            placeholder="Enter name"
          ></input>
          <button
            id="btn"
            type="submit"
            style={styles.button}
            onClick={() => buttonClick()}
          >
            Start!
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirectino: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BLACK,
  },
  input: {
    // marginTop: 20
  },
  title: {
    color: BLUE,
  },
  button: {
    // marginLeft: 100,
  },
};

export default App;
