varying vec2 vUv;


uniform sampler2D uSampler2;
uniform float displacementFactor;

void main() {
    vUv = uv;
    vec4 textureColor = texture2D(uSampler2, uv);
    float grayscale = dot(textureColor.rgb, vec3(0.299, 0.587, 0.114));
    vec3 displacedPosition = position + normal * displacementFactor * grayscale;
    vec4 modelViewPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}
