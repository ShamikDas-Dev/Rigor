import { DrawingUtils } from "@mediapipe/tasks-vision";

export function drawPose(
  canvas,
  landmarks,
  width,
  height
) {
  if (!canvas || !landmarks) {
    return;
  }

  const ctx = canvas.getContext("2d");

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  const drawingUtils =
    new DrawingUtils(ctx);

  drawingUtils.drawConnectors(
    landmarks,
    [
      [11, 12],

      [11, 13],
      [13, 15],

      [12, 14],
      [14, 16],

      [11, 23],
      [12, 24],

      [23, 24],

      [23, 25],
      [25, 27],

      [24, 26],
      [26, 28],

      [27, 31],
      [28, 32],
    ],
    {
      color: "#ff2020",
      lineWidth: 4,
    }
  );

  drawingUtils.drawLandmarks(
    landmarks,
    {
      color: "#ff2020",
      fillColor: "#ff2020",
      radius: 5,
    }
  );
}