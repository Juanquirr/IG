#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;uniform float u_time;void main(){vec2 r=u_resolution,uv=(gl_FragCoord.xy-.5*r)/r.y;vec3 bg=vec3(.05,.1,.2),bc=vec3(1.0,0.80,0.99),col=bg;float R=.15;for(int i=0;i<3;i++){float fi=float(i),a=u_time*-0.5+fi*2.,b=u_time*-1.2+fi*2.;vec2 c=.25*vec2(sin(a),cos(b)),p=uv-c;float d=length(p),m=1.-smoothstep(R,R+.01,d),rim=pow(smoothstep(R,R,d),3.);vec3 g=mix(bc,vec3(1.),rim);col=mix(col,g,m);}gl_FragColor=vec4(col,1.);}
