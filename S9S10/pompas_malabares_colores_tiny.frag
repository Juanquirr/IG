#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;uniform float u_time;void main(){vec2 r=u_resolution,uv=(gl_FragCoord.xy-.5*r)/r.y;vec3 c=vec3(.05,.1,.2);float R=.15;for(int i=0;i<3;i++){float fi=float(i),a=u_time*-.5+fi*2.,b=u_time*-1.2+fi*2.;vec2 ce=.25*vec2(sin(a),cos(b)),p=uv-ce;float d=length(p),m=1.-smoothstep(R,R+.01,d),rim=pow(smoothstep(R,R,d),3.);vec3 bc=i==0?vec3(1.,.48,.48):i==1?vec3(.283,.9,.584):vec3(.486,.682,1.);c=mix(c,mix(bc,vec3(1.),rim),m);}gl_FragColor=vec4(c,1.);}
