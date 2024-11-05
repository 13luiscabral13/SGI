varying vec2 vUv;
varying vec3 vNormal;
uniform float normScale;
uniform float normalizationFactor;
uniform float displacement;
uniform float scale;

void main() {
    vNormal = normal;
    vUv = uv;
    vec3 scaledPosition = position * vec3(scale);
    vec4 modelViewPosition = modelViewMatrix * vec4(scaledPosition + normal * normalizationFactor * (displacement + normScale), 1);
    gl_Position = projectionMatrix * modelViewPosition; 
}
