varying vec2 vUv;

uniform sampler2D uSampler;
uniform float blendScale;
uniform float timeFactor;

float func_mod(float x, float y) {
    return float(x)-float(y)*floor(float(x)/float(y));
}

void main() {
	float t = (timeFactor);	
	vec4 color = texture2D(uSampler, vec2(func_mod(t + vUv.x, 1.0), vUv.y));
	gl_FragColor = color;
}