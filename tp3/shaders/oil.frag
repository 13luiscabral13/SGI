varying vec2 vUv;

uniform sampler2D uSampler1;
uniform sampler2D uSampler2;
uniform float blendScale;
uniform float timeFactor;

float func_mod(float x, float y) {
    return float(x)-float(y)*floor(float(x)/float(y));
}

void main() {
	float t = (timeFactor)*0.001;	
	vec4 color1 = texture2D(uSampler1, vUv);
	vec4 color2 = texture2D(uSampler2, vec2(func_mod(t + vUv.x, 1.0), vUv.y));
	gl_FragColor = mix(color1, color2, blendScale);
}