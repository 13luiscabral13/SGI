varying vec2 vUv;

uniform sampler2D uSampler1;

void main() {
	gl_FragColor = texture2D(uSampler1, vUv);
}