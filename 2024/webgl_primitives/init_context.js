function init(
  canvas,
  vertex = ArticleScope.VERTEX_SHADER,
  fragment = ArticleScope.FRAGMENT_SHADER
) {
  if (canvas == null) {
    return;
  }

  // Postavljanje konteksta renderiranja za WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // Inicijalizacija shadera
  if (!initShaders(gl, vertex, fragment)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  return gl;
}
