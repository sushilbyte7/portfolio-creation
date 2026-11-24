",children:" }}"})]})}let h=`
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`,u=`
precision highp float;
uniform sampler2D atlas;
uniform vec2 size;
uniform vec2 cell;
uniform float dpr;
uniform float count;
uniform float time;
uniform float rest;
uniform float haze;
uniform float hoverInk;
uniform vec3 pointer;
uniform float activity;
uniform vec2 drift;
uniform vec3 color;
uniform vec3 accent;
uniform vec4 waves[12];
uniform vec4 trail[8];

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float clouds(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 4; i++) {
    v += a * smoothNoise(p);
    p = p * 2.02 + vec2(17.1, 9.4);
    a *= 0.5;
  }
  return v;
}

float outline(float kind, float angle, float phase) {
  if (kind < 0.5) return 1.0;
  if (kind < 1.5) {
    float s = sin(angle);
    float c = cos(angle);
    return (2.0 - 2.0 * s + s * sqrt(abs(c)) / (s + 1.4)) * 0.42;
  }
  return 1.0 + 0.14 * sin(3.0 * angle + phase) + 0.08 * sin(5.0 * angle - phase * 1.3);
}

void main() {
  vec2 pixel = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
  vec2 index = floor(pixel / cell);
  vec2 point = (index + 0.5) * cell / dpr;

  float ring = 0.0;
  for (int i = 0; i < 6; i++) {
    vec4 a = waves[i * 2];
    vec4 b = waves[i * 2 + 1];
    if (a.w <= 0.0) continue;
    vec2 v = point - a.xy;
    float angle = atan(-v.y, v.x);
    float shape = mix(1.0, outline(b.x, angle, b.z), b.y);
    shape *= 1.0 + 0.07 * sin(3.0 * angle + b.z + b.w) + 0.05 * sin(5.0 * angle - b.z * 1.7 - b.w * 1.3) + 0.03 * sin(9.0 * angle + b.w * 2.1);
    float d = length(v) - a.z * shape;
    float k = d > 0.0 ? d / 14.0 : d / 42.0;
    ring = max(ring, exp(-k * k) * a.w);
  }

  float focus = length((point - pointer.xy) / vec2(86.0, 48.0));
  float hover = pointer.z * (1.0 - smoothstep(0.12, 1.0, focus));
  for (int i = 0; i < 8; i++) {
    vec4 t = trail[i];
    if (t.w <= 0.0) continue;
    vec2 v = point - t.xy;
    hover += t.w * exp(-dot(v, v) / (2.0 * t.z * t.z));
  }
  hover = min(hover, 1.0);

  mat2 turn = mat2(0.82, 0.57, -0.57, 0.82);
  vec2 q = turn * (point - drift);
  float blob = smoothNoise(vec2(q.x / 140.0, q.y / 80.0) + vec2(time * 0.04, 0.0)) * 0.62
    + smoothNoise(vec2(q.x / 62.0, q.y / 36.0) + vec2(3.7, time * 0.06)) * 0.38;
  float grain = smoothNoise(vec2(q.x / 30.0, q.y / 14.0) + vec2(time * 0.2, 7.3));
  float cloud = blob * (0.82 + 0.24 * grain);
  float mask = pow(smoothstep(0.47 - 0.2 * activity, 0.84, cloud), 2.6);

  float ink = texture2D(atlas, pixel / size).a;

  // Small, quiet islands of code remain visible even without a pointer.
  vec2 viewport = size / dpr;
  vec2 patchSize = vec2(min(110.0, viewport.x * 0.23), 38.0);
  vec2 a = (point - viewport * vec2(0.16, 0.22)) / patchSize;
  vec2 b = (point - viewport * vec2(0.83, 0.36)) / patchSize;
  vec2 c = (point - viewport * vec2(0.22, 0.77)) / patchSize;
  vec2 d = (point - viewport * vec2(0.84, 0.82)) / patchSize;
  float idle = max(
    max(exp(-dot(a, a)) * (0.8 + 0.15 * sin(time * 0.18)),
        exp(-dot(b, b)) * (0.8 + 0.15 * sin(time * 0.18 + 1.6))),
    max(exp(-dot(c, c)) * (0.8 + 0.15 * sin(time * 0.18 + 3.2)),
        exp(-dot(d, d)) * (0.8 + 0.15 * sin(time * 0.18 + 4.8)))
  );
  float grey = ink * clamp(rest + 0.075 * idle + haze * mask * (1.0 + 0.3 * activity) + hoverInk * hover * (0.9 + 0.1 * mask), 0.0, 1.0);
  float blue = ink * ring * 0.10;
  float alpha = grey + blue - grey * blue;
  vec3 tint = color * grey * (1.0 - blue) + accent * blue;
  gl_FragColor = vec4(tint, alpha);
}
`;function p({code:e,fontSize:r=12,interactive:s=!0,className:i="",...n}){let o=(0,a.useRef)(null),l=(0,a.useRef)(null);return(0,a.useEffect)(()=>{let t=o.current,a=l.current;if(!t||!a)return;let i=a.getContext("webgl",{alpha:!0,premultipliedAlpha:!0,antialias:!1});if(!i)return;let n=[],c=(e,t)=>{let a=i.createShader(e);return a?(n.push(a),i.shaderSource(a,t),i.compileShader(a),i.getShaderParameter(a,i.COMPILE_STATUS)?a:null):null},d=c(i.VERTEX_SHADER,h),p=c(i.FRAGMENT_SHADER,u),m=i.createProgram();if(!d||!p||!m){n.forEach(e=>i.deleteShader(e)),m&&i.deleteProgram(m);return}if(i.attachShader(m,d),i.attachShader(m,p),i.linkProgram(m),!i.getProgramParameter(m,i.LINK_STATUS)){n.forEach(e=>i.deleteShader(e)),i.deleteProgram(m);return}i.useProgram(m);let f=i.createBuffer();i.bindBuffer(i.ARRAY_BUFFER,f),i.bufferData(i.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),i.STATIC_DRAW);let x=i.getAttribLocation(m,"position");i.enableVertexAttribArray(x),i.vertexAttribPointer(x,2,i.FLOAT,!1,0,0);let j=i.createTexture();i.bindTexture(i.TEXTURE_2D,j),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MAG_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE);let g=Object.fromEntries(["atlas","size","cell","dpr","time","rest","haze","hoverInk","pointer","activity","drift","color","accent","waves[0]","trail[0]"].map(e=>[e,i.getUniformLocation(m,e)]));i.uniform1i(g.atlas,0),i.uniform1f(g.rest,.025),i.uniform1f(g.haze,.08),i.uniform1f(g.hoverInk,.38);let y=matchMedia("(prefers-reduced-motion: reduce)"),v=document.createElement("canvas"),w=v.getContext("2d"),b=document.createElement("canvas").getContext("2d"),k=0,N=0,A=1,S=0,E=0,P=0,R=!1,L=!1,C=!1,M=null,I=null,T=[],z=[],D=new Float32Array(48),F=new Float32Array(32),O=()=>{if(!b)return;b.fillStyle=getComputedStyle(t).color,b.fillRect(0,0,1,1);let e=b.getImageData(0,0,1,1).data;i.uniform3f(g.color,e[0]/255,e[1]/255,e[2]/255),i.uniform3f(g.accent,e[0]/255,e[1]/255,e[2]/255)},$=()=>{!L&&!C&&k&&N&&(D.fill(0),(T=T.filter(e=>S-e.at<4)).forEach((e,t)=>{let a=S-e.at,r=Math.min(1,a/.08)*Math.exp(-a/1.3)*Math.min(1,(4-a)/.5);D.set([e.x,e.y,420*a/(1+.4*a),r,0,0,0,0],8*t)}),F.fill(0),(z=z.filter(e=>S-e.at<.45)).forEach((e,t)=>{let a=(S-e.at)/.45;F.set([e.x,e.y,28,.18*(1-a)**2],4*t)}),i.viewport(0,0,a.width,a.height),i.uniform2f(g.size,a.width,a.height),i.uniform2f(g.cell,8*A,18*A),i.uniform1f(g.dpr,A),i.uniform1f(g.time,S),i.uniform3f(g.pointer,M?.x??-1e3,M?.y??-1e3,+!!M),i.uniform1f(g.activity,z.length/8),i.uniform2f(g.drift,-8*S,4*S),i.uniform4fv(g["waves[0]"],D),i.uniform4fv(g["trail[0]"],F),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),i.drawArrays(i.TRIANGLES,0,3))},_=()=>{var s,n;if(L||C||!w)return;let o=t.getBoundingClientRect();k=o.width,N=o.height,A=Math.min(devicePixelRatio||1,1.5,Math.sqrt(15e5/Math.max(1,k*N))),a.width=v.width=Math.max(1,Math.round(k*A)),a.height=v.height=Math.max(1,Math.round(N*A)),w.scale(A,A),w.fillStyle="white",w.font=`400 ${r}px ${getComputedStyle(t).fontFamily}`,w.textBaseline="top";let l=1.7*r,c=Math.ceil(N/l),d=Math.max(1,Math.floor(k/370)),h=k/d,u=(s=Math.max(1,h-40),n=e=>w.measureText(e).width,s<=0?[]:e.split("\n").flatMap(e=>{let t=[],a=!1;for(;e&&n(`${a?"  ":""}${e}`)>s;){let r=a?"  ":"",i=e.length;for(;i>1&&n(r+e.slice(0,i))>s;)i--;let o=e.lastIndexOf(" ",i);o>i/2&&(i=o),t.push(r+e.slice(0,i)),e=e.slice(i).trimStart(),a=!0}return[...t,`${a&&e?"  ":""}${e}`]}));for(let e=0;e<d;e++){w.save(),w.beginPath(),w.rect(e*h+20,0,h-40,N),w.clip();let t=k<=700?112:12;for(let a=0;a<c;a++)w.fillText(u[(a+e*c)%u.length],e*h+20,t+a*l);w.restore()}i.bindTexture(i.TEXTURE_2D,j),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,i.RGBA,i.UNSIGNED_BYTE,v),O(),$(),t.dataset.renderer="webgl"},q=e=>{e-P>=1e3/30&&(S+=P?Math.min((e-P)/1e3,.064):0,P=e,$()),E=requestAnimationFrame(q)},B=()=>{cancelAnimationFrame(E),E=0,P=0;let e=R&&!document.hidden&&!y.matches&&!C;t.dataset.animated=String(e),e?E=requestAnimationFrame(q):(T=[],z=[],(!R||document.hidden)&&(M=null),R&&!document.hidden&&$())},G=e=>{let a=t.getBoundingClientRect();return{x:e.clientX-a.left,y:e.clientY-a.top,at:S}},U=e=>{if(!s||!R)return;if(I="touch"===e.pointerType?null:{x:e.clientX,y:e.clientY},W(),y.matches)return void $();let t=G(e),a=z.at(-1);t.x<0||t.x>k||t.y<0||t.y>N||a&&14>Math.hypot(t.x-a.x,t.y-a.y)||(z=[...z.slice(-7),t])},V=e=>{if(!s||y.matches||!R)return;let t=G(e);t.x>=0&&t.x<=k&&t.y>=0&&t.y<=N&&(T=[...T.slice(-5),t])},W=()=>{let e=t.getBoundingClientRect(),a=(I?.x??-1e3)-e.left,r=(I?.y??-1e3)-e.top;M=I&&a>=0&&a<=e.width&&r>=0&&r<=e.height?{x:a,y:r}:null,y.matches&&$()},H=()=>{I=null,M=null,y.matches&&$()},Q=()=>{C=!0,t.dataset.renderer="fallback",B()},X=new ResizeObserver(_);X.observe(t);let K=new IntersectionObserver(([e])=>{R=e.isIntersecting,B()});K.observe(t);let Y=new MutationObserver(()=>{O(),$()});return Y.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]}),window.addEventListener("pointermove",U,{passive:!0,capture:!0}),window.addEventListener("pointerdown",V,{passive:!0,capture:!0}),window.addEventListener("scroll",W,{passive:!0}),window.addEventListener("blur",H),document.documentElement.addEventListener("pointerleave",H),a.addEventListener("webglcontextlost",Q),y.addEventListener("change",B),document.addEventListener("visibilitychange",B),_(),document.fonts.ready.then(()=>{L||_()}),()=>{L=!0,cancelAnimationFrame(E),X.disconnect(),K.disconnect(),Y.disconnect(),window.removeEventListener("pointermove",U,!0),window.removeEventListener("pointerdown",V,!0),window.removeEventListener("scroll",W),window.removeEventListener("blur",H),document.documentElement.removeEventListener("pointerleave",H),a.removeEventListener("webglcontextlost",Q),y.removeEventListener("change",B),document.removeEventListener("visibilitychange",B),i.deleteTexture(j),i.deleteBuffer(f),i.deleteProgram(m),n.forEach(e=>i.deleteShader(e))}},[e,r,s]),(0,t.jsxs)("div",{...n,ref:o,className:`glyph-background ${i}`,"data-slot":"glyph-background","aria-hidden":"true",children:[(0,t.jsx)("pre",{className:"glyph-code-fallback",children:e}),(0,t.jsx)("canvas",{ref:l})]})}