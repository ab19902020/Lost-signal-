(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();const ph="180";const Lp=0,Gh=1,Dp=2;const mh=1,nc=2,Ii=3,zi=0,Mn=1,ni=2,an=0,sr=1,ic=2,Wh=3,Xh=4,nf=5,ii=100,Np=101,Op=102,Up=103,Fp=104,Yr=200,Bp=201,zp=202,kp=203,sc=204,rc=205,ac=206,Hp=207,oc=208,Vp=209,Gp=210,Wp=211,Xp=212,qp=213,Yp=214,lc=0,cc=1,hc=2,cr=3,uc=4,dc=5,fc=6,pc=7,sf=0,jp=1,Kp=2,is=0,rf=1,af=2,of=3,gh=4,lf=5,cf=6,hf=7,qh="attached",Zp="detached",uf=300,hr=301,ur=302,mc=303,gc=304,Ho=306,Yn=1e3,$i=1001,So=1002,Zt=1003,df=1004;const jr=1005;const Cn=1006,fo=1007;const Ni=1008;const hi=1009,ff=1010,pf=1011,na=1012,bh=1013,Es=1014,ai=1015,In=1016,xh=1017,vh=1018,dr=1020,mf=35902,gf=35899,bf=1021,xf=1022,zn=1023,ia=1026,fr=1027,yh=1028,_h=1029,vf=1030,Mh=1031;const Sh=1033,po=33776,mo=33777,go=33778,bo=33779,bc=35840,xc=35841,vc=35842,yc=35843,_c=36196,Mc=37492,Sc=37496,wc=37808,Tc=37809,Ec=37810,Ac=37811,Rc=37812,Cc=37813,Pc=37814,Ic=37815,Lc=37816,Dc=37817,Nc=37818,Oc=37819,Uc=37820,Fc=37821,Bc=36492,zc=36494,kc=36495,Hc=36283,Vc=36284,Gc=36285,Wc=36286,yf=2200,Jp=2201,Qp=2202,sa=2300,ra=2301,Jo=2302,Qs=2400,$s=2401,wo=2402,wh=2500,$p=2501,em=0,_f=1,Xc=2,tm=3200,nm=3201;const Th=0,im=1,Zi="",Xt="srgb",mn="srgb-linear",To="linear",Tt="srgb";const Ns=7680;const Yh=519,sm=512,rm=513,am=514,Mf=515,om=516,lm=517,cm=518,hm=519,qc=35044;const jh="300 es",vi=2e3,Eo=2001;class Is{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const i=n[e];if(i!==void 0){const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,e);e.target=null}}}const hn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Kh=1234567;const Zr=Math.PI/180,pr=180/Math.PI;function oi(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(hn[s&255]+hn[s>>8&255]+hn[s>>16&255]+hn[s>>24&255]+"-"+hn[e&255]+hn[e>>8&255]+"-"+hn[e>>16&15|64]+hn[e>>24&255]+"-"+hn[t&63|128]+hn[t>>8&255]+"-"+hn[t>>16&255]+hn[t>>24&255]+hn[n&255]+hn[n>>8&255]+hn[n>>16&255]+hn[n>>24&255]).toLowerCase()}function ct(s,e,t){return Math.max(e,Math.min(t,s))}function Eh(s,e){return(s%e+e)%e}function um(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function dm(s,e,t){return s!==e?(t-s)/(e-s):0}function Jr(s,e,t){return(1-t)*s+t*e}function fm(s,e,t,n){return Jr(s,e,1-Math.exp(-t*n))}function pm(s,e=1){return e-Math.abs(Eh(s,e*2)-e)}function mm(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function gm(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function bm(s,e){return s+Math.floor(Math.random()*(e-s+1))}function xm(s,e){return s+Math.random()*(e-s)}function vm(s){return s*(.5-Math.random())}function ym(s){s!==void 0&&(Kh=s);let e=Kh+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function _m(s){return s*Zr}function Mm(s){return s*pr}function Sm(s){return(s&s-1)===0&&s!==0}function wm(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Tm(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Em(s,e,t,n,i){const r=Math.cos,a=Math.sin,o=r(t/2),c=a(t/2),l=r((e+n)/2),h=a((e+n)/2),u=r((e-n)/2),f=a((e-n)/2),p=r((n-e)/2),m=a((n-e)/2);switch(i){case"XYX":s.set(o*h,c*u,c*f,o*l);break;case"YZY":s.set(c*f,o*h,c*u,o*l);break;case"ZXZ":s.set(c*u,c*f,o*h,o*l);break;case"XZX":s.set(o*h,c*m,c*p,o*l);break;case"YXY":s.set(c*p,o*h,c*m,o*l);break;case"ZYZ":s.set(c*m,c*p,o*h,o*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function si(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function Et(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const Ke={DEG2RAD:Zr,RAD2DEG:pr,generateUUID:oi,clamp:ct,euclideanModulo:Eh,mapLinear:um,inverseLerp:dm,lerp:Jr,damp:fm,pingpong:pm,smoothstep:mm,smootherstep:gm,randInt:bm,randFloat:xm,randFloatSpread:vm,seededRandom:ym,degToRad:_m,radToDeg:Mm,isPowerOfTwo:Sm,ceilPowerOfTwo:wm,floorPowerOfTwo:Tm,setQuaternionFromProperEuler:Em,normalize:Et,denormalize:si};class We{constructor(e=0,t=0){We.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=ct(this.x,e.x,t.x),this.y=ct(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=ct(this.x,e,t),this.y=ct(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ct(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(ct(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*i+e.x,this.y=r*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class li{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,a,o){let c=n[i+0],l=n[i+1],h=n[i+2],u=n[i+3];const f=r[a+0],p=r[a+1],m=r[a+2],b=r[a+3];if(o===0){e[t+0]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u;return}if(o===1){e[t+0]=f,e[t+1]=p,e[t+2]=m,e[t+3]=b;return}if(u!==b||c!==f||l!==p||h!==m){let g=1-o;const d=c*f+l*p+h*m+u*b,x=d>=0?1:-1,_=1-d*d;if(_>Number.EPSILON){const T=Math.sqrt(_),A=Math.atan2(T,d*x);g=Math.sin(g*A)/T,o=Math.sin(o*A)/T}const v=o*x;if(c=c*g+f*v,l=l*g+p*v,h=h*g+m*v,u=u*g+b*v,g===1-o){const T=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=T,l*=T,h*=T,u*=T}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,r,a){const o=n[i],c=n[i+1],l=n[i+2],h=n[i+3],u=r[a],f=r[a+1],p=r[a+2],m=r[a+3];return e[t]=o*m+h*u+c*p-l*f,e[t+1]=c*m+h*f+l*u-o*p,e[t+2]=l*m+h*p+o*f-c*u,e[t+3]=h*m-o*u-c*f-l*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(n/2),h=o(i/2),u=o(r/2),f=c(n/2),p=c(i/2),m=c(r/2);switch(a){case"XYZ":this._x=f*h*u+l*p*m,this._y=l*p*u-f*h*m,this._z=l*h*m+f*p*u,this._w=l*h*u-f*p*m;break;case"YXZ":this._x=f*h*u+l*p*m,this._y=l*p*u-f*h*m,this._z=l*h*m-f*p*u,this._w=l*h*u+f*p*m;break;case"ZXY":this._x=f*h*u-l*p*m,this._y=l*p*u+f*h*m,this._z=l*h*m+f*p*u,this._w=l*h*u-f*p*m;break;case"ZYX":this._x=f*h*u-l*p*m,this._y=l*p*u+f*h*m,this._z=l*h*m-f*p*u,this._w=l*h*u+f*p*m;break;case"YZX":this._x=f*h*u+l*p*m,this._y=l*p*u+f*h*m,this._z=l*h*m-f*p*u,this._w=l*h*u-f*p*m;break;case"XZY":this._x=f*h*u-l*p*m,this._y=l*p*u-f*h*m,this._z=l*h*m+f*p*u,this._w=l*h*u+f*p*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],h=t[6],u=t[10],f=n+o+u;if(f>0){const p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(h-c)*p,this._y=(r-l)*p,this._z=(a-i)*p}else if(n>o&&n>u){const p=2*Math.sqrt(1+n-o-u);this._w=(h-c)/p,this._x=.25*p,this._y=(i+a)/p,this._z=(r+l)/p}else if(o>u){const p=2*Math.sqrt(1+o-n-u);this._w=(r-l)/p,this._x=(i+a)/p,this._y=.25*p,this._z=(c+h)/p}else{const p=2*Math.sqrt(1+u-n-o);this._w=(a-i)/p,this._x=(r+l)/p,this._y=(c+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ct(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,h=t._w;return this._x=n*h+a*o+i*l-r*c,this._y=i*h+a*c+r*o-n*l,this._z=r*h+a*l+n*c-i*o,this._w=a*h-n*o-i*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,r=this._z,a=this._w;let o=a*e._w+n*e._x+i*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=r,this;const c=1-o*o;if(c<=Number.EPSILON){const p=1-t;return this._w=p*a+t*this._w,this._x=p*n+t*this._x,this._y=p*i+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}const l=Math.sqrt(c),h=Math.atan2(l,o),u=Math.sin((1-t)*h)/l,f=Math.sin(t*h)/l;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=i*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class P{constructor(e=0,t=0,n=0){P.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Zh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Zh.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*i-o*n),h=2*(o*t-r*i),u=2*(r*n-a*t);return this.x=t+c*l+a*u-o*h,this.y=n+c*h+o*l-r*u,this.z=i+c*u+r*h-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=ct(this.x,e.x,t.x),this.y=ct(this.y,e.y,t.y),this.z=ct(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=ct(this.x,e,t),this.y=ct(this.y,e,t),this.z=ct(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ct(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=i*c-r*o,this.y=r*a-n*c,this.z=n*o-i*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Qo.copy(this).projectOnVector(e),this.sub(Qo)}reflect(e){return this.sub(Qo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(ct(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Qo=new P,Zh=new li;class nt{constructor(e,t,n,i,r,a,o,c,l){nt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,o,c,l)}set(e,t,n,i,r,a,o,c,l){const h=this.elements;return h[0]=e,h[1]=i,h[2]=o,h[3]=t,h[4]=r,h[5]=c,h[6]=n,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],h=n[4],u=n[7],f=n[2],p=n[5],m=n[8],b=i[0],g=i[3],d=i[6],x=i[1],_=i[4],v=i[7],T=i[2],A=i[5],C=i[8];return r[0]=a*b+o*x+c*T,r[3]=a*g+o*_+c*A,r[6]=a*d+o*v+c*C,r[1]=l*b+h*x+u*T,r[4]=l*g+h*_+u*A,r[7]=l*d+h*v+u*C,r[2]=f*b+p*x+m*T,r[5]=f*g+p*_+m*A,r[8]=f*d+p*v+m*C,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8];return t*a*h-t*o*l-n*r*h+n*o*c+i*r*l-i*a*c}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],u=h*a-o*l,f=o*c-h*r,p=l*r-a*c,m=t*u+n*f+i*p;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const b=1/m;return e[0]=u*b,e[1]=(i*l-h*n)*b,e[2]=(o*n-i*a)*b,e[3]=f*b,e[4]=(h*t-i*c)*b,e[5]=(i*r-o*t)*b,e[6]=p*b,e[7]=(n*c-l*t)*b,e[8]=(a*t-n*r)*b,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,a,o){const c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+e,-i*l,i*c,-i*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply($o.makeScale(e,t)),this}rotate(e){return this.premultiply($o.makeRotation(-e)),this}translate(e,t){return this.premultiply($o.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const $o=new nt;function Sf(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function aa(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Am(){const s=aa("canvas");return s.style.display="block",s}const Jh={};function oa(s){s in Jh||(Jh[s]=!0,console.warn(s))}function Rm(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const Qh=new nt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),$h=new nt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Cm(){const s={enabled:!0,workingColorSpace:mn,spaces:{},convert:function(i,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Tt&&(i.r=Fi(i.r),i.g=Fi(i.g),i.b=Fi(i.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Tt&&(i.r=rr(i.r),i.g=rr(i.g),i.b=rr(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Zi?To:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,a){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return oa("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return oa("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[mn]:{primaries:e,whitePoint:n,transfer:To,toXYZ:Qh,fromXYZ:$h,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Xt},outputColorSpaceConfig:{drawingBufferColorSpace:Xt}},[Xt]:{primaries:e,whitePoint:n,transfer:Tt,toXYZ:Qh,fromXYZ:$h,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Xt}}}),s}const dt=Cm();function Fi(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function rr(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let Os;class Pm{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Os===void 0&&(Os=aa("canvas")),Os.width=e.width,Os.height=e.height;const i=Os.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Os}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=aa("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=Fi(r[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Fi(t[n]/255)*255):t[n]=Fi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Im=0;class Ah{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Im++}),this.uuid=oi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(el(i[a].image)):r.push(el(i[a]))}else r=el(i);n.url=r}return t||(e.images[this.uuid]=n),n}}function el(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Pm.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Lm=0;const tl=new P;class Gt extends Is{constructor(e=Gt.DEFAULT_IMAGE,t=Gt.DEFAULT_MAPPING,n=$i,i=$i,r=Cn,a=Ni,o=zn,c=hi,l=Gt.DEFAULT_ANISOTROPY,h=Zi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Lm++}),this.uuid=oi(),this.name="",this.source=new Ah(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new We(0,0),this.repeat=new We(1,1),this.center=new We(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new nt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(tl).x}get height(){return this.source.getSize(tl).y}get depth(){return this.source.getSize(tl).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==uf)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Yn:e.x=e.x-Math.floor(e.x);break;case $i:e.x=e.x<0?0:1;break;case So:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Yn:e.y=e.y-Math.floor(e.y);break;case $i:e.y=e.y<0?0:1;break;case So:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Gt.DEFAULT_IMAGE=null;Gt.DEFAULT_MAPPING=uf;Gt.DEFAULT_ANISOTROPY=1;class xt{constructor(e=0,t=0,n=0,i=1){xt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r;const c=e.elements,l=c[0],h=c[4],u=c[8],f=c[1],p=c[5],m=c[9],b=c[2],g=c[6],d=c[10];if(Math.abs(h-f)<.01&&Math.abs(u-b)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+b)<.1&&Math.abs(m+g)<.1&&Math.abs(l+p+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const _=(l+1)/2,v=(p+1)/2,T=(d+1)/2,A=(h+f)/4,C=(u+b)/4,D=(m+g)/4;return _>v&&_>T?_<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(_),i=A/n,r=C/n):v>T?v<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(v),n=A/i,r=D/i):T<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(T),n=C/r,i=D/r),this.set(n,i,r,t),this}let x=Math.sqrt((g-m)*(g-m)+(u-b)*(u-b)+(f-h)*(f-h));return Math.abs(x)<.001&&(x=1),this.x=(g-m)/x,this.y=(u-b)/x,this.z=(f-h)/x,this.w=Math.acos((l+p+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=ct(this.x,e.x,t.x),this.y=ct(this.y,e.y,t.y),this.z=ct(this.z,e.z,t.z),this.w=ct(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=ct(this.x,e,t),this.y=ct(this.y,e,t),this.z=ct(this.z,e,t),this.w=ct(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ct(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Dm extends Is{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Cn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new xt(0,0,e,t),this.scissorTest=!1,this.viewport=new xt(0,0,e,t);const i={width:e,height:t,depth:n.depth},r=new Gt(i);this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:Cn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isArrayTexture=this.textures[i].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const i=Object.assign({},e.textures[t].image);this.textures[t].source=new Ah(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class pn extends Dm{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class wf extends Gt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Zt,this.minFilter=Zt,this.wrapR=$i,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Nm extends Gt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Zt,this.minFilter=Zt,this.wrapR=$i,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class gn{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Qn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Qn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Qn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Qn):Qn.fromBufferAttribute(r,a),Qn.applyMatrix4(e.matrixWorld),this.expandByPoint(Qn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ma.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ma.copy(n.boundingBox)),Ma.applyMatrix4(e.matrixWorld),this.union(Ma)}const i=e.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Qn),Qn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ir),Sa.subVectors(this.max,Ir),Us.subVectors(e.a,Ir),Fs.subVectors(e.b,Ir),Bs.subVectors(e.c,Ir),Vi.subVectors(Fs,Us),Gi.subVectors(Bs,Fs),ls.subVectors(Us,Bs);let t=[0,-Vi.z,Vi.y,0,-Gi.z,Gi.y,0,-ls.z,ls.y,Vi.z,0,-Vi.x,Gi.z,0,-Gi.x,ls.z,0,-ls.x,-Vi.y,Vi.x,0,-Gi.y,Gi.x,0,-ls.y,ls.x,0];return!nl(t,Us,Fs,Bs,Sa)||(t=[1,0,0,0,1,0,0,0,1],!nl(t,Us,Fs,Bs,Sa))?!1:(wa.crossVectors(Vi,Gi),t=[wa.x,wa.y,wa.z],nl(t,Us,Fs,Bs,Sa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Qn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Qn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ti[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ti[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ti[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ti[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ti[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ti[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ti[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ti[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ti),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Ti=[new P,new P,new P,new P,new P,new P,new P,new P],Qn=new P,Ma=new gn,Us=new P,Fs=new P,Bs=new P,Vi=new P,Gi=new P,ls=new P,Ir=new P,Sa=new P,wa=new P,cs=new P;function nl(s,e,t,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){cs.fromArray(s,r);const o=i.x*Math.abs(cs.x)+i.y*Math.abs(cs.y)+i.z*Math.abs(cs.z),c=e.dot(cs),l=t.dot(cs),h=n.dot(cs);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}const Om=new gn,Lr=new P,il=new P;class Mi{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Om.setFromPoints(e).getCenter(n);let i=0;for(let r=0,a=e.length;r<a;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Lr.subVectors(e,this.center);const t=Lr.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(Lr,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(il.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Lr.copy(e.center).add(il)),this.expandByPoint(Lr.copy(e.center).sub(il))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const Ei=new P,sl=new P,Ta=new P,Wi=new P,rl=new P,Ea=new P,al=new P;class ga{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ei)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Ei.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ei.copy(this.origin).addScaledVector(this.direction,t),Ei.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){sl.copy(e).add(t).multiplyScalar(.5),Ta.copy(t).sub(e).normalize(),Wi.copy(this.origin).sub(sl);const r=e.distanceTo(t)*.5,a=-this.direction.dot(Ta),o=Wi.dot(this.direction),c=-Wi.dot(Ta),l=Wi.lengthSq(),h=Math.abs(1-a*a);let u,f,p,m;if(h>0)if(u=a*c-o,f=a*o-c,m=r*h,u>=0)if(f>=-m)if(f<=m){const b=1/h;u*=b,f*=b,p=u*(u+a*f+2*o)+f*(a*u+f+2*c)+l}else f=r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*c)+l;else f=-r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*c)+l;else f<=-m?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-c),r),p=-u*u+f*(f+2*c)+l):f<=m?(u=0,f=Math.min(Math.max(-r,-c),r),p=f*(f+2*c)+l):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-c),r),p=-u*u+f*(f+2*c)+l);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(sl).addScaledVector(Ta,f),p}intersectSphere(e,t){Ei.subVectors(e.center,this.origin);const n=Ei.dot(this.direction),i=Ei.dot(Ei)-n*n,r=e.radius*e.radius;if(i>r)return null;const a=Math.sqrt(r-i),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,a,o,c;const l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return l>=0?(n=(e.min.x-f.x)*l,i=(e.max.x-f.x)*l):(n=(e.max.x-f.x)*l,i=(e.min.x-f.x)*l),h>=0?(r=(e.min.y-f.y)*h,a=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,a=(e.min.y-f.y)*h),n>a||r>i||((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),u>=0?(o=(e.min.z-f.z)*u,c=(e.max.z-f.z)*u):(o=(e.max.z-f.z)*u,c=(e.min.z-f.z)*u),n>c||o>i)||((o>n||n!==n)&&(n=o),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Ei)!==null}intersectTriangle(e,t,n,i,r){rl.subVectors(t,e),Ea.subVectors(n,e),al.crossVectors(rl,Ea);let a=this.direction.dot(al),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Wi.subVectors(this.origin,e);const c=o*this.direction.dot(Ea.crossVectors(Wi,Ea));if(c<0)return null;const l=o*this.direction.dot(rl.cross(Wi));if(l<0||c+l>a)return null;const h=-o*Wi.dot(al);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Je{constructor(e,t,n,i,r,a,o,c,l,h,u,f,p,m,b,g){Je.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,o,c,l,h,u,f,p,m,b,g)}set(e,t,n,i,r,a,o,c,l,h,u,f,p,m,b,g){const d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=i,d[1]=r,d[5]=a,d[9]=o,d[13]=c,d[2]=l,d[6]=h,d[10]=u,d[14]=f,d[3]=p,d[7]=m,d[11]=b,d[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Je().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/zs.setFromMatrixColumn(e,0).length(),r=1/zs.setFromMatrixColumn(e,1).length(),a=1/zs.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(i),l=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const f=a*h,p=a*u,m=o*h,b=o*u;t[0]=c*h,t[4]=-c*u,t[8]=l,t[1]=p+m*l,t[5]=f-b*l,t[9]=-o*c,t[2]=b-f*l,t[6]=m+p*l,t[10]=a*c}else if(e.order==="YXZ"){const f=c*h,p=c*u,m=l*h,b=l*u;t[0]=f+b*o,t[4]=m*o-p,t[8]=a*l,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=p*o-m,t[6]=b+f*o,t[10]=a*c}else if(e.order==="ZXY"){const f=c*h,p=c*u,m=l*h,b=l*u;t[0]=f-b*o,t[4]=-a*u,t[8]=m+p*o,t[1]=p+m*o,t[5]=a*h,t[9]=b-f*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){const f=a*h,p=a*u,m=o*h,b=o*u;t[0]=c*h,t[4]=m*l-p,t[8]=f*l+b,t[1]=c*u,t[5]=b*l+f,t[9]=p*l-m,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){const f=a*c,p=a*l,m=o*c,b=o*l;t[0]=c*h,t[4]=b-f*u,t[8]=m*u+p,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-l*h,t[6]=p*u+m,t[10]=f-b*u}else if(e.order==="XZY"){const f=a*c,p=a*l,m=o*c,b=o*l;t[0]=c*h,t[4]=-u,t[8]=l*h,t[1]=f*u+b,t[5]=a*h,t[9]=p*u-m,t[2]=m*u-p,t[6]=o*h,t[10]=b*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Um,e,Fm)}lookAt(e,t,n){const i=this.elements;return Dn.subVectors(e,t),Dn.lengthSq()===0&&(Dn.z=1),Dn.normalize(),Xi.crossVectors(n,Dn),Xi.lengthSq()===0&&(Math.abs(n.z)===1?Dn.x+=1e-4:Dn.z+=1e-4,Dn.normalize(),Xi.crossVectors(n,Dn)),Xi.normalize(),Aa.crossVectors(Dn,Xi),i[0]=Xi.x,i[4]=Aa.x,i[8]=Dn.x,i[1]=Xi.y,i[5]=Aa.y,i[9]=Dn.y,i[2]=Xi.z,i[6]=Aa.z,i[10]=Dn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],h=n[1],u=n[5],f=n[9],p=n[13],m=n[2],b=n[6],g=n[10],d=n[14],x=n[3],_=n[7],v=n[11],T=n[15],A=i[0],C=i[4],D=i[8],w=i[12],S=i[1],I=i[5],z=i[9],O=i[13],G=i[2],j=i[6],K=i[10],ee=i[14],X=i[3],de=i[7],se=i[11],ge=i[15];return r[0]=a*A+o*S+c*G+l*X,r[4]=a*C+o*I+c*j+l*de,r[8]=a*D+o*z+c*K+l*se,r[12]=a*w+o*O+c*ee+l*ge,r[1]=h*A+u*S+f*G+p*X,r[5]=h*C+u*I+f*j+p*de,r[9]=h*D+u*z+f*K+p*se,r[13]=h*w+u*O+f*ee+p*ge,r[2]=m*A+b*S+g*G+d*X,r[6]=m*C+b*I+g*j+d*de,r[10]=m*D+b*z+g*K+d*se,r[14]=m*w+b*O+g*ee+d*ge,r[3]=x*A+_*S+v*G+T*X,r[7]=x*C+_*I+v*j+T*de,r[11]=x*D+_*z+v*K+T*se,r[15]=x*w+_*O+v*ee+T*ge,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],h=e[2],u=e[6],f=e[10],p=e[14],m=e[3],b=e[7],g=e[11],d=e[15];return m*(+r*c*u-i*l*u-r*o*f+n*l*f+i*o*p-n*c*p)+b*(+t*c*p-t*l*f+r*a*f-i*a*p+i*l*h-r*c*h)+g*(+t*l*u-t*o*p-r*a*u+n*a*p+r*o*h-n*l*h)+d*(-i*o*h-t*c*u+t*o*f+i*a*u-n*a*f+n*c*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],u=e[9],f=e[10],p=e[11],m=e[12],b=e[13],g=e[14],d=e[15],x=u*g*l-b*f*l+b*c*p-o*g*p-u*c*d+o*f*d,_=m*f*l-h*g*l-m*c*p+a*g*p+h*c*d-a*f*d,v=h*b*l-m*u*l+m*o*p-a*b*p-h*o*d+a*u*d,T=m*u*c-h*b*c-m*o*f+a*b*f+h*o*g-a*u*g,A=t*x+n*_+i*v+r*T;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const C=1/A;return e[0]=x*C,e[1]=(b*f*r-u*g*r-b*i*p+n*g*p+u*i*d-n*f*d)*C,e[2]=(o*g*r-b*c*r+b*i*l-n*g*l-o*i*d+n*c*d)*C,e[3]=(u*c*r-o*f*r-u*i*l+n*f*l+o*i*p-n*c*p)*C,e[4]=_*C,e[5]=(h*g*r-m*f*r+m*i*p-t*g*p-h*i*d+t*f*d)*C,e[6]=(m*c*r-a*g*r-m*i*l+t*g*l+a*i*d-t*c*d)*C,e[7]=(a*f*r-h*c*r+h*i*l-t*f*l-a*i*p+t*c*p)*C,e[8]=v*C,e[9]=(m*u*r-h*b*r-m*n*p+t*b*p+h*n*d-t*u*d)*C,e[10]=(a*b*r-m*o*r+m*n*l-t*b*l-a*n*d+t*o*d)*C,e[11]=(h*o*r-a*u*r-h*n*l+t*u*l+a*n*p-t*o*p)*C,e[12]=T*C,e[13]=(h*b*i-m*u*i+m*n*f-t*b*f-h*n*g+t*u*g)*C,e[14]=(m*o*i-a*b*i-m*n*c+t*b*c+a*n*g-t*o*g)*C,e[15]=(a*u*i-h*o*i+h*n*c-t*u*c-a*n*f+t*o*f)*C,this}scale(e){const t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),r=1-n,a=e.x,o=e.y,c=e.z,l=r*a,h=r*o;return this.set(l*a+n,l*o-i*c,l*c+i*o,0,l*o+i*c,h*o+n,h*c-i*a,0,l*c-i*o,h*c+i*a,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,a){return this.set(1,n,r,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,h=a+a,u=o+o,f=r*l,p=r*h,m=r*u,b=a*h,g=a*u,d=o*u,x=c*l,_=c*h,v=c*u,T=n.x,A=n.y,C=n.z;return i[0]=(1-(b+d))*T,i[1]=(p+v)*T,i[2]=(m-_)*T,i[3]=0,i[4]=(p-v)*A,i[5]=(1-(f+d))*A,i[6]=(g+x)*A,i[7]=0,i[8]=(m+_)*C,i[9]=(g-x)*C,i[10]=(1-(f+b))*C,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let r=zs.set(i[0],i[1],i[2]).length();const a=zs.set(i[4],i[5],i[6]).length(),o=zs.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),e.x=i[12],e.y=i[13],e.z=i[14],$n.copy(this);const l=1/r,h=1/a,u=1/o;return $n.elements[0]*=l,$n.elements[1]*=l,$n.elements[2]*=l,$n.elements[4]*=h,$n.elements[5]*=h,$n.elements[6]*=h,$n.elements[8]*=u,$n.elements[9]*=u,$n.elements[10]*=u,t.setFromRotationMatrix($n),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,i,r,a,o=vi,c=!1){const l=this.elements,h=2*r/(t-e),u=2*r/(n-i),f=(t+e)/(t-e),p=(n+i)/(n-i);let m,b;if(c)m=r/(a-r),b=a*r/(a-r);else if(o===vi)m=-(a+r)/(a-r),b=-2*a*r/(a-r);else if(o===Eo)m=-a/(a-r),b=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=u,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=b,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,r,a,o=vi,c=!1){const l=this.elements,h=2/(t-e),u=2/(n-i),f=-(t+e)/(t-e),p=-(n+i)/(n-i);let m,b;if(c)m=1/(a-r),b=a/(a-r);else if(o===vi)m=-2/(a-r),b=-(a+r)/(a-r);else if(o===Eo)m=-1/(a-r),b=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=u,l[9]=0,l[13]=p,l[2]=0,l[6]=0,l[10]=m,l[14]=b,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const zs=new P,$n=new Je,Um=new P(0,0,0),Fm=new P(1,1,1),Xi=new P,Aa=new P,Dn=new P,eu=new Je,tu=new li;class _i{constructor(e=0,t=0,n=0,i=_i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,r=i[0],a=i[4],o=i[8],c=i[1],l=i[5],h=i[9],u=i[2],f=i[6],p=i[10];switch(t){case"XYZ":this._y=Math.asin(ct(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-ct(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(ct(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-ct(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(ct(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-ct(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return eu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(eu,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return tu.setFromEuler(this),this.setFromQuaternion(tu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}_i.DEFAULT_ORDER="XYZ";class Rh{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Bm=0;const nu=new P,ks=new li,Ai=new Je,Ra=new P,Dr=new P,zm=new P,km=new li,iu=new P(1,0,0),su=new P(0,1,0),ru=new P(0,0,1),au={type:"added"},Hm={type:"removed"},Hs={type:"childadded",child:null},ol={type:"childremoved",child:null};class Bt extends Is{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Bm++}),this.uuid=oi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Bt.DEFAULT_UP.clone();const e=new P,t=new _i,n=new li,i=new P(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Je},normalMatrix:{value:new nt}}),this.matrix=new Je,this.matrixWorld=new Je,this.matrixAutoUpdate=Bt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Rh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ks.setFromAxisAngle(e,t),this.quaternion.multiply(ks),this}rotateOnWorldAxis(e,t){return ks.setFromAxisAngle(e,t),this.quaternion.premultiply(ks),this}rotateX(e){return this.rotateOnAxis(iu,e)}rotateY(e){return this.rotateOnAxis(su,e)}rotateZ(e){return this.rotateOnAxis(ru,e)}translateOnAxis(e,t){return nu.copy(e).applyQuaternion(this.quaternion),this.position.add(nu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(iu,e)}translateY(e){return this.translateOnAxis(su,e)}translateZ(e){return this.translateOnAxis(ru,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ai.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ra.copy(e):Ra.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),Dr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ai.lookAt(Dr,Ra,this.up):Ai.lookAt(Ra,Dr,this.up),this.quaternion.setFromRotationMatrix(Ai),i&&(Ai.extractRotation(i.matrixWorld),ks.setFromRotationMatrix(Ai),this.quaternion.premultiply(ks.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(au),Hs.child=e,this.dispatchEvent(Hs),Hs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Hm),ol.child=e,this.dispatchEvent(ol),ol.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ai.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ai.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ai),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(au),Hs.child=e,this.dispatchEvent(Hs),Hs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Dr,e,zm),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Dr,km,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(o=>({...o})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const u=c[l];r(e.shapes,u)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));i.material=o}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];i.animations.push(r(e.animations,c))}}if(t){const o=a(e.geometries),c=a(e.materials),l=a(e.textures),h=a(e.images),u=a(e.shapes),f=a(e.skeletons),p=a(e.animations),m=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),p.length>0&&(n.animations=p),m.length>0&&(n.nodes=m)}return n.object=i,n;function a(o){const c=[];for(const l in o){const h=o[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}Bt.DEFAULT_UP=new P(0,1,0);Bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const ei=new P,Ri=new P,ll=new P,Ci=new P,Vs=new P,Gs=new P,ou=new P,cl=new P,hl=new P,ul=new P,dl=new xt,fl=new xt,pl=new xt;class ri{constructor(e=new P,t=new P,n=new P){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),ei.subVectors(e,t),i.cross(ei);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){ei.subVectors(i,t),Ri.subVectors(n,t),ll.subVectors(e,t);const a=ei.dot(ei),o=ei.dot(Ri),c=ei.dot(ll),l=Ri.dot(Ri),h=Ri.dot(ll),u=a*l-o*o;if(u===0)return r.set(0,0,0),null;const f=1/u,p=(l*c-o*h)*f,m=(a*h-o*c)*f;return r.set(1-p-m,m,p)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Ci)===null?!1:Ci.x>=0&&Ci.y>=0&&Ci.x+Ci.y<=1}static getInterpolation(e,t,n,i,r,a,o,c){return this.getBarycoord(e,t,n,i,Ci)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Ci.x),c.addScaledVector(a,Ci.y),c.addScaledVector(o,Ci.z),c)}static getInterpolatedAttribute(e,t,n,i,r,a){return dl.setScalar(0),fl.setScalar(0),pl.setScalar(0),dl.fromBufferAttribute(e,t),fl.fromBufferAttribute(e,n),pl.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(dl,r.x),a.addScaledVector(fl,r.y),a.addScaledVector(pl,r.z),a}static isFrontFacing(e,t,n,i){return ei.subVectors(n,t),Ri.subVectors(e,t),ei.cross(Ri).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ei.subVectors(this.c,this.b),Ri.subVectors(this.a,this.b),ei.cross(Ri).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return ri.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return ri.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return ri.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return ri.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return ri.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,r=this.c;let a,o;Vs.subVectors(i,n),Gs.subVectors(r,n),cl.subVectors(e,n);const c=Vs.dot(cl),l=Gs.dot(cl);if(c<=0&&l<=0)return t.copy(n);hl.subVectors(e,i);const h=Vs.dot(hl),u=Gs.dot(hl);if(h>=0&&u<=h)return t.copy(i);const f=c*u-h*l;if(f<=0&&c>=0&&h<=0)return a=c/(c-h),t.copy(n).addScaledVector(Vs,a);ul.subVectors(e,r);const p=Vs.dot(ul),m=Gs.dot(ul);if(m>=0&&p<=m)return t.copy(r);const b=p*l-c*m;if(b<=0&&l>=0&&m<=0)return o=l/(l-m),t.copy(n).addScaledVector(Gs,o);const g=h*m-p*u;if(g<=0&&u-h>=0&&p-m>=0)return ou.subVectors(r,i),o=(u-h)/(u-h+(p-m)),t.copy(i).addScaledVector(ou,o);const d=1/(g+b+f);return a=b*d,o=f*d,t.copy(n).addScaledVector(Vs,a).addScaledVector(Gs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Tf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},qi={h:0,s:0,l:0},Ca={h:0,s:0,l:0};function ml(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class De{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Xt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,dt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=dt.workingColorSpace){return this.r=e,this.g=t,this.b=n,dt.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=dt.workingColorSpace){if(e=Eh(e,1),t=ct(t,0,1),n=ct(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=ml(a,r,e+1/3),this.g=ml(a,r,e),this.b=ml(a,r,e-1/3)}return dt.colorSpaceToWorking(this,i),this}setStyle(e,t=Xt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Xt){const n=Tf[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Fi(e.r),this.g=Fi(e.g),this.b=Fi(e.b),this}copyLinearToSRGB(e){return this.r=rr(e.r),this.g=rr(e.g),this.b=rr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Xt){return dt.workingToColorSpace(un.copy(this),e),Math.round(ct(un.r*255,0,255))*65536+Math.round(ct(un.g*255,0,255))*256+Math.round(ct(un.b*255,0,255))}getHexString(e=Xt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=dt.workingColorSpace){dt.workingToColorSpace(un.copy(this),t);const n=un.r,i=un.g,r=un.b,a=Math.max(n,i,r),o=Math.min(n,i,r);let c,l;const h=(o+a)/2;if(o===a)c=0,l=0;else{const u=a-o;switch(l=h<=.5?u/(a+o):u/(2-a-o),a){case n:c=(i-r)/u+(i<r?6:0);break;case i:c=(r-n)/u+2;break;case r:c=(n-i)/u+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=dt.workingColorSpace){return dt.workingToColorSpace(un.copy(this),t),e.r=un.r,e.g=un.g,e.b=un.b,e}getStyle(e=Xt){dt.workingToColorSpace(un.copy(this),e);const t=un.r,n=un.g,i=un.b;return e!==Xt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(qi),this.setHSL(qi.h+e,qi.s+t,qi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(qi),e.getHSL(Ca);const n=Jr(qi.h,Ca.h,t),i=Jr(qi.s,Ca.s,t),r=Jr(qi.l,Ca.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const un=new De;De.NAMES=Tf;let Vm=0;class ci extends Is{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Vm++}),this.uuid=oi(),this.name="",this.type="Material",this.blending=sr,this.side=zi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=sc,this.blendDst=rc,this.blendEquation=ii,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new De(0,0,0),this.blendAlpha=0,this.depthFunc=cr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Yh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ns,this.stencilZFail=Ns,this.stencilZPass=Ns,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==sr&&(n.blending=this.blending),this.side!==zi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==sc&&(n.blendSrc=this.blendSrc),this.blendDst!==rc&&(n.blendDst=this.blendDst),this.blendEquation!==ii&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==cr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Yh&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ns&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ns&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ns&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const a=[];for(const o in r){const c=r[o];delete c.metadata,a.push(c)}return a}if(t){const r=i(e.textures),a=i(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Pn extends ci{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new De(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _i,this.combine=sf,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Wt=new P,Pa=new We;let Gm=0;class rn{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Gm++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=qc,this.updateRanges=[],this.gpuType=ai,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Pa.fromBufferAttribute(this,t),Pa.applyMatrix3(e),this.setXY(t,Pa.x,Pa.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Wt.fromBufferAttribute(this,t),Wt.applyMatrix3(e),this.setXYZ(t,Wt.x,Wt.y,Wt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Wt.fromBufferAttribute(this,t),Wt.applyMatrix4(e),this.setXYZ(t,Wt.x,Wt.y,Wt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Wt.fromBufferAttribute(this,t),Wt.applyNormalMatrix(e),this.setXYZ(t,Wt.x,Wt.y,Wt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Wt.fromBufferAttribute(this,t),Wt.transformDirection(e),this.setXYZ(t,Wt.x,Wt.y,Wt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=si(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Et(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=si(t,this.array)),t}setX(e,t){return this.normalized&&(t=Et(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=si(t,this.array)),t}setY(e,t){return this.normalized&&(t=Et(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=si(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Et(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=si(t,this.array)),t}setW(e,t){return this.normalized&&(t=Et(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Et(t,this.array),n=Et(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=Et(t,this.array),n=Et(n,this.array),i=Et(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=Et(t,this.array),n=Et(n,this.array),i=Et(i,this.array),r=Et(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==qc&&(e.usage=this.usage),e}}class Ef extends rn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Af extends rn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Ln extends rn{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Wm=0;const Gn=new Je,gl=new Bt,Ws=new P,Nn=new gn,Nr=new gn,tn=new P;class wn extends Is{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Wm++}),this.uuid=oi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Sf(e)?Af:Ef)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new nt().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Gn.makeRotationFromQuaternion(e),this.applyMatrix4(Gn),this}rotateX(e){return Gn.makeRotationX(e),this.applyMatrix4(Gn),this}rotateY(e){return Gn.makeRotationY(e),this.applyMatrix4(Gn),this}rotateZ(e){return Gn.makeRotationZ(e),this.applyMatrix4(Gn),this}translate(e,t,n){return Gn.makeTranslation(e,t,n),this.applyMatrix4(Gn),this}scale(e,t,n){return Gn.makeScale(e,t,n),this.applyMatrix4(Gn),this}lookAt(e){return gl.lookAt(e),gl.updateMatrix(),this.applyMatrix4(gl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ws).negate(),this.translate(Ws.x,Ws.y,Ws.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,r=e.length;i<r;i++){const a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Ln(n,3))}else{const n=Math.min(e.length,t.count);for(let i=0;i<n;i++){const r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new gn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const r=t[n];Nn.setFromBufferAttribute(r),this.morphTargetsRelative?(tn.addVectors(this.boundingBox.min,Nn.min),this.boundingBox.expandByPoint(tn),tn.addVectors(this.boundingBox.max,Nn.max),this.boundingBox.expandByPoint(tn)):(this.boundingBox.expandByPoint(Nn.min),this.boundingBox.expandByPoint(Nn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Mi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){const n=this.boundingSphere.center;if(Nn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];Nr.setFromBufferAttribute(o),this.morphTargetsRelative?(tn.addVectors(Nn.min,Nr.min),Nn.expandByPoint(tn),tn.addVectors(Nn.max,Nr.max),Nn.expandByPoint(tn)):(Nn.expandByPoint(Nr.min),Nn.expandByPoint(Nr.max))}Nn.getCenter(n);let i=0;for(let r=0,a=e.count;r<a;r++)tn.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(tn));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)tn.fromBufferAttribute(o,l),c&&(Ws.fromBufferAttribute(e,l),tn.add(Ws)),i=Math.max(i,n.distanceToSquared(tn))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new rn(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],c=[];for(let D=0;D<n.count;D++)o[D]=new P,c[D]=new P;const l=new P,h=new P,u=new P,f=new We,p=new We,m=new We,b=new P,g=new P;function d(D,w,S){l.fromBufferAttribute(n,D),h.fromBufferAttribute(n,w),u.fromBufferAttribute(n,S),f.fromBufferAttribute(r,D),p.fromBufferAttribute(r,w),m.fromBufferAttribute(r,S),h.sub(l),u.sub(l),p.sub(f),m.sub(f);const I=1/(p.x*m.y-m.x*p.y);isFinite(I)&&(b.copy(h).multiplyScalar(m.y).addScaledVector(u,-p.y).multiplyScalar(I),g.copy(u).multiplyScalar(p.x).addScaledVector(h,-m.x).multiplyScalar(I),o[D].add(b),o[w].add(b),o[S].add(b),c[D].add(g),c[w].add(g),c[S].add(g))}let x=this.groups;x.length===0&&(x=[{start:0,count:e.count}]);for(let D=0,w=x.length;D<w;++D){const S=x[D],I=S.start,z=S.count;for(let O=I,G=I+z;O<G;O+=3)d(e.getX(O+0),e.getX(O+1),e.getX(O+2))}const _=new P,v=new P,T=new P,A=new P;function C(D){T.fromBufferAttribute(i,D),A.copy(T);const w=o[D];_.copy(w),_.sub(T.multiplyScalar(T.dot(w))).normalize(),v.crossVectors(A,w);const I=v.dot(c[D])<0?-1:1;a.setXYZW(D,_.x,_.y,_.z,I)}for(let D=0,w=x.length;D<w;++D){const S=x[D],I=S.start,z=S.count;for(let O=I,G=I+z;O<G;O+=3)C(e.getX(O+0)),C(e.getX(O+1)),C(e.getX(O+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new rn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,p=n.count;f<p;f++)n.setXYZ(f,0,0,0);const i=new P,r=new P,a=new P,o=new P,c=new P,l=new P,h=new P,u=new P;if(e)for(let f=0,p=e.count;f<p;f+=3){const m=e.getX(f+0),b=e.getX(f+1),g=e.getX(f+2);i.fromBufferAttribute(t,m),r.fromBufferAttribute(t,b),a.fromBufferAttribute(t,g),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),o.fromBufferAttribute(n,m),c.fromBufferAttribute(n,b),l.fromBufferAttribute(n,g),o.add(h),c.add(h),l.add(h),n.setXYZ(m,o.x,o.y,o.z),n.setXYZ(b,c.x,c.y,c.z),n.setXYZ(g,l.x,l.y,l.z)}else for(let f=0,p=t.count;f<p;f+=3)i.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)tn.fromBufferAttribute(e,t),tn.normalize(),e.setXYZ(t,tn.x,tn.y,tn.z)}toNonIndexed(){function e(o,c){const l=o.array,h=o.itemSize,u=o.normalized,f=new l.constructor(c.length*h);let p=0,m=0;for(let b=0,g=c.length;b<g;b++){o.isInterleavedBufferAttribute?p=c[b]*o.data.stride+o.offset:p=c[b]*h;for(let d=0;d<h;d++)f[m++]=l[p++]}return new rn(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new wn,n=this.index.array,i=this.attributes;for(const o in i){const c=i[o],l=e(c,n);t.setAttribute(o,l)}const r=this.morphAttributes;for(const o in r){const c=[],l=r[o];for(let h=0,u=l.length;h<u;h++){const f=l[h],p=e(f,n);c.push(p)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const i={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let u=0,f=l.length;u<f;u++){const p=l[u];h.push(p.toJSON(e.data))}h.length>0&&(i[c]=h,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const i=e.attributes;for(const l in i){const h=i[l];this.setAttribute(l,h.clone(t))}const r=e.morphAttributes;for(const l in r){const h=[],u=r[l];for(let f=0,p=u.length;f<p;f++)h.push(u[f].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let l=0,h=a.length;l<h;l++){const u=a[l];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const lu=new Je,hs=new ga,Ia=new Mi,cu=new P,La=new P,Da=new P,Na=new P,bl=new P,Oa=new P,hu=new P,Ua=new P;class Kt extends Bt{constructor(e=new wn,t=new Pn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const o=this.morphTargetInfluences;if(r&&o){Oa.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const h=o[c],u=r[c];h!==0&&(bl.fromBufferAttribute(u,e),a?Oa.addScaledVector(bl,h):Oa.addScaledVector(bl.sub(t),h))}t.add(Oa)}return t}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ia.copy(n.boundingSphere),Ia.applyMatrix4(r),hs.copy(e.ray).recast(e.near),!(Ia.containsPoint(hs.origin)===!1&&(hs.intersectSphere(Ia,cu)===null||hs.origin.distanceToSquared(cu)>(e.far-e.near)**2))&&(lu.copy(r).invert(),hs.copy(e.ray).applyMatrix4(lu),!(n.boundingBox!==null&&hs.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,hs)))}_computeIntersections(e,t,n){let i;const r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,b=f.length;m<b;m++){const g=f[m],d=a[g.materialIndex],x=Math.max(g.start,p.start),_=Math.min(o.count,Math.min(g.start+g.count,p.start+p.count));for(let v=x,T=_;v<T;v+=3){const A=o.getX(v),C=o.getX(v+1),D=o.getX(v+2);i=Fa(this,d,e,n,l,h,u,A,C,D),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{const m=Math.max(0,p.start),b=Math.min(o.count,p.start+p.count);for(let g=m,d=b;g<d;g+=3){const x=o.getX(g),_=o.getX(g+1),v=o.getX(g+2);i=Fa(this,a,e,n,l,h,u,x,_,v),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}else if(c!==void 0)if(Array.isArray(a))for(let m=0,b=f.length;m<b;m++){const g=f[m],d=a[g.materialIndex],x=Math.max(g.start,p.start),_=Math.min(c.count,Math.min(g.start+g.count,p.start+p.count));for(let v=x,T=_;v<T;v+=3){const A=v,C=v+1,D=v+2;i=Fa(this,d,e,n,l,h,u,A,C,D),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{const m=Math.max(0,p.start),b=Math.min(c.count,p.start+p.count);for(let g=m,d=b;g<d;g+=3){const x=g,_=g+1,v=g+2;i=Fa(this,a,e,n,l,h,u,x,_,v),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}}}function Xm(s,e,t,n,i,r,a,o){let c;if(e.side===Mn?c=n.intersectTriangle(a,r,i,!0,o):c=n.intersectTriangle(i,r,a,e.side===zi,o),c===null)return null;Ua.copy(o),Ua.applyMatrix4(s.matrixWorld);const l=t.ray.origin.distanceTo(Ua);return l<t.near||l>t.far?null:{distance:l,point:Ua.clone(),object:s}}function Fa(s,e,t,n,i,r,a,o,c,l){s.getVertexPosition(o,La),s.getVertexPosition(c,Da),s.getVertexPosition(l,Na);const h=Xm(s,e,t,n,La,Da,Na,hu);if(h){const u=new P;ri.getBarycoord(hu,La,Da,Na,u),i&&(h.uv=ri.getInterpolatedAttribute(i,o,c,l,u,new We)),r&&(h.uv1=ri.getInterpolatedAttribute(r,o,c,l,u,new We)),a&&(h.normal=ri.getInterpolatedAttribute(a,o,c,l,u,new P),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:c,c:l,normal:new P,materialIndex:0};ri.getNormal(La,Da,Na,f.normal),h.face=f,h.barycoord=u}return h}class As extends wn{constructor(e=1,t=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};const o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);const c=[],l=[],h=[],u=[];let f=0,p=0;m("z","y","x",-1,-1,n,t,e,a,r,0),m("z","y","x",1,-1,n,t,-e,a,r,1),m("x","z","y",1,1,e,n,t,i,a,2),m("x","z","y",1,-1,e,n,-t,i,a,3),m("x","y","z",1,-1,e,t,n,i,r,4),m("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(c),this.setAttribute("position",new Ln(l,3)),this.setAttribute("normal",new Ln(h,3)),this.setAttribute("uv",new Ln(u,2));function m(b,g,d,x,_,v,T,A,C,D,w){const S=v/C,I=T/D,z=v/2,O=T/2,G=A/2,j=C+1,K=D+1;let ee=0,X=0;const de=new P;for(let se=0;se<K;se++){const ge=se*I-O;for(let Ee=0;Ee<j;Ee++){const $e=Ee*S-z;de[b]=$e*x,de[g]=ge*_,de[d]=G,l.push(de.x,de.y,de.z),de[b]=0,de[g]=0,de[d]=A>0?1:-1,h.push(de.x,de.y,de.z),u.push(Ee/C),u.push(1-se/D),ee+=1}}for(let se=0;se<D;se++)for(let ge=0;ge<C;ge++){const Ee=f+ge+j*se,$e=f+ge+j*(se+1),at=f+(ge+1)+j*(se+1),et=f+(ge+1)+j*se;c.push(Ee,$e,et),c.push($e,at,et),X+=6}o.addGroup(p,X,w),p+=X,f+=ee}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new As(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function mr(s){const e={};for(const t in s){e[t]={};for(const n in s[t]){const i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function yn(s){const e={};for(let t=0;t<s.length;t++){const n=mr(s[t]);for(const i in n)e[i]=n[i]}return e}function qm(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function Rf(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:dt.workingColorSpace}const Un={clone:mr,merge:yn};var Ym=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,jm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ft extends ci{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ym,this.fragmentShader=jm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=mr(e.uniforms),this.uniformsGroups=qm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Cf extends Bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Je,this.projectionMatrix=new Je,this.projectionMatrixInverse=new Je,this.coordinateSystem=vi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Yi=new P,uu=new We,du=new We;class qt extends Cf{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=pr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Zr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return pr*2*Math.atan(Math.tan(Zr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Yi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Yi.x,Yi.y).multiplyScalar(-e/Yi.z),Yi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Yi.x,Yi.y).multiplyScalar(-e/Yi.z)}getViewSize(e,t){return this.getViewBounds(e,uu,du),t.subVectors(du,uu)}setViewOffset(e,t,n,i,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Zr*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*i/c,t-=a.offsetY*n/l,i*=a.width/c,n*=a.height/l}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Xs=-90,qs=1;class Km extends Bt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new qt(Xs,qs,e,t);i.layers=this.layers,this.add(i);const r=new qt(Xs,qs,e,t);r.layers=this.layers,this.add(r);const a=new qt(Xs,qs,e,t);a.layers=this.layers,this.add(a);const o=new qt(Xs,qs,e,t);o.layers=this.layers,this.add(o);const c=new qt(Xs,qs,e,t);c.layers=this.layers,this.add(c);const l=new qt(Xs,qs,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,r,a,o,c]=t;for(const l of t)this.remove(l);if(e===vi)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Eo)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,c,l,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;const b=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,r),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,c),e.setRenderTarget(n,4,i),e.render(t,l),n.texture.generateMipmaps=b,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,f,p),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}}class Pf extends Gt{constructor(e=[],t=hr,n,i,r,a,o,c,l,h){super(e,t,n,i,r,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Zm extends pn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new Pf(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new As(5,5,5),r=new Ft({name:"CubemapFromEquirect",uniforms:mr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Mn,blending:an});r.uniforms.tEquirect.value=t;const a=new Kt(i,r),o=t.minFilter;return t.minFilter===Ni&&(t.minFilter=Cn),new Km(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(r)}}class kn extends Bt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Jm={type:"move"};class xl{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new kn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new kn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new kn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,a=null;const o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(const b of e.hand.values()){const g=t.getJointPose(b,n),d=this._getHandJoint(l,b);g!==null&&(d.matrix.fromArray(g.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=g.radius),d.visible=g!==null}const h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],f=h.position.distanceTo(u.position),p=.02,m=.005;l.inputState.pinching&&f>p+m?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&f<=p-m&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Jm)))}return o!==null&&(o.visible=i!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new kn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Rs{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new De(e),this.density=t}clone(){return new Rs(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class vl extends Bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new _i,this.environmentIntensity=1,this.environmentRotation=new _i,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Qm{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=qc,this.updateRanges=[],this.version=0,this.uuid=oi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=oi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=oi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const vn=new P;class Ch{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)vn.fromBufferAttribute(this,t),vn.applyMatrix4(e),this.setXYZ(t,vn.x,vn.y,vn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)vn.fromBufferAttribute(this,t),vn.applyNormalMatrix(e),this.setXYZ(t,vn.x,vn.y,vn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)vn.fromBufferAttribute(this,t),vn.transformDirection(e),this.setXYZ(t,vn.x,vn.y,vn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=si(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Et(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Et(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Et(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Et(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Et(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=si(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=si(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=si(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=si(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Et(t,this.array),n=Et(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Et(t,this.array),n=Et(n,this.array),i=Et(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Et(t,this.array),n=Et(n,this.array),i=Et(i,this.array),r=Et(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new rn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Ch(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const fu=new P,pu=new xt,mu=new xt,$m=new P,gu=new Je,Ba=new P,yl=new Mi,bu=new Je,_l=new ga;class eg extends Kt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=qh,this.bindMatrix=new Je,this.bindMatrixInverse=new Je,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new gn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ba),this.boundingBox.expandByPoint(Ba)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Mi),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ba),this.boundingSphere.expandByPoint(Ba)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),yl.copy(this.boundingSphere),yl.applyMatrix4(i),e.ray.intersectsSphere(yl)!==!1&&(bu.copy(i).invert(),_l.copy(e.ray).applyMatrix4(bu),!(this.boundingBox!==null&&_l.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,_l)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new xt,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===qh?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Zp?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;pu.fromBufferAttribute(i.attributes.skinIndex,e),mu.fromBufferAttribute(i.attributes.skinWeight,e),fu.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const a=mu.getComponent(r);if(a!==0){const o=pu.getComponent(r);gu.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector($m.copy(fu).applyMatrix4(gu),a)}}return t.applyMatrix4(this.bindMatrixInverse)}}class If extends Bt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class Vo extends Gt{constructor(e=null,t=1,n=1,i,r,a,o,c,l=Zt,h=Zt,u,f){super(null,a,o,c,l,h,i,r,u,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const xu=new Je,tg=new Je;class Ph{constructor(e=[],t=[]){this.uuid=oi(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Je)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Je;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,a=e.length;r<a;r++){const o=e[r]?e[r].matrixWorld:tg;xu.multiplyMatrices(o,t[r]),xu.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new Ph(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new Vo(t,e,e,zn,ai);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const r=e.bones[n];let a=t[r];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),a=new If),this.bones.push(a),this.boneInverses.push(new Je().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){const a=t[i];e.bones.push(a.uuid);const o=n[i];e.boneInverses.push(o.toArray())}return e}}class Yc extends rn{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Ys=new Je,vu=new Je,za=[],yu=new gn,ng=new Je,Or=new Kt,Ur=new Mi;class Lf extends Kt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Yc(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,ng)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new gn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ys),yu.copy(e.boundingBox).applyMatrix4(Ys),this.boundingBox.union(yu)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Mi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ys),Ur.copy(e.boundingSphere).applyMatrix4(Ys),this.boundingSphere.union(Ur)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(Or.geometry=this.geometry,Or.material=this.material,Or.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ur.copy(this.boundingSphere),Ur.applyMatrix4(n),e.ray.intersectsSphere(Ur)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Ys),vu.multiplyMatrices(n,Ys),Or.matrixWorld=vu,Or.raycast(e,za);for(let a=0,o=za.length;a<o;a++){const c=za[a];c.instanceId=r,c.object=this,t.push(c)}za.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Yc(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Vo(new Float32Array(i*this.count),i,this.count,yh,ai));const r=this.morphTexture.source.data.data;let a=0;for(let l=0;l<n.length;l++)a+=n[l];const o=this.geometry.morphTargetsRelative?1:1-a,c=i*e;r[c]=o,r.set(n,c+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Ml=new P,ig=new P,sg=new nt;class bs{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=Ml.subVectors(n,t).cross(ig.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Ml),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||sg.getNormalMatrix(e),i=this.coplanarPoint(Ml).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const us=new Mi,rg=new We(.5,.5),ka=new P;class Go{constructor(e=new bs,t=new bs,n=new bs,i=new bs,r=new bs,a=new bs){this.planes=[e,t,n,i,r,a]}set(e,t,n,i,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=vi,n=!1){const i=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],l=r[3],h=r[4],u=r[5],f=r[6],p=r[7],m=r[8],b=r[9],g=r[10],d=r[11],x=r[12],_=r[13],v=r[14],T=r[15];if(i[0].setComponents(l-a,p-h,d-m,T-x).normalize(),i[1].setComponents(l+a,p+h,d+m,T+x).normalize(),i[2].setComponents(l+o,p+u,d+b,T+_).normalize(),i[3].setComponents(l-o,p-u,d-b,T-_).normalize(),n)i[4].setComponents(c,f,g,v).normalize(),i[5].setComponents(l-c,p-f,d-g,T-v).normalize();else if(i[4].setComponents(l-c,p-f,d-g,T-v).normalize(),t===vi)i[5].setComponents(l+c,p+f,d+g,T+v).normalize();else if(t===Eo)i[5].setComponents(c,f,g,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),us.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),us.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(us)}intersectsSprite(e){us.center.set(0,0,0);const t=rg.distanceTo(e.center);return us.radius=.7071067811865476+t,us.applyMatrix4(e.matrixWorld),this.intersectsSphere(us)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(ka.x=i.normal.x>0?e.max.x:e.min.x,ka.y=i.normal.y>0?e.max.y:e.min.y,ka.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(ka)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Df extends ci{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new De(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Ao=new P,Ro=new P,_u=new Je,Fr=new ga,Ha=new Mi,Sl=new P,Mu=new P;class Ih extends Bt{constructor(e=new wn,t=new Df){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)Ao.fromBufferAttribute(t,i-1),Ro.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Ao.distanceTo(Ro);e.setAttribute("lineDistance",new Ln(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ha.copy(n.boundingSphere),Ha.applyMatrix4(i),Ha.radius+=r,e.ray.intersectsSphere(Ha)===!1)return;_u.copy(i).invert(),Fr.copy(e.ray).applyMatrix4(_u);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const p=Math.max(0,a.start),m=Math.min(h.count,a.start+a.count);for(let b=p,g=m-1;b<g;b+=l){const d=h.getX(b),x=h.getX(b+1),_=Va(this,e,Fr,c,d,x,b);_&&t.push(_)}if(this.isLineLoop){const b=h.getX(m-1),g=h.getX(p),d=Va(this,e,Fr,c,b,g,m-1);d&&t.push(d)}}else{const p=Math.max(0,a.start),m=Math.min(f.count,a.start+a.count);for(let b=p,g=m-1;b<g;b+=l){const d=Va(this,e,Fr,c,b,b+1,b);d&&t.push(d)}if(this.isLineLoop){const b=Va(this,e,Fr,c,m-1,p,m-1);b&&t.push(b)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Va(s,e,t,n,i,r,a){const o=s.geometry.attributes.position;if(Ao.fromBufferAttribute(o,i),Ro.fromBufferAttribute(o,r),t.distanceSqToSegment(Ao,Ro,Sl,Mu)>n)return;Sl.applyMatrix4(s.matrixWorld);const l=e.ray.origin.distanceTo(Sl);if(!(l<e.near||l>e.far))return{distance:l,point:Mu.clone().applyMatrix4(s.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:s}}const Su=new P,wu=new P;class ag extends Ih{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)Su.fromBufferAttribute(t,i),wu.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Su.distanceTo(wu);e.setAttribute("lineDistance",new Ln(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class og extends Ih{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class la extends ci{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new De(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Tu=new Je,jc=new ga,Ga=new Mi,Wa=new P;class Co extends Bt{constructor(e=new wn,t=new la){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ga.copy(n.boundingSphere),Ga.applyMatrix4(i),Ga.radius+=r,e.ray.intersectsSphere(Ga)===!1)return;Tu.copy(i).invert(),jc.copy(e.ray).applyMatrix4(Tu);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=n.index,u=n.attributes.position;if(l!==null){const f=Math.max(0,a.start),p=Math.min(l.count,a.start+a.count);for(let m=f,b=p;m<b;m++){const g=l.getX(m);Wa.fromBufferAttribute(u,g),Eu(Wa,g,c,i,e,t,this)}}else{const f=Math.max(0,a.start),p=Math.min(u.count,a.start+a.count);for(let m=f,b=p;m<b;m++)Wa.fromBufferAttribute(u,m),Eu(Wa,m,c,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Eu(s,e,t,n,i,r,a){const o=jc.distanceSqToPoint(s);if(o<t){const c=new P;jc.closestPointToPoint(s,c),c.applyMatrix4(n);const l=i.ray.origin.distanceTo(c);if(l<i.near||l>i.far)return;r.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class lg extends Gt{constructor(e,t,n,i,r,a,o,c,l){super(e,t,n,i,r,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Lh extends Gt{constructor(e,t,n=Es,i,r,a,o=Zt,c=Zt,l,h=ia,u=1){if(h!==ia&&h!==fr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const f={width:e,height:t,depth:u};super(f,i,r,a,o,c,h,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ah(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Nf extends Gt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Mr extends wn{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const r=e/2,a=t/2,o=Math.floor(n),c=Math.floor(i),l=o+1,h=c+1,u=e/o,f=t/c,p=[],m=[],b=[],g=[];for(let d=0;d<h;d++){const x=d*f-a;for(let _=0;_<l;_++){const v=_*u-r;m.push(v,-x,0),b.push(0,0,1),g.push(_/o),g.push(1-d/c)}}for(let d=0;d<c;d++)for(let x=0;x<o;x++){const _=x+l*d,v=x+l*(d+1),T=x+1+l*(d+1),A=x+1+l*d;p.push(_,v,A),p.push(v,T,A)}this.setIndex(p),this.setAttribute("position",new Ln(m,3)),this.setAttribute("normal",new Ln(b,3)),this.setAttribute("uv",new Ln(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Mr(e.width,e.height,e.widthSegments,e.heightSegments)}}class Wo extends wn{constructor(e=1,t=32,n=16,i=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const c=Math.min(a+o,Math.PI);let l=0;const h=[],u=new P,f=new P,p=[],m=[],b=[],g=[];for(let d=0;d<=n;d++){const x=[],_=d/n;let v=0;d===0&&a===0?v=.5/t:d===n&&c===Math.PI&&(v=-.5/t);for(let T=0;T<=t;T++){const A=T/t;u.x=-e*Math.cos(i+A*r)*Math.sin(a+_*o),u.y=e*Math.cos(a+_*o),u.z=e*Math.sin(i+A*r)*Math.sin(a+_*o),m.push(u.x,u.y,u.z),f.copy(u).normalize(),b.push(f.x,f.y,f.z),g.push(A+v,1-_),x.push(l++)}h.push(x)}for(let d=0;d<n;d++)for(let x=0;x<t;x++){const _=h[d][x+1],v=h[d][x],T=h[d+1][x],A=h[d+1][x+1];(d!==0||a>0)&&p.push(_,v,A),(d!==n-1||c<Math.PI)&&p.push(v,T,A)}this.setIndex(p),this.setAttribute("position",new Ln(m,3)),this.setAttribute("normal",new Ln(b,3)),this.setAttribute("uv",new Ln(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Wo(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class cg extends Ft{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Dh extends ci{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new De(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new De(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Th,this.normalScale=new We(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _i,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Si extends Dh{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new We(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ct(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new De(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new De(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new De(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class hg extends ci{constructor(e){super(),this.isMeshNormalMaterial=!0,this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Th,this.normalScale=new We(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}}class ug extends ci{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=tm,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class dg extends ci{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function Xa(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function fg(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function pg(s){function e(i,r){return s[i]-s[r]}const t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function Au(s,e,t){const n=s.length,i=new s.constructor(n);for(let r=0,a=0;a!==n;++r){const o=t[r]*e;for(let c=0;c!==e;++c)i[a++]=s[o+c]}return i}function Of(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=s[i++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=s[i++];while(r!==void 0)}class ba{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=i,i=t[++n],e<i)break t}a=t.length;break n}if(!(e>=r)){const o=t[1];e<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(i=r,r=t[--n-1],e>=r)break t}a=n,n=0;break n}break e}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let a=0;a!==i;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class mg extends ba{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Qs,endingEnd:Qs}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,a=e+1,o=i[r],c=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case $s:r=e,o=2*t-n;break;case wo:r=i.length-2,o=t+i[r]-i[r+1];break;default:r=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case $s:a=e,c=2*n-t;break;case wo:a=1,c=n+i[1]-i[0];break;default:a=e-1,c=t}const l=(n-t)*.5,h=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,p=this._weightNext,m=(n-t)/(i-t),b=m*m,g=b*m,d=-f*g+2*f*b-f*m,x=(1+f)*g+(-1.5-2*f)*b+(-.5+f)*m+1,_=(-1-p)*g+(1.5+p)*b+.5*m,v=p*g-p*b;for(let T=0;T!==o;++T)r[T]=d*a[h+T]+x*a[l+T]+_*a[c+T]+v*a[u+T];return r}}class Uf extends ba{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=(n-t)/(i-t),u=1-h;for(let f=0;f!==o;++f)r[f]=a[l+f]*u+a[c+f]*h;return r}}class gg extends ba{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class ui{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Xa(t,this.TimeBufferType),this.values=Xa(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Xa(e.times,Array),values:Xa(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new gg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Uf(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new mg(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case sa:t=this.InterpolantFactoryMethodDiscrete;break;case ra:t=this.InterpolantFactoryMethodLinear;break;case Jo:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return sa;case this.InterpolantFactoryMethodLinear:return ra;case this.InterpolantFactoryMethodSmooth:return Jo}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let r=0,a=i-1;for(;r!==i&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==i){r>=a&&(a=Math.max(a,1),r=a-1);const o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){const c=n[o];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(i!==void 0&&fg(i))for(let o=0,c=i.length;o!==c;++o){const l=i[o];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Jo,r=e.length-1;let a=1;for(let o=1;o<r;++o){let c=!1;const l=e[o],h=e[o+1];if(l!==h&&(o!==1||l!==e[0]))if(i)c=!0;else{const u=o*n,f=u-n,p=u+n;for(let m=0;m!==n;++m){const b=t[u+m];if(b!==t[f+m]||b!==t[p+m]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];const u=o*n,f=a*n;for(let p=0;p!==n;++p)t[f+p]=t[u+p]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,c=a*n,l=0;l!==n;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}ui.prototype.ValueTypeName="";ui.prototype.TimeBufferType=Float32Array;ui.prototype.ValueBufferType=Float32Array;ui.prototype.DefaultInterpolation=ra;class Sr extends ui{constructor(e,t,n){super(e,t,n)}}Sr.prototype.ValueTypeName="bool";Sr.prototype.ValueBufferType=Array;Sr.prototype.DefaultInterpolation=sa;Sr.prototype.InterpolantFactoryMethodLinear=void 0;Sr.prototype.InterpolantFactoryMethodSmooth=void 0;class Ff extends ui{constructor(e,t,n,i){super(e,t,n,i)}}Ff.prototype.ValueTypeName="color";class gr extends ui{constructor(e,t,n,i){super(e,t,n,i)}}gr.prototype.ValueTypeName="number";class bg extends ba{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(i-t);let l=e*o;for(let h=l+o;l!==h;l+=4)li.slerpFlat(r,0,a,l-o,a,l,c);return r}}class br extends ui{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new bg(this.times,this.values,this.getValueSize(),e)}}br.prototype.ValueTypeName="quaternion";br.prototype.InterpolantFactoryMethodSmooth=void 0;class wr extends ui{constructor(e,t,n){super(e,t,n)}}wr.prototype.ValueTypeName="string";wr.prototype.ValueBufferType=Array;wr.prototype.DefaultInterpolation=sa;wr.prototype.InterpolantFactoryMethodLinear=void 0;wr.prototype.InterpolantFactoryMethodSmooth=void 0;class xr extends ui{constructor(e,t,n,i){super(e,t,n,i)}}xr.prototype.ValueTypeName="vector";class Kc{constructor(e="",t=-1,n=[],i=wh){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=oi(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(vg(n[a]).scale(i));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(ui.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const r=t.length,a=[];for(let o=0;o<r;o++){let c=[],l=[];c.push((o+r-1)%r,o,(o+1)%r),l.push(0,1,0);const h=pg(c);c=Au(c,1,h),l=Au(l,1,h),!i&&c[0]===0&&(c.push(r),l.push(l[0])),a.push(new gr(".morphTargetInfluences["+t[o].name+"]",c,l).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,c=e.length;o<c;o++){const l=e[o],h=l.name.match(r);if(h&&h.length>1){const u=h[1];let f=i[u];f||(i[u]=f=[]),f.push(l)}}const a=[];for(const o in i)a.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return a}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(u,f,p,m,b){if(p.length!==0){const g=[],d=[];Of(p,g,d,m),g.length!==0&&b.push(new u(f,g,d))}},i=[],r=e.name||"default",a=e.fps||30,o=e.blendMode;let c=e.length||-1;const l=e.hierarchy||[];for(let u=0;u<l.length;u++){const f=l[u].keys;if(!(!f||f.length===0))if(f[0].morphTargets){const p={};let m;for(m=0;m<f.length;m++)if(f[m].morphTargets)for(let b=0;b<f[m].morphTargets.length;b++)p[f[m].morphTargets[b]]=-1;for(const b in p){const g=[],d=[];for(let x=0;x!==f[m].morphTargets.length;++x){const _=f[m];g.push(_.time),d.push(_.morphTarget===b?1:0)}i.push(new gr(".morphTargetInfluence["+b+"]",g,d))}c=p.length*a}else{const p=".bones["+t[u].name+"]";n(xr,p+".position",f,"pos",i),n(br,p+".quaternion",f,"rot",i),n(xr,p+".scale",f,"scl",i)}}return i.length===0?null:new this(r,c,i,o)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function xg(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return gr;case"vector":case"vector2":case"vector3":case"vector4":return xr;case"color":return Ff;case"quaternion":return br;case"bool":case"boolean":return Sr;case"string":return wr}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function vg(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=xg(s.type);if(s.times===void 0){const t=[],n=[];Of(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}const Oi={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class yg{constructor(e,t,n){const i=this;let r=!1,a=0,o=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(h){o++,r===!1&&i.onStart!==void 0&&i.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,i.onProgress!==void 0&&i.onProgress(h,a,o),a===o&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){const u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=l.length;u<f;u+=2){const p=l[u],m=l[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return m}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}}const _g=new yg;class Tr{constructor(e){this.manager=e!==void 0?e:_g,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}Tr.DEFAULT_MATERIAL_NAME="__DEFAULT";const Pi={};class Mg extends Error{constructor(e,t){super(e),this.response=t}}class Bf extends Tr{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=Oi.get(`file:${e}`);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(Pi[e]!==void 0){Pi[e].push({onLoad:t,onProgress:n,onError:i});return}Pi[e]=[],Pi[e].push({onLoad:t,onProgress:n,onError:i});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,c=this.responseType;fetch(a).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const h=Pi[e],u=l.body.getReader(),f=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),p=f?parseInt(f):0,m=p!==0;let b=0;const g=new ReadableStream({start(d){x();function x(){u.read().then(({done:_,value:v})=>{if(_)d.close();else{b+=v.byteLength;const T=new ProgressEvent("progress",{lengthComputable:m,loaded:b,total:p});for(let A=0,C=h.length;A<C;A++){const D=h[A];D.onProgress&&D.onProgress(T)}d.enqueue(v),x()}},_=>{d.error(_)})}}});return new Response(g)}else throw new Mg(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return l.json();default:if(o==="")return l.text();{const u=/charset="?([^;"\s]*)"?/i.exec(o),f=u&&u[1]?u[1].toLowerCase():void 0,p=new TextDecoder(f);return l.arrayBuffer().then(m=>p.decode(m))}}}).then(l=>{Oi.add(`file:${e}`,l);const h=Pi[e];delete Pi[e];for(let u=0,f=h.length;u<f;u++){const p=h[u];p.onLoad&&p.onLoad(l)}}).catch(l=>{const h=Pi[e];if(h===void 0)throw this.manager.itemError(e),l;delete Pi[e];for(let u=0,f=h.length;u<f;u++){const p=h[u];p.onError&&p.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const js=new WeakMap;class Sg extends Tr{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=Oi.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let u=js.get(a);u===void 0&&(u=[],js.set(a,u)),u.push({onLoad:t,onError:i})}return a}const o=aa("img");function c(){h(),t&&t(this);const u=js.get(this)||[];for(let f=0;f<u.length;f++){const p=u[f];p.onLoad&&p.onLoad(this)}js.delete(this),r.manager.itemEnd(e)}function l(u){h(),i&&i(u),Oi.remove(`image:${e}`);const f=js.get(this)||[];for(let p=0;p<f.length;p++){const m=f[p];m.onError&&m.onError(u)}js.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",c,!1),o.removeEventListener("error",l,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Oi.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}}class wg extends Tr{constructor(e){super(e)}load(e,t,n,i){const r=new Gt,a=new Sg(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}}class xa extends Bt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new De(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class Nh extends xa{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new De(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const wl=new Je,Ru=new P,Cu=new P;class Oh{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new We(512,512),this.mapType=hi,this.map=null,this.mapPass=null,this.matrix=new Je,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Go,this._frameExtents=new We(1,1),this._viewportCount=1,this._viewports=[new xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Ru.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ru),Cu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Cu),t.updateMatrixWorld(),wl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(wl,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(wl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Tg extends Oh{constructor(){super(new qt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=pr*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class va extends xa{constructor(e,t,n=0,i=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.target=new Bt,this.distance=n,this.angle=i,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new Tg}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Pu=new Je,Br=new P,Tl=new P;class Eg extends Oh{constructor(){super(new qt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new We(4,2),this._viewportCount=6,this._viewports=[new xt(2,1,1,1),new xt(0,1,1,1),new xt(3,1,1,1),new xt(1,1,1,1),new xt(3,0,1,1),new xt(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Br.setFromMatrixPosition(e.matrixWorld),n.position.copy(Br),Tl.copy(n.position),Tl.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Tl),n.updateMatrixWorld(),i.makeTranslation(-Br.x,-Br.y,-Br.z),Pu.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Pu,n.coordinateSystem,n.reversedDepth)}}class Fn extends xa{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Eg}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class Xo extends Cf{constructor(e=-1,t=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=i+t,c=i-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Ag extends Oh{constructor(){super(new Xo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Po extends xa{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.target=new Bt,this.shadow=new Ag}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Zc extends xa{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Qr{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const El=new WeakMap;class Rg extends Tr{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=Oi.get(`image-bitmap:${e}`);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(l=>{if(El.has(a)===!0)i&&i(El.get(a)),r.manager.itemError(e),r.manager.itemEnd(e);else return t&&t(l),r.manager.itemEnd(e),l});return}return setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0),a}const o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;const c=fetch(e,o).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(l){return Oi.add(`image-bitmap:${e}`,l),t&&t(l),r.manager.itemEnd(e),l}).catch(function(l){i&&i(l),El.set(c,l),Oi.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});Oi.add(`image-bitmap:${e}`,c),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class Cg extends qt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class zf{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}class Pg{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,r,a;switch(t){case"quaternion":i=this._slerp,r=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,r=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,r=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){const n=this.buffer,i=this.valueSize,r=e*i+i;let a=this.cumulativeWeight;if(a===0){for(let o=0;o!==i;++o)n[r+o]=n[o];a=t}else{a+=t;const o=t/a;this._mixBufferRegion(n,r,0,o,i)}this.cumulativeWeight=a}accumulateAdditive(e){const t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){const t=this.valueSize,n=this.buffer,i=e*t+t,r=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){const c=t*this._origIndex;this._mixBufferRegion(n,i,c,1-r,t)}a>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let c=t,l=t+t;c!==l;++c)if(n[c]!==n[c+t]){o.setValue(n,i);break}}saveOriginalState(){const e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let r=n,a=i;r!==a;++r)t[r]=t[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){const e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,r){if(i>=.5)for(let a=0;a!==r;++a)e[t+a]=e[n+a]}_slerp(e,t,n,i){li.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,r){const a=this._workIndex*r;li.multiplyQuaternionsFlat(e,a,e,t,e,n),li.slerpFlat(e,t,e,t,e,a,i)}_lerp(e,t,n,i,r){const a=1-i;for(let o=0;o!==r;++o){const c=t+o;e[c]=e[c]*a+e[n+o]*i}}_lerpAdditive(e,t,n,i,r){for(let a=0;a!==r;++a){const o=t+a;e[o]=e[o]+e[n+a]*i}}}const Uh="\\[\\]\\.:\\/",Ig=new RegExp("["+Uh+"]","g"),Fh="[^"+Uh+"]",Lg="[^"+Uh.replace("\\.","")+"]",Dg=/((?:WC+[\/:])*)/.source.replace("WC",Fh),Ng=/(WCOD+)?/.source.replace("WCOD",Lg),Og=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Fh),Ug=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Fh),Fg=new RegExp("^"+Dg+Ng+Og+Ug+"$"),Bg=["material","materials","bones","map"];class zg{constructor(e,t,n){const i=n||wt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class wt{constructor(e,t,n){this.path=t,this.parsedPath=n||wt.parseTrackName(t),this.node=wt.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new wt.Composite(e,t,n):new wt(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Ig,"")}static parseTrackName(e){const t=Fg.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const r=n.nodeName.substring(i+1);Bg.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let a=0;a<r.length;a++){const o=r[a];if(o.name===t||o.uuid===t)return o;const c=n(o.children);if(c)return c}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let r=t.propertyIndex;if(e||(e=wt.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===l){l=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}const a=e[i];if(a===void 0){const l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}wt.Composite=zg;wt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};wt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};wt.prototype.GetterByBindingType=[wt.prototype._getValue_direct,wt.prototype._getValue_array,wt.prototype._getValue_arrayElement,wt.prototype._getValue_toArray];wt.prototype.SetterByBindingTypeAndVersioning=[[wt.prototype._setValue_direct,wt.prototype._setValue_direct_setNeedsUpdate,wt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[wt.prototype._setValue_array,wt.prototype._setValue_array_setNeedsUpdate,wt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[wt.prototype._setValue_arrayElement,wt.prototype._setValue_arrayElement_setNeedsUpdate,wt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[wt.prototype._setValue_fromArray,wt.prototype._setValue_fromArray_setNeedsUpdate,wt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class kg{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;const r=t.tracks,a=r.length,o=new Array(a),c={endingStart:Qs,endingEnd:Qs};for(let l=0;l!==a;++l){const h=r[l].createInterpolant(null);o[l]=h,h.settings=c}this._interpolantSettings=c,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=Jp,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){const i=this._clip.duration,r=e._clip.duration,a=r/i,o=i/r;e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){const e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){const i=this._mixer,r=i.time,a=this.timeScale;let o=this._timeScaleInterpolant;o===null&&(o=i._lendControlInterpolant(),this._timeScaleInterpolant=o);const c=o.parameterPositions,l=o.sampleValues;return c[0]=r,c[1]=r+n,l[0]=e/a,l[1]=t/a,this}stopWarping(){const e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}const r=this._startTime;if(r!==null){const c=(e-r)*n;c<0||n===0?t=0:(this._startTime=null,t=n*c)}t*=this._updateTimeScale(e);const a=this._updateTime(t),o=this._updateWeight(e);if(o>0){const c=this._interpolants,l=this._propertyBindings;switch(this.blendMode){case $p:for(let h=0,u=c.length;h!==u;++h)c[h].evaluate(a),l[h].accumulateAdditive(o);break;case wh:default:for(let h=0,u=c.length;h!==u;++h)c[h].evaluate(a),l[h].accumulate(i,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;const n=this._weightInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;const n=this._timeScaleInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){const t=this._clip.duration,n=this.loop;let i=this.time+e,r=this._loopCount;const a=n===Qp;if(e===0)return r===-1?i:a&&(r&1)===1?t-i:i;if(n===yf){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),i>=t||i<0){const o=Math.floor(i/t);i-=t*o,r+=Math.abs(o);const c=this.repetitions-r;if(c<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(c===1){const l=e<0;this._setEndings(l,!l,a)}else this._setEndings(!1,!1,a);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this.time=i;if(a&&(r&1)===1)return t-i}return i}_setEndings(e,t,n){const i=this._interpolantSettings;n?(i.endingStart=$s,i.endingEnd=$s):(e?i.endingStart=this.zeroSlopeAtStart?$s:Qs:i.endingStart=wo,t?i.endingEnd=this.zeroSlopeAtEnd?$s:Qs:i.endingEnd=wo)}_scheduleFading(e,t,n){const i=this._mixer,r=i.time;let a=this._weightInterpolant;a===null&&(a=i._lendControlInterpolant(),this._weightInterpolant=a);const o=a.parameterPositions,c=a.sampleValues;return o[0]=r,c[0]=t,o[1]=r+e,c[1]=n,this}}const Hg=new Float32Array(1);class Jc extends Is{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){const n=e._localRoot||this._root,i=e._clip.tracks,r=i.length,a=e._propertyBindings,o=e._interpolants,c=n.uuid,l=this._bindingsByRootAndName;let h=l[c];h===void 0&&(h={},l[c]=h);for(let u=0;u!==r;++u){const f=i[u],p=f.name;let m=h[p];if(m!==void 0)++m.referenceCount,a[u]=m;else{if(m=a[u],m!==void 0){m._cacheIndex===null&&(++m.referenceCount,this._addInactiveBinding(m,c,p));continue}const b=t&&t._propertyBindings[u].binding.parsedPath;m=new Pg(wt.create(n,p,b),f.ValueTypeName,f.getValueSize()),++m.referenceCount,this._addInactiveBinding(m,c,p),a[u]=m}o[u].resultBuffer=m.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){const n=(e._localRoot||this._root).uuid,i=e._clip.uuid,r=this._actionsByClip[i];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,i,n)}const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){const t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){const i=this._actions,r=this._actionsByClip;let a=r[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=a;else{const o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=i.length,i.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){const t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;const r=e._clip.uuid,a=this._actionsByClip,o=a[r],c=o.knownActions,l=c[c.length-1],h=e._byClipCacheIndex;l._byClipCacheIndex=h,c[h]=l,c.pop(),e._byClipCacheIndex=null;const u=o.actionByRoot,f=(e._localRoot||this._root).uuid;delete u[f],c.length===0&&delete a[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){const t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){const t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){const i=this._bindingsByRootAndName,r=this._bindings;let a=i[t];a===void 0&&(a={},i[t]=a),a[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){const t=this._bindings,n=e.binding,i=n.rootNode.uuid,r=n.path,a=this._bindingsByRootAndName,o=a[i],c=t[t.length-1],l=e._cacheIndex;c._cacheIndex=l,t[l]=c,t.pop(),delete o[r],Object.keys(o).length===0&&delete a[i]}_lendBinding(e){const t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){const t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){const e=this._controlInterpolants,t=this._nActiveControlInterpolants++;let n=e[t];return n===void 0&&(n=new Uf(new Float32Array(2),new Float32Array(2),1,Hg),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){const t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,r=t[i];e.__cacheIndex=i,t[i]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){const i=t||this._root,r=i.uuid;let a=typeof e=="string"?Kc.findByName(i,e):e;const o=a!==null?a.uuid:e,c=this._actionsByClip[o];let l=null;if(n===void 0&&(a!==null?n=a.blendMode:n=wh),c!==void 0){const u=c.actionByRoot[r];if(u!==void 0&&u.blendMode===n)return u;l=c.knownActions[0],a===null&&(a=l._clip)}if(a===null)return null;const h=new kg(this,a,t,n);return this._bindAction(h,l),this._addInactiveAction(h,o,r),h}existingAction(e,t){const n=t||this._root,i=n.uuid,r=typeof e=="string"?Kc.findByName(n,e):e,a=r?r.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[i]||null}stopAllAction(){const e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;const t=this._actions,n=this._nActiveActions,i=this.time+=e,r=Math.sign(e),a=this._accuIndex^=1;for(let l=0;l!==n;++l)t[l]._update(i,e,r,a);const o=this._bindings,c=this._nActiveBindings;for(let l=0;l!==c;++l)o[l].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){const t=this._actions,n=e.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){const a=r.knownActions;for(let o=0,c=a.length;o!==c;++o){const l=a[o];this._deactivateAction(l);const h=l._cacheIndex,u=t[t.length-1];l._cacheIndex=null,l._byClipCacheIndex=null,u._cacheIndex=h,t[h]=u,t.pop(),this._removeInactiveBindingsForAction(l)}delete i[n]}}uncacheRoot(e){const t=e.uuid,n=this._actionsByClip;for(const a in n){const o=n[a].actionByRoot,c=o[t];c!==void 0&&(this._deactivateAction(c),this._removeInactiveAction(c))}const i=this._bindingsByRootAndName,r=i[t];if(r!==void 0)for(const a in r){const o=r[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){const n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}}const Iu=new Je;class kf{constructor(e,t,n=0,i=1/0){this.ray=new ga(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new Rh,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Iu.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Iu),this}intersectObject(e,t=!0,n=[]){return Qc(e,this,n,t),n.sort(Lu),n}intersectObjects(e,t=!0,n=[]){for(let i=0,r=e.length;i<r;i++)Qc(e[i],this,n,t);return n.sort(Lu),n}}function Lu(s,e){return s.distance-e.distance}function Qc(s,e,t,n){let i=!0;if(s.layers.test(e.layers)&&s.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){const r=s.children;for(let a=0,o=r.length;a<o;a++)Qc(r[a],e,t,!0)}}function Du(s,e,t,n){const i=Vg(n);switch(t){case bf:return s*e;case yh:return s*e/i.components*i.byteLength;case _h:return s*e/i.components*i.byteLength;case vf:return s*e*2/i.components*i.byteLength;case Mh:return s*e*2/i.components*i.byteLength;case xf:return s*e*3/i.components*i.byteLength;case zn:return s*e*4/i.components*i.byteLength;case Sh:return s*e*4/i.components*i.byteLength;case po:case mo:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case go:case bo:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case xc:case yc:return Math.max(s,16)*Math.max(e,8)/4;case bc:case vc:return Math.max(s,8)*Math.max(e,8)/2;case _c:case Mc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Sc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case wc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Tc:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case Ec:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case Ac:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case Rc:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Cc:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Pc:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case Ic:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case Lc:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case Dc:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case Nc:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case Oc:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case Uc:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Fc:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case Bc:case zc:case kc:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Hc:case Vc:return Math.ceil(s/4)*Math.ceil(e/4)*8;case Gc:case Wc:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Vg(s){switch(s){case hi:case ff:return{byteLength:1,components:1};case na:case pf:case In:return{byteLength:2,components:1};case xh:case vh:return{byteLength:2,components:4};case Es:case bh:case ai:return{byteLength:4,components:1};case mf:case gf:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ph}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ph);function Hf(){let s=null,e=!1,t=null,n=null;function i(r,a){t(r,a),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function Gg(s){const e=new WeakMap;function t(o,c){const l=o.array,h=o.usage,u=l.byteLength,f=s.createBuffer();s.bindBuffer(c,f),s.bufferData(c,l,h),o.onUploadCallback();let p;if(l instanceof Float32Array)p=s.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)p=s.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?p=s.HALF_FLOAT:p=s.UNSIGNED_SHORT;else if(l instanceof Int16Array)p=s.SHORT;else if(l instanceof Uint32Array)p=s.UNSIGNED_INT;else if(l instanceof Int32Array)p=s.INT;else if(l instanceof Int8Array)p=s.BYTE;else if(l instanceof Uint8Array)p=s.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)p=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:p,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,c,l){const h=c.array,u=c.updateRanges;if(s.bindBuffer(l,o),u.length===0)s.bufferSubData(l,0,h);else{u.sort((p,m)=>p.start-m.start);let f=0;for(let p=1;p<u.length;p++){const m=u[f],b=u[p];b.start<=m.start+m.count+1?m.count=Math.max(m.count,b.start+b.count-m.start):(++f,u[f]=b)}u.length=f+1;for(let p=0,m=u.length;p<m;p++){const b=u[p];s.bufferSubData(l,b.start*h.BYTES_PER_ELEMENT,h,b.start,b.count)}c.clearUpdateRanges()}c.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const c=e.get(o);c&&(s.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,o,c),l.version=o.version}}return{get:i,remove:r,update:a}}var Wg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Xg=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,qg=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Yg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,jg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Kg=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Zg=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Jg=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Qg=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,$g=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,e0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,t0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,n0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,i0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,s0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,r0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,a0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,o0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,l0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,c0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,h0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,u0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,d0=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,f0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,p0=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,m0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,g0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,b0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,x0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,v0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,y0="gl_FragColor = linearToOutputTexel( gl_FragColor );",_0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,M0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,S0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,w0=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,T0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,E0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,A0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,R0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,C0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,P0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,I0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,L0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,D0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,N0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,O0=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,U0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,F0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,B0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,z0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,k0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,H0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,V0=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,G0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,W0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,X0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,q0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Y0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,j0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,K0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Z0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,J0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Q0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,$0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,eb=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,tb=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,nb=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ib=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,sb=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,rb=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,ab=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ob=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,lb=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,cb=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,hb=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ub=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,db=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,fb=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,pb=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,mb=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,gb=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,bb=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,xb=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,vb=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,yb=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,_b=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Mb=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Sb=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,wb=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Tb=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Eb=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Ab=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Rb=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Cb=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Pb=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Ib=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Lb=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Db=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Nb=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Ob=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Ub=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Fb=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Bb=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,zb=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,kb=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Hb=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Vb=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Gb=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Wb=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Xb=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,qb=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Yb=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,jb=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Kb=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Zb=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Jb=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Qb=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,$b=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,ex=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tx=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,nx=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ix=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,sx=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rx=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ax=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ox=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,lx=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,cx=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,hx=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,ux=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,dx=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fx=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,px=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mx=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,gx=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bx=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,xx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,vx=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,yx=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,_x=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Mx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,rt={alphahash_fragment:Wg,alphahash_pars_fragment:Xg,alphamap_fragment:qg,alphamap_pars_fragment:Yg,alphatest_fragment:jg,alphatest_pars_fragment:Kg,aomap_fragment:Zg,aomap_pars_fragment:Jg,batching_pars_vertex:Qg,batching_vertex:$g,begin_vertex:e0,beginnormal_vertex:t0,bsdfs:n0,iridescence_fragment:i0,bumpmap_pars_fragment:s0,clipping_planes_fragment:r0,clipping_planes_pars_fragment:a0,clipping_planes_pars_vertex:o0,clipping_planes_vertex:l0,color_fragment:c0,color_pars_fragment:h0,color_pars_vertex:u0,color_vertex:d0,common:f0,cube_uv_reflection_fragment:p0,defaultnormal_vertex:m0,displacementmap_pars_vertex:g0,displacementmap_vertex:b0,emissivemap_fragment:x0,emissivemap_pars_fragment:v0,colorspace_fragment:y0,colorspace_pars_fragment:_0,envmap_fragment:M0,envmap_common_pars_fragment:S0,envmap_pars_fragment:w0,envmap_pars_vertex:T0,envmap_physical_pars_fragment:U0,envmap_vertex:E0,fog_vertex:A0,fog_pars_vertex:R0,fog_fragment:C0,fog_pars_fragment:P0,gradientmap_pars_fragment:I0,lightmap_pars_fragment:L0,lights_lambert_fragment:D0,lights_lambert_pars_fragment:N0,lights_pars_begin:O0,lights_toon_fragment:F0,lights_toon_pars_fragment:B0,lights_phong_fragment:z0,lights_phong_pars_fragment:k0,lights_physical_fragment:H0,lights_physical_pars_fragment:V0,lights_fragment_begin:G0,lights_fragment_maps:W0,lights_fragment_end:X0,logdepthbuf_fragment:q0,logdepthbuf_pars_fragment:Y0,logdepthbuf_pars_vertex:j0,logdepthbuf_vertex:K0,map_fragment:Z0,map_pars_fragment:J0,map_particle_fragment:Q0,map_particle_pars_fragment:$0,metalnessmap_fragment:eb,metalnessmap_pars_fragment:tb,morphinstance_vertex:nb,morphcolor_vertex:ib,morphnormal_vertex:sb,morphtarget_pars_vertex:rb,morphtarget_vertex:ab,normal_fragment_begin:ob,normal_fragment_maps:lb,normal_pars_fragment:cb,normal_pars_vertex:hb,normal_vertex:ub,normalmap_pars_fragment:db,clearcoat_normal_fragment_begin:fb,clearcoat_normal_fragment_maps:pb,clearcoat_pars_fragment:mb,iridescence_pars_fragment:gb,opaque_fragment:bb,packing:xb,premultiplied_alpha_fragment:vb,project_vertex:yb,dithering_fragment:_b,dithering_pars_fragment:Mb,roughnessmap_fragment:Sb,roughnessmap_pars_fragment:wb,shadowmap_pars_fragment:Tb,shadowmap_pars_vertex:Eb,shadowmap_vertex:Ab,shadowmask_pars_fragment:Rb,skinbase_vertex:Cb,skinning_pars_vertex:Pb,skinning_vertex:Ib,skinnormal_vertex:Lb,specularmap_fragment:Db,specularmap_pars_fragment:Nb,tonemapping_fragment:Ob,tonemapping_pars_fragment:Ub,transmission_fragment:Fb,transmission_pars_fragment:Bb,uv_pars_fragment:zb,uv_pars_vertex:kb,uv_vertex:Hb,worldpos_vertex:Vb,background_vert:Gb,background_frag:Wb,backgroundCube_vert:Xb,backgroundCube_frag:qb,cube_vert:Yb,cube_frag:jb,depth_vert:Kb,depth_frag:Zb,distanceRGBA_vert:Jb,distanceRGBA_frag:Qb,equirect_vert:$b,equirect_frag:ex,linedashed_vert:tx,linedashed_frag:nx,meshbasic_vert:ix,meshbasic_frag:sx,meshlambert_vert:rx,meshlambert_frag:ax,meshmatcap_vert:ox,meshmatcap_frag:lx,meshnormal_vert:cx,meshnormal_frag:hx,meshphong_vert:ux,meshphong_frag:dx,meshphysical_vert:fx,meshphysical_frag:px,meshtoon_vert:mx,meshtoon_frag:gx,points_vert:bx,points_frag:xx,shadow_vert:vx,shadow_frag:yx,sprite_vert:_x,sprite_frag:Mx},Se={common:{diffuse:{value:new De(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new nt},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new nt}},envmap:{envMap:{value:null},envMapRotation:{value:new nt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new nt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new nt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new nt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new nt},normalScale:{value:new We(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new nt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new nt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new nt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new nt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new De(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new De(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0},uvTransform:{value:new nt}},sprite:{diffuse:{value:new De(16777215)},opacity:{value:1},center:{value:new We(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new nt},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0}}},bi={basic:{uniforms:yn([Se.common,Se.specularmap,Se.envmap,Se.aomap,Se.lightmap,Se.fog]),vertexShader:rt.meshbasic_vert,fragmentShader:rt.meshbasic_frag},lambert:{uniforms:yn([Se.common,Se.specularmap,Se.envmap,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.fog,Se.lights,{emissive:{value:new De(0)}}]),vertexShader:rt.meshlambert_vert,fragmentShader:rt.meshlambert_frag},phong:{uniforms:yn([Se.common,Se.specularmap,Se.envmap,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.fog,Se.lights,{emissive:{value:new De(0)},specular:{value:new De(1118481)},shininess:{value:30}}]),vertexShader:rt.meshphong_vert,fragmentShader:rt.meshphong_frag},standard:{uniforms:yn([Se.common,Se.envmap,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.roughnessmap,Se.metalnessmap,Se.fog,Se.lights,{emissive:{value:new De(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:rt.meshphysical_vert,fragmentShader:rt.meshphysical_frag},toon:{uniforms:yn([Se.common,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.gradientmap,Se.fog,Se.lights,{emissive:{value:new De(0)}}]),vertexShader:rt.meshtoon_vert,fragmentShader:rt.meshtoon_frag},matcap:{uniforms:yn([Se.common,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.fog,{matcap:{value:null}}]),vertexShader:rt.meshmatcap_vert,fragmentShader:rt.meshmatcap_frag},points:{uniforms:yn([Se.points,Se.fog]),vertexShader:rt.points_vert,fragmentShader:rt.points_frag},dashed:{uniforms:yn([Se.common,Se.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:rt.linedashed_vert,fragmentShader:rt.linedashed_frag},depth:{uniforms:yn([Se.common,Se.displacementmap]),vertexShader:rt.depth_vert,fragmentShader:rt.depth_frag},normal:{uniforms:yn([Se.common,Se.bumpmap,Se.normalmap,Se.displacementmap,{opacity:{value:1}}]),vertexShader:rt.meshnormal_vert,fragmentShader:rt.meshnormal_frag},sprite:{uniforms:yn([Se.sprite,Se.fog]),vertexShader:rt.sprite_vert,fragmentShader:rt.sprite_frag},background:{uniforms:{uvTransform:{value:new nt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:rt.background_vert,fragmentShader:rt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new nt}},vertexShader:rt.backgroundCube_vert,fragmentShader:rt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:rt.cube_vert,fragmentShader:rt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:rt.equirect_vert,fragmentShader:rt.equirect_frag},distanceRGBA:{uniforms:yn([Se.common,Se.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:rt.distanceRGBA_vert,fragmentShader:rt.distanceRGBA_frag},shadow:{uniforms:yn([Se.lights,Se.fog,{color:{value:new De(0)},opacity:{value:1}}]),vertexShader:rt.shadow_vert,fragmentShader:rt.shadow_frag}};bi.physical={uniforms:yn([bi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new nt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new nt},clearcoatNormalScale:{value:new We(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new nt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new nt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new nt},sheen:{value:0},sheenColor:{value:new De(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new nt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new nt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new nt},transmissionSamplerSize:{value:new We},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new nt},attenuationDistance:{value:0},attenuationColor:{value:new De(0)},specularColor:{value:new De(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new nt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new nt},anisotropyVector:{value:new We},anisotropyMap:{value:null},anisotropyMapTransform:{value:new nt}}]),vertexShader:rt.meshphysical_vert,fragmentShader:rt.meshphysical_frag};const qa={r:0,b:0,g:0},ds=new _i,Sx=new Je;function wx(s,e,t,n,i,r,a){const o=new De(0);let c=r===!0?0:1,l,h,u=null,f=0,p=null;function m(_){let v=_.isScene===!0?_.background:null;return v&&v.isTexture&&(v=(_.backgroundBlurriness>0?t:e).get(v)),v}function b(_){let v=!1;const T=m(_);T===null?d(o,c):T&&T.isColor&&(d(T,1),v=!0);const A=s.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,a):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(s.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function g(_,v){const T=m(v);T&&(T.isCubeTexture||T.mapping===Ho)?(h===void 0&&(h=new Kt(new As(1,1,1),new Ft({name:"BackgroundCubeMaterial",uniforms:mr(bi.backgroundCube.uniforms),vertexShader:bi.backgroundCube.vertexShader,fragmentShader:bi.backgroundCube.fragmentShader,side:Mn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(A,C,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),ds.copy(v.backgroundRotation),ds.x*=-1,ds.y*=-1,ds.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(ds.y*=-1,ds.z*=-1),h.material.uniforms.envMap.value=T,h.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Sx.makeRotationFromEuler(ds)),h.material.toneMapped=dt.getTransfer(T.colorSpace)!==Tt,(u!==T||f!==T.version||p!==s.toneMapping)&&(h.material.needsUpdate=!0,u=T,f=T.version,p=s.toneMapping),h.layers.enableAll(),_.unshift(h,h.geometry,h.material,0,0,null)):T&&T.isTexture&&(l===void 0&&(l=new Kt(new Mr(2,2),new Ft({name:"BackgroundMaterial",uniforms:mr(bi.background.uniforms),vertexShader:bi.background.vertexShader,fragmentShader:bi.background.fragmentShader,side:zi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=T,l.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,l.material.toneMapped=dt.getTransfer(T.colorSpace)!==Tt,T.matrixAutoUpdate===!0&&T.updateMatrix(),l.material.uniforms.uvTransform.value.copy(T.matrix),(u!==T||f!==T.version||p!==s.toneMapping)&&(l.material.needsUpdate=!0,u=T,f=T.version,p=s.toneMapping),l.layers.enableAll(),_.unshift(l,l.geometry,l.material,0,0,null))}function d(_,v){_.getRGB(qa,Rf(s)),n.buffers.color.setClear(qa.r,qa.g,qa.b,v,a)}function x(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(_,v=1){o.set(_),c=v,d(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(_){c=_,d(o,c)},render:b,addToRenderList:g,dispose:x}}function Tx(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=f(null);let r=i,a=!1;function o(S,I,z,O,G){let j=!1;const K=u(O,z,I);r!==K&&(r=K,l(r.object)),j=p(S,O,z,G),j&&m(S,O,z,G),G!==null&&e.update(G,s.ELEMENT_ARRAY_BUFFER),(j||a)&&(a=!1,v(S,I,z,O),G!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(G).buffer))}function c(){return s.createVertexArray()}function l(S){return s.bindVertexArray(S)}function h(S){return s.deleteVertexArray(S)}function u(S,I,z){const O=z.wireframe===!0;let G=n[S.id];G===void 0&&(G={},n[S.id]=G);let j=G[I.id];j===void 0&&(j={},G[I.id]=j);let K=j[O];return K===void 0&&(K=f(c()),j[O]=K),K}function f(S){const I=[],z=[],O=[];for(let G=0;G<t;G++)I[G]=0,z[G]=0,O[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:z,attributeDivisors:O,object:S,attributes:{},index:null}}function p(S,I,z,O){const G=r.attributes,j=I.attributes;let K=0;const ee=z.getAttributes();for(const X in ee)if(ee[X].location>=0){const se=G[X];let ge=j[X];if(ge===void 0&&(X==="instanceMatrix"&&S.instanceMatrix&&(ge=S.instanceMatrix),X==="instanceColor"&&S.instanceColor&&(ge=S.instanceColor)),se===void 0||se.attribute!==ge||ge&&se.data!==ge.data)return!0;K++}return r.attributesNum!==K||r.index!==O}function m(S,I,z,O){const G={},j=I.attributes;let K=0;const ee=z.getAttributes();for(const X in ee)if(ee[X].location>=0){let se=j[X];se===void 0&&(X==="instanceMatrix"&&S.instanceMatrix&&(se=S.instanceMatrix),X==="instanceColor"&&S.instanceColor&&(se=S.instanceColor));const ge={};ge.attribute=se,se&&se.data&&(ge.data=se.data),G[X]=ge,K++}r.attributes=G,r.attributesNum=K,r.index=O}function b(){const S=r.newAttributes;for(let I=0,z=S.length;I<z;I++)S[I]=0}function g(S){d(S,0)}function d(S,I){const z=r.newAttributes,O=r.enabledAttributes,G=r.attributeDivisors;z[S]=1,O[S]===0&&(s.enableVertexAttribArray(S),O[S]=1),G[S]!==I&&(s.vertexAttribDivisor(S,I),G[S]=I)}function x(){const S=r.newAttributes,I=r.enabledAttributes;for(let z=0,O=I.length;z<O;z++)I[z]!==S[z]&&(s.disableVertexAttribArray(z),I[z]=0)}function _(S,I,z,O,G,j,K){K===!0?s.vertexAttribIPointer(S,I,z,G,j):s.vertexAttribPointer(S,I,z,O,G,j)}function v(S,I,z,O){b();const G=O.attributes,j=z.getAttributes(),K=I.defaultAttributeValues;for(const ee in j){const X=j[ee];if(X.location>=0){let de=G[ee];if(de===void 0&&(ee==="instanceMatrix"&&S.instanceMatrix&&(de=S.instanceMatrix),ee==="instanceColor"&&S.instanceColor&&(de=S.instanceColor)),de!==void 0){const se=de.normalized,ge=de.itemSize,Ee=e.get(de);if(Ee===void 0)continue;const $e=Ee.buffer,at=Ee.type,et=Ee.bytesPerElement,Q=at===s.INT||at===s.UNSIGNED_INT||de.gpuType===bh;if(de.isInterleavedBufferAttribute){const $=de.data,xe=$.stride,Oe=de.offset;if($.isInstancedInterleavedBuffer){for(let we=0;we<X.locationSize;we++)d(X.location+we,$.meshPerAttribute);S.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let we=0;we<X.locationSize;we++)g(X.location+we);s.bindBuffer(s.ARRAY_BUFFER,$e);for(let we=0;we<X.locationSize;we++)_(X.location+we,ge/X.locationSize,at,se,xe*et,(Oe+ge/X.locationSize*we)*et,Q)}else{if(de.isInstancedBufferAttribute){for(let $=0;$<X.locationSize;$++)d(X.location+$,de.meshPerAttribute);S.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=de.meshPerAttribute*de.count)}else for(let $=0;$<X.locationSize;$++)g(X.location+$);s.bindBuffer(s.ARRAY_BUFFER,$e);for(let $=0;$<X.locationSize;$++)_(X.location+$,ge/X.locationSize,at,se,ge*et,ge/X.locationSize*$*et,Q)}}else if(K!==void 0){const se=K[ee];if(se!==void 0)switch(se.length){case 2:s.vertexAttrib2fv(X.location,se);break;case 3:s.vertexAttrib3fv(X.location,se);break;case 4:s.vertexAttrib4fv(X.location,se);break;default:s.vertexAttrib1fv(X.location,se)}}}}x()}function T(){D();for(const S in n){const I=n[S];for(const z in I){const O=I[z];for(const G in O)h(O[G].object),delete O[G];delete I[z]}delete n[S]}}function A(S){if(n[S.id]===void 0)return;const I=n[S.id];for(const z in I){const O=I[z];for(const G in O)h(O[G].object),delete O[G];delete I[z]}delete n[S.id]}function C(S){for(const I in n){const z=n[I];if(z[S.id]===void 0)continue;const O=z[S.id];for(const G in O)h(O[G].object),delete O[G];delete z[S.id]}}function D(){w(),a=!0,r!==i&&(r=i,l(r.object))}function w(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:D,resetDefaultState:w,dispose:T,releaseStatesOfGeometry:A,releaseStatesOfProgram:C,initAttributes:b,enableAttribute:g,disableUnusedAttributes:x}}function Ex(s,e,t){let n;function i(l){n=l}function r(l,h){s.drawArrays(n,l,h),t.update(h,n,1)}function a(l,h,u){u!==0&&(s.drawArraysInstanced(n,l,h,u),t.update(h,n,u))}function o(l,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,h,0,u);let p=0;for(let m=0;m<u;m++)p+=h[m];t.update(p,n,1)}function c(l,h,u,f){if(u===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<l.length;m++)a(l[m],h[m],f[m]);else{p.multiDrawArraysInstancedWEBGL(n,l,0,h,0,f,0,u);let m=0;for(let b=0;b<u;b++)m+=h[b]*f[b];t.update(m,n,1)}}this.setMode=i,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=c}function Ax(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const C=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(C){return!(C!==zn&&n.convert(C)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(C){const D=C===In&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==hi&&n.convert(C)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==ai&&!D)}function c(C){if(C==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const h=c(l);h!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const u=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),p=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),m=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),b=s.getParameter(s.MAX_TEXTURE_SIZE),g=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),d=s.getParameter(s.MAX_VERTEX_ATTRIBS),x=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),_=s.getParameter(s.MAX_VARYING_VECTORS),v=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),T=m>0,A=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:b,maxCubemapSize:g,maxAttributes:d,maxVertexUniforms:x,maxVaryings:_,maxFragmentUniforms:v,vertexTextures:T,maxSamples:A}}function Rx(s){const e=this;let t=null,n=0,i=!1,r=!1;const a=new bs,o=new nt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const p=u.length!==0||f||n!==0||i;return i=f,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,p){const m=u.clippingPlanes,b=u.clipIntersection,g=u.clipShadows,d=s.get(u);if(!i||m===null||m.length===0||r&&!g)r?h(null):l();else{const x=r?0:n,_=x*4;let v=d.clippingState||null;c.value=v,v=h(m,f,_,p);for(let T=0;T!==_;++T)v[T]=t[T];d.clippingState=v,this.numIntersection=b?this.numPlanes:0,this.numPlanes+=x}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,f,p,m){const b=u!==null?u.length:0;let g=null;if(b!==0){if(g=c.value,m!==!0||g===null){const d=p+b*4,x=f.matrixWorldInverse;o.getNormalMatrix(x),(g===null||g.length<d)&&(g=new Float32Array(d));for(let _=0,v=p;_!==b;++_,v+=4)a.copy(u[_]).applyMatrix4(x,o),a.normal.toArray(g,v),g[v+3]=a.constant}c.value=g,c.needsUpdate=!0}return e.numPlanes=b,e.numIntersection=0,g}}function Cx(s){let e=new WeakMap;function t(a,o){return o===mc?a.mapping=hr:o===gc&&(a.mapping=ur),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===mc||o===gc)if(e.has(a)){const c=e.get(a).texture;return t(c,a.mapping)}else{const c=a.image;if(c&&c.height>0){const l=new Zm(c.height);return l.fromEquirectangularTexture(s,a),e.set(a,l),a.addEventListener("dispose",i),t(l.texture,a.mapping)}else return null}}return a}function i(a){const o=a.target;o.removeEventListener("dispose",i);const c=e.get(o);c!==void 0&&(e.delete(o),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}const er=4,Nu=[.125,.215,.35,.446,.526,.582],vs=20,Al=new Xo,Ou=new De;let Rl=null,Cl=0,Pl=0,Il=!1;const xs=(1+Math.sqrt(5))/2,Ks=1/xs,Uu=[new P(-xs,Ks,0),new P(xs,Ks,0),new P(-Ks,0,xs),new P(Ks,0,xs),new P(0,xs,-Ks),new P(0,xs,Ks),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)],Px=new P;class Fu{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100,r={}){const{size:a=256,position:o=Px}=r;Rl=this._renderer.getRenderTarget(),Cl=this._renderer.getActiveCubeFace(),Pl=this._renderer.getActiveMipmapLevel(),Il=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,i,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ku(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=zu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Rl,Cl,Pl),this._renderer.xr.enabled=Il,e.scissorTest=!1,Ya(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===hr||e.mapping===ur?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Rl=this._renderer.getRenderTarget(),Cl=this._renderer.getActiveCubeFace(),Pl=this._renderer.getActiveMipmapLevel(),Il=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Cn,minFilter:Cn,generateMipmaps:!1,type:In,format:zn,colorSpace:mn,depthBuffer:!1},i=Bu(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Bu(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Ix(r)),this._blurMaterial=Lx(r,e,t)}return i}_compileMaterial(e){const t=new Kt(this._lodPlanes[0],e);this._renderer.compile(t,Al)}_sceneToCubeUV(e,t,n,i,r){const c=new qt(90,1,t,n),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,f=u.autoClear,p=u.toneMapping;u.getClearColor(Ou),u.toneMapping=is,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(i),u.clearDepth(),u.setRenderTarget(null));const b=new Pn({name:"PMREM.Background",side:Mn,depthWrite:!1,depthTest:!1}),g=new Kt(new As,b);let d=!1;const x=e.background;x?x.isColor&&(b.color.copy(x),e.background=null,d=!0):(b.color.copy(Ou),d=!0);for(let _=0;_<6;_++){const v=_%3;v===0?(c.up.set(0,l[_],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[_],r.y,r.z)):v===1?(c.up.set(0,0,l[_]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[_],r.z)):(c.up.set(0,l[_],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[_]));const T=this._cubeSize;Ya(i,v*T,_>2?T:0,T,T),u.setRenderTarget(i),d&&u.render(g,c),u.render(e,c)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=p,u.autoClear=f,e.background=x}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===hr||e.mapping===ur;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=ku()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=zu());const r=i?this._cubemapMaterial:this._equirectMaterial,a=new Kt(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;const c=this._cubeSize;Ya(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,Al)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodPlanes.length;for(let r=1;r<i;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Uu[(i-r-1)%Uu.length];this._blur(e,r-1,r,a,o)}t.autoClear=n}_blur(e,t,n,i,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",r),this._halfBlur(a,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,a,o){const c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Kt(this._lodPlanes[i],l),f=l.uniforms,p=this._sizeLods[n]-1,m=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*vs-1),b=r/m,g=isFinite(r)?1+Math.floor(h*b):vs;g>vs&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${vs}`);const d=[];let x=0;for(let C=0;C<vs;++C){const D=C/b,w=Math.exp(-D*D/2);d.push(w),C===0?x+=w:C<g&&(x+=2*w)}for(let C=0;C<d.length;C++)d[C]=d[C]/x;f.envMap.value=e.texture,f.samples.value=g,f.weights.value=d,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:_}=this;f.dTheta.value=m,f.mipInt.value=_-n;const v=this._sizeLods[i],T=3*v*(i>_-er?i-_+er:0),A=4*(this._cubeSize-v);Ya(t,T,A,3*v,2*v),c.setRenderTarget(t),c.render(u,Al)}}function Ix(s){const e=[],t=[],n=[];let i=s;const r=s-er+1+Nu.length;for(let a=0;a<r;a++){const o=Math.pow(2,i);t.push(o);let c=1/o;a>s-er?c=Nu[a-s+er-1]:a===0&&(c=0),n.push(c);const l=1/(o-2),h=-l,u=1+l,f=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,m=6,b=3,g=2,d=1,x=new Float32Array(b*m*p),_=new Float32Array(g*m*p),v=new Float32Array(d*m*p);for(let A=0;A<p;A++){const C=A%3*2/3-1,D=A>2?0:-1,w=[C,D,0,C+2/3,D,0,C+2/3,D+1,0,C,D,0,C+2/3,D+1,0,C,D+1,0];x.set(w,b*m*A),_.set(f,g*m*A);const S=[A,A,A,A,A,A];v.set(S,d*m*A)}const T=new wn;T.setAttribute("position",new rn(x,b)),T.setAttribute("uv",new rn(_,g)),T.setAttribute("faceIndex",new rn(v,d)),e.push(T),i>er&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Bu(s,e,t){const n=new pn(s,e,t);return n.texture.mapping=Ho,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ya(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function Lx(s,e,t){const n=new Float32Array(vs),i=new P(0,1,0);return new Ft({name:"SphericalGaussianBlur",defines:{n:vs,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Bh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:an,depthTest:!1,depthWrite:!1})}function zu(){return new Ft({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Bh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:an,depthTest:!1,depthWrite:!1})}function ku(){return new Ft({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Bh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:an,depthTest:!1,depthWrite:!1})}function Bh(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Dx(s){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const c=o.mapping,l=c===mc||c===gc,h=c===hr||c===ur;if(l||h){let u=e.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return t===null&&(t=new Fu(s)),u=l?t.fromEquirectangular(o,u):t.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),u.texture;if(u!==void 0)return u.texture;{const p=o.image;return l&&p&&p.height>0||h&&p&&i(p)?(t===null&&(t=new Fu(s)),u=l?t.fromEquirectangular(o):t.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function i(o){let c=0;const l=6;for(let h=0;h<l;h++)o[h]!==void 0&&c++;return c===l}function r(o){const c=o.target;c.removeEventListener("dispose",r);const l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function Nx(s){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&oa("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function Ox(s,e,t,n){const i={},r=new WeakMap;function a(u){const f=u.target;f.index!==null&&e.remove(f.index);for(const m in f.attributes)e.remove(f.attributes[m]);f.removeEventListener("dispose",a),delete i[f.id];const p=r.get(f);p&&(e.remove(p),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(u,f){return i[f.id]===!0||(f.addEventListener("dispose",a),i[f.id]=!0,t.memory.geometries++),f}function c(u){const f=u.attributes;for(const p in f)e.update(f[p],s.ARRAY_BUFFER)}function l(u){const f=[],p=u.index,m=u.attributes.position;let b=0;if(p!==null){const x=p.array;b=p.version;for(let _=0,v=x.length;_<v;_+=3){const T=x[_+0],A=x[_+1],C=x[_+2];f.push(T,A,A,C,C,T)}}else if(m!==void 0){const x=m.array;b=m.version;for(let _=0,v=x.length/3-1;_<v;_+=3){const T=_+0,A=_+1,C=_+2;f.push(T,A,A,C,C,T)}}else return;const g=new(Sf(f)?Af:Ef)(f,1);g.version=b;const d=r.get(u);d&&e.remove(d),r.set(u,g)}function h(u){const f=r.get(u);if(f){const p=u.index;p!==null&&f.version<p.version&&l(u)}else l(u);return r.get(u)}return{get:o,update:c,getWireframeAttribute:h}}function Ux(s,e,t){let n;function i(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function c(f,p){s.drawElements(n,p,r,f*a),t.update(p,n,1)}function l(f,p,m){m!==0&&(s.drawElementsInstanced(n,p,r,f*a,m),t.update(p,n,m))}function h(f,p,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,f,0,m);let g=0;for(let d=0;d<m;d++)g+=p[d];t.update(g,n,1)}function u(f,p,m,b){if(m===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let d=0;d<f.length;d++)l(f[d]/a,p[d],b[d]);else{g.multiDrawElementsInstancedWEBGL(n,p,0,r,f,0,b,0,m);let d=0;for(let x=0;x<m;x++)d+=p[x]*b[x];t.update(d,n,1)}}this.setMode=i,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Fx(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case s.TRIANGLES:t.triangles+=o*(r/3);break;case s.LINES:t.lines+=o*(r/2);break;case s.LINE_STRIP:t.lines+=o*(r-1);break;case s.LINE_LOOP:t.lines+=o*r;break;case s.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function Bx(s,e,t){const n=new WeakMap,i=new xt;function r(a,o,c){const l=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(o);if(f===void 0||f.count!==u){let S=function(){D.dispose(),n.delete(o),o.removeEventListener("dispose",S)};var p=S;f!==void 0&&f.texture.dispose();const m=o.morphAttributes.position!==void 0,b=o.morphAttributes.normal!==void 0,g=o.morphAttributes.color!==void 0,d=o.morphAttributes.position||[],x=o.morphAttributes.normal||[],_=o.morphAttributes.color||[];let v=0;m===!0&&(v=1),b===!0&&(v=2),g===!0&&(v=3);let T=o.attributes.position.count*v,A=1;T>e.maxTextureSize&&(A=Math.ceil(T/e.maxTextureSize),T=e.maxTextureSize);const C=new Float32Array(T*A*4*u),D=new wf(C,T,A,u);D.type=ai,D.needsUpdate=!0;const w=v*4;for(let I=0;I<u;I++){const z=d[I],O=x[I],G=_[I],j=T*A*4*I;for(let K=0;K<z.count;K++){const ee=K*w;m===!0&&(i.fromBufferAttribute(z,K),C[j+ee+0]=i.x,C[j+ee+1]=i.y,C[j+ee+2]=i.z,C[j+ee+3]=0),b===!0&&(i.fromBufferAttribute(O,K),C[j+ee+4]=i.x,C[j+ee+5]=i.y,C[j+ee+6]=i.z,C[j+ee+7]=0),g===!0&&(i.fromBufferAttribute(G,K),C[j+ee+8]=i.x,C[j+ee+9]=i.y,C[j+ee+10]=i.z,C[j+ee+11]=G.itemSize===4?i.w:1)}}f={count:u,texture:D,size:new We(T,A)},n.set(o,f),o.addEventListener("dispose",S)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(s,"morphTexture",a.morphTexture,t);else{let m=0;for(let g=0;g<l.length;g++)m+=l[g];const b=o.morphTargetsRelative?1:1-m;c.getUniforms().setValue(s,"morphTargetBaseInfluence",b),c.getUniforms().setValue(s,"morphTargetInfluences",l)}c.getUniforms().setValue(s,"morphTargetsTexture",f.texture,t),c.getUniforms().setValue(s,"morphTargetsTextureSize",f.size)}return{update:r}}function zx(s,e,t,n){let i=new WeakMap;function r(c){const l=n.render.frame,h=c.geometry,u=e.get(c,h);if(i.get(u)!==l&&(e.update(u),i.set(u,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),i.get(c)!==l&&(t.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,s.ARRAY_BUFFER),i.set(c,l))),c.isSkinnedMesh){const f=c.skeleton;i.get(f)!==l&&(f.update(),i.set(f,l))}return u}function a(){i=new WeakMap}function o(c){const l=c.target;l.removeEventListener("dispose",o),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:a}}const Vf=new Gt,Hu=new Lh(1,1),Gf=new wf,Wf=new Nm,Xf=new Pf,Vu=[],Gu=[],Wu=new Float32Array(16),Xu=new Float32Array(9),qu=new Float32Array(4);function Er(s,e,t){const n=s[0];if(n<=0||n>0)return s;const i=e*t;let r=Vu[i];if(r===void 0&&(r=new Float32Array(i),Vu[i]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,s[a].toArray(r,o)}return r}function Jt(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function Qt(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function qo(s,e){let t=Gu[e];t===void 0&&(t=new Int32Array(e),Gu[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function kx(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function Hx(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Jt(t,e))return;s.uniform2fv(this.addr,e),Qt(t,e)}}function Vx(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Jt(t,e))return;s.uniform3fv(this.addr,e),Qt(t,e)}}function Gx(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Jt(t,e))return;s.uniform4fv(this.addr,e),Qt(t,e)}}function Wx(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Jt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),Qt(t,e)}else{if(Jt(t,n))return;qu.set(n),s.uniformMatrix2fv(this.addr,!1,qu),Qt(t,n)}}function Xx(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Jt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),Qt(t,e)}else{if(Jt(t,n))return;Xu.set(n),s.uniformMatrix3fv(this.addr,!1,Xu),Qt(t,n)}}function qx(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Jt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),Qt(t,e)}else{if(Jt(t,n))return;Wu.set(n),s.uniformMatrix4fv(this.addr,!1,Wu),Qt(t,n)}}function Yx(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function jx(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Jt(t,e))return;s.uniform2iv(this.addr,e),Qt(t,e)}}function Kx(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Jt(t,e))return;s.uniform3iv(this.addr,e),Qt(t,e)}}function Zx(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Jt(t,e))return;s.uniform4iv(this.addr,e),Qt(t,e)}}function Jx(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function Qx(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Jt(t,e))return;s.uniform2uiv(this.addr,e),Qt(t,e)}}function $x(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Jt(t,e))return;s.uniform3uiv(this.addr,e),Qt(t,e)}}function ev(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Jt(t,e))return;s.uniform4uiv(this.addr,e),Qt(t,e)}}function tv(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(Hu.compareFunction=Mf,r=Hu):r=Vf,t.setTexture2D(e||r,i)}function nv(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Wf,i)}function iv(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Xf,i)}function sv(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Gf,i)}function rv(s){switch(s){case 5126:return kx;case 35664:return Hx;case 35665:return Vx;case 35666:return Gx;case 35674:return Wx;case 35675:return Xx;case 35676:return qx;case 5124:case 35670:return Yx;case 35667:case 35671:return jx;case 35668:case 35672:return Kx;case 35669:case 35673:return Zx;case 5125:return Jx;case 36294:return Qx;case 36295:return $x;case 36296:return ev;case 35678:case 36198:case 36298:case 36306:case 35682:return tv;case 35679:case 36299:case 36307:return nv;case 35680:case 36300:case 36308:case 36293:return iv;case 36289:case 36303:case 36311:case 36292:return sv}}function av(s,e){s.uniform1fv(this.addr,e)}function ov(s,e){const t=Er(e,this.size,2);s.uniform2fv(this.addr,t)}function lv(s,e){const t=Er(e,this.size,3);s.uniform3fv(this.addr,t)}function cv(s,e){const t=Er(e,this.size,4);s.uniform4fv(this.addr,t)}function hv(s,e){const t=Er(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function uv(s,e){const t=Er(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function dv(s,e){const t=Er(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function fv(s,e){s.uniform1iv(this.addr,e)}function pv(s,e){s.uniform2iv(this.addr,e)}function mv(s,e){s.uniform3iv(this.addr,e)}function gv(s,e){s.uniform4iv(this.addr,e)}function bv(s,e){s.uniform1uiv(this.addr,e)}function xv(s,e){s.uniform2uiv(this.addr,e)}function vv(s,e){s.uniform3uiv(this.addr,e)}function yv(s,e){s.uniform4uiv(this.addr,e)}function _v(s,e,t){const n=this.cache,i=e.length,r=qo(t,i);Jt(n,r)||(s.uniform1iv(this.addr,r),Qt(n,r));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||Vf,r[a])}function Mv(s,e,t){const n=this.cache,i=e.length,r=qo(t,i);Jt(n,r)||(s.uniform1iv(this.addr,r),Qt(n,r));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||Wf,r[a])}function Sv(s,e,t){const n=this.cache,i=e.length,r=qo(t,i);Jt(n,r)||(s.uniform1iv(this.addr,r),Qt(n,r));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||Xf,r[a])}function wv(s,e,t){const n=this.cache,i=e.length,r=qo(t,i);Jt(n,r)||(s.uniform1iv(this.addr,r),Qt(n,r));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||Gf,r[a])}function Tv(s){switch(s){case 5126:return av;case 35664:return ov;case 35665:return lv;case 35666:return cv;case 35674:return hv;case 35675:return uv;case 35676:return dv;case 5124:case 35670:return fv;case 35667:case 35671:return pv;case 35668:case 35672:return mv;case 35669:case 35673:return gv;case 5125:return bv;case 36294:return xv;case 36295:return vv;case 36296:return yv;case 35678:case 36198:case 36298:case 36306:case 35682:return _v;case 35679:case 36299:case 36307:return Mv;case 35680:case 36300:case 36308:case 36293:return Sv;case 36289:case 36303:case 36311:case 36292:return wv}}class Ev{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=rv(t.type)}}class Av{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Tv(t.type)}}class Rv{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let r=0,a=i.length;r!==a;++r){const o=i[r];o.setValue(e,t[o.id],n)}}}const Ll=/(\w+)(\])?(\[|\.)?/g;function Yu(s,e){s.seq.push(e),s.map[e.id]=e}function Cv(s,e,t){const n=s.name,i=n.length;for(Ll.lastIndex=0;;){const r=Ll.exec(n),a=Ll.lastIndex;let o=r[1];const c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===i){Yu(t,l===void 0?new Ev(o,s,e):new Av(o,s,e));break}else{let u=t.map[o];u===void 0&&(u=new Rv(o),Yu(t,u)),t=u}}}class xo{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=e.getActiveUniform(t,i),a=e.getUniformLocation(t,r.name);Cv(r,a,this)}}setValue(e,t,n,i){const r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,a=t.length;r!==a;++r){const o=t[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,r=e.length;i!==r;++i){const a=e[i];a.id in t&&n.push(a)}return n}}function ju(s,e,t){const n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}const Pv=37297;let Iv=0;function Lv(s,e){const t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=i;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const Ku=new nt;function Dv(s){dt._getMatrix(Ku,dt.workingColorSpace,s);const e=`mat3( ${Ku.elements.map(t=>t.toFixed(4))} )`;switch(dt.getTransfer(s)){case To:return[e,"LinearTransferOETF"];case Tt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function Zu(s,e,t){const n=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+Lv(s.getShaderSource(e),o)}else return r}function Nv(s,e){const t=Dv(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Ov(s,e){let t;switch(e){case rf:t="Linear";break;case af:t="Reinhard";break;case of:t="Cineon";break;case gh:t="ACESFilmic";break;case cf:t="AgX";break;case hf:t="Neutral";break;case lf:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const ja=new P;function Uv(){dt.getLuminanceCoefficients(ja);const s=ja.x.toFixed(4),e=ja.y.toFixed(4),t=ja.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Fv(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Kr).join(`
`)}function Bv(s){const e=[];for(const t in s){const n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function zv(s,e){const t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(e,i),a=r.name;let o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:s.getAttribLocation(e,a),locationSize:o}}return t}function Kr(s){return s!==""}function Ju(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Qu(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const kv=/^[ \t]*#include +<([\w\d./]+)>/gm;function $c(s){return s.replace(kv,Vv)}const Hv=new Map;function Vv(s,e){let t=rt[e];if(t===void 0){const n=Hv.get(e);if(n!==void 0)t=rt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return $c(t)}const Gv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function $u(s){return s.replace(Gv,Wv)}function Wv(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function ed(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Xv(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===mh?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===nc?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Ii&&(e="SHADOWMAP_TYPE_VSM"),e}function qv(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case hr:case ur:e="ENVMAP_TYPE_CUBE";break;case Ho:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Yv(s){let e="ENVMAP_MODE_REFLECTION";return s.envMap&&s.envMapMode===ur&&(e="ENVMAP_MODE_REFRACTION"),e}function jv(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case sf:e="ENVMAP_BLENDING_MULTIPLY";break;case jp:e="ENVMAP_BLENDING_MIX";break;case Kp:e="ENVMAP_BLENDING_ADD";break}return e}function Kv(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Zv(s,e,t,n){const i=s.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const c=Xv(t),l=qv(t),h=Yv(t),u=jv(t),f=Kv(t),p=Fv(t),m=Bv(r),b=i.createProgram();let g,d,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Kr).join(`
`),g.length>0&&(g+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Kr).join(`
`),d.length>0&&(d+=`
`)):(g=[ed(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Kr).join(`
`),d=[ed(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==is?"#define TONE_MAPPING":"",t.toneMapping!==is?rt.tonemapping_pars_fragment:"",t.toneMapping!==is?Ov("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",rt.colorspace_pars_fragment,Nv("linearToOutputTexel",t.outputColorSpace),Uv(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Kr).join(`
`)),a=$c(a),a=Ju(a,t),a=Qu(a,t),o=$c(o),o=Ju(o,t),o=Qu(o,t),a=$u(a),o=$u(o),t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,g=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,d=["#define varying in",t.glslVersion===jh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===jh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const _=x+g+a,v=x+d+o,T=ju(i,i.VERTEX_SHADER,_),A=ju(i,i.FRAGMENT_SHADER,v);i.attachShader(b,T),i.attachShader(b,A),t.index0AttributeName!==void 0?i.bindAttribLocation(b,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(b,0,"position"),i.linkProgram(b);function C(I){if(s.debug.checkShaderErrors){const z=i.getProgramInfoLog(b)||"",O=i.getShaderInfoLog(T)||"",G=i.getShaderInfoLog(A)||"",j=z.trim(),K=O.trim(),ee=G.trim();let X=!0,de=!0;if(i.getProgramParameter(b,i.LINK_STATUS)===!1)if(X=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,b,T,A);else{const se=Zu(i,T,"vertex"),ge=Zu(i,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(b,i.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+j+`
`+se+`
`+ge)}else j!==""?console.warn("THREE.WebGLProgram: Program Info Log:",j):(K===""||ee==="")&&(de=!1);de&&(I.diagnostics={runnable:X,programLog:j,vertexShader:{log:K,prefix:g},fragmentShader:{log:ee,prefix:d}})}i.deleteShader(T),i.deleteShader(A),D=new xo(i,b),w=zv(i,b)}let D;this.getUniforms=function(){return D===void 0&&C(this),D};let w;this.getAttributes=function(){return w===void 0&&C(this),w};let S=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return S===!1&&(S=i.getProgramParameter(b,Pv)),S},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(b),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Iv++,this.cacheKey=e,this.usedTimes=1,this.program=b,this.vertexShader=T,this.fragmentShader=A,this}let Jv=0;class Qv{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new $v(e),t.set(e,n)),n}}class $v{constructor(e){this.id=Jv++,this.code=e,this.usedTimes=0}}function ey(s,e,t,n,i,r,a){const o=new Rh,c=new Qv,l=new Set,h=[],u=i.logarithmicDepthBuffer,f=i.vertexTextures;let p=i.precision;const m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function b(w){return l.add(w),w===0?"uv":`uv${w}`}function g(w,S,I,z,O){const G=z.fog,j=O.geometry,K=w.isMeshStandardMaterial?z.environment:null,ee=(w.isMeshStandardMaterial?t:e).get(w.envMap||K),X=ee&&ee.mapping===Ho?ee.image.height:null,de=m[w.type];w.precision!==null&&(p=i.getMaxPrecision(w.precision),p!==w.precision&&console.warn("THREE.WebGLProgram.getParameters:",w.precision,"not supported, using",p,"instead."));const se=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,ge=se!==void 0?se.length:0;let Ee=0;j.morphAttributes.position!==void 0&&(Ee=1),j.morphAttributes.normal!==void 0&&(Ee=2),j.morphAttributes.color!==void 0&&(Ee=3);let $e,at,et,Q;if(de){const ot=bi[de];$e=ot.vertexShader,at=ot.fragmentShader}else $e=w.vertexShader,at=w.fragmentShader,c.update(w),et=c.getVertexShaderID(w),Q=c.getFragmentShaderID(w);const $=s.getRenderTarget(),xe=s.state.buffers.depth.getReversed(),Oe=O.isInstancedMesh===!0,we=O.isBatchedMesh===!0,Qe=!!w.map,Rt=!!w.matcap,L=!!ee,ft=!!w.aoMap,qe=!!w.lightMap,ze=!!w.bumpMap,Re=!!w.normalMap,pt=!!w.displacementMap,ve=!!w.emissiveMap,Ye=!!w.metalnessMap,gt=!!w.roughnessMap,vt=w.anisotropy>0,R=w.clearcoat>0,y=w.dispersion>0,H=w.iridescence>0,Z=w.sheen>0,ie=w.transmission>0,Y=vt&&!!w.anisotropyMap,Te=R&&!!w.clearcoatMap,he=R&&!!w.clearcoatNormalMap,_e=R&&!!w.clearcoatRoughnessMap,ye=H&&!!w.iridescenceMap,le=H&&!!w.iridescenceThicknessMap,be=Z&&!!w.sheenColorMap,ke=Z&&!!w.sheenRoughnessMap,Le=!!w.specularMap,pe=!!w.specularColorMap,Ne=!!w.specularIntensityMap,N=ie&&!!w.transmissionMap,fe=ie&&!!w.thicknessMap,me=!!w.gradientMap,Ae=!!w.alphaMap,ue=w.alphaTest>0,te=!!w.alphaHash,Ie=!!w.extensions;let je=is;w.toneMapped&&($===null||$.isXRRenderTarget===!0)&&(je=s.toneMapping);const mt={shaderID:de,shaderType:w.type,shaderName:w.name,vertexShader:$e,fragmentShader:at,defines:w.defines,customVertexShaderID:et,customFragmentShaderID:Q,isRawShaderMaterial:w.isRawShaderMaterial===!0,glslVersion:w.glslVersion,precision:p,batching:we,batchingColor:we&&O._colorsTexture!==null,instancing:Oe,instancingColor:Oe&&O.instanceColor!==null,instancingMorph:Oe&&O.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:$===null?s.outputColorSpace:$.isXRRenderTarget===!0?$.texture.colorSpace:mn,alphaToCoverage:!!w.alphaToCoverage,map:Qe,matcap:Rt,envMap:L,envMapMode:L&&ee.mapping,envMapCubeUVHeight:X,aoMap:ft,lightMap:qe,bumpMap:ze,normalMap:Re,displacementMap:f&&pt,emissiveMap:ve,normalMapObjectSpace:Re&&w.normalMapType===im,normalMapTangentSpace:Re&&w.normalMapType===Th,metalnessMap:Ye,roughnessMap:gt,anisotropy:vt,anisotropyMap:Y,clearcoat:R,clearcoatMap:Te,clearcoatNormalMap:he,clearcoatRoughnessMap:_e,dispersion:y,iridescence:H,iridescenceMap:ye,iridescenceThicknessMap:le,sheen:Z,sheenColorMap:be,sheenRoughnessMap:ke,specularMap:Le,specularColorMap:pe,specularIntensityMap:Ne,transmission:ie,transmissionMap:N,thicknessMap:fe,gradientMap:me,opaque:w.transparent===!1&&w.blending===sr&&w.alphaToCoverage===!1,alphaMap:Ae,alphaTest:ue,alphaHash:te,combine:w.combine,mapUv:Qe&&b(w.map.channel),aoMapUv:ft&&b(w.aoMap.channel),lightMapUv:qe&&b(w.lightMap.channel),bumpMapUv:ze&&b(w.bumpMap.channel),normalMapUv:Re&&b(w.normalMap.channel),displacementMapUv:pt&&b(w.displacementMap.channel),emissiveMapUv:ve&&b(w.emissiveMap.channel),metalnessMapUv:Ye&&b(w.metalnessMap.channel),roughnessMapUv:gt&&b(w.roughnessMap.channel),anisotropyMapUv:Y&&b(w.anisotropyMap.channel),clearcoatMapUv:Te&&b(w.clearcoatMap.channel),clearcoatNormalMapUv:he&&b(w.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:_e&&b(w.clearcoatRoughnessMap.channel),iridescenceMapUv:ye&&b(w.iridescenceMap.channel),iridescenceThicknessMapUv:le&&b(w.iridescenceThicknessMap.channel),sheenColorMapUv:be&&b(w.sheenColorMap.channel),sheenRoughnessMapUv:ke&&b(w.sheenRoughnessMap.channel),specularMapUv:Le&&b(w.specularMap.channel),specularColorMapUv:pe&&b(w.specularColorMap.channel),specularIntensityMapUv:Ne&&b(w.specularIntensityMap.channel),transmissionMapUv:N&&b(w.transmissionMap.channel),thicknessMapUv:fe&&b(w.thicknessMap.channel),alphaMapUv:Ae&&b(w.alphaMap.channel),vertexTangents:!!j.attributes.tangent&&(Re||vt),vertexColors:w.vertexColors,vertexAlphas:w.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!j.attributes.uv&&(Qe||Ae),fog:!!G,useFog:w.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:w.flatShading===!0&&w.wireframe===!1,sizeAttenuation:w.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:xe,skinning:O.isSkinnedMesh===!0,morphTargets:j.morphAttributes.position!==void 0,morphNormals:j.morphAttributes.normal!==void 0,morphColors:j.morphAttributes.color!==void 0,morphTargetsCount:ge,morphTextureStride:Ee,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:w.dithering,shadowMapEnabled:s.shadowMap.enabled&&I.length>0,shadowMapType:s.shadowMap.type,toneMapping:je,decodeVideoTexture:Qe&&w.map.isVideoTexture===!0&&dt.getTransfer(w.map.colorSpace)===Tt,decodeVideoTextureEmissive:ve&&w.emissiveMap.isVideoTexture===!0&&dt.getTransfer(w.emissiveMap.colorSpace)===Tt,premultipliedAlpha:w.premultipliedAlpha,doubleSided:w.side===ni,flipSided:w.side===Mn,useDepthPacking:w.depthPacking>=0,depthPacking:w.depthPacking||0,index0AttributeName:w.index0AttributeName,extensionClipCullDistance:Ie&&w.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ie&&w.extensions.multiDraw===!0||we)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:w.customProgramCacheKey()};return mt.vertexUv1s=l.has(1),mt.vertexUv2s=l.has(2),mt.vertexUv3s=l.has(3),l.clear(),mt}function d(w){const S=[];if(w.shaderID?S.push(w.shaderID):(S.push(w.customVertexShaderID),S.push(w.customFragmentShaderID)),w.defines!==void 0)for(const I in w.defines)S.push(I),S.push(w.defines[I]);return w.isRawShaderMaterial===!1&&(x(S,w),_(S,w),S.push(s.outputColorSpace)),S.push(w.customProgramCacheKey),S.join()}function x(w,S){w.push(S.precision),w.push(S.outputColorSpace),w.push(S.envMapMode),w.push(S.envMapCubeUVHeight),w.push(S.mapUv),w.push(S.alphaMapUv),w.push(S.lightMapUv),w.push(S.aoMapUv),w.push(S.bumpMapUv),w.push(S.normalMapUv),w.push(S.displacementMapUv),w.push(S.emissiveMapUv),w.push(S.metalnessMapUv),w.push(S.roughnessMapUv),w.push(S.anisotropyMapUv),w.push(S.clearcoatMapUv),w.push(S.clearcoatNormalMapUv),w.push(S.clearcoatRoughnessMapUv),w.push(S.iridescenceMapUv),w.push(S.iridescenceThicknessMapUv),w.push(S.sheenColorMapUv),w.push(S.sheenRoughnessMapUv),w.push(S.specularMapUv),w.push(S.specularColorMapUv),w.push(S.specularIntensityMapUv),w.push(S.transmissionMapUv),w.push(S.thicknessMapUv),w.push(S.combine),w.push(S.fogExp2),w.push(S.sizeAttenuation),w.push(S.morphTargetsCount),w.push(S.morphAttributeCount),w.push(S.numDirLights),w.push(S.numPointLights),w.push(S.numSpotLights),w.push(S.numSpotLightMaps),w.push(S.numHemiLights),w.push(S.numRectAreaLights),w.push(S.numDirLightShadows),w.push(S.numPointLightShadows),w.push(S.numSpotLightShadows),w.push(S.numSpotLightShadowsWithMaps),w.push(S.numLightProbes),w.push(S.shadowMapType),w.push(S.toneMapping),w.push(S.numClippingPlanes),w.push(S.numClipIntersection),w.push(S.depthPacking)}function _(w,S){o.disableAll(),S.supportsVertexTextures&&o.enable(0),S.instancing&&o.enable(1),S.instancingColor&&o.enable(2),S.instancingMorph&&o.enable(3),S.matcap&&o.enable(4),S.envMap&&o.enable(5),S.normalMapObjectSpace&&o.enable(6),S.normalMapTangentSpace&&o.enable(7),S.clearcoat&&o.enable(8),S.iridescence&&o.enable(9),S.alphaTest&&o.enable(10),S.vertexColors&&o.enable(11),S.vertexAlphas&&o.enable(12),S.vertexUv1s&&o.enable(13),S.vertexUv2s&&o.enable(14),S.vertexUv3s&&o.enable(15),S.vertexTangents&&o.enable(16),S.anisotropy&&o.enable(17),S.alphaHash&&o.enable(18),S.batching&&o.enable(19),S.dispersion&&o.enable(20),S.batchingColor&&o.enable(21),S.gradientMap&&o.enable(22),w.push(o.mask),o.disableAll(),S.fog&&o.enable(0),S.useFog&&o.enable(1),S.flatShading&&o.enable(2),S.logarithmicDepthBuffer&&o.enable(3),S.reversedDepthBuffer&&o.enable(4),S.skinning&&o.enable(5),S.morphTargets&&o.enable(6),S.morphNormals&&o.enable(7),S.morphColors&&o.enable(8),S.premultipliedAlpha&&o.enable(9),S.shadowMapEnabled&&o.enable(10),S.doubleSided&&o.enable(11),S.flipSided&&o.enable(12),S.useDepthPacking&&o.enable(13),S.dithering&&o.enable(14),S.transmission&&o.enable(15),S.sheen&&o.enable(16),S.opaque&&o.enable(17),S.pointsUvs&&o.enable(18),S.decodeVideoTexture&&o.enable(19),S.decodeVideoTextureEmissive&&o.enable(20),S.alphaToCoverage&&o.enable(21),w.push(o.mask)}function v(w){const S=m[w.type];let I;if(S){const z=bi[S];I=Un.clone(z.uniforms)}else I=w.uniforms;return I}function T(w,S){let I;for(let z=0,O=h.length;z<O;z++){const G=h[z];if(G.cacheKey===S){I=G,++I.usedTimes;break}}return I===void 0&&(I=new Zv(s,S,w,r),h.push(I)),I}function A(w){if(--w.usedTimes===0){const S=h.indexOf(w);h[S]=h[h.length-1],h.pop(),w.destroy()}}function C(w){c.remove(w)}function D(){c.dispose()}return{getParameters:g,getProgramCacheKey:d,getUniforms:v,acquireProgram:T,releaseProgram:A,releaseShaderCache:C,programs:h,dispose:D}}function ty(){let s=new WeakMap;function e(a){return s.has(a)}function t(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function n(a){s.delete(a)}function i(a,o,c){s.get(a)[o]=c}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function ny(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function td(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function nd(){const s=[];let e=0;const t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function a(u,f,p,m,b,g){let d=s[e];return d===void 0?(d={id:u.id,object:u,geometry:f,material:p,groupOrder:m,renderOrder:u.renderOrder,z:b,group:g},s[e]=d):(d.id=u.id,d.object=u,d.geometry=f,d.material=p,d.groupOrder=m,d.renderOrder=u.renderOrder,d.z=b,d.group=g),e++,d}function o(u,f,p,m,b,g){const d=a(u,f,p,m,b,g);p.transmission>0?n.push(d):p.transparent===!0?i.push(d):t.push(d)}function c(u,f,p,m,b,g){const d=a(u,f,p,m,b,g);p.transmission>0?n.unshift(d):p.transparent===!0?i.unshift(d):t.unshift(d)}function l(u,f){t.length>1&&t.sort(u||ny),n.length>1&&n.sort(f||td),i.length>1&&i.sort(f||td)}function h(){for(let u=e,f=s.length;u<f;u++){const p=s[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:o,unshift:c,finish:h,sort:l}}function iy(){let s=new WeakMap;function e(n,i){const r=s.get(n);let a;return r===void 0?(a=new nd,s.set(n,[a])):i>=r.length?(a=new nd,r.push(a)):a=r[i],a}function t(){s=new WeakMap}return{get:e,dispose:t}}function sy(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new De};break;case"SpotLight":t={position:new P,direction:new P,color:new De,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new De,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new De,groundColor:new De};break;case"RectAreaLight":t={color:new De,position:new P,halfWidth:new P,halfHeight:new P};break}return s[e.id]=t,t}}}function ry(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new We};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new We};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new We,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let ay=0;function oy(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function ly(s){const e=new sy,t=ry(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new P);const i=new P,r=new Je,a=new Je;function o(l){let h=0,u=0,f=0;for(let w=0;w<9;w++)n.probe[w].set(0,0,0);let p=0,m=0,b=0,g=0,d=0,x=0,_=0,v=0,T=0,A=0,C=0;l.sort(oy);for(let w=0,S=l.length;w<S;w++){const I=l[w],z=I.color,O=I.intensity,G=I.distance,j=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)h+=z.r*O,u+=z.g*O,f+=z.b*O;else if(I.isLightProbe){for(let K=0;K<9;K++)n.probe[K].addScaledVector(I.sh.coefficients[K],O);C++}else if(I.isDirectionalLight){const K=e.get(I);if(K.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const ee=I.shadow,X=t.get(I);X.shadowIntensity=ee.intensity,X.shadowBias=ee.bias,X.shadowNormalBias=ee.normalBias,X.shadowRadius=ee.radius,X.shadowMapSize=ee.mapSize,n.directionalShadow[p]=X,n.directionalShadowMap[p]=j,n.directionalShadowMatrix[p]=I.shadow.matrix,x++}n.directional[p]=K,p++}else if(I.isSpotLight){const K=e.get(I);K.position.setFromMatrixPosition(I.matrixWorld),K.color.copy(z).multiplyScalar(O),K.distance=G,K.coneCos=Math.cos(I.angle),K.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),K.decay=I.decay,n.spot[b]=K;const ee=I.shadow;if(I.map&&(n.spotLightMap[T]=I.map,T++,ee.updateMatrices(I),I.castShadow&&A++),n.spotLightMatrix[b]=ee.matrix,I.castShadow){const X=t.get(I);X.shadowIntensity=ee.intensity,X.shadowBias=ee.bias,X.shadowNormalBias=ee.normalBias,X.shadowRadius=ee.radius,X.shadowMapSize=ee.mapSize,n.spotShadow[b]=X,n.spotShadowMap[b]=j,v++}b++}else if(I.isRectAreaLight){const K=e.get(I);K.color.copy(z).multiplyScalar(O),K.halfWidth.set(I.width*.5,0,0),K.halfHeight.set(0,I.height*.5,0),n.rectArea[g]=K,g++}else if(I.isPointLight){const K=e.get(I);if(K.color.copy(I.color).multiplyScalar(I.intensity),K.distance=I.distance,K.decay=I.decay,I.castShadow){const ee=I.shadow,X=t.get(I);X.shadowIntensity=ee.intensity,X.shadowBias=ee.bias,X.shadowNormalBias=ee.normalBias,X.shadowRadius=ee.radius,X.shadowMapSize=ee.mapSize,X.shadowCameraNear=ee.camera.near,X.shadowCameraFar=ee.camera.far,n.pointShadow[m]=X,n.pointShadowMap[m]=j,n.pointShadowMatrix[m]=I.shadow.matrix,_++}n.point[m]=K,m++}else if(I.isHemisphereLight){const K=e.get(I);K.skyColor.copy(I.color).multiplyScalar(O),K.groundColor.copy(I.groundColor).multiplyScalar(O),n.hemi[d]=K,d++}}g>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Se.LTC_FLOAT_1,n.rectAreaLTC2=Se.LTC_FLOAT_2):(n.rectAreaLTC1=Se.LTC_HALF_1,n.rectAreaLTC2=Se.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const D=n.hash;(D.directionalLength!==p||D.pointLength!==m||D.spotLength!==b||D.rectAreaLength!==g||D.hemiLength!==d||D.numDirectionalShadows!==x||D.numPointShadows!==_||D.numSpotShadows!==v||D.numSpotMaps!==T||D.numLightProbes!==C)&&(n.directional.length=p,n.spot.length=b,n.rectArea.length=g,n.point.length=m,n.hemi.length=d,n.directionalShadow.length=x,n.directionalShadowMap.length=x,n.pointShadow.length=_,n.pointShadowMap.length=_,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=x,n.pointShadowMatrix.length=_,n.spotLightMatrix.length=v+T-A,n.spotLightMap.length=T,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=C,D.directionalLength=p,D.pointLength=m,D.spotLength=b,D.rectAreaLength=g,D.hemiLength=d,D.numDirectionalShadows=x,D.numPointShadows=_,D.numSpotShadows=v,D.numSpotMaps=T,D.numLightProbes=C,n.version=ay++)}function c(l,h){let u=0,f=0,p=0,m=0,b=0;const g=h.matrixWorldInverse;for(let d=0,x=l.length;d<x;d++){const _=l[d];if(_.isDirectionalLight){const v=n.directional[u];v.direction.setFromMatrixPosition(_.matrixWorld),i.setFromMatrixPosition(_.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(g),u++}else if(_.isSpotLight){const v=n.spot[p];v.position.setFromMatrixPosition(_.matrixWorld),v.position.applyMatrix4(g),v.direction.setFromMatrixPosition(_.matrixWorld),i.setFromMatrixPosition(_.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(g),p++}else if(_.isRectAreaLight){const v=n.rectArea[m];v.position.setFromMatrixPosition(_.matrixWorld),v.position.applyMatrix4(g),a.identity(),r.copy(_.matrixWorld),r.premultiply(g),a.extractRotation(r),v.halfWidth.set(_.width*.5,0,0),v.halfHeight.set(0,_.height*.5,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),m++}else if(_.isPointLight){const v=n.point[f];v.position.setFromMatrixPosition(_.matrixWorld),v.position.applyMatrix4(g),f++}else if(_.isHemisphereLight){const v=n.hemi[b];v.direction.setFromMatrixPosition(_.matrixWorld),v.direction.transformDirection(g),b++}}}return{setup:o,setupView:c,state:n}}function id(s){const e=new ly(s),t=[],n=[];function i(h){l.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function c(h){e.setupView(t,h)}const l={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:o,setupLightsView:c,pushLight:r,pushShadow:a}}function cy(s){let e=new WeakMap;function t(i,r=0){const a=e.get(i);let o;return a===void 0?(o=new id(s),e.set(i,[o])):r>=a.length?(o=new id(s),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const hy=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,uy=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function dy(s,e,t){let n=new Go;const i=new We,r=new We,a=new xt,o=new ug({depthPacking:nm}),c=new dg,l={},h=t.maxTextureSize,u={[zi]:Mn,[Mn]:zi,[ni]:ni},f=new Ft({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new We},radius:{value:4}},vertexShader:hy,fragmentShader:uy}),p=f.clone();p.defines.HORIZONTAL_PASS=1;const m=new wn;m.setAttribute("position",new rn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const b=new Kt(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=mh;let d=this.type;this.render=function(A,C,D){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||A.length===0)return;const w=s.getRenderTarget(),S=s.getActiveCubeFace(),I=s.getActiveMipmapLevel(),z=s.state;z.setBlending(an),z.buffers.depth.getReversed()===!0?z.buffers.color.setClear(0,0,0,0):z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);const O=d!==Ii&&this.type===Ii,G=d===Ii&&this.type!==Ii;for(let j=0,K=A.length;j<K;j++){const ee=A[j],X=ee.shadow;if(X===void 0){console.warn("THREE.WebGLShadowMap:",ee,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;i.copy(X.mapSize);const de=X.getFrameExtents();if(i.multiply(de),r.copy(X.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/de.x),i.x=r.x*de.x,X.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/de.y),i.y=r.y*de.y,X.mapSize.y=r.y)),X.map===null||O===!0||G===!0){const ge=this.type!==Ii?{minFilter:Zt,magFilter:Zt}:{};X.map!==null&&X.map.dispose(),X.map=new pn(i.x,i.y,ge),X.map.texture.name=ee.name+".shadowMap",X.camera.updateProjectionMatrix()}s.setRenderTarget(X.map),s.clear();const se=X.getViewportCount();for(let ge=0;ge<se;ge++){const Ee=X.getViewport(ge);a.set(r.x*Ee.x,r.y*Ee.y,r.x*Ee.z,r.y*Ee.w),z.viewport(a),X.updateMatrices(ee,ge),n=X.getFrustum(),v(C,D,X.camera,ee,this.type)}X.isPointLightShadow!==!0&&this.type===Ii&&x(X,D),X.needsUpdate=!1}d=this.type,g.needsUpdate=!1,s.setRenderTarget(w,S,I)};function x(A,C){const D=e.update(b);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,p.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new pn(i.x,i.y)),f.uniforms.shadow_pass.value=A.map.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,s.setRenderTarget(A.mapPass),s.clear(),s.renderBufferDirect(C,null,D,f,b,null),p.uniforms.shadow_pass.value=A.mapPass.texture,p.uniforms.resolution.value=A.mapSize,p.uniforms.radius.value=A.radius,s.setRenderTarget(A.map),s.clear(),s.renderBufferDirect(C,null,D,p,b,null)}function _(A,C,D,w){let S=null;const I=D.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(I!==void 0)S=I;else if(S=D.isPointLight===!0?c:o,s.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){const z=S.uuid,O=C.uuid;let G=l[z];G===void 0&&(G={},l[z]=G);let j=G[O];j===void 0&&(j=S.clone(),G[O]=j,C.addEventListener("dispose",T)),S=j}if(S.visible=C.visible,S.wireframe=C.wireframe,w===Ii?S.side=C.shadowSide!==null?C.shadowSide:C.side:S.side=C.shadowSide!==null?C.shadowSide:u[C.side],S.alphaMap=C.alphaMap,S.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,S.map=C.map,S.clipShadows=C.clipShadows,S.clippingPlanes=C.clippingPlanes,S.clipIntersection=C.clipIntersection,S.displacementMap=C.displacementMap,S.displacementScale=C.displacementScale,S.displacementBias=C.displacementBias,S.wireframeLinewidth=C.wireframeLinewidth,S.linewidth=C.linewidth,D.isPointLight===!0&&S.isMeshDistanceMaterial===!0){const z=s.properties.get(S);z.light=D}return S}function v(A,C,D,w,S){if(A.visible===!1)return;if(A.layers.test(C.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&S===Ii)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,A.matrixWorld);const O=e.update(A),G=A.material;if(Array.isArray(G)){const j=O.groups;for(let K=0,ee=j.length;K<ee;K++){const X=j[K],de=G[X.materialIndex];if(de&&de.visible){const se=_(A,de,w,S);A.onBeforeShadow(s,A,C,D,O,se,X),s.renderBufferDirect(D,null,O,se,A,X),A.onAfterShadow(s,A,C,D,O,se,X)}}}else if(G.visible){const j=_(A,G,w,S);A.onBeforeShadow(s,A,C,D,O,j,null),s.renderBufferDirect(D,null,O,j,A,null),A.onAfterShadow(s,A,C,D,O,j,null)}}const z=A.children;for(let O=0,G=z.length;O<G;O++)v(z[O],C,D,w,S)}function T(A){A.target.removeEventListener("dispose",T);for(const D in l){const w=l[D],S=A.target.uuid;S in w&&(w[S].dispose(),delete w[S])}}}const fy={[lc]:cc,[hc]:fc,[uc]:pc,[cr]:dc,[cc]:lc,[fc]:hc,[pc]:uc,[dc]:cr};function py(s,e){function t(){let N=!1;const fe=new xt;let me=null;const Ae=new xt(0,0,0,0);return{setMask:function(ue){me!==ue&&!N&&(s.colorMask(ue,ue,ue,ue),me=ue)},setLocked:function(ue){N=ue},setClear:function(ue,te,Ie,je,mt){mt===!0&&(ue*=je,te*=je,Ie*=je),fe.set(ue,te,Ie,je),Ae.equals(fe)===!1&&(s.clearColor(ue,te,Ie,je),Ae.copy(fe))},reset:function(){N=!1,me=null,Ae.set(-1,0,0,0)}}}function n(){let N=!1,fe=!1,me=null,Ae=null,ue=null;return{setReversed:function(te){if(fe!==te){const Ie=e.get("EXT_clip_control");te?Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.ZERO_TO_ONE_EXT):Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.NEGATIVE_ONE_TO_ONE_EXT),fe=te;const je=ue;ue=null,this.setClear(je)}},getReversed:function(){return fe},setTest:function(te){te?$(s.DEPTH_TEST):xe(s.DEPTH_TEST)},setMask:function(te){me!==te&&!N&&(s.depthMask(te),me=te)},setFunc:function(te){if(fe&&(te=fy[te]),Ae!==te){switch(te){case lc:s.depthFunc(s.NEVER);break;case cc:s.depthFunc(s.ALWAYS);break;case hc:s.depthFunc(s.LESS);break;case cr:s.depthFunc(s.LEQUAL);break;case uc:s.depthFunc(s.EQUAL);break;case dc:s.depthFunc(s.GEQUAL);break;case fc:s.depthFunc(s.GREATER);break;case pc:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}Ae=te}},setLocked:function(te){N=te},setClear:function(te){ue!==te&&(fe&&(te=1-te),s.clearDepth(te),ue=te)},reset:function(){N=!1,me=null,Ae=null,ue=null,fe=!1}}}function i(){let N=!1,fe=null,me=null,Ae=null,ue=null,te=null,Ie=null,je=null,mt=null;return{setTest:function(ot){N||(ot?$(s.STENCIL_TEST):xe(s.STENCIL_TEST))},setMask:function(ot){fe!==ot&&!N&&(s.stencilMask(ot),fe=ot)},setFunc:function(ot,bn,$t){(me!==ot||Ae!==bn||ue!==$t)&&(s.stencilFunc(ot,bn,$t),me=ot,Ae=bn,ue=$t)},setOp:function(ot,bn,$t){(te!==ot||Ie!==bn||je!==$t)&&(s.stencilOp(ot,bn,$t),te=ot,Ie=bn,je=$t)},setLocked:function(ot){N=ot},setClear:function(ot){mt!==ot&&(s.clearStencil(ot),mt=ot)},reset:function(){N=!1,fe=null,me=null,Ae=null,ue=null,te=null,Ie=null,je=null,mt=null}}}const r=new t,a=new n,o=new i,c=new WeakMap,l=new WeakMap;let h={},u={},f=new WeakMap,p=[],m=null,b=!1,g=null,d=null,x=null,_=null,v=null,T=null,A=null,C=new De(0,0,0),D=0,w=!1,S=null,I=null,z=null,O=null,G=null;const j=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let K=!1,ee=0;const X=s.getParameter(s.VERSION);X.indexOf("WebGL")!==-1?(ee=parseFloat(/^WebGL (\d)/.exec(X)[1]),K=ee>=1):X.indexOf("OpenGL ES")!==-1&&(ee=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),K=ee>=2);let de=null,se={};const ge=s.getParameter(s.SCISSOR_BOX),Ee=s.getParameter(s.VIEWPORT),$e=new xt().fromArray(ge),at=new xt().fromArray(Ee);function et(N,fe,me,Ae){const ue=new Uint8Array(4),te=s.createTexture();s.bindTexture(N,te),s.texParameteri(N,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(N,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Ie=0;Ie<me;Ie++)N===s.TEXTURE_3D||N===s.TEXTURE_2D_ARRAY?s.texImage3D(fe,0,s.RGBA,1,1,Ae,0,s.RGBA,s.UNSIGNED_BYTE,ue):s.texImage2D(fe+Ie,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,ue);return te}const Q={};Q[s.TEXTURE_2D]=et(s.TEXTURE_2D,s.TEXTURE_2D,1),Q[s.TEXTURE_CUBE_MAP]=et(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),Q[s.TEXTURE_2D_ARRAY]=et(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),Q[s.TEXTURE_3D]=et(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),$(s.DEPTH_TEST),a.setFunc(cr),ze(!1),Re(Gh),$(s.CULL_FACE),ft(an);function $(N){h[N]!==!0&&(s.enable(N),h[N]=!0)}function xe(N){h[N]!==!1&&(s.disable(N),h[N]=!1)}function Oe(N,fe){return u[N]!==fe?(s.bindFramebuffer(N,fe),u[N]=fe,N===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=fe),N===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=fe),!0):!1}function we(N,fe){let me=p,Ae=!1;if(N){me=f.get(fe),me===void 0&&(me=[],f.set(fe,me));const ue=N.textures;if(me.length!==ue.length||me[0]!==s.COLOR_ATTACHMENT0){for(let te=0,Ie=ue.length;te<Ie;te++)me[te]=s.COLOR_ATTACHMENT0+te;me.length=ue.length,Ae=!0}}else me[0]!==s.BACK&&(me[0]=s.BACK,Ae=!0);Ae&&s.drawBuffers(me)}function Qe(N){return m!==N?(s.useProgram(N),m=N,!0):!1}const Rt={[ii]:s.FUNC_ADD,[Np]:s.FUNC_SUBTRACT,[Op]:s.FUNC_REVERSE_SUBTRACT};Rt[Up]=s.MIN,Rt[Fp]=s.MAX;const L={[Yr]:s.ZERO,[Bp]:s.ONE,[zp]:s.SRC_COLOR,[sc]:s.SRC_ALPHA,[Gp]:s.SRC_ALPHA_SATURATE,[oc]:s.DST_COLOR,[ac]:s.DST_ALPHA,[kp]:s.ONE_MINUS_SRC_COLOR,[rc]:s.ONE_MINUS_SRC_ALPHA,[Vp]:s.ONE_MINUS_DST_COLOR,[Hp]:s.ONE_MINUS_DST_ALPHA,[Wp]:s.CONSTANT_COLOR,[Xp]:s.ONE_MINUS_CONSTANT_COLOR,[qp]:s.CONSTANT_ALPHA,[Yp]:s.ONE_MINUS_CONSTANT_ALPHA};function ft(N,fe,me,Ae,ue,te,Ie,je,mt,ot){if(N===an){b===!0&&(xe(s.BLEND),b=!1);return}if(b===!1&&($(s.BLEND),b=!0),N!==nf){if(N!==g||ot!==w){if((d!==ii||v!==ii)&&(s.blendEquation(s.FUNC_ADD),d=ii,v=ii),ot)switch(N){case sr:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case ic:s.blendFunc(s.ONE,s.ONE);break;case Wh:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Xh:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}else switch(N){case sr:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case ic:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case Wh:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Xh:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}x=null,_=null,T=null,A=null,C.set(0,0,0),D=0,g=N,w=ot}return}ue=ue||fe,te=te||me,Ie=Ie||Ae,(fe!==d||ue!==v)&&(s.blendEquationSeparate(Rt[fe],Rt[ue]),d=fe,v=ue),(me!==x||Ae!==_||te!==T||Ie!==A)&&(s.blendFuncSeparate(L[me],L[Ae],L[te],L[Ie]),x=me,_=Ae,T=te,A=Ie),(je.equals(C)===!1||mt!==D)&&(s.blendColor(je.r,je.g,je.b,mt),C.copy(je),D=mt),g=N,w=!1}function qe(N,fe){N.side===ni?xe(s.CULL_FACE):$(s.CULL_FACE);let me=N.side===Mn;fe&&(me=!me),ze(me),N.blending===sr&&N.transparent===!1?ft(an):ft(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),r.setMask(N.colorWrite);const Ae=N.stencilWrite;o.setTest(Ae),Ae&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),ve(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?$(s.SAMPLE_ALPHA_TO_COVERAGE):xe(s.SAMPLE_ALPHA_TO_COVERAGE)}function ze(N){S!==N&&(N?s.frontFace(s.CW):s.frontFace(s.CCW),S=N)}function Re(N){N!==Lp?($(s.CULL_FACE),N!==I&&(N===Gh?s.cullFace(s.BACK):N===Dp?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):xe(s.CULL_FACE),I=N}function pt(N){N!==z&&(K&&s.lineWidth(N),z=N)}function ve(N,fe,me){N?($(s.POLYGON_OFFSET_FILL),(O!==fe||G!==me)&&(s.polygonOffset(fe,me),O=fe,G=me)):xe(s.POLYGON_OFFSET_FILL)}function Ye(N){N?$(s.SCISSOR_TEST):xe(s.SCISSOR_TEST)}function gt(N){N===void 0&&(N=s.TEXTURE0+j-1),de!==N&&(s.activeTexture(N),de=N)}function vt(N,fe,me){me===void 0&&(de===null?me=s.TEXTURE0+j-1:me=de);let Ae=se[me];Ae===void 0&&(Ae={type:void 0,texture:void 0},se[me]=Ae),(Ae.type!==N||Ae.texture!==fe)&&(de!==me&&(s.activeTexture(me),de=me),s.bindTexture(N,fe||Q[N]),Ae.type=N,Ae.texture=fe)}function R(){const N=se[de];N!==void 0&&N.type!==void 0&&(s.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function y(){try{s.compressedTexImage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function H(){try{s.compressedTexImage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Z(){try{s.texSubImage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ie(){try{s.texSubImage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Y(){try{s.compressedTexSubImage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Te(){try{s.compressedTexSubImage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function he(){try{s.texStorage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function _e(){try{s.texStorage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ye(){try{s.texImage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function le(){try{s.texImage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function be(N){$e.equals(N)===!1&&(s.scissor(N.x,N.y,N.z,N.w),$e.copy(N))}function ke(N){at.equals(N)===!1&&(s.viewport(N.x,N.y,N.z,N.w),at.copy(N))}function Le(N,fe){let me=l.get(fe);me===void 0&&(me=new WeakMap,l.set(fe,me));let Ae=me.get(N);Ae===void 0&&(Ae=s.getUniformBlockIndex(fe,N.name),me.set(N,Ae))}function pe(N,fe){const Ae=l.get(fe).get(N);c.get(fe)!==Ae&&(s.uniformBlockBinding(fe,Ae,N.__bindingPointIndex),c.set(fe,Ae))}function Ne(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},de=null,se={},u={},f=new WeakMap,p=[],m=null,b=!1,g=null,d=null,x=null,_=null,v=null,T=null,A=null,C=new De(0,0,0),D=0,w=!1,S=null,I=null,z=null,O=null,G=null,$e.set(0,0,s.canvas.width,s.canvas.height),at.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:$,disable:xe,bindFramebuffer:Oe,drawBuffers:we,useProgram:Qe,setBlending:ft,setMaterial:qe,setFlipSided:ze,setCullFace:Re,setLineWidth:pt,setPolygonOffset:ve,setScissorTest:Ye,activeTexture:gt,bindTexture:vt,unbindTexture:R,compressedTexImage2D:y,compressedTexImage3D:H,texImage2D:ye,texImage3D:le,updateUBOMapping:Le,uniformBlockBinding:pe,texStorage2D:he,texStorage3D:_e,texSubImage2D:Z,texSubImage3D:ie,compressedTexSubImage2D:Y,compressedTexSubImage3D:Te,scissor:be,viewport:ke,reset:Ne}}function my(s,e,t,n,i,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new We,h=new WeakMap;let u;const f=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(R,y){return p?new OffscreenCanvas(R,y):aa("canvas")}function b(R,y,H){let Z=1;const ie=vt(R);if((ie.width>H||ie.height>H)&&(Z=H/Math.max(ie.width,ie.height)),Z<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const Y=Math.floor(Z*ie.width),Te=Math.floor(Z*ie.height);u===void 0&&(u=m(Y,Te));const he=y?m(Y,Te):u;return he.width=Y,he.height=Te,he.getContext("2d").drawImage(R,0,0,Y,Te),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ie.width+"x"+ie.height+") to ("+Y+"x"+Te+")."),he}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ie.width+"x"+ie.height+")."),R;return R}function g(R){return R.generateMipmaps}function d(R){s.generateMipmap(R)}function x(R){return R.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?s.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function _(R,y,H,Z,ie=!1){if(R!==null){if(s[R]!==void 0)return s[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let Y=y;if(y===s.RED&&(H===s.FLOAT&&(Y=s.R32F),H===s.HALF_FLOAT&&(Y=s.R16F),H===s.UNSIGNED_BYTE&&(Y=s.R8)),y===s.RED_INTEGER&&(H===s.UNSIGNED_BYTE&&(Y=s.R8UI),H===s.UNSIGNED_SHORT&&(Y=s.R16UI),H===s.UNSIGNED_INT&&(Y=s.R32UI),H===s.BYTE&&(Y=s.R8I),H===s.SHORT&&(Y=s.R16I),H===s.INT&&(Y=s.R32I)),y===s.RG&&(H===s.FLOAT&&(Y=s.RG32F),H===s.HALF_FLOAT&&(Y=s.RG16F),H===s.UNSIGNED_BYTE&&(Y=s.RG8)),y===s.RG_INTEGER&&(H===s.UNSIGNED_BYTE&&(Y=s.RG8UI),H===s.UNSIGNED_SHORT&&(Y=s.RG16UI),H===s.UNSIGNED_INT&&(Y=s.RG32UI),H===s.BYTE&&(Y=s.RG8I),H===s.SHORT&&(Y=s.RG16I),H===s.INT&&(Y=s.RG32I)),y===s.RGB_INTEGER&&(H===s.UNSIGNED_BYTE&&(Y=s.RGB8UI),H===s.UNSIGNED_SHORT&&(Y=s.RGB16UI),H===s.UNSIGNED_INT&&(Y=s.RGB32UI),H===s.BYTE&&(Y=s.RGB8I),H===s.SHORT&&(Y=s.RGB16I),H===s.INT&&(Y=s.RGB32I)),y===s.RGBA_INTEGER&&(H===s.UNSIGNED_BYTE&&(Y=s.RGBA8UI),H===s.UNSIGNED_SHORT&&(Y=s.RGBA16UI),H===s.UNSIGNED_INT&&(Y=s.RGBA32UI),H===s.BYTE&&(Y=s.RGBA8I),H===s.SHORT&&(Y=s.RGBA16I),H===s.INT&&(Y=s.RGBA32I)),y===s.RGB&&(H===s.UNSIGNED_INT_5_9_9_9_REV&&(Y=s.RGB9_E5),H===s.UNSIGNED_INT_10F_11F_11F_REV&&(Y=s.R11F_G11F_B10F)),y===s.RGBA){const Te=ie?To:dt.getTransfer(Z);H===s.FLOAT&&(Y=s.RGBA32F),H===s.HALF_FLOAT&&(Y=s.RGBA16F),H===s.UNSIGNED_BYTE&&(Y=Te===Tt?s.SRGB8_ALPHA8:s.RGBA8),H===s.UNSIGNED_SHORT_4_4_4_4&&(Y=s.RGBA4),H===s.UNSIGNED_SHORT_5_5_5_1&&(Y=s.RGB5_A1)}return(Y===s.R16F||Y===s.R32F||Y===s.RG16F||Y===s.RG32F||Y===s.RGBA16F||Y===s.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function v(R,y){let H;return R?y===null||y===Es||y===dr?H=s.DEPTH24_STENCIL8:y===ai?H=s.DEPTH32F_STENCIL8:y===na&&(H=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===Es||y===dr?H=s.DEPTH_COMPONENT24:y===ai?H=s.DEPTH_COMPONENT32F:y===na&&(H=s.DEPTH_COMPONENT16),H}function T(R,y){return g(R)===!0||R.isFramebufferTexture&&R.minFilter!==Zt&&R.minFilter!==Cn?Math.log2(Math.max(y.width,y.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?y.mipmaps.length:1}function A(R){const y=R.target;y.removeEventListener("dispose",A),D(y),y.isVideoTexture&&h.delete(y)}function C(R){const y=R.target;y.removeEventListener("dispose",C),S(y)}function D(R){const y=n.get(R);if(y.__webglInit===void 0)return;const H=R.source,Z=f.get(H);if(Z){const ie=Z[y.__cacheKey];ie.usedTimes--,ie.usedTimes===0&&w(R),Object.keys(Z).length===0&&f.delete(H)}n.remove(R)}function w(R){const y=n.get(R);s.deleteTexture(y.__webglTexture);const H=R.source,Z=f.get(H);delete Z[y.__cacheKey],a.memory.textures--}function S(R){const y=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(y.__webglFramebuffer[Z]))for(let ie=0;ie<y.__webglFramebuffer[Z].length;ie++)s.deleteFramebuffer(y.__webglFramebuffer[Z][ie]);else s.deleteFramebuffer(y.__webglFramebuffer[Z]);y.__webglDepthbuffer&&s.deleteRenderbuffer(y.__webglDepthbuffer[Z])}else{if(Array.isArray(y.__webglFramebuffer))for(let Z=0;Z<y.__webglFramebuffer.length;Z++)s.deleteFramebuffer(y.__webglFramebuffer[Z]);else s.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&s.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&s.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let Z=0;Z<y.__webglColorRenderbuffer.length;Z++)y.__webglColorRenderbuffer[Z]&&s.deleteRenderbuffer(y.__webglColorRenderbuffer[Z]);y.__webglDepthRenderbuffer&&s.deleteRenderbuffer(y.__webglDepthRenderbuffer)}const H=R.textures;for(let Z=0,ie=H.length;Z<ie;Z++){const Y=n.get(H[Z]);Y.__webglTexture&&(s.deleteTexture(Y.__webglTexture),a.memory.textures--),n.remove(H[Z])}n.remove(R)}let I=0;function z(){I=0}function O(){const R=I;return R>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+i.maxTextures),I+=1,R}function G(R){const y=[];return y.push(R.wrapS),y.push(R.wrapT),y.push(R.wrapR||0),y.push(R.magFilter),y.push(R.minFilter),y.push(R.anisotropy),y.push(R.internalFormat),y.push(R.format),y.push(R.type),y.push(R.generateMipmaps),y.push(R.premultiplyAlpha),y.push(R.flipY),y.push(R.unpackAlignment),y.push(R.colorSpace),y.join()}function j(R,y){const H=n.get(R);if(R.isVideoTexture&&Ye(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&H.__version!==R.version){const Z=R.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Q(H,R,y);return}}else R.isExternalTexture&&(H.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,H.__webglTexture,s.TEXTURE0+y)}function K(R,y){const H=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&H.__version!==R.version){Q(H,R,y);return}t.bindTexture(s.TEXTURE_2D_ARRAY,H.__webglTexture,s.TEXTURE0+y)}function ee(R,y){const H=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&H.__version!==R.version){Q(H,R,y);return}t.bindTexture(s.TEXTURE_3D,H.__webglTexture,s.TEXTURE0+y)}function X(R,y){const H=n.get(R);if(R.version>0&&H.__version!==R.version){$(H,R,y);return}t.bindTexture(s.TEXTURE_CUBE_MAP,H.__webglTexture,s.TEXTURE0+y)}const de={[Yn]:s.REPEAT,[$i]:s.CLAMP_TO_EDGE,[So]:s.MIRRORED_REPEAT},se={[Zt]:s.NEAREST,[df]:s.NEAREST_MIPMAP_NEAREST,[jr]:s.NEAREST_MIPMAP_LINEAR,[Cn]:s.LINEAR,[fo]:s.LINEAR_MIPMAP_NEAREST,[Ni]:s.LINEAR_MIPMAP_LINEAR},ge={[sm]:s.NEVER,[hm]:s.ALWAYS,[rm]:s.LESS,[Mf]:s.LEQUAL,[am]:s.EQUAL,[cm]:s.GEQUAL,[om]:s.GREATER,[lm]:s.NOTEQUAL};function Ee(R,y){if(y.type===ai&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===Cn||y.magFilter===fo||y.magFilter===jr||y.magFilter===Ni||y.minFilter===Cn||y.minFilter===fo||y.minFilter===jr||y.minFilter===Ni)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(R,s.TEXTURE_WRAP_S,de[y.wrapS]),s.texParameteri(R,s.TEXTURE_WRAP_T,de[y.wrapT]),(R===s.TEXTURE_3D||R===s.TEXTURE_2D_ARRAY)&&s.texParameteri(R,s.TEXTURE_WRAP_R,de[y.wrapR]),s.texParameteri(R,s.TEXTURE_MAG_FILTER,se[y.magFilter]),s.texParameteri(R,s.TEXTURE_MIN_FILTER,se[y.minFilter]),y.compareFunction&&(s.texParameteri(R,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(R,s.TEXTURE_COMPARE_FUNC,ge[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Zt||y.minFilter!==jr&&y.minFilter!==Ni||y.type===ai&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){const H=e.get("EXT_texture_filter_anisotropic");s.texParameterf(R,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,i.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function $e(R,y){let H=!1;R.__webglInit===void 0&&(R.__webglInit=!0,y.addEventListener("dispose",A));const Z=y.source;let ie=f.get(Z);ie===void 0&&(ie={},f.set(Z,ie));const Y=G(y);if(Y!==R.__cacheKey){ie[Y]===void 0&&(ie[Y]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,H=!0),ie[Y].usedTimes++;const Te=ie[R.__cacheKey];Te!==void 0&&(ie[R.__cacheKey].usedTimes--,Te.usedTimes===0&&w(y)),R.__cacheKey=Y,R.__webglTexture=ie[Y].texture}return H}function at(R,y,H){return Math.floor(Math.floor(R/H)/y)}function et(R,y,H,Z){const Y=R.updateRanges;if(Y.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,y.width,y.height,H,Z,y.data);else{Y.sort((le,be)=>le.start-be.start);let Te=0;for(let le=1;le<Y.length;le++){const be=Y[Te],ke=Y[le],Le=be.start+be.count,pe=at(ke.start,y.width,4),Ne=at(be.start,y.width,4);ke.start<=Le+1&&pe===Ne&&at(ke.start+ke.count-1,y.width,4)===pe?be.count=Math.max(be.count,ke.start+ke.count-be.start):(++Te,Y[Te]=ke)}Y.length=Te+1;const he=s.getParameter(s.UNPACK_ROW_LENGTH),_e=s.getParameter(s.UNPACK_SKIP_PIXELS),ye=s.getParameter(s.UNPACK_SKIP_ROWS);s.pixelStorei(s.UNPACK_ROW_LENGTH,y.width);for(let le=0,be=Y.length;le<be;le++){const ke=Y[le],Le=Math.floor(ke.start/4),pe=Math.ceil(ke.count/4),Ne=Le%y.width,N=Math.floor(Le/y.width),fe=pe,me=1;s.pixelStorei(s.UNPACK_SKIP_PIXELS,Ne),s.pixelStorei(s.UNPACK_SKIP_ROWS,N),t.texSubImage2D(s.TEXTURE_2D,0,Ne,N,fe,me,H,Z,y.data)}R.clearUpdateRanges(),s.pixelStorei(s.UNPACK_ROW_LENGTH,he),s.pixelStorei(s.UNPACK_SKIP_PIXELS,_e),s.pixelStorei(s.UNPACK_SKIP_ROWS,ye)}}function Q(R,y,H){let Z=s.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(Z=s.TEXTURE_2D_ARRAY),y.isData3DTexture&&(Z=s.TEXTURE_3D);const ie=$e(R,y),Y=y.source;t.bindTexture(Z,R.__webglTexture,s.TEXTURE0+H);const Te=n.get(Y);if(Y.version!==Te.__version||ie===!0){t.activeTexture(s.TEXTURE0+H);const he=dt.getPrimaries(dt.workingColorSpace),_e=y.colorSpace===Zi?null:dt.getPrimaries(y.colorSpace),ye=y.colorSpace===Zi||he===_e?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,y.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,y.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);let le=b(y.image,!1,i.maxTextureSize);le=gt(y,le);const be=r.convert(y.format,y.colorSpace),ke=r.convert(y.type);let Le=_(y.internalFormat,be,ke,y.colorSpace,y.isVideoTexture);Ee(Z,y);let pe;const Ne=y.mipmaps,N=y.isVideoTexture!==!0,fe=Te.__version===void 0||ie===!0,me=Y.dataReady,Ae=T(y,le);if(y.isDepthTexture)Le=v(y.format===fr,y.type),fe&&(N?t.texStorage2D(s.TEXTURE_2D,1,Le,le.width,le.height):t.texImage2D(s.TEXTURE_2D,0,Le,le.width,le.height,0,be,ke,null));else if(y.isDataTexture)if(Ne.length>0){N&&fe&&t.texStorage2D(s.TEXTURE_2D,Ae,Le,Ne[0].width,Ne[0].height);for(let ue=0,te=Ne.length;ue<te;ue++)pe=Ne[ue],N?me&&t.texSubImage2D(s.TEXTURE_2D,ue,0,0,pe.width,pe.height,be,ke,pe.data):t.texImage2D(s.TEXTURE_2D,ue,Le,pe.width,pe.height,0,be,ke,pe.data);y.generateMipmaps=!1}else N?(fe&&t.texStorage2D(s.TEXTURE_2D,Ae,Le,le.width,le.height),me&&et(y,le,be,ke)):t.texImage2D(s.TEXTURE_2D,0,Le,le.width,le.height,0,be,ke,le.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){N&&fe&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Ae,Le,Ne[0].width,Ne[0].height,le.depth);for(let ue=0,te=Ne.length;ue<te;ue++)if(pe=Ne[ue],y.format!==zn)if(be!==null)if(N){if(me)if(y.layerUpdates.size>0){const Ie=Du(pe.width,pe.height,y.format,y.type);for(const je of y.layerUpdates){const mt=pe.data.subarray(je*Ie/pe.data.BYTES_PER_ELEMENT,(je+1)*Ie/pe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ue,0,0,je,pe.width,pe.height,1,be,mt)}y.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ue,0,0,0,pe.width,pe.height,le.depth,be,pe.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,ue,Le,pe.width,pe.height,le.depth,0,pe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else N?me&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,ue,0,0,0,pe.width,pe.height,le.depth,be,ke,pe.data):t.texImage3D(s.TEXTURE_2D_ARRAY,ue,Le,pe.width,pe.height,le.depth,0,be,ke,pe.data)}else{N&&fe&&t.texStorage2D(s.TEXTURE_2D,Ae,Le,Ne[0].width,Ne[0].height);for(let ue=0,te=Ne.length;ue<te;ue++)pe=Ne[ue],y.format!==zn?be!==null?N?me&&t.compressedTexSubImage2D(s.TEXTURE_2D,ue,0,0,pe.width,pe.height,be,pe.data):t.compressedTexImage2D(s.TEXTURE_2D,ue,Le,pe.width,pe.height,0,pe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):N?me&&t.texSubImage2D(s.TEXTURE_2D,ue,0,0,pe.width,pe.height,be,ke,pe.data):t.texImage2D(s.TEXTURE_2D,ue,Le,pe.width,pe.height,0,be,ke,pe.data)}else if(y.isDataArrayTexture)if(N){if(fe&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Ae,Le,le.width,le.height,le.depth),me)if(y.layerUpdates.size>0){const ue=Du(le.width,le.height,y.format,y.type);for(const te of y.layerUpdates){const Ie=le.data.subarray(te*ue/le.data.BYTES_PER_ELEMENT,(te+1)*ue/le.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,te,le.width,le.height,1,be,ke,Ie)}y.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,le.width,le.height,le.depth,be,ke,le.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,Le,le.width,le.height,le.depth,0,be,ke,le.data);else if(y.isData3DTexture)N?(fe&&t.texStorage3D(s.TEXTURE_3D,Ae,Le,le.width,le.height,le.depth),me&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,le.width,le.height,le.depth,be,ke,le.data)):t.texImage3D(s.TEXTURE_3D,0,Le,le.width,le.height,le.depth,0,be,ke,le.data);else if(y.isFramebufferTexture){if(fe)if(N)t.texStorage2D(s.TEXTURE_2D,Ae,Le,le.width,le.height);else{let ue=le.width,te=le.height;for(let Ie=0;Ie<Ae;Ie++)t.texImage2D(s.TEXTURE_2D,Ie,Le,ue,te,0,be,ke,null),ue>>=1,te>>=1}}else if(Ne.length>0){if(N&&fe){const ue=vt(Ne[0]);t.texStorage2D(s.TEXTURE_2D,Ae,Le,ue.width,ue.height)}for(let ue=0,te=Ne.length;ue<te;ue++)pe=Ne[ue],N?me&&t.texSubImage2D(s.TEXTURE_2D,ue,0,0,be,ke,pe):t.texImage2D(s.TEXTURE_2D,ue,Le,be,ke,pe);y.generateMipmaps=!1}else if(N){if(fe){const ue=vt(le);t.texStorage2D(s.TEXTURE_2D,Ae,Le,ue.width,ue.height)}me&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,be,ke,le)}else t.texImage2D(s.TEXTURE_2D,0,Le,be,ke,le);g(y)&&d(Z),Te.__version=Y.version,y.onUpdate&&y.onUpdate(y)}R.__version=y.version}function $(R,y,H){if(y.image.length!==6)return;const Z=$e(R,y),ie=y.source;t.bindTexture(s.TEXTURE_CUBE_MAP,R.__webglTexture,s.TEXTURE0+H);const Y=n.get(ie);if(ie.version!==Y.__version||Z===!0){t.activeTexture(s.TEXTURE0+H);const Te=dt.getPrimaries(dt.workingColorSpace),he=y.colorSpace===Zi?null:dt.getPrimaries(y.colorSpace),_e=y.colorSpace===Zi||Te===he?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,y.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,y.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,_e);const ye=y.isCompressedTexture||y.image[0].isCompressedTexture,le=y.image[0]&&y.image[0].isDataTexture,be=[];for(let te=0;te<6;te++)!ye&&!le?be[te]=b(y.image[te],!0,i.maxCubemapSize):be[te]=le?y.image[te].image:y.image[te],be[te]=gt(y,be[te]);const ke=be[0],Le=r.convert(y.format,y.colorSpace),pe=r.convert(y.type),Ne=_(y.internalFormat,Le,pe,y.colorSpace),N=y.isVideoTexture!==!0,fe=Y.__version===void 0||Z===!0,me=ie.dataReady;let Ae=T(y,ke);Ee(s.TEXTURE_CUBE_MAP,y);let ue;if(ye){N&&fe&&t.texStorage2D(s.TEXTURE_CUBE_MAP,Ae,Ne,ke.width,ke.height);for(let te=0;te<6;te++){ue=be[te].mipmaps;for(let Ie=0;Ie<ue.length;Ie++){const je=ue[Ie];y.format!==zn?Le!==null?N?me&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ie,0,0,je.width,je.height,Le,je.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ie,Ne,je.width,je.height,0,je.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):N?me&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ie,0,0,je.width,je.height,Le,pe,je.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ie,Ne,je.width,je.height,0,Le,pe,je.data)}}}else{if(ue=y.mipmaps,N&&fe){ue.length>0&&Ae++;const te=vt(be[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,Ae,Ne,te.width,te.height)}for(let te=0;te<6;te++)if(le){N?me&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,0,0,be[te].width,be[te].height,Le,pe,be[te].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,Ne,be[te].width,be[te].height,0,Le,pe,be[te].data);for(let Ie=0;Ie<ue.length;Ie++){const mt=ue[Ie].image[te].image;N?me&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ie+1,0,0,mt.width,mt.height,Le,pe,mt.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ie+1,Ne,mt.width,mt.height,0,Le,pe,mt.data)}}else{N?me&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,0,0,Le,pe,be[te]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,Ne,Le,pe,be[te]);for(let Ie=0;Ie<ue.length;Ie++){const je=ue[Ie];N?me&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ie+1,0,0,Le,pe,je.image[te]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+te,Ie+1,Ne,Le,pe,je.image[te])}}}g(y)&&d(s.TEXTURE_CUBE_MAP),Y.__version=ie.version,y.onUpdate&&y.onUpdate(y)}R.__version=y.version}function xe(R,y,H,Z,ie,Y){const Te=r.convert(H.format,H.colorSpace),he=r.convert(H.type),_e=_(H.internalFormat,Te,he,H.colorSpace),ye=n.get(y),le=n.get(H);if(le.__renderTarget=y,!ye.__hasExternalTextures){const be=Math.max(1,y.width>>Y),ke=Math.max(1,y.height>>Y);ie===s.TEXTURE_3D||ie===s.TEXTURE_2D_ARRAY?t.texImage3D(ie,Y,_e,be,ke,y.depth,0,Te,he,null):t.texImage2D(ie,Y,_e,be,ke,0,Te,he,null)}t.bindFramebuffer(s.FRAMEBUFFER,R),ve(y)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Z,ie,le.__webglTexture,0,pt(y)):(ie===s.TEXTURE_2D||ie>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&ie<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,Z,ie,le.__webglTexture,Y),t.bindFramebuffer(s.FRAMEBUFFER,null)}function Oe(R,y,H){if(s.bindRenderbuffer(s.RENDERBUFFER,R),y.depthBuffer){const Z=y.depthTexture,ie=Z&&Z.isDepthTexture?Z.type:null,Y=v(y.stencilBuffer,ie),Te=y.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,he=pt(y);ve(y)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,he,Y,y.width,y.height):H?s.renderbufferStorageMultisample(s.RENDERBUFFER,he,Y,y.width,y.height):s.renderbufferStorage(s.RENDERBUFFER,Y,y.width,y.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Te,s.RENDERBUFFER,R)}else{const Z=y.textures;for(let ie=0;ie<Z.length;ie++){const Y=Z[ie],Te=r.convert(Y.format,Y.colorSpace),he=r.convert(Y.type),_e=_(Y.internalFormat,Te,he,Y.colorSpace),ye=pt(y);H&&ve(y)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,ye,_e,y.width,y.height):ve(y)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ye,_e,y.width,y.height):s.renderbufferStorage(s.RENDERBUFFER,_e,y.width,y.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function we(R,y){if(y&&y.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,R),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Z=n.get(y.depthTexture);Z.__renderTarget=y,(!Z.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),j(y.depthTexture,0);const ie=Z.__webglTexture,Y=pt(y);if(y.depthTexture.format===ia)ve(y)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,ie,0,Y):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,ie,0);else if(y.depthTexture.format===fr)ve(y)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,ie,0,Y):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,ie,0);else throw new Error("Unknown depthTexture format")}function Qe(R){const y=n.get(R),H=R.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==R.depthTexture){const Z=R.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),Z){const ie=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,Z.removeEventListener("dispose",ie)};Z.addEventListener("dispose",ie),y.__depthDisposeCallback=ie}y.__boundDepthTexture=Z}if(R.depthTexture&&!y.__autoAllocateDepthBuffer){if(H)throw new Error("target.depthTexture not supported in Cube render targets");const Z=R.texture.mipmaps;Z&&Z.length>0?we(y.__webglFramebuffer[0],R):we(y.__webglFramebuffer,R)}else if(H){y.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(t.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer[Z]),y.__webglDepthbuffer[Z]===void 0)y.__webglDepthbuffer[Z]=s.createRenderbuffer(),Oe(y.__webglDepthbuffer[Z],R,!1);else{const ie=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Y=y.__webglDepthbuffer[Z];s.bindRenderbuffer(s.RENDERBUFFER,Y),s.framebufferRenderbuffer(s.FRAMEBUFFER,ie,s.RENDERBUFFER,Y)}}else{const Z=R.texture.mipmaps;if(Z&&Z.length>0?t.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=s.createRenderbuffer(),Oe(y.__webglDepthbuffer,R,!1);else{const ie=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Y=y.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,Y),s.framebufferRenderbuffer(s.FRAMEBUFFER,ie,s.RENDERBUFFER,Y)}}t.bindFramebuffer(s.FRAMEBUFFER,null)}function Rt(R,y,H){const Z=n.get(R);y!==void 0&&xe(Z.__webglFramebuffer,R,R.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),H!==void 0&&Qe(R)}function L(R){const y=R.texture,H=n.get(R),Z=n.get(y);R.addEventListener("dispose",C);const ie=R.textures,Y=R.isWebGLCubeRenderTarget===!0,Te=ie.length>1;if(Te||(Z.__webglTexture===void 0&&(Z.__webglTexture=s.createTexture()),Z.__version=y.version,a.memory.textures++),Y){H.__webglFramebuffer=[];for(let he=0;he<6;he++)if(y.mipmaps&&y.mipmaps.length>0){H.__webglFramebuffer[he]=[];for(let _e=0;_e<y.mipmaps.length;_e++)H.__webglFramebuffer[he][_e]=s.createFramebuffer()}else H.__webglFramebuffer[he]=s.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){H.__webglFramebuffer=[];for(let he=0;he<y.mipmaps.length;he++)H.__webglFramebuffer[he]=s.createFramebuffer()}else H.__webglFramebuffer=s.createFramebuffer();if(Te)for(let he=0,_e=ie.length;he<_e;he++){const ye=n.get(ie[he]);ye.__webglTexture===void 0&&(ye.__webglTexture=s.createTexture(),a.memory.textures++)}if(R.samples>0&&ve(R)===!1){H.__webglMultisampledFramebuffer=s.createFramebuffer(),H.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let he=0;he<ie.length;he++){const _e=ie[he];H.__webglColorRenderbuffer[he]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,H.__webglColorRenderbuffer[he]);const ye=r.convert(_e.format,_e.colorSpace),le=r.convert(_e.type),be=_(_e.internalFormat,ye,le,_e.colorSpace,R.isXRRenderTarget===!0),ke=pt(R);s.renderbufferStorageMultisample(s.RENDERBUFFER,ke,be,R.width,R.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+he,s.RENDERBUFFER,H.__webglColorRenderbuffer[he])}s.bindRenderbuffer(s.RENDERBUFFER,null),R.depthBuffer&&(H.__webglDepthRenderbuffer=s.createRenderbuffer(),Oe(H.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(Y){t.bindTexture(s.TEXTURE_CUBE_MAP,Z.__webglTexture),Ee(s.TEXTURE_CUBE_MAP,y);for(let he=0;he<6;he++)if(y.mipmaps&&y.mipmaps.length>0)for(let _e=0;_e<y.mipmaps.length;_e++)xe(H.__webglFramebuffer[he][_e],R,y,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+he,_e);else xe(H.__webglFramebuffer[he],R,y,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+he,0);g(y)&&d(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Te){for(let he=0,_e=ie.length;he<_e;he++){const ye=ie[he],le=n.get(ye);let be=s.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(be=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(be,le.__webglTexture),Ee(be,ye),xe(H.__webglFramebuffer,R,ye,s.COLOR_ATTACHMENT0+he,be,0),g(ye)&&d(be)}t.unbindTexture()}else{let he=s.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(he=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(he,Z.__webglTexture),Ee(he,y),y.mipmaps&&y.mipmaps.length>0)for(let _e=0;_e<y.mipmaps.length;_e++)xe(H.__webglFramebuffer[_e],R,y,s.COLOR_ATTACHMENT0,he,_e);else xe(H.__webglFramebuffer,R,y,s.COLOR_ATTACHMENT0,he,0);g(y)&&d(he),t.unbindTexture()}R.depthBuffer&&Qe(R)}function ft(R){const y=R.textures;for(let H=0,Z=y.length;H<Z;H++){const ie=y[H];if(g(ie)){const Y=x(R),Te=n.get(ie).__webglTexture;t.bindTexture(Y,Te),d(Y),t.unbindTexture()}}}const qe=[],ze=[];function Re(R){if(R.samples>0){if(ve(R)===!1){const y=R.textures,H=R.width,Z=R.height;let ie=s.COLOR_BUFFER_BIT;const Y=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Te=n.get(R),he=y.length>1;if(he)for(let ye=0;ye<y.length;ye++)t.bindFramebuffer(s.FRAMEBUFFER,Te.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ye,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,Te.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ye,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,Te.__webglMultisampledFramebuffer);const _e=R.texture.mipmaps;_e&&_e.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Te.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Te.__webglFramebuffer);for(let ye=0;ye<y.length;ye++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(ie|=s.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(ie|=s.STENCIL_BUFFER_BIT)),he){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Te.__webglColorRenderbuffer[ye]);const le=n.get(y[ye]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,le,0)}s.blitFramebuffer(0,0,H,Z,0,0,H,Z,ie,s.NEAREST),c===!0&&(qe.length=0,ze.length=0,qe.push(s.COLOR_ATTACHMENT0+ye),R.depthBuffer&&R.resolveDepthBuffer===!1&&(qe.push(Y),ze.push(Y),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,ze)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,qe))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),he)for(let ye=0;ye<y.length;ye++){t.bindFramebuffer(s.FRAMEBUFFER,Te.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ye,s.RENDERBUFFER,Te.__webglColorRenderbuffer[ye]);const le=n.get(y[ye]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,Te.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ye,s.TEXTURE_2D,le,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Te.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&c){const y=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[y])}}}function pt(R){return Math.min(i.maxSamples,R.samples)}function ve(R){const y=n.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function Ye(R){const y=a.render.frame;h.get(R)!==y&&(h.set(R,y),R.update())}function gt(R,y){const H=R.colorSpace,Z=R.format,ie=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||H!==mn&&H!==Zi&&(dt.getTransfer(H)===Tt?(Z!==zn||ie!==hi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",H)),y}function vt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(l.width=R.naturalWidth||R.width,l.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(l.width=R.displayWidth,l.height=R.displayHeight):(l.width=R.width,l.height=R.height),l}this.allocateTextureUnit=O,this.resetTextureUnits=z,this.setTexture2D=j,this.setTexture2DArray=K,this.setTexture3D=ee,this.setTextureCube=X,this.rebindTextures=Rt,this.setupRenderTarget=L,this.updateRenderTargetMipmap=ft,this.updateMultisampleRenderTarget=Re,this.setupDepthRenderbuffer=Qe,this.setupFrameBufferTexture=xe,this.useMultisampledRTT=ve}function gy(s,e){function t(n,i=Zi){let r;const a=dt.getTransfer(i);if(n===hi)return s.UNSIGNED_BYTE;if(n===xh)return s.UNSIGNED_SHORT_4_4_4_4;if(n===vh)return s.UNSIGNED_SHORT_5_5_5_1;if(n===mf)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===gf)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===ff)return s.BYTE;if(n===pf)return s.SHORT;if(n===na)return s.UNSIGNED_SHORT;if(n===bh)return s.INT;if(n===Es)return s.UNSIGNED_INT;if(n===ai)return s.FLOAT;if(n===In)return s.HALF_FLOAT;if(n===bf)return s.ALPHA;if(n===xf)return s.RGB;if(n===zn)return s.RGBA;if(n===ia)return s.DEPTH_COMPONENT;if(n===fr)return s.DEPTH_STENCIL;if(n===yh)return s.RED;if(n===_h)return s.RED_INTEGER;if(n===vf)return s.RG;if(n===Mh)return s.RG_INTEGER;if(n===Sh)return s.RGBA_INTEGER;if(n===po||n===mo||n===go||n===bo)if(a===Tt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===po)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===mo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===go)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===bo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===po)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===mo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===go)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===bo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===bc||n===xc||n===vc||n===yc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===bc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===xc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===vc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===yc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===_c||n===Mc||n===Sc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===_c||n===Mc)return a===Tt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Sc)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===wc||n===Tc||n===Ec||n===Ac||n===Rc||n===Cc||n===Pc||n===Ic||n===Lc||n===Dc||n===Nc||n===Oc||n===Uc||n===Fc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===wc)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Tc)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ec)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ac)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Rc)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Cc)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Pc)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ic)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Lc)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Dc)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Nc)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Oc)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Uc)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Fc)return a===Tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Bc||n===zc||n===kc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Bc)return a===Tt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===zc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===kc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Hc||n===Vc||n===Gc||n===Wc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Hc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Vc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Gc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Wc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===dr?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}const by=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,xy=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class vy{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Nf(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Ft({vertexShader:by,fragmentShader:xy,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Kt(new Mr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class yy extends Is{constructor(e,t){super();const n=this;let i=null,r=1,a=null,o="local-floor",c=1,l=null,h=null,u=null,f=null,p=null,m=null;const b=typeof XRWebGLBinding<"u",g=new vy,d={},x=t.getContextAttributes();let _=null,v=null;const T=[],A=[],C=new We;let D=null;const w=new qt;w.viewport=new xt;const S=new qt;S.viewport=new xt;const I=[w,S],z=new Cg;let O=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Q){let $=T[Q];return $===void 0&&($=new xl,T[Q]=$),$.getTargetRaySpace()},this.getControllerGrip=function(Q){let $=T[Q];return $===void 0&&($=new xl,T[Q]=$),$.getGripSpace()},this.getHand=function(Q){let $=T[Q];return $===void 0&&($=new xl,T[Q]=$),$.getHandSpace()};function j(Q){const $=A.indexOf(Q.inputSource);if($===-1)return;const xe=T[$];xe!==void 0&&(xe.update(Q.inputSource,Q.frame,l||a),xe.dispatchEvent({type:Q.type,data:Q.inputSource}))}function K(){i.removeEventListener("select",j),i.removeEventListener("selectstart",j),i.removeEventListener("selectend",j),i.removeEventListener("squeeze",j),i.removeEventListener("squeezestart",j),i.removeEventListener("squeezeend",j),i.removeEventListener("end",K),i.removeEventListener("inputsourceschange",ee);for(let Q=0;Q<T.length;Q++){const $=A[Q];$!==null&&(A[Q]=null,T[Q].disconnect($))}O=null,G=null,g.reset();for(const Q in d)delete d[Q];e.setRenderTarget(_),p=null,f=null,u=null,i=null,v=null,et.stop(),n.isPresenting=!1,e.setPixelRatio(D),e.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Q){r=Q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Q){o=Q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(Q){l=Q},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return u===null&&b&&(u=new XRWebGLBinding(i,t)),u},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(Q){if(i=Q,i!==null){if(_=e.getRenderTarget(),i.addEventListener("select",j),i.addEventListener("selectstart",j),i.addEventListener("selectend",j),i.addEventListener("squeeze",j),i.addEventListener("squeezestart",j),i.addEventListener("squeezeend",j),i.addEventListener("end",K),i.addEventListener("inputsourceschange",ee),x.xrCompatible!==!0&&await t.makeXRCompatible(),D=e.getPixelRatio(),e.getSize(C),b&&"createProjectionLayer"in XRWebGLBinding.prototype){let xe=null,Oe=null,we=null;x.depth&&(we=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,xe=x.stencil?fr:ia,Oe=x.stencil?dr:Es);const Qe={colorFormat:t.RGBA8,depthFormat:we,scaleFactor:r};u=this.getBinding(),f=u.createProjectionLayer(Qe),i.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),v=new pn(f.textureWidth,f.textureHeight,{format:zn,type:hi,depthTexture:new Lh(f.textureWidth,f.textureHeight,Oe,void 0,void 0,void 0,void 0,void 0,void 0,xe),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{const xe={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(i,t,xe),i.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),v=new pn(p.framebufferWidth,p.framebufferHeight,{format:zn,type:hi,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await i.requestReferenceSpace(o),et.setContext(i),et.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function ee(Q){for(let $=0;$<Q.removed.length;$++){const xe=Q.removed[$],Oe=A.indexOf(xe);Oe>=0&&(A[Oe]=null,T[Oe].disconnect(xe))}for(let $=0;$<Q.added.length;$++){const xe=Q.added[$];let Oe=A.indexOf(xe);if(Oe===-1){for(let Qe=0;Qe<T.length;Qe++)if(Qe>=A.length){A.push(xe),Oe=Qe;break}else if(A[Qe]===null){A[Qe]=xe,Oe=Qe;break}if(Oe===-1)break}const we=T[Oe];we&&we.connect(xe)}}const X=new P,de=new P;function se(Q,$,xe){X.setFromMatrixPosition($.matrixWorld),de.setFromMatrixPosition(xe.matrixWorld);const Oe=X.distanceTo(de),we=$.projectionMatrix.elements,Qe=xe.projectionMatrix.elements,Rt=we[14]/(we[10]-1),L=we[14]/(we[10]+1),ft=(we[9]+1)/we[5],qe=(we[9]-1)/we[5],ze=(we[8]-1)/we[0],Re=(Qe[8]+1)/Qe[0],pt=Rt*ze,ve=Rt*Re,Ye=Oe/(-ze+Re),gt=Ye*-ze;if($.matrixWorld.decompose(Q.position,Q.quaternion,Q.scale),Q.translateX(gt),Q.translateZ(Ye),Q.matrixWorld.compose(Q.position,Q.quaternion,Q.scale),Q.matrixWorldInverse.copy(Q.matrixWorld).invert(),we[10]===-1)Q.projectionMatrix.copy($.projectionMatrix),Q.projectionMatrixInverse.copy($.projectionMatrixInverse);else{const vt=Rt+Ye,R=L+Ye,y=pt-gt,H=ve+(Oe-gt),Z=ft*L/R*vt,ie=qe*L/R*vt;Q.projectionMatrix.makePerspective(y,H,Z,ie,vt,R),Q.projectionMatrixInverse.copy(Q.projectionMatrix).invert()}}function ge(Q,$){$===null?Q.matrixWorld.copy(Q.matrix):Q.matrixWorld.multiplyMatrices($.matrixWorld,Q.matrix),Q.matrixWorldInverse.copy(Q.matrixWorld).invert()}this.updateCamera=function(Q){if(i===null)return;let $=Q.near,xe=Q.far;g.texture!==null&&(g.depthNear>0&&($=g.depthNear),g.depthFar>0&&(xe=g.depthFar)),z.near=S.near=w.near=$,z.far=S.far=w.far=xe,(O!==z.near||G!==z.far)&&(i.updateRenderState({depthNear:z.near,depthFar:z.far}),O=z.near,G=z.far),z.layers.mask=Q.layers.mask|6,w.layers.mask=z.layers.mask&3,S.layers.mask=z.layers.mask&5;const Oe=Q.parent,we=z.cameras;ge(z,Oe);for(let Qe=0;Qe<we.length;Qe++)ge(we[Qe],Oe);we.length===2?se(z,w,S):z.projectionMatrix.copy(w.projectionMatrix),Ee(Q,z,Oe)};function Ee(Q,$,xe){xe===null?Q.matrix.copy($.matrixWorld):(Q.matrix.copy(xe.matrixWorld),Q.matrix.invert(),Q.matrix.multiply($.matrixWorld)),Q.matrix.decompose(Q.position,Q.quaternion,Q.scale),Q.updateMatrixWorld(!0),Q.projectionMatrix.copy($.projectionMatrix),Q.projectionMatrixInverse.copy($.projectionMatrixInverse),Q.isPerspectiveCamera&&(Q.fov=pr*2*Math.atan(1/Q.projectionMatrix.elements[5]),Q.zoom=1)}this.getCamera=function(){return z},this.getFoveation=function(){if(!(f===null&&p===null))return c},this.setFoveation=function(Q){c=Q,f!==null&&(f.fixedFoveation=Q),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Q)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(z)},this.getCameraTexture=function(Q){return d[Q]};let $e=null;function at(Q,$){if(h=$.getViewerPose(l||a),m=$,h!==null){const xe=h.views;p!==null&&(e.setRenderTargetFramebuffer(v,p.framebuffer),e.setRenderTarget(v));let Oe=!1;xe.length!==z.cameras.length&&(z.cameras.length=0,Oe=!0);for(let L=0;L<xe.length;L++){const ft=xe[L];let qe=null;if(p!==null)qe=p.getViewport(ft);else{const Re=u.getViewSubImage(f,ft);qe=Re.viewport,L===0&&(e.setRenderTargetTextures(v,Re.colorTexture,Re.depthStencilTexture),e.setRenderTarget(v))}let ze=I[L];ze===void 0&&(ze=new qt,ze.layers.enable(L),ze.viewport=new xt,I[L]=ze),ze.matrix.fromArray(ft.transform.matrix),ze.matrix.decompose(ze.position,ze.quaternion,ze.scale),ze.projectionMatrix.fromArray(ft.projectionMatrix),ze.projectionMatrixInverse.copy(ze.projectionMatrix).invert(),ze.viewport.set(qe.x,qe.y,qe.width,qe.height),L===0&&(z.matrix.copy(ze.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale)),Oe===!0&&z.cameras.push(ze)}const we=i.enabledFeatures;if(we&&we.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&b){u=n.getBinding();const L=u.getDepthInformation(xe[0]);L&&L.isValid&&L.texture&&g.init(L,i.renderState)}if(we&&we.includes("camera-access")&&b){e.state.unbindTexture(),u=n.getBinding();for(let L=0;L<xe.length;L++){const ft=xe[L].camera;if(ft){let qe=d[ft];qe||(qe=new Nf,d[ft]=qe);const ze=u.getCameraImage(ft);qe.sourceTexture=ze}}}}for(let xe=0;xe<T.length;xe++){const Oe=A[xe],we=T[xe];Oe!==null&&we!==void 0&&we.update(Oe,$,l||a)}$e&&$e(Q,$),$.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:$}),m=null}const et=new Hf;et.setAnimationLoop(at),this.setAnimationLoop=function(Q){$e=Q},this.dispose=function(){}}}const fs=new _i,_y=new Je;function My(s,e){function t(g,d){g.matrixAutoUpdate===!0&&g.updateMatrix(),d.value.copy(g.matrix)}function n(g,d){d.color.getRGB(g.fogColor.value,Rf(s)),d.isFog?(g.fogNear.value=d.near,g.fogFar.value=d.far):d.isFogExp2&&(g.fogDensity.value=d.density)}function i(g,d,x,_,v){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(g,d):d.isMeshToonMaterial?(r(g,d),u(g,d)):d.isMeshPhongMaterial?(r(g,d),h(g,d)):d.isMeshStandardMaterial?(r(g,d),f(g,d),d.isMeshPhysicalMaterial&&p(g,d,v)):d.isMeshMatcapMaterial?(r(g,d),m(g,d)):d.isMeshDepthMaterial?r(g,d):d.isMeshDistanceMaterial?(r(g,d),b(g,d)):d.isMeshNormalMaterial?r(g,d):d.isLineBasicMaterial?(a(g,d),d.isLineDashedMaterial&&o(g,d)):d.isPointsMaterial?c(g,d,x,_):d.isSpriteMaterial?l(g,d):d.isShadowMaterial?(g.color.value.copy(d.color),g.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(g,d){g.opacity.value=d.opacity,d.color&&g.diffuse.value.copy(d.color),d.emissive&&g.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(g.map.value=d.map,t(d.map,g.mapTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,t(d.alphaMap,g.alphaMapTransform)),d.bumpMap&&(g.bumpMap.value=d.bumpMap,t(d.bumpMap,g.bumpMapTransform),g.bumpScale.value=d.bumpScale,d.side===Mn&&(g.bumpScale.value*=-1)),d.normalMap&&(g.normalMap.value=d.normalMap,t(d.normalMap,g.normalMapTransform),g.normalScale.value.copy(d.normalScale),d.side===Mn&&g.normalScale.value.negate()),d.displacementMap&&(g.displacementMap.value=d.displacementMap,t(d.displacementMap,g.displacementMapTransform),g.displacementScale.value=d.displacementScale,g.displacementBias.value=d.displacementBias),d.emissiveMap&&(g.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,g.emissiveMapTransform)),d.specularMap&&(g.specularMap.value=d.specularMap,t(d.specularMap,g.specularMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest);const x=e.get(d),_=x.envMap,v=x.envMapRotation;_&&(g.envMap.value=_,fs.copy(v),fs.x*=-1,fs.y*=-1,fs.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(fs.y*=-1,fs.z*=-1),g.envMapRotation.value.setFromMatrix4(_y.makeRotationFromEuler(fs)),g.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=d.reflectivity,g.ior.value=d.ior,g.refractionRatio.value=d.refractionRatio),d.lightMap&&(g.lightMap.value=d.lightMap,g.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,g.lightMapTransform)),d.aoMap&&(g.aoMap.value=d.aoMap,g.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,g.aoMapTransform))}function a(g,d){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,d.map&&(g.map.value=d.map,t(d.map,g.mapTransform))}function o(g,d){g.dashSize.value=d.dashSize,g.totalSize.value=d.dashSize+d.gapSize,g.scale.value=d.scale}function c(g,d,x,_){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,g.size.value=d.size*x,g.scale.value=_*.5,d.map&&(g.map.value=d.map,t(d.map,g.uvTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,t(d.alphaMap,g.alphaMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest)}function l(g,d){g.diffuse.value.copy(d.color),g.opacity.value=d.opacity,g.rotation.value=d.rotation,d.map&&(g.map.value=d.map,t(d.map,g.mapTransform)),d.alphaMap&&(g.alphaMap.value=d.alphaMap,t(d.alphaMap,g.alphaMapTransform)),d.alphaTest>0&&(g.alphaTest.value=d.alphaTest)}function h(g,d){g.specular.value.copy(d.specular),g.shininess.value=Math.max(d.shininess,1e-4)}function u(g,d){d.gradientMap&&(g.gradientMap.value=d.gradientMap)}function f(g,d){g.metalness.value=d.metalness,d.metalnessMap&&(g.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,g.metalnessMapTransform)),g.roughness.value=d.roughness,d.roughnessMap&&(g.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,g.roughnessMapTransform)),d.envMap&&(g.envMapIntensity.value=d.envMapIntensity)}function p(g,d,x){g.ior.value=d.ior,d.sheen>0&&(g.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),g.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(g.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,g.sheenColorMapTransform)),d.sheenRoughnessMap&&(g.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,g.sheenRoughnessMapTransform))),d.clearcoat>0&&(g.clearcoat.value=d.clearcoat,g.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(g.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,g.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(g.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Mn&&g.clearcoatNormalScale.value.negate())),d.dispersion>0&&(g.dispersion.value=d.dispersion),d.iridescence>0&&(g.iridescence.value=d.iridescence,g.iridescenceIOR.value=d.iridescenceIOR,g.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(g.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,g.iridescenceMapTransform)),d.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),d.transmission>0&&(g.transmission.value=d.transmission,g.transmissionSamplerMap.value=x.texture,g.transmissionSamplerSize.value.set(x.width,x.height),d.transmissionMap&&(g.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,g.transmissionMapTransform)),g.thickness.value=d.thickness,d.thicknessMap&&(g.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=d.attenuationDistance,g.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(g.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(g.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=d.specularIntensity,g.specularColor.value.copy(d.specularColor),d.specularColorMap&&(g.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,g.specularColorMapTransform)),d.specularIntensityMap&&(g.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,d){d.matcap&&(g.matcap.value=d.matcap)}function b(g,d){const x=e.get(d).light;g.referencePosition.value.setFromMatrixPosition(x.matrixWorld),g.nearDistance.value=x.shadow.camera.near,g.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function Sy(s,e,t,n){let i={},r={},a=[];const o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function c(x,_){const v=_.program;n.uniformBlockBinding(x,v)}function l(x,_){let v=i[x.id];v===void 0&&(m(x),v=h(x),i[x.id]=v,x.addEventListener("dispose",g));const T=_.program;n.updateUBOMapping(x,T);const A=e.render.frame;r[x.id]!==A&&(f(x),r[x.id]=A)}function h(x){const _=u();x.__bindingPointIndex=_;const v=s.createBuffer(),T=x.__size,A=x.usage;return s.bindBuffer(s.UNIFORM_BUFFER,v),s.bufferData(s.UNIFORM_BUFFER,T,A),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,_,v),v}function u(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(x){const _=i[x.id],v=x.uniforms,T=x.__cache;s.bindBuffer(s.UNIFORM_BUFFER,_);for(let A=0,C=v.length;A<C;A++){const D=Array.isArray(v[A])?v[A]:[v[A]];for(let w=0,S=D.length;w<S;w++){const I=D[w];if(p(I,A,w,T)===!0){const z=I.__offset,O=Array.isArray(I.value)?I.value:[I.value];let G=0;for(let j=0;j<O.length;j++){const K=O[j],ee=b(K);typeof K=="number"||typeof K=="boolean"?(I.__data[0]=K,s.bufferSubData(s.UNIFORM_BUFFER,z+G,I.__data)):K.isMatrix3?(I.__data[0]=K.elements[0],I.__data[1]=K.elements[1],I.__data[2]=K.elements[2],I.__data[3]=0,I.__data[4]=K.elements[3],I.__data[5]=K.elements[4],I.__data[6]=K.elements[5],I.__data[7]=0,I.__data[8]=K.elements[6],I.__data[9]=K.elements[7],I.__data[10]=K.elements[8],I.__data[11]=0):(K.toArray(I.__data,G),G+=ee.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,z,I.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function p(x,_,v,T){const A=x.value,C=_+"_"+v;if(T[C]===void 0)return typeof A=="number"||typeof A=="boolean"?T[C]=A:T[C]=A.clone(),!0;{const D=T[C];if(typeof A=="number"||typeof A=="boolean"){if(D!==A)return T[C]=A,!0}else if(D.equals(A)===!1)return D.copy(A),!0}return!1}function m(x){const _=x.uniforms;let v=0;const T=16;for(let C=0,D=_.length;C<D;C++){const w=Array.isArray(_[C])?_[C]:[_[C]];for(let S=0,I=w.length;S<I;S++){const z=w[S],O=Array.isArray(z.value)?z.value:[z.value];for(let G=0,j=O.length;G<j;G++){const K=O[G],ee=b(K),X=v%T,de=X%ee.boundary,se=X+de;v+=de,se!==0&&T-se<ee.storage&&(v+=T-se),z.__data=new Float32Array(ee.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=v,v+=ee.storage}}}const A=v%T;return A>0&&(v+=T-A),x.__size=v,x.__cache={},this}function b(x){const _={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(_.boundary=4,_.storage=4):x.isVector2?(_.boundary=8,_.storage=8):x.isVector3||x.isColor?(_.boundary=16,_.storage=12):x.isVector4?(_.boundary=16,_.storage=16):x.isMatrix3?(_.boundary=48,_.storage=48):x.isMatrix4?(_.boundary=64,_.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),_}function g(x){const _=x.target;_.removeEventListener("dispose",g);const v=a.indexOf(_.__bindingPointIndex);a.splice(v,1),s.deleteBuffer(i[_.id]),delete i[_.id],delete r[_.id]}function d(){for(const x in i)s.deleteBuffer(i[x]);a=[],i={},r={}}return{bind:c,update:l,dispose:d}}class wy{constructor(e={}){const{canvas:t=Am(),context:n=null,depth:i=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;const m=new Uint32Array(4),b=new Int32Array(4);let g=null,d=null;const x=[],_=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=is,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const v=this;let T=!1;this._outputColorSpace=Xt;let A=0,C=0,D=null,w=-1,S=null;const I=new xt,z=new xt;let O=null;const G=new De(0);let j=0,K=t.width,ee=t.height,X=1,de=null,se=null;const ge=new xt(0,0,K,ee),Ee=new xt(0,0,K,ee);let $e=!1;const at=new Go;let et=!1,Q=!1;const $=new Je,xe=new P,Oe=new xt,we={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Qe=!1;function Rt(){return D===null?X:1}let L=n;function ft(M,U){return t.getContext(M,U)}try{const M={alpha:!0,depth:i,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${ph}`),t.addEventListener("webglcontextlost",me,!1),t.addEventListener("webglcontextrestored",Ae,!1),t.addEventListener("webglcontextcreationerror",ue,!1),L===null){const U="webgl2";if(L=ft(U,M),L===null)throw ft(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw console.error("THREE.WebGLRenderer: "+M.message),M}let qe,ze,Re,pt,ve,Ye,gt,vt,R,y,H,Z,ie,Y,Te,he,_e,ye,le,be,ke,Le,pe,Ne;function N(){qe=new Nx(L),qe.init(),Le=new gy(L,qe),ze=new Ax(L,qe,e,Le),Re=new py(L,qe),ze.reversedDepthBuffer&&f&&Re.buffers.depth.setReversed(!0),pt=new Fx(L),ve=new ty,Ye=new my(L,qe,Re,ve,ze,Le,pt),gt=new Cx(v),vt=new Dx(v),R=new Gg(L),pe=new Tx(L,R),y=new Ox(L,R,pt,pe),H=new zx(L,y,R,pt),le=new Bx(L,ze,Ye),he=new Rx(ve),Z=new ey(v,gt,vt,qe,ze,pe,he),ie=new My(v,ve),Y=new iy,Te=new cy(qe),ye=new wx(v,gt,vt,Re,H,p,c),_e=new dy(v,H,ze),Ne=new Sy(L,pt,ze,Re),be=new Ex(L,qe,pt),ke=new Ux(L,qe,pt),pt.programs=Z.programs,v.capabilities=ze,v.extensions=qe,v.properties=ve,v.renderLists=Y,v.shadowMap=_e,v.state=Re,v.info=pt}N();const fe=new yy(v,L);this.xr=fe,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){const M=qe.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){const M=qe.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return X},this.setPixelRatio=function(M){M!==void 0&&(X=M,this.setSize(K,ee,!1))},this.getSize=function(M){return M.set(K,ee)},this.setSize=function(M,U,W=!0){if(fe.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}K=M,ee=U,t.width=Math.floor(M*X),t.height=Math.floor(U*X),W===!0&&(t.style.width=M+"px",t.style.height=U+"px"),this.setViewport(0,0,M,U)},this.getDrawingBufferSize=function(M){return M.set(K*X,ee*X).floor()},this.setDrawingBufferSize=function(M,U,W){K=M,ee=U,X=W,t.width=Math.floor(M*W),t.height=Math.floor(U*W),this.setViewport(0,0,M,U)},this.getCurrentViewport=function(M){return M.copy(I)},this.getViewport=function(M){return M.copy(ge)},this.setViewport=function(M,U,W,q){M.isVector4?ge.set(M.x,M.y,M.z,M.w):ge.set(M,U,W,q),Re.viewport(I.copy(ge).multiplyScalar(X).round())},this.getScissor=function(M){return M.copy(Ee)},this.setScissor=function(M,U,W,q){M.isVector4?Ee.set(M.x,M.y,M.z,M.w):Ee.set(M,U,W,q),Re.scissor(z.copy(Ee).multiplyScalar(X).round())},this.getScissorTest=function(){return $e},this.setScissorTest=function(M){Re.setScissorTest($e=M)},this.setOpaqueSort=function(M){de=M},this.setTransparentSort=function(M){se=M},this.getClearColor=function(M){return M.copy(ye.getClearColor())},this.setClearColor=function(){ye.setClearColor(...arguments)},this.getClearAlpha=function(){return ye.getClearAlpha()},this.setClearAlpha=function(){ye.setClearAlpha(...arguments)},this.clear=function(M=!0,U=!0,W=!0){let q=0;if(M){let F=!1;if(D!==null){const ce=D.texture.format;F=ce===Sh||ce===Mh||ce===_h}if(F){const ce=D.texture.type,Me=ce===hi||ce===Es||ce===na||ce===dr||ce===xh||ce===vh,Ce=ye.getClearColor(),Pe=ye.getClearAlpha(),Xe=Ce.r,Ve=Ce.g,He=Ce.b;Me?(m[0]=Xe,m[1]=Ve,m[2]=He,m[3]=Pe,L.clearBufferuiv(L.COLOR,0,m)):(b[0]=Xe,b[1]=Ve,b[2]=He,b[3]=Pe,L.clearBufferiv(L.COLOR,0,b))}else q|=L.COLOR_BUFFER_BIT}U&&(q|=L.DEPTH_BUFFER_BIT),W&&(q|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(q)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",me,!1),t.removeEventListener("webglcontextrestored",Ae,!1),t.removeEventListener("webglcontextcreationerror",ue,!1),ye.dispose(),Y.dispose(),Te.dispose(),ve.dispose(),gt.dispose(),vt.dispose(),H.dispose(),pe.dispose(),Ne.dispose(),Z.dispose(),fe.dispose(),fe.removeEventListener("sessionstart",$t),fe.removeEventListener("sessionend",os),Zn.stop()};function me(M){M.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),T=!0}function Ae(){console.log("THREE.WebGLRenderer: Context Restored."),T=!1;const M=pt.autoReset,U=_e.enabled,W=_e.autoUpdate,q=_e.needsUpdate,F=_e.type;N(),pt.autoReset=M,_e.enabled=U,_e.autoUpdate=W,_e.needsUpdate=q,_e.type=F}function ue(M){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function te(M){const U=M.target;U.removeEventListener("dispose",te),Ie(U)}function Ie(M){je(M),ve.remove(M)}function je(M){const U=ve.get(M).programs;U!==void 0&&(U.forEach(function(W){Z.releaseProgram(W)}),M.isShaderMaterial&&Z.releaseShaderCache(M))}this.renderBufferDirect=function(M,U,W,q,F,ce){U===null&&(U=we);const Me=F.isMesh&&F.matrixWorld.determinant()<0,Ce=ae(M,U,W,q,F);Re.setMaterial(q,Me);let Pe=W.index,Xe=1;if(q.wireframe===!0){if(Pe=y.getWireframeAttribute(W),Pe===void 0)return;Xe=2}const Ve=W.drawRange,He=W.attributes.position;let it=Ve.start*Xe,yt=(Ve.start+Ve.count)*Xe;ce!==null&&(it=Math.max(it,ce.start*Xe),yt=Math.min(yt,(ce.start+ce.count)*Xe)),Pe!==null?(it=Math.max(it,0),yt=Math.min(yt,Pe.count)):He!=null&&(it=Math.max(it,0),yt=Math.min(yt,He.count));const Dt=yt-it;if(Dt<0||Dt===1/0)return;pe.setup(F,q,Ce,W,Pe);let _t,Mt=be;if(Pe!==null&&(_t=R.get(Pe),Mt=ke,Mt.setIndex(_t)),F.isMesh)q.wireframe===!0?(Re.setLineWidth(q.wireframeLinewidth*Rt()),Mt.setMode(L.LINES)):Mt.setMode(L.TRIANGLES);else if(F.isLine){let Ge=q.linewidth;Ge===void 0&&(Ge=1),Re.setLineWidth(Ge*Rt()),F.isLineSegments?Mt.setMode(L.LINES):F.isLineLoop?Mt.setMode(L.LINE_LOOP):Mt.setMode(L.LINE_STRIP)}else F.isPoints?Mt.setMode(L.POINTS):F.isSprite&&Mt.setMode(L.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)oa("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Mt.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(qe.get("WEBGL_multi_draw"))Mt.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const Ge=F._multiDrawStarts,Pt=F._multiDrawCounts,ut=F._multiDrawCount,xn=Pe?R.get(Pe).bytesPerElement:1,Nt=ve.get(q).currentProgram.getUniforms();for(let bt=0;bt<ut;bt++)Nt.setValue(L,"_gl_DrawID",bt),Mt.render(Ge[bt]/xn,Pt[bt])}else if(F.isInstancedMesh)Mt.renderInstances(it,Dt,F.count);else if(W.isInstancedBufferGeometry){const Ge=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,Pt=Math.min(W.instanceCount,Ge);Mt.renderInstances(it,Dt,Pt)}else Mt.render(it,Dt)};function mt(M,U,W){M.transparent===!0&&M.side===ni&&M.forceSinglePass===!1?(M.side=Mn,M.needsUpdate=!0,E(M,U,W),M.side=zi,M.needsUpdate=!0,E(M,U,W),M.side=ni):E(M,U,W)}this.compile=function(M,U,W=null){W===null&&(W=M),d=Te.get(W),d.init(U),_.push(d),W.traverseVisible(function(F){F.isLight&&F.layers.test(U.layers)&&(d.pushLight(F),F.castShadow&&d.pushShadow(F))}),M!==W&&M.traverseVisible(function(F){F.isLight&&F.layers.test(U.layers)&&(d.pushLight(F),F.castShadow&&d.pushShadow(F))}),d.setupLights();const q=new Set;return M.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const ce=F.material;if(ce)if(Array.isArray(ce))for(let Me=0;Me<ce.length;Me++){const Ce=ce[Me];mt(Ce,W,F),q.add(Ce)}else mt(ce,W,F),q.add(ce)}),d=_.pop(),q},this.compileAsync=function(M,U,W=null){const q=this.compile(M,U,W);return new Promise(F=>{function ce(){if(q.forEach(function(Me){ve.get(Me).currentProgram.isReady()&&q.delete(Me)}),q.size===0){F(M);return}setTimeout(ce,10)}qe.get("KHR_parallel_shader_compile")!==null?ce():setTimeout(ce,10)})};let ot=null;function bn(M){ot&&ot(M)}function $t(){Zn.stop()}function os(){Zn.start()}const Zn=new Hf;Zn.setAnimationLoop(bn),typeof self<"u"&&Zn.setContext(self),this.setAnimationLoop=function(M){ot=M,fe.setAnimationLoop(M),M===null?Zn.stop():Zn.start()},fe.addEventListener("sessionstart",$t),fe.addEventListener("sessionend",os),this.render=function(M,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(T===!0)return;if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),fe.enabled===!0&&fe.isPresenting===!0&&(fe.cameraAutoUpdate===!0&&fe.updateCamera(U),U=fe.getCamera()),M.isScene===!0&&M.onBeforeRender(v,M,U,D),d=Te.get(M,_.length),d.init(U),_.push(d),$.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),at.setFromProjectionMatrix($,vi,U.reversedDepth),Q=this.localClippingEnabled,et=he.init(this.clippingPlanes,Q),g=Y.get(M,x.length),g.init(),x.push(g),fe.enabled===!0&&fe.isPresenting===!0){const ce=v.xr.getDepthSensingMesh();ce!==null&&Hi(ce,U,-1/0,v.sortObjects)}Hi(M,U,0,v.sortObjects),g.finish(),v.sortObjects===!0&&g.sort(de,se),Qe=fe.enabled===!1||fe.isPresenting===!1||fe.hasDepthSensing()===!1,Qe&&ye.addToRenderList(g,M),this.info.render.frame++,et===!0&&he.beginShadows();const W=d.state.shadowsArray;_e.render(W,M,U),et===!0&&he.endShadows(),this.info.autoReset===!0&&this.info.reset();const q=g.opaque,F=g.transmissive;if(d.setupLights(),U.isArrayCamera){const ce=U.cameras;if(F.length>0)for(let Me=0,Ce=ce.length;Me<Ce;Me++){const Pe=ce[Me];Rr(q,F,M,Pe)}Qe&&ye.render(M);for(let Me=0,Ce=ce.length;Me<Ce;Me++){const Pe=ce[Me];Ds(g,M,Pe,Pe.viewport)}}else F.length>0&&Rr(q,F,M,U),Qe&&ye.render(M),Ds(g,M,U);D!==null&&C===0&&(Ye.updateMultisampleRenderTarget(D),Ye.updateRenderTargetMipmap(D)),M.isScene===!0&&M.onAfterRender(v,M,U),pe.resetDefaultState(),w=-1,S=null,_.pop(),_.length>0?(d=_[_.length-1],et===!0&&he.setGlobalState(v.clippingPlanes,d.state.camera)):d=null,x.pop(),x.length>0?g=x[x.length-1]:g=null};function Hi(M,U,W,q){if(M.visible===!1)return;if(M.layers.test(U.layers)){if(M.isGroup)W=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(U);else if(M.isLight)d.pushLight(M),M.castShadow&&d.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||at.intersectsSprite(M)){q&&Oe.setFromMatrixPosition(M.matrixWorld).applyMatrix4($);const Me=H.update(M),Ce=M.material;Ce.visible&&g.push(M,Me,Ce,W,Oe.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||at.intersectsObject(M))){const Me=H.update(M),Ce=M.material;if(q&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Oe.copy(M.boundingSphere.center)):(Me.boundingSphere===null&&Me.computeBoundingSphere(),Oe.copy(Me.boundingSphere.center)),Oe.applyMatrix4(M.matrixWorld).applyMatrix4($)),Array.isArray(Ce)){const Pe=Me.groups;for(let Xe=0,Ve=Pe.length;Xe<Ve;Xe++){const He=Pe[Xe],it=Ce[He.materialIndex];it&&it.visible&&g.push(M,Me,it,W,Oe.z,He)}}else Ce.visible&&g.push(M,Me,Ce,W,Oe.z,null)}}const ce=M.children;for(let Me=0,Ce=ce.length;Me<Ce;Me++)Hi(ce[Me],U,W,q)}function Ds(M,U,W,q){const F=M.opaque,ce=M.transmissive,Me=M.transparent;d.setupLightsView(W),et===!0&&he.setGlobalState(v.clippingPlanes,W),q&&Re.viewport(I.copy(q)),F.length>0&&B(F,U,W),ce.length>0&&B(ce,U,W),Me.length>0&&B(Me,U,W),Re.buffers.depth.setTest(!0),Re.buffers.depth.setMask(!0),Re.buffers.color.setMask(!0),Re.setPolygonOffset(!1)}function Rr(M,U,W,q){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[q.id]===void 0&&(d.state.transmissionRenderTarget[q.id]=new pn(1,1,{generateMipmaps:!0,type:qe.has("EXT_color_buffer_half_float")||qe.has("EXT_color_buffer_float")?In:hi,minFilter:Ni,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:dt.workingColorSpace}));const ce=d.state.transmissionRenderTarget[q.id],Me=q.viewport||I;ce.setSize(Me.z*v.transmissionResolutionScale,Me.w*v.transmissionResolutionScale);const Ce=v.getRenderTarget(),Pe=v.getActiveCubeFace(),Xe=v.getActiveMipmapLevel();v.setRenderTarget(ce),v.getClearColor(G),j=v.getClearAlpha(),j<1&&v.setClearColor(16777215,.5),v.clear(),Qe&&ye.render(W);const Ve=v.toneMapping;v.toneMapping=is;const He=q.viewport;if(q.viewport!==void 0&&(q.viewport=void 0),d.setupLightsView(q),et===!0&&he.setGlobalState(v.clippingPlanes,q),B(M,W,q),Ye.updateMultisampleRenderTarget(ce),Ye.updateRenderTargetMipmap(ce),qe.has("WEBGL_multisampled_render_to_texture")===!1){let it=!1;for(let yt=0,Dt=U.length;yt<Dt;yt++){const _t=U[yt],Mt=_t.object,Ge=_t.geometry,Pt=_t.material,ut=_t.group;if(Pt.side===ni&&Mt.layers.test(q.layers)){const xn=Pt.side;Pt.side=Mn,Pt.needsUpdate=!0,re(Mt,W,q,Ge,Pt,ut),Pt.side=xn,Pt.needsUpdate=!0,it=!0}}it===!0&&(Ye.updateMultisampleRenderTarget(ce),Ye.updateRenderTargetMipmap(ce))}v.setRenderTarget(Ce,Pe,Xe),v.setClearColor(G,j),He!==void 0&&(q.viewport=He),v.toneMapping=Ve}function B(M,U,W){const q=U.isScene===!0?U.overrideMaterial:null;for(let F=0,ce=M.length;F<ce;F++){const Me=M[F],Ce=Me.object,Pe=Me.geometry,Xe=Me.group;let Ve=Me.material;Ve.allowOverride===!0&&q!==null&&(Ve=q),Ce.layers.test(W.layers)&&re(Ce,U,W,Pe,Ve,Xe)}}function re(M,U,W,q,F,ce){M.onBeforeRender(v,U,W,q,F,ce),M.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),F.onBeforeRender(v,U,W,q,M,ce),F.transparent===!0&&F.side===ni&&F.forceSinglePass===!1?(F.side=Mn,F.needsUpdate=!0,v.renderBufferDirect(W,U,q,F,M,ce),F.side=zi,F.needsUpdate=!0,v.renderBufferDirect(W,U,q,F,M,ce),F.side=ni):v.renderBufferDirect(W,U,q,F,M,ce),M.onAfterRender(v,U,W,q,F,ce)}function E(M,U,W){U.isScene!==!0&&(U=we);const q=ve.get(M),F=d.state.lights,ce=d.state.shadowsArray,Me=F.state.version,Ce=Z.getParameters(M,F.state,ce,U,W),Pe=Z.getProgramCacheKey(Ce);let Xe=q.programs;q.environment=M.isMeshStandardMaterial?U.environment:null,q.fog=U.fog,q.envMap=(M.isMeshStandardMaterial?vt:gt).get(M.envMap||q.environment),q.envMapRotation=q.environment!==null&&M.envMap===null?U.environmentRotation:M.envMapRotation,Xe===void 0&&(M.addEventListener("dispose",te),Xe=new Map,q.programs=Xe);let Ve=Xe.get(Pe);if(Ve!==void 0){if(q.currentProgram===Ve&&q.lightsStateVersion===Me)return V(M,Ce),Ve}else Ce.uniforms=Z.getUniforms(M),M.onBeforeCompile(Ce,v),Ve=Z.acquireProgram(Ce,Pe),Xe.set(Pe,Ve),q.uniforms=Ce.uniforms;const He=q.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(He.clippingPlanes=he.uniform),V(M,Ce),q.needsLights=Ue(M),q.lightsStateVersion=Me,q.needsLights&&(He.ambientLightColor.value=F.state.ambient,He.lightProbe.value=F.state.probe,He.directionalLights.value=F.state.directional,He.directionalLightShadows.value=F.state.directionalShadow,He.spotLights.value=F.state.spot,He.spotLightShadows.value=F.state.spotShadow,He.rectAreaLights.value=F.state.rectArea,He.ltc_1.value=F.state.rectAreaLTC1,He.ltc_2.value=F.state.rectAreaLTC2,He.pointLights.value=F.state.point,He.pointLightShadows.value=F.state.pointShadow,He.hemisphereLights.value=F.state.hemi,He.directionalShadowMap.value=F.state.directionalShadowMap,He.directionalShadowMatrix.value=F.state.directionalShadowMatrix,He.spotShadowMap.value=F.state.spotShadowMap,He.spotLightMatrix.value=F.state.spotLightMatrix,He.spotLightMap.value=F.state.spotLightMap,He.pointShadowMap.value=F.state.pointShadowMap,He.pointShadowMatrix.value=F.state.pointShadowMatrix),q.currentProgram=Ve,q.uniformsList=null,Ve}function k(M){if(M.uniformsList===null){const U=M.currentProgram.getUniforms();M.uniformsList=xo.seqWithValue(U.seq,M.uniforms)}return M.uniformsList}function V(M,U){const W=ve.get(M);W.outputColorSpace=U.outputColorSpace,W.batching=U.batching,W.batchingColor=U.batchingColor,W.instancing=U.instancing,W.instancingColor=U.instancingColor,W.instancingMorph=U.instancingMorph,W.skinning=U.skinning,W.morphTargets=U.morphTargets,W.morphNormals=U.morphNormals,W.morphColors=U.morphColors,W.morphTargetsCount=U.morphTargetsCount,W.numClippingPlanes=U.numClippingPlanes,W.numIntersection=U.numClipIntersection,W.vertexAlphas=U.vertexAlphas,W.vertexTangents=U.vertexTangents,W.toneMapping=U.toneMapping}function ae(M,U,W,q,F){U.isScene!==!0&&(U=we),Ye.resetTextureUnits();const ce=U.fog,Me=q.isMeshStandardMaterial?U.environment:null,Ce=D===null?v.outputColorSpace:D.isXRRenderTarget===!0?D.texture.colorSpace:mn,Pe=(q.isMeshStandardMaterial?vt:gt).get(q.envMap||Me),Xe=q.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,Ve=!!W.attributes.tangent&&(!!q.normalMap||q.anisotropy>0),He=!!W.morphAttributes.position,it=!!W.morphAttributes.normal,yt=!!W.morphAttributes.color;let Dt=is;q.toneMapped&&(D===null||D.isXRRenderTarget===!0)&&(Dt=v.toneMapping);const _t=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,Mt=_t!==void 0?_t.length:0,Ge=ve.get(q),Pt=d.state.lights;if(et===!0&&(Q===!0||M!==S)){const kt=M===S&&q.id===w;he.setState(q,M,kt)}let ut=!1;q.version===Ge.__version?(Ge.needsLights&&Ge.lightsStateVersion!==Pt.state.version||Ge.outputColorSpace!==Ce||F.isBatchedMesh&&Ge.batching===!1||!F.isBatchedMesh&&Ge.batching===!0||F.isBatchedMesh&&Ge.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Ge.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Ge.instancing===!1||!F.isInstancedMesh&&Ge.instancing===!0||F.isSkinnedMesh&&Ge.skinning===!1||!F.isSkinnedMesh&&Ge.skinning===!0||F.isInstancedMesh&&Ge.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Ge.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Ge.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Ge.instancingMorph===!1&&F.morphTexture!==null||Ge.envMap!==Pe||q.fog===!0&&Ge.fog!==ce||Ge.numClippingPlanes!==void 0&&(Ge.numClippingPlanes!==he.numPlanes||Ge.numIntersection!==he.numIntersection)||Ge.vertexAlphas!==Xe||Ge.vertexTangents!==Ve||Ge.morphTargets!==He||Ge.morphNormals!==it||Ge.morphColors!==yt||Ge.toneMapping!==Dt||Ge.morphTargetsCount!==Mt)&&(ut=!0):(ut=!0,Ge.__version=q.version);let xn=Ge.currentProgram;ut===!0&&(xn=E(q,U,F));let Nt=!1,bt=!1,en=!1;const st=xn.getUniforms(),jt=Ge.uniforms;if(Re.useProgram(xn.program)&&(Nt=!0,bt=!0,en=!0),q.id!==w&&(w=q.id,bt=!0),Nt||S!==M){Re.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),st.setValue(L,"projectionMatrix",M.projectionMatrix),st.setValue(L,"viewMatrix",M.matrixWorldInverse);const Ht=st.map.cameraPosition;Ht!==void 0&&Ht.setValue(L,xe.setFromMatrixPosition(M.matrixWorld)),ze.logarithmicDepthBuffer&&st.setValue(L,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(q.isMeshPhongMaterial||q.isMeshToonMaterial||q.isMeshLambertMaterial||q.isMeshBasicMaterial||q.isMeshStandardMaterial||q.isShaderMaterial)&&st.setValue(L,"isOrthographic",M.isOrthographicCamera===!0),S!==M&&(S=M,bt=!0,en=!0)}if(F.isSkinnedMesh){st.setOptional(L,F,"bindMatrix"),st.setOptional(L,F,"bindMatrixInverse");const kt=F.skeleton;kt&&(kt.boneTexture===null&&kt.computeBoneTexture(),st.setValue(L,"boneTexture",kt.boneTexture,Ye))}F.isBatchedMesh&&(st.setOptional(L,F,"batchingTexture"),st.setValue(L,"batchingTexture",F._matricesTexture,Ye),st.setOptional(L,F,"batchingIdTexture"),st.setValue(L,"batchingIdTexture",F._indirectTexture,Ye),st.setOptional(L,F,"batchingColorTexture"),F._colorsTexture!==null&&st.setValue(L,"batchingColorTexture",F._colorsTexture,Ye));const cn=W.morphAttributes;if((cn.position!==void 0||cn.normal!==void 0||cn.color!==void 0)&&le.update(F,W,xn),(bt||Ge.receiveShadow!==F.receiveShadow)&&(Ge.receiveShadow=F.receiveShadow,st.setValue(L,"receiveShadow",F.receiveShadow)),q.isMeshGouraudMaterial&&q.envMap!==null&&(jt.envMap.value=Pe,jt.flipEnvMap.value=Pe.isCubeTexture&&Pe.isRenderTargetTexture===!1?-1:1),q.isMeshStandardMaterial&&q.envMap===null&&U.environment!==null&&(jt.envMapIntensity.value=U.environmentIntensity),bt&&(st.setValue(L,"toneMappingExposure",v.toneMappingExposure),Ge.needsLights&&oe(jt,en),ce&&q.fog===!0&&ie.refreshFogUniforms(jt,ce),ie.refreshMaterialUniforms(jt,q,X,ee,d.state.transmissionRenderTarget[M.id]),xo.upload(L,k(Ge),jt,Ye)),q.isShaderMaterial&&q.uniformsNeedUpdate===!0&&(xo.upload(L,k(Ge),jt,Ye),q.uniformsNeedUpdate=!1),q.isSpriteMaterial&&st.setValue(L,"center",F.center),st.setValue(L,"modelViewMatrix",F.modelViewMatrix),st.setValue(L,"normalMatrix",F.normalMatrix),st.setValue(L,"modelMatrix",F.matrixWorld),q.isShaderMaterial||q.isRawShaderMaterial){const kt=q.uniformsGroups;for(let Ht=0,Jn=kt.length;Ht<Jn;Ht++){const Vn=kt[Ht];Ne.update(Vn,xn),Ne.bind(Vn,xn)}}return xn}function oe(M,U){M.ambientLightColor.needsUpdate=U,M.lightProbe.needsUpdate=U,M.directionalLights.needsUpdate=U,M.directionalLightShadows.needsUpdate=U,M.pointLights.needsUpdate=U,M.pointLightShadows.needsUpdate=U,M.spotLights.needsUpdate=U,M.spotLightShadows.needsUpdate=U,M.rectAreaLights.needsUpdate=U,M.hemisphereLights.needsUpdate=U}function Ue(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return D},this.setRenderTargetTextures=function(M,U,W){const q=ve.get(M);q.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,q.__autoAllocateDepthBuffer===!1&&(q.__useRenderToTexture=!1),ve.get(M.texture).__webglTexture=U,ve.get(M.depthTexture).__webglTexture=q.__autoAllocateDepthBuffer?void 0:W,q.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,U){const W=ve.get(M);W.__webglFramebuffer=U,W.__useDefaultFramebuffer=U===void 0};const Fe=L.createFramebuffer();this.setRenderTarget=function(M,U=0,W=0){D=M,A=U,C=W;let q=!0,F=null,ce=!1,Me=!1;if(M){const Pe=ve.get(M);if(Pe.__useDefaultFramebuffer!==void 0)Re.bindFramebuffer(L.FRAMEBUFFER,null),q=!1;else if(Pe.__webglFramebuffer===void 0)Ye.setupRenderTarget(M);else if(Pe.__hasExternalTextures)Ye.rebindTextures(M,ve.get(M.texture).__webglTexture,ve.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){const He=M.depthTexture;if(Pe.__boundDepthTexture!==He){if(He!==null&&ve.has(He)&&(M.width!==He.image.width||M.height!==He.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Ye.setupDepthRenderbuffer(M)}}const Xe=M.texture;(Xe.isData3DTexture||Xe.isDataArrayTexture||Xe.isCompressedArrayTexture)&&(Me=!0);const Ve=ve.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ve[U])?F=Ve[U][W]:F=Ve[U],ce=!0):M.samples>0&&Ye.useMultisampledRTT(M)===!1?F=ve.get(M).__webglMultisampledFramebuffer:Array.isArray(Ve)?F=Ve[W]:F=Ve,I.copy(M.viewport),z.copy(M.scissor),O=M.scissorTest}else I.copy(ge).multiplyScalar(X).floor(),z.copy(Ee).multiplyScalar(X).floor(),O=$e;if(W!==0&&(F=Fe),Re.bindFramebuffer(L.FRAMEBUFFER,F)&&q&&Re.drawBuffers(M,F),Re.viewport(I),Re.scissor(z),Re.setScissorTest(O),ce){const Pe=ve.get(M.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+U,Pe.__webglTexture,W)}else if(Me){const Pe=U;for(let Xe=0;Xe<M.textures.length;Xe++){const Ve=ve.get(M.textures[Xe]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Xe,Ve.__webglTexture,W,Pe)}}else if(M!==null&&W!==0){const Pe=ve.get(M.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Pe.__webglTexture,W)}w=-1},this.readRenderTargetPixels=function(M,U,W,q,F,ce,Me,Ce=0){if(!(M&&M.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Pe=ve.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Me!==void 0&&(Pe=Pe[Me]),Pe){Re.bindFramebuffer(L.FRAMEBUFFER,Pe);try{const Xe=M.textures[Ce],Ve=Xe.format,He=Xe.type;if(!ze.textureFormatReadable(Ve)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ze.textureTypeReadable(He)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=M.width-q&&W>=0&&W<=M.height-F&&(M.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Ce),L.readPixels(U,W,q,F,Le.convert(Ve),Le.convert(He),ce))}finally{const Xe=D!==null?ve.get(D).__webglFramebuffer:null;Re.bindFramebuffer(L.FRAMEBUFFER,Xe)}}},this.readRenderTargetPixelsAsync=async function(M,U,W,q,F,ce,Me,Ce=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Pe=ve.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Me!==void 0&&(Pe=Pe[Me]),Pe)if(U>=0&&U<=M.width-q&&W>=0&&W<=M.height-F){Re.bindFramebuffer(L.FRAMEBUFFER,Pe);const Xe=M.textures[Ce],Ve=Xe.format,He=Xe.type;if(!ze.textureFormatReadable(Ve))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ze.textureTypeReadable(He))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const it=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,it),L.bufferData(L.PIXEL_PACK_BUFFER,ce.byteLength,L.STREAM_READ),M.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Ce),L.readPixels(U,W,q,F,Le.convert(Ve),Le.convert(He),0);const yt=D!==null?ve.get(D).__webglFramebuffer:null;Re.bindFramebuffer(L.FRAMEBUFFER,yt);const Dt=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await Rm(L,Dt,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,it),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,ce),L.deleteBuffer(it),L.deleteSync(Dt),ce}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,U=null,W=0){const q=Math.pow(2,-W),F=Math.floor(M.image.width*q),ce=Math.floor(M.image.height*q),Me=U!==null?U.x:0,Ce=U!==null?U.y:0;Ye.setTexture2D(M,0),L.copyTexSubImage2D(L.TEXTURE_2D,W,0,0,Me,Ce,F,ce),Re.unbindTexture()};const lt=L.createFramebuffer(),Ct=L.createFramebuffer();this.copyTextureToTexture=function(M,U,W=null,q=null,F=0,ce=null){ce===null&&(F!==0?(oa("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ce=F,F=0):ce=0);let Me,Ce,Pe,Xe,Ve,He,it,yt,Dt;const _t=M.isCompressedTexture?M.mipmaps[ce]:M.image;if(W!==null)Me=W.max.x-W.min.x,Ce=W.max.y-W.min.y,Pe=W.isBox3?W.max.z-W.min.z:1,Xe=W.min.x,Ve=W.min.y,He=W.isBox3?W.min.z:0;else{const cn=Math.pow(2,-F);Me=Math.floor(_t.width*cn),Ce=Math.floor(_t.height*cn),M.isDataArrayTexture?Pe=_t.depth:M.isData3DTexture?Pe=Math.floor(_t.depth*cn):Pe=1,Xe=0,Ve=0,He=0}q!==null?(it=q.x,yt=q.y,Dt=q.z):(it=0,yt=0,Dt=0);const Mt=Le.convert(U.format),Ge=Le.convert(U.type);let Pt;U.isData3DTexture?(Ye.setTexture3D(U,0),Pt=L.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(Ye.setTexture2DArray(U,0),Pt=L.TEXTURE_2D_ARRAY):(Ye.setTexture2D(U,0),Pt=L.TEXTURE_2D),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,U.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,U.unpackAlignment);const ut=L.getParameter(L.UNPACK_ROW_LENGTH),xn=L.getParameter(L.UNPACK_IMAGE_HEIGHT),Nt=L.getParameter(L.UNPACK_SKIP_PIXELS),bt=L.getParameter(L.UNPACK_SKIP_ROWS),en=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,_t.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,_t.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Xe),L.pixelStorei(L.UNPACK_SKIP_ROWS,Ve),L.pixelStorei(L.UNPACK_SKIP_IMAGES,He);const st=M.isDataArrayTexture||M.isData3DTexture,jt=U.isDataArrayTexture||U.isData3DTexture;if(M.isDepthTexture){const cn=ve.get(M),kt=ve.get(U),Ht=ve.get(cn.__renderTarget),Jn=ve.get(kt.__renderTarget);Re.bindFramebuffer(L.READ_FRAMEBUFFER,Ht.__webglFramebuffer),Re.bindFramebuffer(L.DRAW_FRAMEBUFFER,Jn.__webglFramebuffer);for(let Vn=0;Vn<Pe;Vn++)st&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,ve.get(M).__webglTexture,F,He+Vn),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,ve.get(U).__webglTexture,ce,Dt+Vn)),L.blitFramebuffer(Xe,Ve,Me,Ce,it,yt,Me,Ce,L.DEPTH_BUFFER_BIT,L.NEAREST);Re.bindFramebuffer(L.READ_FRAMEBUFFER,null),Re.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(F!==0||M.isRenderTargetTexture||ve.has(M)){const cn=ve.get(M),kt=ve.get(U);Re.bindFramebuffer(L.READ_FRAMEBUFFER,lt),Re.bindFramebuffer(L.DRAW_FRAMEBUFFER,Ct);for(let Ht=0;Ht<Pe;Ht++)st?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,cn.__webglTexture,F,He+Ht):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,cn.__webglTexture,F),jt?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,kt.__webglTexture,ce,Dt+Ht):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,kt.__webglTexture,ce),F!==0?L.blitFramebuffer(Xe,Ve,Me,Ce,it,yt,Me,Ce,L.COLOR_BUFFER_BIT,L.NEAREST):jt?L.copyTexSubImage3D(Pt,ce,it,yt,Dt+Ht,Xe,Ve,Me,Ce):L.copyTexSubImage2D(Pt,ce,it,yt,Xe,Ve,Me,Ce);Re.bindFramebuffer(L.READ_FRAMEBUFFER,null),Re.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else jt?M.isDataTexture||M.isData3DTexture?L.texSubImage3D(Pt,ce,it,yt,Dt,Me,Ce,Pe,Mt,Ge,_t.data):U.isCompressedArrayTexture?L.compressedTexSubImage3D(Pt,ce,it,yt,Dt,Me,Ce,Pe,Mt,_t.data):L.texSubImage3D(Pt,ce,it,yt,Dt,Me,Ce,Pe,Mt,Ge,_t):M.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,ce,it,yt,Me,Ce,Mt,Ge,_t.data):M.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,ce,it,yt,_t.width,_t.height,Mt,_t.data):L.texSubImage2D(L.TEXTURE_2D,ce,it,yt,Me,Ce,Mt,Ge,_t);L.pixelStorei(L.UNPACK_ROW_LENGTH,ut),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,xn),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Nt),L.pixelStorei(L.UNPACK_SKIP_ROWS,bt),L.pixelStorei(L.UNPACK_SKIP_IMAGES,en),ce===0&&U.generateMipmaps&&L.generateMipmap(Pt),Re.unbindTexture()},this.initRenderTarget=function(M){ve.get(M).__webglFramebuffer===void 0&&Ye.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?Ye.setTextureCube(M,0):M.isData3DTexture?Ye.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?Ye.setTexture2DArray(M,0):Ye.setTexture2D(M,0),Re.unbindTexture()},this.resetState=function(){A=0,C=0,D=null,Re.reset(),pe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return vi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=dt._getDrawingBufferColorSpace(e),t.unpackColorSpace=dt._getUnpackColorSpace()}}const Ss={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class as{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Ty=new Xo(-1,1,1,-1,0,1);class Ey extends wn{constructor(){super(),this.setAttribute("position",new Ln([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ln([0,2,0,0,2,0],2))}}const Ay=new Ey;class ya{constructor(e){this._mesh=new Kt(Ay,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Ty)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class eh extends as{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Ft?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Un.clone(e.uniforms),this.material=new Ft({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new ya(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class sd extends as{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const i=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),r.buffers.stencil.setFunc(i.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(i.EQUAL,1,4294967295),r.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),r.buffers.stencil.setLocked(!0)}}class Ry extends as{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class rd{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new We);this._width=n.width,this._height=n.height,t=new pn(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:In}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new eh(Ss),this.copyPass.material.blending=an,this.clock=new zf}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let i=0,r=this.passes.length;i<r;i++){const a=this.passes[i];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),a.needsSwap){if(n){const o=this.renderer.getContext(),c=this.renderer.state.buffers.stencil;c.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),c.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}sd!==void 0&&(a instanceof sd?n=!0:a instanceof Ry&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new We);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(n,i),this.renderTarget2.setSize(n,i);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,i)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class ad extends as{constructor(e,t,n=null,i=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=i,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new De}render(e,t,n){const i=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=i}}const Cy={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new De(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class vr extends as{constructor(e,t=1,n,i){super(),this.strength=t,this.radius=n,this.threshold=i,this.resolution=e!==void 0?new We(e.x,e.y):new We(256,256),this.clearColor=new De(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new pn(r,a,{type:In}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){const u=new pn(r,a,{type:In});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);const f=new pn(r,a,{type:In});f.texture.name="UnrealBloomPass.v"+h,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),r=Math.round(r/2),a=Math.round(a/2)}const o=Cy;this.highPassUniforms=Un.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Ft({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const c=[3,5,7,9,11];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(c[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new We(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const l=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=l,this.bloomTintColors=[new P(1,1,1),new P(1,1,1),new P(1,1,1),new P(1,1,1),new P(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Un.clone(Ss.uniforms),this.blendMaterial=new Ft({uniforms:this.copyUniforms,vertexShader:Ss.vertexShader,fragmentShader:Ss.fragmentShader,blending:ic,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new De,this._oldClearAlpha=1,this._basic=new Pn,this._fsQuad=new ya(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),i=Math.round(t/2);this.renderTargetBright.setSize(n,i);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,i),this.renderTargetsVertical[r].setSize(n,i),this.separableBlurMaterials[r].uniforms.invSize.value=new We(1/n,1/i),n=Math.round(n/2),i=Math.round(i/2)}render(e,t,n,i,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=n.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let c=0;c<this.nMips;c++)this._fsQuad.material=this.separableBlurMaterials[c],this.separableBlurMaterials[c].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[c].uniforms.direction.value=vr.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[c]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[c].uniforms.colorTexture.value=this.renderTargetsHorizontal[c].texture,this.separableBlurMaterials[c].uniforms.direction.value=vr.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[c]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[c];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(n),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){const t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new Ft({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new We(.5,.5)},direction:{value:new We(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}_getCompositeMaterial(e){return new Ft({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}vr.BlurDirectionX=new We(1,0);vr.BlurDirectionY=new We(0,1);const Ka={defines:{SMAA_THRESHOLD:"0.1"},uniforms:{tDiffuse:{value:null},resolution:{value:new We(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		void SMAAEdgeDetectionVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAAEdgeDetectionVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {
			vec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );

			// Calculate color deltas:
			vec4 delta;
			vec3 C = texture2D( colorTex, texcoord ).rgb;

			vec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;
			vec3 t = abs( C - Cleft );
			delta.x = max( max( t.r, t.g ), t.b );

			vec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;
			t = abs( C - Ctop );
			delta.y = max( max( t.r, t.g ), t.b );

			// We do the usual threshold:
			vec2 edges = step( threshold, delta.xy );

			// Then discard if there is no edge:
			if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )
				discard;

			// Calculate right and bottom deltas:
			vec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;
			t = abs( C - Cright );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;
			t = abs( C - Cbottom );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the maximum delta in the direct neighborhood:
			float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );

			// Calculate left-left and top-top deltas:
			vec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;
			t = abs( C - Cleftleft );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;
			t = abs( C - Ctoptop );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the final maximum delta:
			maxDelta = max( max( maxDelta, delta.z ), delta.w );

			// Local contrast adaptation in action:
			edges.xy *= step( 0.5 * maxDelta, delta.xy );

			return vec4( edges, 0.0, 0.0 );
		}

		void main() {

			gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );

		}`},Za={defines:{SMAA_MAX_SEARCH_STEPS:"8",SMAA_AREATEX_MAX_DISTANCE:"16",SMAA_AREATEX_PIXEL_SIZE:"( 1.0 / vec2( 160.0, 560.0 ) )",SMAA_AREATEX_SUBTEX_SIZE:"( 1.0 / 7.0 )"},uniforms:{tDiffuse:{value:null},tArea:{value:null},tSearch:{value:null},resolution:{value:new We(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];
		varying vec2 vPixcoord;

		void SMAABlendingWeightCalculationVS( vec2 texcoord ) {
			vPixcoord = texcoord / resolution;

			// We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 ); // WebGL port note: Changed sign in Y and W components
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 ); // WebGL port note: Changed sign in Y and W components

			// And these for the searches, they indicate the ends of the loops:
			vOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );

		}

		void main() {

			vUv = uv;

			SMAABlendingWeightCalculationVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )

		uniform sampler2D tDiffuse;
		uniform sampler2D tArea;
		uniform sampler2D tSearch;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[3];
		varying vec2 vPixcoord;

		#if __VERSION__ == 100
		vec2 round( vec2 x ) {
			return sign( x ) * floor( abs( x ) + 0.5 );
		}
		#endif

		float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {
			// Not required if searchTex accesses are set to point:
			// float2 SEARCH_TEX_PIXEL_SIZE = 1.0 / float2(66.0, 33.0);
			// e = float2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE +
			//     e * float2(scale, 1.0) * float2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;
			e.r = bias + e.r * scale;
			return 255.0 * texture2D( searchTex, e, 0.0 ).r;
		}

		float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			/**
				* @PSEUDO_GATHER4
				* This texcoord has been offset by (-0.25, -0.125) in the vertex shader to
				* sample between edge, thus fetching four edges in a row.
				* Sampling with different offsets in each direction allows to disambiguate
				* which edges are active from the four fetched ones.
				*/
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			// We correct the previous (-0.25, -0.125) offset we applied:
			texcoord.x += 0.25 * resolution.x;

			// The searches are bias by 1, so adjust the coords accordingly:
			texcoord.x += resolution.x;

			// Disambiguate the length added by the last step:
			texcoord.x += 2.0 * resolution.x; // Undo last step
			texcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);

			return texcoord.x;
		}

		float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			texcoord.x -= 0.25 * resolution.x;
			texcoord.x -= resolution.x;
			texcoord.x -= 2.0 * resolution.x;
			texcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );

			return texcoord.x;
		}

		float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y -= 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y; // WebGL port note: Changed sign
			texcoord.y -= 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y += 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y; // WebGL port note: Changed sign
			texcoord.y += 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {
			// Rounding prevents precision errors of bilinear filtering:
			vec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;

			// We do a scale and bias for mapping to texel space:
			texcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );

			// Move to proper place, according to the subpixel offset:
			texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;

			return texture2D( areaTex, texcoord, 0.0 ).rg;
		}

		vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {
			vec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );

			vec2 e = texture2D( edgesTex, texcoord ).rg;

			if ( e.g > 0.0 ) { // Edge at north
				vec2 d;

				// Find the distance to the left:
				vec2 coords;
				coords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );
				coords.y = offset[ 1 ].y; // offset[1].y = texcoord.y - 0.25 * resolution.y (@CROSSING_OFFSET)
				d.x = coords.x;

				// Now fetch the left crossing edges, two at a time using bilinear
				// filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to
				// discern what value each edge has:
				float e1 = texture2D( edgesTex, coords, 0.0 ).r;

				// Find the distance to the right:
				coords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );
				d.y = coords.x;

				// We want the distances to be in pixel units (doing this here allow to
				// better interleave arithmetic and memory accesses):
				d = d / resolution.x - pixcoord.x;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the right crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;

				// Ok, we know how this pattern looks like, now it is time for getting
				// the actual area:
				weights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );
			}

			if ( e.r > 0.0 ) { // Edge at west
				vec2 d;

				// Find the distance to the top:
				vec2 coords;

				coords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );
				coords.x = offset[ 0 ].x; // offset[1].x = texcoord.x - 0.25 * resolution.x;
				d.x = coords.y;

				// Fetch the top crossing edges:
				float e1 = texture2D( edgesTex, coords, 0.0 ).g;

				// Find the distance to the bottom:
				coords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );
				d.y = coords.y;

				// We want the distances to be in pixel units:
				d = d / resolution.y - pixcoord.y;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the bottom crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;

				// Get the area for this direction:
				weights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );
			}

			return weights;
		}

		void main() {

			gl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );

		}`},Dl={uniforms:{tDiffuse:{value:null},tColor:{value:null},resolution:{value:new We(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		void SMAANeighborhoodBlendingVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAANeighborhoodBlendingVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform sampler2D tColor;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {
			// Fetch the blending weights for current pixel:
			vec4 a;
			a.xz = texture2D( blendTex, texcoord ).xz;
			a.y = texture2D( blendTex, offset[ 1 ].zw ).g;
			a.w = texture2D( blendTex, offset[ 1 ].xy ).a;

			// Is there any blending weight with a value greater than 0.0?
			if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {
				return texture2D( colorTex, texcoord, 0.0 );
			} else {
				// Up to 4 lines can be crossing a pixel (one through each edge). We
				// favor blending by choosing the line with the maximum weight for each
				// direction:
				vec2 offset;
				offset.x = a.a > a.b ? a.a : -a.b; // left vs. right
				offset.y = a.g > a.r ? -a.g : a.r; // top vs. bottom // WebGL port note: Changed signs

				// Then we go in the direction that has the maximum weight:
				if ( abs( offset.x ) > abs( offset.y )) { // horizontal vs. vertical
					offset.y = 0.0;
				} else {
					offset.x = 0.0;
				}

				// Fetch the opposite color and lerp by hand:
				vec4 C = texture2D( colorTex, texcoord, 0.0 );
				texcoord += sign( offset ) * resolution;
				vec4 Cop = texture2D( colorTex, texcoord, 0.0 );
				float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );

				// WebGL port note: Added gamma correction
				C.xyz = pow(C.xyz, vec3(2.2));
				Cop.xyz = pow(Cop.xyz, vec3(2.2));
				vec4 mixed = mix(C, Cop, s);
				mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));

				return mixed;
			}
		}

		void main() {

			gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );

		}`};class Py extends as{constructor(){super(),this._edgesRT=new pn(1,1,{depthBuffer:!1,type:In}),this._edgesRT.texture.name="SMAAPass.edges",this._weightsRT=new pn(1,1,{depthBuffer:!1,type:In}),this._weightsRT.texture.name="SMAAPass.weights";const e=this,t=new Image;t.src=this._getAreaTexture(),t.onload=function(){e._areaTexture.needsUpdate=!0},this._areaTexture=new Gt,this._areaTexture.name="SMAAPass.area",this._areaTexture.image=t,this._areaTexture.minFilter=Cn,this._areaTexture.generateMipmaps=!1,this._areaTexture.flipY=!1;const n=new Image;n.src=this._getSearchTexture(),n.onload=function(){e._searchTexture.needsUpdate=!0},this._searchTexture=new Gt,this._searchTexture.name="SMAAPass.search",this._searchTexture.image=n,this._searchTexture.magFilter=Zt,this._searchTexture.minFilter=Zt,this._searchTexture.generateMipmaps=!1,this._searchTexture.flipY=!1,this._uniformsEdges=Un.clone(Ka.uniforms),this._materialEdges=new Ft({defines:Object.assign({},Ka.defines),uniforms:this._uniformsEdges,vertexShader:Ka.vertexShader,fragmentShader:Ka.fragmentShader}),this._uniformsWeights=Un.clone(Za.uniforms),this._uniformsWeights.tDiffuse.value=this._edgesRT.texture,this._uniformsWeights.tArea.value=this._areaTexture,this._uniformsWeights.tSearch.value=this._searchTexture,this._materialWeights=new Ft({defines:Object.assign({},Za.defines),uniforms:this._uniformsWeights,vertexShader:Za.vertexShader,fragmentShader:Za.fragmentShader}),this._uniformsBlend=Un.clone(Dl.uniforms),this._uniformsBlend.tDiffuse.value=this._weightsRT.texture,this._materialBlend=new Ft({uniforms:this._uniformsBlend,vertexShader:Dl.vertexShader,fragmentShader:Dl.fragmentShader}),this._fsQuad=new ya(null)}render(e,t,n){this._uniformsEdges.tDiffuse.value=n.texture,this._fsQuad.material=this._materialEdges,e.setRenderTarget(this._edgesRT),this.clear&&e.clear(),this._fsQuad.render(e),this._fsQuad.material=this._materialWeights,e.setRenderTarget(this._weightsRT),this.clear&&e.clear(),this._fsQuad.render(e),this._uniformsBlend.tColor.value=n.texture,this._fsQuad.material=this._materialBlend,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(),this._fsQuad.render(e))}setSize(e,t){this._edgesRT.setSize(e,t),this._weightsRT.setSize(e,t),this._materialEdges.uniforms.resolution.value.set(1/e,1/t),this._materialWeights.uniforms.resolution.value.set(1/e,1/t),this._materialBlend.uniforms.resolution.value.set(1/e,1/t)}dispose(){this._edgesRT.dispose(),this._weightsRT.dispose(),this._areaTexture.dispose(),this._searchTexture.dispose(),this._materialEdges.dispose(),this._materialWeights.dispose(),this._materialBlend.dispose(),this._fsQuad.dispose()}_getAreaTexture(){return"data:image/png;base64,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"}_getSearchTexture(){return"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII="}}const Ja={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class od extends as{constructor(){super(),this.uniforms=Un.clone(Ja.uniforms),this.material=new cg({name:Ja.name,uniforms:this.uniforms,vertexShader:Ja.vertexShader,fragmentShader:Ja.fragmentShader}),this._fsQuad=new ya(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},dt.getTransfer(this._outputColorSpace)===Tt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===rf?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===af?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===of?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===gh?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===cf?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===hf?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===lf&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const Qa={defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new We},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new Je},cameraProjectionMatrixInverse:{value:new Je},cameraWorldMatrix:{value:new Je},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new P(-1,-1,-1)},sceneBoxMax:{value:new P(1,1,1)}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		varying vec2 vUv;
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform mat4 cameraWorldMatrix;
		uniform float radius;
		uniform float distanceExponent;
		uniform float thickness;
		uniform float distanceFallOff;
		uniform float scale;
		#if SCENE_CLIP_BOX == 1
			uniform vec3 sceneBoxMin;
			uniform vec3 sceneBoxMax;
		#endif

		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
			return textureLod(tDepth, uv.xy, 0.0).DEPTH_SWIZZLING;
		}

		float fetchDepth(const ivec2 uv) {
			return texelFetch(tDepth, uv.xy, 0).DEPTH_SWIZZLING;
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
			#if NORMAL_VECTOR_TYPE == 2
				return normalize(textureLod(tNormal, uv, 0.).rgb);
			#elif NORMAL_VECTOR_TYPE == 1
				return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
			#else
				return computeNormalFromDepth(uv);
			#endif
		}

		vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleSceneDepth = getDepth(sampleUv);
			return vec3(sampleUv, sampleSceneDepth);
		}

		void main() {
			float depth = getDepth(vUv.xy);
			if (depth >= 1.0) {
				discard;
				return;
			}
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);

			float radiusToUse = radius;
			float distanceFalloffToUse = thickness;
			#if SCREEN_SPACE_RADIUS == 1
				float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
				radiusToUse *= radiusScale;
				distanceFalloffToUse *= radiusScale;
			#endif

			#if SCENE_CLIP_BOX == 1
				vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
				float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
				if (boxDistance > radiusToUse) {
					discard;
					return;
				}
			#endif

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
			vec3 tangent = normalize(vec3(randomVec.xy, 0.));
			vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
			mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

			const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
			float ao = 0.0;
			for (int i = 0; i < DIRECTIONS; ++i) {

				float angle = float(i) / float(DIRECTIONS) * PI;
				vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w);
				sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

				vec3 viewDir = normalize(-viewPos.xyz);
				vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
				vec3 sliceTangent = cross(sliceBitangent, viewDir);
				vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));

				vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
				vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));

				for (int j = 0; j < STEPS; ++j) {
					vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);

					vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
					vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					vec3 viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
					}

					sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
					sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
					}
				}

				vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
				float nx = dot(normalInSlice, sliceTangent);
				float ny = dot(normalInSlice, viewDir);
				float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
				float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
				float occlusion = nx * nxb + ny * nyb;
				ao += occlusion;
			}

			ao = clamp(ao / float(DIRECTIONS), 0., 1.);
		#if SCENE_CLIP_BOX == 1
			ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
		#endif
			ao = pow(ao, scale);

			gl_FragColor = FRAGMENT_OUTPUT;
		}`},$a={defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {
			#if PERSPECTIVE_CAMERA == 1
				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			#else
				return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		void main() {
			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},Nl={uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform float intensity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
		}`};function Iy(s=5){const e=Math.floor(s)%2===0?Math.floor(s)+1:Math.floor(s),t=Ly(e),n=t.length,i=new Uint8Array(n*4);for(let a=0;a<n;++a){const o=t[a],c=2*Math.PI*o/n,l=new P(Math.cos(c),Math.sin(c),0).normalize();i[a*4]=(l.x*.5+.5)*255,i[a*4+1]=(l.y*.5+.5)*255,i[a*4+2]=127,i[a*4+3]=255}const r=new Vo(i,e,e);return r.wrapS=Yn,r.wrapT=Yn,r.needsUpdate=!0,r}function Ly(s){const e=Math.floor(s)%2===0?Math.floor(s)+1:Math.floor(s),t=e*e,n=Array(t).fill(0);let i=Math.floor(e/2),r=e-1;for(let a=1;a<=t;){if(i===-1&&r===e?(r=e-2,i=0):(r===e&&(r=0),i<0&&(i=e-1)),n[i*e+r]!==0){r-=2,i++;continue}else n[i*e+r]=a++;r++,i--}return n}const eo={defines:{SAMPLES:16,SAMPLE_VECTORS:qf(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new We},cameraProjectionMatrixInverse:{value:new Je},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;

		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
		#if DEPTH_VALUE_SOURCE == 1
			return textureLod(tDepth, uv.xy, 0.0).a;
		#else
			return textureLod(tDepth, uv.xy, 0.0).r;
		#endif
		}

		float fetchDepth(const ivec2 uv) {
			#if DEPTH_VALUE_SOURCE == 1
				return texelFetch(tDepth, uv.xy, 0).a;
			#else
				return texelFetch(tDepth, uv.xy, 0).r;
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
									: -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
									: -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}

		void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
			vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
			float sampleDepth = getDepth(sampleUv);
			vec3 sampleNormal = getViewNormal(sampleUv);
			vec3 neighborColor = sampleTexel.rgb;
			vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);

			float normalDiff = dot(viewNormal, sampleNormal);
			float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
			float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
			float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
			float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
			float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
			float w = lumaSimilarity * depthSimilarity * normalSimilarity;

			denoised += w * neighborColor;
			totalWeight += w;
		}

		void main() {
			float depth = getDepth(vUv.xy);
			vec3 viewNormal = getViewNormal(vUv);
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);

			float totalWeight = 1.0;
			vec3 denoised = texel.rgb;
			for (int i = 0; i < SAMPLES; i++) {
				vec3 sampleDir = poissonDisk[i];
				vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
				vec2 sampleUv = vUv + offset;
				denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
			}

			if (totalWeight > 0.) {
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`};function qf(s,e,t){const n=Dy(s,e,t);let i="vec3[SAMPLES](";for(let r=0;r<s;r++){const a=n[r];i+=`vec3(${a.x}, ${a.y}, ${a.z})${r<s-1?",":")"}`}return i}function Dy(s,e,t){const n=[];for(let i=0;i<s;i++){const r=2*Math.PI*e*i/s,a=Math.pow(i/(s-1),t);n.push(new P(Math.cos(r),Math.sin(r),a))}return n}class Ny{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let n,i,r;const a=.5*(Math.sqrt(3)-1),o=(e+t)*a,c=Math.floor(e+o),l=Math.floor(t+o),h=(3-Math.sqrt(3))/6,u=(c+l)*h,f=c-u,p=l-u,m=e-f,b=t-p;let g,d;m>b?(g=1,d=0):(g=0,d=1);const x=m-g+h,_=b-d+h,v=m-1+2*h,T=b-1+2*h,A=c&255,C=l&255,D=this.perm[A+this.perm[C]]%12,w=this.perm[A+g+this.perm[C+d]]%12,S=this.perm[A+1+this.perm[C+1]]%12;let I=.5-m*m-b*b;I<0?n=0:(I*=I,n=I*I*this._dot(this.grad3[D],m,b));let z=.5-x*x-_*_;z<0?i=0:(z*=z,i=z*z*this._dot(this.grad3[w],x,_));let O=.5-v*v-T*T;return O<0?r=0:(O*=O,r=O*O*this._dot(this.grad3[S],v,T)),70*(n+i+r)}noise3d(e,t,n){let i,r,a,o;const l=(e+t+n)*.3333333333333333,h=Math.floor(e+l),u=Math.floor(t+l),f=Math.floor(n+l),p=1/6,m=(h+u+f)*p,b=h-m,g=u-m,d=f-m,x=e-b,_=t-g,v=n-d;let T,A,C,D,w,S;x>=_?_>=v?(T=1,A=0,C=0,D=1,w=1,S=0):x>=v?(T=1,A=0,C=0,D=1,w=0,S=1):(T=0,A=0,C=1,D=1,w=0,S=1):_<v?(T=0,A=0,C=1,D=0,w=1,S=1):x<v?(T=0,A=1,C=0,D=0,w=1,S=1):(T=0,A=1,C=0,D=1,w=1,S=0);const I=x-T+p,z=_-A+p,O=v-C+p,G=x-D+2*p,j=_-w+2*p,K=v-S+2*p,ee=x-1+3*p,X=_-1+3*p,de=v-1+3*p,se=h&255,ge=u&255,Ee=f&255,$e=this.perm[se+this.perm[ge+this.perm[Ee]]]%12,at=this.perm[se+T+this.perm[ge+A+this.perm[Ee+C]]]%12,et=this.perm[se+D+this.perm[ge+w+this.perm[Ee+S]]]%12,Q=this.perm[se+1+this.perm[ge+1+this.perm[Ee+1]]]%12;let $=.6-x*x-_*_-v*v;$<0?i=0:($*=$,i=$*$*this._dot3(this.grad3[$e],x,_,v));let xe=.6-I*I-z*z-O*O;xe<0?r=0:(xe*=xe,r=xe*xe*this._dot3(this.grad3[at],I,z,O));let Oe=.6-G*G-j*j-K*K;Oe<0?a=0:(Oe*=Oe,a=Oe*Oe*this._dot3(this.grad3[et],G,j,K));let we=.6-ee*ee-X*X-de*de;return we<0?o=0:(we*=we,o=we*we*this._dot3(this.grad3[Q],ee,X,de)),32*(i+r+a+o)}noise4d(e,t,n,i){const r=this.grad4,a=this.simplex,o=this.perm,c=(Math.sqrt(5)-1)/4,l=(5-Math.sqrt(5))/20;let h,u,f,p,m;const b=(e+t+n+i)*c,g=Math.floor(e+b),d=Math.floor(t+b),x=Math.floor(n+b),_=Math.floor(i+b),v=(g+d+x+_)*l,T=g-v,A=d-v,C=x-v,D=_-v,w=e-T,S=t-A,I=n-C,z=i-D,O=w>S?32:0,G=w>I?16:0,j=S>I?8:0,K=w>z?4:0,ee=S>z?2:0,X=I>z?1:0,de=O+G+j+K+ee+X,se=a[de][0]>=3?1:0,ge=a[de][1]>=3?1:0,Ee=a[de][2]>=3?1:0,$e=a[de][3]>=3?1:0,at=a[de][0]>=2?1:0,et=a[de][1]>=2?1:0,Q=a[de][2]>=2?1:0,$=a[de][3]>=2?1:0,xe=a[de][0]>=1?1:0,Oe=a[de][1]>=1?1:0,we=a[de][2]>=1?1:0,Qe=a[de][3]>=1?1:0,Rt=w-se+l,L=S-ge+l,ft=I-Ee+l,qe=z-$e+l,ze=w-at+2*l,Re=S-et+2*l,pt=I-Q+2*l,ve=z-$+2*l,Ye=w-xe+3*l,gt=S-Oe+3*l,vt=I-we+3*l,R=z-Qe+3*l,y=w-1+4*l,H=S-1+4*l,Z=I-1+4*l,ie=z-1+4*l,Y=g&255,Te=d&255,he=x&255,_e=_&255,ye=o[Y+o[Te+o[he+o[_e]]]]%32,le=o[Y+se+o[Te+ge+o[he+Ee+o[_e+$e]]]]%32,be=o[Y+at+o[Te+et+o[he+Q+o[_e+$]]]]%32,ke=o[Y+xe+o[Te+Oe+o[he+we+o[_e+Qe]]]]%32,Le=o[Y+1+o[Te+1+o[he+1+o[_e+1]]]]%32;let pe=.6-w*w-S*S-I*I-z*z;pe<0?h=0:(pe*=pe,h=pe*pe*this._dot4(r[ye],w,S,I,z));let Ne=.6-Rt*Rt-L*L-ft*ft-qe*qe;Ne<0?u=0:(Ne*=Ne,u=Ne*Ne*this._dot4(r[le],Rt,L,ft,qe));let N=.6-ze*ze-Re*Re-pt*pt-ve*ve;N<0?f=0:(N*=N,f=N*N*this._dot4(r[be],ze,Re,pt,ve));let fe=.6-Ye*Ye-gt*gt-vt*vt-R*R;fe<0?p=0:(fe*=fe,p=fe*fe*this._dot4(r[ke],Ye,gt,vt,R));let me=.6-y*y-H*H-Z*Z-ie*ie;return me<0?m=0:(me*=me,m=me*me*this._dot4(r[Le],y,H,Z,ie)),27*(h+u+f+p+m)}_dot(e,t,n){return e[0]*t+e[1]*n}_dot3(e,t,n,i){return e[0]*t+e[1]*n+e[2]*i}_dot4(e,t,n,i,r){return e[0]*t+e[1]*n+e[2]*i+e[3]*r}}class ti extends as{constructor(e,t,n=512,i=512,r,a,o){super(),this.width=n,this.height=i,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Iy(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new pn(this.width,this.height,{type:In}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new Ft({defines:Object.assign({},Qa.defines),uniforms:Un.clone(Qa.uniforms),vertexShader:Qa.vertexShader,fragmentShader:Qa.fragmentShader,blending:an,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new hg,this.normalMaterial.blending=an,this.pdMaterial=new Ft({defines:Object.assign({},eo.defines),uniforms:Un.clone(eo.uniforms),vertexShader:eo.vertexShader,fragmentShader:eo.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new Ft({defines:Object.assign({},$a.defines),uniforms:Un.clone($a.uniforms),vertexShader:$a.vertexShader,fragmentShader:$a.fragmentShader,blending:an}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new Ft({uniforms:Un.clone(Ss.uniforms),vertexShader:Ss.vertexShader,fragmentShader:Ss.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:oc,blendDst:Yr,blendEquation:ii,blendSrcAlpha:ac,blendDstAlpha:Yr,blendEquationAlpha:ii}),this.blendMaterial=new Ft({uniforms:Un.clone(Nl.uniforms),vertexShader:Nl.vertexShader,fragmentShader:Nl.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:nf,blendSrc:oc,blendDst:Yr,blendEquation:ii,blendSrcAlpha:ac,blendDstAlpha:Yr,blendEquationAlpha:ii}),this._fsQuad=new ya(null),this._originalClearColor=new De,this.setGBuffer(r?r.depthTexture:void 0,r?r.normalTexture:void 0),a!==void 0&&this.updateGtaoMaterial(a),o!==void 0&&this.updatePdMaterial(o)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new Lh,this.depthTexture.format=fr,this.depthTexture.type=dr,this.normalRenderTarget=new pn(this.width,this.height,{minFilter:Zt,magFilter:Zt,type:In,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);const n=this.normalTexture?1:0,i=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=n,this.gtaoMaterial.defines.DEPTH_SWIZZLING=i,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=n,this.pdMaterial.defines.DEPTH_SWIZZLING=i,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=qf(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,n){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case ti.OUTPUT.Off:break;case ti.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=an,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case ti.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=an,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case ti.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=an,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case ti.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case ti.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=an,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case ti.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=an,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}_renderPass(e,t,n,i,r){e.getClearColor(this._originalClearColor);const a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,i!=null&&(e.setClearColor(i),e.setClearAlpha(r||0),e.clear()),this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_renderOverride(e,t,n,i,r){e.getClearColor(this._originalClearColor);const a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,i=t.clearColor||i,r=t.clearAlpha||r,i!=null&&(e.setClearColor(i),e.setClearAlpha(r||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(a)}_overrideVisibility(){const e=this.scene,t=this._visibilityCache;e.traverse(function(n){(n.isPoints||n.isLine||n.isLine2)&&n.visible&&(n.visible=!1,t.push(n))})}_restoreVisibility(){const e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){const t=new Ny,n=e*e*4,i=new Uint8Array(n);for(let a=0;a<e;a++)for(let o=0;o<e;o++){const c=a,l=o;i[(a*e+o)*4]=(t.noise(c,l)*.5+.5)*255,i[(a*e+o)*4+1]=(t.noise(c+e,l)*.5+.5)*255,i[(a*e+o)*4+2]=(t.noise(c,l+e)*.5+.5)*255,i[(a*e+o)*4+3]=(t.noise(c+e,l+e)*.5+.5)*255}const r=new Vo(i,e,e,zn,hi);return r.wrapS=Yn,r.wrapT=Yn,r.needsUpdate=!0,r}}ti.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};function ld(s,e){if(e===em)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===Xc||e===_f){let t=s.getIndex();if(t===null){const a=[],o=s.getAttribute("position");if(o!==void 0){for(let c=0;c<o.count;c++)a.push(c);s.setIndex(a),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}const n=t.count-2,i=[];if(e===Xc)for(let a=1;a<=n;a++)i.push(t.getX(0)),i.push(t.getX(a)),i.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(i.push(t.getX(a)),i.push(t.getX(a+1)),i.push(t.getX(a+2))):(i.push(t.getX(a+2)),i.push(t.getX(a+1)),i.push(t.getX(a)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=s.clone();return r.setIndex(i),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}class Oy extends Tr{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new ky(t)}),this.register(function(t){return new Hy(t)}),this.register(function(t){return new Zy(t)}),this.register(function(t){return new Jy(t)}),this.register(function(t){return new Qy(t)}),this.register(function(t){return new Gy(t)}),this.register(function(t){return new Wy(t)}),this.register(function(t){return new Xy(t)}),this.register(function(t){return new qy(t)}),this.register(function(t){return new zy(t)}),this.register(function(t){return new Yy(t)}),this.register(function(t){return new Vy(t)}),this.register(function(t){return new Ky(t)}),this.register(function(t){return new jy(t)}),this.register(function(t){return new Fy(t)}),this.register(function(t){return new $y(t)}),this.register(function(t){return new e_(t)})}load(e,t,n,i){const r=this;let a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){const l=Qr.extractUrlBase(e);a=Qr.resolveURL(l,this.path)}else a=Qr.extractUrlBase(e);this.manager.itemStart(e);const o=function(l){i?i(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},c=new Bf(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{r.parse(l,a,function(h){t(h),r.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r;const a={},o={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===Yf){try{a[ht.KHR_BINARY_GLTF]=new t_(e)}catch(u){i&&i(u);return}r=JSON.parse(a[ht.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const l=new p_(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const u=this.pluginCallbacks[h](l);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[u.name]=u,a[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){const u=r.extensionsUsed[h],f=r.extensionsRequired||[];switch(u){case ht.KHR_MATERIALS_UNLIT:a[u]=new By;break;case ht.KHR_DRACO_MESH_COMPRESSION:a[u]=new n_(r,this.dracoLoader);break;case ht.KHR_TEXTURE_TRANSFORM:a[u]=new i_;break;case ht.KHR_MESH_QUANTIZATION:a[u]=new s_;break;default:f.indexOf(u)>=0&&o[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}l.setExtensions(a),l.setPlugins(o),l.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}}function Uy(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}const ht={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class Fy{constructor(e){this.parser=e,this.name=ht.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let l;const h=new De(16777215);c.color!==void 0&&h.setRGB(c.color[0],c.color[1],c.color[2],mn);const u=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new Po(h),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new Fn(h),l.distance=u;break;case"spot":l=new va(h),l.distance=u,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),fi(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),i=Promise.resolve(l),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],o=(r.extensions&&r.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(c){return n._getNodeRef(t.cache,o,c)})}}class By{constructor(){this.name=ht.KHR_MATERIALS_UNLIT}getMaterialType(){return Pn}extendParams(e,t,n){const i=[];e.color=new De(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const a=r.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],mn),e.opacity=a[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,Xt))}return Promise.all(i)}}class zy{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}}class ky{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Si}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){const o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new We(o,o)}return Promise.all(r)}}class Hy{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Si}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}}class Vy{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Si}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(r)}}class Gy{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Si}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new De(0,0,0),t.sheenRoughness=0,t.sheen=1;const a=i.extensions[this.name];if(a.sheenColorFactor!==void 0){const o=a.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],mn)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture,Xt)),a.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(r)}}class Wy{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Si}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(r)}}class Xy{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Si}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;const o=a.attenuationColor||[1,1,1];return t.attenuationColor=new De().setRGB(o[0],o[1],o[2],mn),Promise.all(r)}}class qy{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Si}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}}class Yy{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Si}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));const o=a.specularColorFactor||[1,1,1];return t.specularColor=new De().setRGB(o[0],o[1],o[2],mn),a.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture,Xt)),Promise.all(r)}}class jy{constructor(e){this.parser=e,this.name=ht.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Si}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(r)}}class Ky{constructor(e){this.parser=e,this.name=ht.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Si}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(r)}}class Zy{constructor(e){this.parser=e,this.name=ht.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const r=i.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,a)}}class Jy{constructor(e){this.parser=e,this.name=ht.EXT_TEXTURE_WEBP}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=i.images[a.source];let c=n.textureLoader;if(o.uri){const l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return n.loadTextureImage(e,a.source,c)}}class Qy{constructor(e){this.parser=e,this.name=ht.EXT_TEXTURE_AVIF}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=i.images[a.source];let c=n.textureLoader;if(o.uri){const l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return n.loadTextureImage(e,a.source,c)}}class $y{constructor(e){this.name=ht.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(o){const c=i.byteOffset||0,l=i.byteLength||0,h=i.count,u=i.byteStride,f=new Uint8Array(o,c,l);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(h,u,f,i.mode,i.filter).then(function(p){return p.buffer}):a.ready.then(function(){const p=new ArrayBuffer(h*u);return a.decodeGltfBuffer(new Uint8Array(p),h,u,f,i.mode,i.filter),p})})}else return null}}class e_{constructor(e){this.name=ht.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const l of i.primitives)if(l.mode!==Wn.TRIANGLES&&l.mode!==Wn.TRIANGLE_STRIP&&l.mode!==Wn.TRIANGLE_FAN&&l.mode!==void 0)return null;const a=n.extensions[this.name].attributes,o=[],c={};for(const l in a)o.push(this.parser.getDependency("accessor",a[l]).then(h=>(c[l]=h,c[l])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(l=>{const h=l.pop(),u=h.isGroup?h.children:[h],f=l[0].count,p=[];for(const m of u){const b=new Je,g=new P,d=new li,x=new P(1,1,1),_=new Lf(m.geometry,m.material,f);for(let v=0;v<f;v++)c.TRANSLATION&&g.fromBufferAttribute(c.TRANSLATION,v),c.ROTATION&&d.fromBufferAttribute(c.ROTATION,v),c.SCALE&&x.fromBufferAttribute(c.SCALE,v),_.setMatrixAt(v,b.compose(g,d,x));for(const v in c)if(v==="_COLOR_0"){const T=c[v];_.instanceColor=new Yc(T.array,T.itemSize,T.normalized)}else v!=="TRANSLATION"&&v!=="ROTATION"&&v!=="SCALE"&&m.geometry.setAttribute(v,c[v]);Bt.prototype.copy.call(_,m),this.parser.assignFinalMaterial(_),p.push(_)}return h.isGroup?(h.clear(),h.add(...p),h):p[0]}))}}const Yf="glTF",zr=12,cd={JSON:1313821514,BIN:5130562};class t_{constructor(e){this.name=ht.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,zr),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Yf)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-zr,r=new DataView(e,zr);let a=0;for(;a<i;){const o=r.getUint32(a,!0);a+=4;const c=r.getUint32(a,!0);if(a+=4,c===cd.JSON){const l=new Uint8Array(e,zr+a,o);this.content=n.decode(l)}else if(c===cd.BIN){const l=zr+a;this.body=e.slice(l,l+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class n_{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=ht.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},c={},l={};for(const h in a){const u=th[h]||h.toLowerCase();o[u]=a[h]}for(const h in e.attributes){const u=th[h]||h.toLowerCase();if(a[h]!==void 0){const f=n.accessors[e.attributes[h]],p=ar[f.componentType];l[u]=p.name,c[u]=f.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,f){i.decodeDracoFile(h,function(p){for(const m in p.attributes){const b=p.attributes[m],g=c[m];g!==void 0&&(b.normalized=g)}u(p)},o,l,mn,f)})})}}class i_{constructor(){this.name=ht.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class s_{constructor(){this.name=ht.KHR_MESH_QUANTIZATION}}class jf extends ba{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let a=0;a!==i;a++)t[a]=n[r+a];return t}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=o*2,l=o*3,h=i-t,u=(n-t)/h,f=u*u,p=f*u,m=e*l,b=m-l,g=-2*p+3*f,d=p-f,x=1-g,_=d-f+u;for(let v=0;v!==o;v++){const T=a[b+v+o],A=a[b+v+c]*h,C=a[m+v+o],D=a[m+v]*h;r[v]=x*T+_*A+g*C+d*D}return r}}const r_=new li;class a_ extends jf{interpolate_(e,t,n,i){const r=super.interpolate_(e,t,n,i);return r_.fromArray(r).normalize().toArray(r),r}}const Wn={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},ar={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},hd={9728:Zt,9729:Cn,9984:df,9985:fo,9986:jr,9987:Ni},ud={33071:$i,33648:So,10497:Yn},Ol={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},th={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},ji={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},o_={CUBICSPLINE:void 0,LINEAR:ra,STEP:sa},Ul={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function l_(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new Dh({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:zi})),s.DefaultMaterial}function ps(s,e,t){for(const n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function fi(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function c_(s,e,t){let n=!1,i=!1,r=!1;for(let l=0,h=e.length;l<h;l++){const u=e[l];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(i=!0),u.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);const a=[],o=[],c=[];for(let l=0,h=e.length;l<h;l++){const u=e[l];if(n){const f=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):s.attributes.position;a.push(f)}if(i){const f=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):s.attributes.normal;o.push(f)}if(r){const f=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):s.attributes.color;c.push(f)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c)]).then(function(l){const h=l[0],u=l[1],f=l[2];return n&&(s.morphAttributes.position=h),i&&(s.morphAttributes.normal=u),r&&(s.morphAttributes.color=f),s.morphTargetsRelative=!0,s})}function h_(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function u_(s){let e;const t=s.extensions&&s.extensions[ht.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Fl(t.attributes):e=s.indices+":"+Fl(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+Fl(s.targets[n]);return e}function Fl(s){let e="";const t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function nh(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function d_(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const f_=new Je;class p_{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Uy,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,a=-1;if(typeof navigator<"u"){const o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;const c=o.match(/Version\/(\d+)/);i=n&&c?parseInt(c[1],10):-1,r=o.indexOf("Firefox")>-1,a=r?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&a<98?this.textureLoader=new wg(this.options.manager):this.textureLoader=new Rg(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Bf(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){const o={scene:a[0][i.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:i.asset,parser:n,userData:{}};return ps(r,o,i),fi(o,i),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(o)})).then(function(){for(const c of o.scenes)c.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){const a=t[i].joints;for(let o=0,c=a.length;o<c;o++)e[a[o]].isBone=!0}for(let i=0,r=e.length;i<r;i++){const a=e[i];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),r=(a,o)=>{const c=this.associations.get(a);c!=null&&this.associations.set(o,c);for(const[l,h]of a.children.entries())r(h,o.children[l])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[ht.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(r,a){n.load(Qr.resolveURL(t.uri,i.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const a=Ol[i.type],o=ar[i.componentType],c=i.normalized===!0,l=new o(i.count*a);return Promise.resolve(new rn(l,a,c))}const r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(a){const o=a[0],c=Ol[i.type],l=ar[i.componentType],h=l.BYTES_PER_ELEMENT,u=h*c,f=i.byteOffset||0,p=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,m=i.normalized===!0;let b,g;if(p&&p!==u){const d=Math.floor(f/p),x="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+d+":"+i.count;let _=t.cache.get(x);_||(b=new l(o,d*p,i.count*p/h),_=new Qm(b,p/h),t.cache.add(x,_)),g=new Ch(_,c,f%p/h,m)}else o===null?b=new l(i.count*c):b=new l(o,f,i.count*c),g=new rn(b,c,m);if(i.sparse!==void 0){const d=Ol.SCALAR,x=ar[i.sparse.indices.componentType],_=i.sparse.indices.byteOffset||0,v=i.sparse.values.byteOffset||0,T=new x(a[1],_,i.sparse.count*d),A=new l(a[2],v,i.sparse.count*c);o!==null&&(g=new rn(g.array.slice(),g.itemSize,g.normalized)),g.normalized=!1;for(let C=0,D=T.length;C<D;C++){const w=T[C];if(g.setX(w,A[C*c]),c>=2&&g.setY(w,A[C*c+1]),c>=3&&g.setZ(w,A[C*c+2]),c>=4&&g.setW(w,A[C*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}g.normalized=m}return g})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,a=t.images[r];let o=this.textureLoader;if(a.uri){const c=n.manager.getHandler(a.uri);c!==null&&(o=c)}return this.loadTextureImage(e,r,o)}loadTextureImage(e,t,n){const i=this,r=this.json,a=r.textures[e],o=r.images[t],c=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[c])return this.textureCache[c];const l=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=a.name||o.name||"",h.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(h.name=o.uri);const f=(r.samplers||{})[a.sampler]||{};return h.magFilter=hd[f.magFilter]||Cn,h.minFilter=hd[f.minFilter]||Ni,h.wrapS=ud[f.wrapS]||Yn,h.wrapT=ud[f.wrapT]||Yn,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==Zt&&h.minFilter!==Cn,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){const n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());const a=i.images[e],o=self.URL||self.webkitURL;let c=a.uri||"",l=!1;if(a.bufferView!==void 0)c=n.getDependency("bufferView",a.bufferView).then(function(u){l=!0;const f=new Blob([u],{type:a.mimeType});return c=o.createObjectURL(f),c});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const h=Promise.resolve(c).then(function(u){return new Promise(function(f,p){let m=f;t.isImageBitmapLoader===!0&&(m=function(b){const g=new Gt(b);g.needsUpdate=!0,f(g)}),t.load(Qr.resolveURL(u,r.path),m,void 0,p)})}).then(function(u){return l===!0&&o.revokeObjectURL(c),fi(u,a),u.userData.mimeType=a.mimeType||d_(a.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){const r=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),r.extensions[ht.KHR_TEXTURE_TRANSFORM]){const o=n.extensions!==void 0?n.extensions[ht.KHR_TEXTURE_TRANSFORM]:void 0;if(o){const c=r.associations.get(a);a=r.extensions[ht.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),r.associations.set(a,c)}}return i!==void 0&&(a.colorSpace=i),e[t]=a,a})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){const o="PointsMaterial:"+n.uuid;let c=this.cache.get(o);c||(c=new la,ci.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(o,c)),n=c}else if(e.isLine){const o="LineBasicMaterial:"+n.uuid;let c=this.cache.get(o);c||(c=new Df,ci.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(o,c)),n=c}if(i||r||a){let o="ClonedMaterial:"+n.uuid+":";i&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let c=this.cache.get(o);c||(c=n.clone(),r&&(c.vertexColors=!0),a&&(c.flatShading=!0),i&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(o,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return Dh}loadMaterial(e){const t=this,n=this.json,i=this.extensions,r=n.materials[e];let a;const o={},c=r.extensions||{},l=[];if(c[ht.KHR_MATERIALS_UNLIT]){const u=i[ht.KHR_MATERIALS_UNLIT];a=u.getMaterialType(),l.push(u.extendParams(o,r,t))}else{const u=r.pbrMetallicRoughness||{};if(o.color=new De(1,1,1),o.opacity=1,Array.isArray(u.baseColorFactor)){const f=u.baseColorFactor;o.color.setRGB(f[0],f[1],f[2],mn),o.opacity=f[3]}u.baseColorTexture!==void 0&&l.push(t.assignTexture(o,"map",u.baseColorTexture,Xt)),o.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,o.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(o,"metalnessMap",u.metallicRoughnessTexture)),l.push(t.assignTexture(o,"roughnessMap",u.metallicRoughnessTexture))),a=this._invokeOne(function(f){return f.getMaterialType&&f.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(f){return f.extendMaterialParams&&f.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=ni);const h=r.alphaMode||Ul.OPAQUE;if(h===Ul.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,h===Ul.MASK&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==Pn&&(l.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new We(1,1),r.normalTexture.scale!==void 0)){const u=r.normalTexture.scale;o.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&a!==Pn&&(l.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==Pn){const u=r.emissiveFactor;o.emissive=new De().setRGB(u[0],u[1],u[2],mn)}return r.emissiveTexture!==void 0&&a!==Pn&&l.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture,Xt)),Promise.all(l).then(function(){const u=new a(o);return r.name&&(u.name=r.name),fi(u,r),t.associations.set(u,{materials:e}),r.extensions&&ps(i,u,r),u})}createUniqueName(e){const t=wt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function r(o){return n[ht.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(c){return dd(c,o,t)})}const a=[];for(let o=0,c=e.length;o<c;o++){const l=e[o],h=u_(l),u=i[h];if(u)a.push(u.promise);else{let f;l.extensions&&l.extensions[ht.KHR_DRACO_MESH_COMPRESSION]?f=r(l):f=dd(new wn,l,t),i[h]={primitive:l,promise:f},a.push(f)}}return Promise.all(a)}loadMesh(e){const t=this,n=this.json,i=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let c=0,l=a.length;c<l;c++){const h=a[c].material===void 0?l_(this.cache):this.getDependency("material",a[c].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(c){const l=c.slice(0,c.length-1),h=c[c.length-1],u=[];for(let p=0,m=h.length;p<m;p++){const b=h[p],g=a[p];let d;const x=l[p];if(g.mode===Wn.TRIANGLES||g.mode===Wn.TRIANGLE_STRIP||g.mode===Wn.TRIANGLE_FAN||g.mode===void 0)d=r.isSkinnedMesh===!0?new eg(b,x):new Kt(b,x),d.isSkinnedMesh===!0&&d.normalizeSkinWeights(),g.mode===Wn.TRIANGLE_STRIP?d.geometry=ld(d.geometry,_f):g.mode===Wn.TRIANGLE_FAN&&(d.geometry=ld(d.geometry,Xc));else if(g.mode===Wn.LINES)d=new ag(b,x);else if(g.mode===Wn.LINE_STRIP)d=new Ih(b,x);else if(g.mode===Wn.LINE_LOOP)d=new og(b,x);else if(g.mode===Wn.POINTS)d=new Co(b,x);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+g.mode);Object.keys(d.geometry.morphAttributes).length>0&&h_(d,r),d.name=t.createUniqueName(r.name||"mesh_"+e),fi(d,r),g.extensions&&ps(i,d,g),t.assignFinalMaterial(d),u.push(d)}for(let p=0,m=u.length;p<m;p++)t.associations.set(u[p],{meshes:e,primitives:p});if(u.length===1)return r.extensions&&ps(i,u[0],r),u[0];const f=new kn;r.extensions&&ps(i,f,r),t.associations.set(f,{meshes:e});for(let p=0,m=u.length;p<m;p++)f.add(u[p]);return f})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new qt(Ke.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new Xo(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),fi(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const r=i.pop(),a=i,o=[],c=[];for(let l=0,h=a.length;l<h;l++){const u=a[l];if(u){o.push(u);const f=new Je;r!==null&&f.fromArray(r.array,l*16),c.push(f)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new Ph(o,c)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,a=[],o=[],c=[],l=[],h=[];for(let u=0,f=i.channels.length;u<f;u++){const p=i.channels[u],m=i.samplers[p.sampler],b=p.target,g=b.node,d=i.parameters!==void 0?i.parameters[m.input]:m.input,x=i.parameters!==void 0?i.parameters[m.output]:m.output;b.node!==void 0&&(a.push(this.getDependency("node",g)),o.push(this.getDependency("accessor",d)),c.push(this.getDependency("accessor",x)),l.push(m),h.push(b))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c),Promise.all(l),Promise.all(h)]).then(function(u){const f=u[0],p=u[1],m=u[2],b=u[3],g=u[4],d=[];for(let _=0,v=f.length;_<v;_++){const T=f[_],A=p[_],C=m[_],D=b[_],w=g[_];if(T===void 0)continue;T.updateMatrix&&T.updateMatrix();const S=n._createAnimationTracks(T,A,C,D,w);if(S)for(let I=0;I<S.length;I++)d.push(S[I])}const x=new Kc(r,void 0,d);return fi(x,i),x})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){const a=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let c=0,l=i.weights.length;c<l;c++)o.morphTargetInfluences[c]=i.weights[c]}),a})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),a=[],o=i.children||[];for(let l=0,h=o.length;l<h;l++)a.push(n.getDependency("node",o[l]));const c=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(a),c]).then(function(l){const h=l[0],u=l[1],f=l[2];f!==null&&h.traverse(function(p){p.isSkinnedMesh&&p.bind(f,f_)});for(let p=0,m=u.length;p<m;p++)h.add(u[p]);return h})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],a=r.name?i.createUniqueName(r.name):"",o=[],c=i._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&o.push(c),r.camera!==void 0&&o.push(i.getDependency("camera",r.camera).then(function(l){return i._getNodeRef(i.cameraCache,r.camera,l)})),i._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){o.push(l)}),this.nodeCache[e]=Promise.all(o).then(function(l){let h;if(r.isBone===!0?h=new If:l.length>1?h=new kn:l.length===1?h=l[0]:h=new Bt,h!==l[0])for(let u=0,f=l.length;u<f;u++)h.add(l[u]);if(r.name&&(h.userData.name=r.name,h.name=a),fi(h,r),r.extensions&&ps(n,h,r),r.matrix!==void 0){const u=new Je;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!i.associations.has(h))i.associations.set(h,{});else if(r.mesh!==void 0&&i.meshCache.refs[r.mesh]>1){const u=i.associations.get(h);i.associations.set(h,{...u})}return i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,r=new kn;n.name&&(r.name=i.createUniqueName(n.name)),fi(r,n),n.extensions&&ps(t,r,n);const a=n.nodes||[],o=[];for(let c=0,l=a.length;c<l;c++)o.push(i.getDependency("node",a[c]));return Promise.all(o).then(function(c){for(let h=0,u=c.length;h<u;h++)r.add(c[h]);const l=h=>{const u=new Map;for(const[f,p]of i.associations)(f instanceof ci||f instanceof Gt)&&u.set(f,p);return h.traverse(f=>{const p=i.associations.get(f);p!=null&&u.set(f,p)}),u};return i.associations=l(r),r})}_createAnimationTracks(e,t,n,i,r){const a=[],o=e.name?e.name:e.uuid,c=[];ji[r.path]===ji.weights?e.traverse(function(f){f.morphTargetInfluences&&c.push(f.name?f.name:f.uuid)}):c.push(o);let l;switch(ji[r.path]){case ji.weights:l=gr;break;case ji.rotation:l=br;break;case ji.translation:case ji.scale:l=xr;break;default:n.itemSize===1?l=gr:l=xr;break}const h=i.interpolation!==void 0?o_[i.interpolation]:ra,u=this._getArrayFromAccessor(n);for(let f=0,p=c.length;f<p;f++){const m=new l(c[f]+"."+ji[r.path],t.array,u,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(m),a.push(m)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=nh(t.constructor),i=new Float32Array(t.length);for(let r=0,a=t.length;r<a;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof br?a_:jf;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function m_(s,e,t){const n=e.attributes,i=new gn;if(n.POSITION!==void 0){const o=t.json.accessors[n.POSITION],c=o.min,l=o.max;if(c!==void 0&&l!==void 0){if(i.set(new P(c[0],c[1],c[2]),new P(l[0],l[1],l[2])),o.normalized){const h=nh(ar[o.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const o=new P,c=new P;for(let l=0,h=r.length;l<h;l++){const u=r[l];if(u.POSITION!==void 0){const f=t.json.accessors[u.POSITION],p=f.min,m=f.max;if(p!==void 0&&m!==void 0){if(c.setX(Math.max(Math.abs(p[0]),Math.abs(m[0]))),c.setY(Math.max(Math.abs(p[1]),Math.abs(m[1]))),c.setZ(Math.max(Math.abs(p[2]),Math.abs(m[2]))),f.normalized){const b=nh(ar[f.componentType]);c.multiplyScalar(b)}o.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(o)}s.boundingBox=i;const a=new Mi;i.getCenter(a.center),a.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=a}function dd(s,e,t){const n=e.attributes,i=[];function r(a,o){return t.getDependency("accessor",a).then(function(c){s.setAttribute(o,c)})}for(const a in n){const o=th[a]||a.toLowerCase();o in s.attributes||i.push(r(n[a],o))}if(e.indices!==void 0&&!s.index){const a=t.getDependency("accessor",e.indices).then(function(o){s.setIndex(o)});i.push(a)}return dt.workingColorSpace!==mn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${dt.workingColorSpace}" not supported.`),fi(s,e),m_(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?c_(s,e.targets,t):s})}var Kf=(function(){var s="b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuikqbeeedddillviebeoweuec:q:Odkr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbol79IV9Rbrq;w8Wqdbk;esezu8Jjjjjbcj;eb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Radz1jjjbhwcj;abad9Uc;WFbGgocjdaocjd6EhDaicefhocbhqdnindndndnaeaq9nmbaDaeaq9RaqaDfae6Egkcsfglcl4cifcd4hxalc9WGgmTmecbhPawcjdfhsaohzinaraz9Rax6mvarazaxfgo9RcK6mvczhlcbhHinalgic9WfgOawcj;cbffhldndndndndnazaOco4fRbbaHcoG4ciGPlbedibkal9cb83ibalcwf9cb83ibxikalaoRblaoRbbgOco4gAaAciSgAE86bbawcj;cbfaifglcGfaoclfaAfgARbbaOcl4ciGgCaCciSgCE86bbalcVfaAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc7faAaCfgARbbaOciGgOaOciSgOE86bbalctfaAaOfgARbbaoRbegOco4gCaCciSgCE86bbalc91faAaCfgARbbaOcl4ciGgCaCciSgCE86bbalc4faAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc93faAaCfgARbbaOciGgOaOciSgOE86bbalc94faAaOfgARbbaoRbdgOco4gCaCciSgCE86bbalc95faAaCfgARbbaOcl4ciGgCaCciSgCE86bbalc96faAaCfgARbbaOcd4ciGgCaCciSgCE86bbalc97faAaCfgARbbaOciGgOaOciSgOE86bbalc98faAaOfgORbbaoRbigoco4gAaAciSgAE86bbalc99faOaAfgORbbaocl4ciGgAaAciSgAE86bbalc9:faOaAfgORbbaocd4ciGgAaAciSgAE86bbalcufaOaAfglRbbaociGgoaociSgoE86bbalaofhoxdkalaoRbwaoRbbgOcl4gAaAcsSgAE86bbawcj;cbfaifglcGfaocwfaAfgARbbaOcsGgOaOcsSgOE86bbalcVfaAaOfgORbbaoRbegAcl4gCaCcsSgCE86bbalc7faOaCfgORbbaAcsGgAaAcsSgAE86bbalctfaOaAfgORbbaoRbdgAcl4gCaCcsSgCE86bbalc91faOaCfgORbbaAcsGgAaAcsSgAE86bbalc4faOaAfgORbbaoRbigAcl4gCaCcsSgCE86bbalc93faOaCfgORbbaAcsGgAaAcsSgAE86bbalc94faOaAfgORbbaoRblgAcl4gCaCcsSgCE86bbalc95faOaCfgORbbaAcsGgAaAcsSgAE86bbalc96faOaAfgORbbaoRbvgAcl4gCaCcsSgCE86bbalc97faOaCfgORbbaAcsGgAaAcsSgAE86bbalc98faOaAfgORbbaoRbogAcl4gCaCcsSgCE86bbalc99faOaCfgORbbaAcsGgAaAcsSgAE86bbalc9:faOaAfgORbbaoRbrgocl4gAaAcsSgAE86bbalcufaOaAfglRbbaocsGgoaocsSgoE86bbalaofhoxekalao8Pbb83bbalcwfaocwf8Pbb83bbaoczfhokdnaiam9pmbaHcdfhHaiczfhlarao9RcL0mekkaiam6mvaoTmvdnakTmbawaPfRbbhHawcj;cbfhlashiakhOinaialRbbgzce4cbazceG9R7aHfgH86bbaiadfhialcefhlaOcufgOmbkkascefhsaohzaPcefgPad9hmbxikkcbc99arao9Radcaadca0ESEhoxlkaoaxad2fhCdnakmbadhlinaoTmlarao9Rax6mlaoaxfhoalcufglmbkaChoxekcbhmawcjdfhAinarao9Rax6miawamfRbbhHawcj;cbfhlaAhiakhOinaialRbbgzce4cbazceG9R7aHfgH86bbaiadfhialcefhlaOcufgOmbkaAcefhAaoaxfhoamcefgmad9hmbkaChokabaqad2fawcjdfakad2z1jjjb8Aawawcjdfakcufad2fadz1jjjb8Aakaqfhqaombkc9:hoxekc9:hokavcj;ebf8Kjjjjbaok;cseHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgwce0mbavc;abfcFecjez:jjjjb8AavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhDaicefgqarfhidnaeTmbcmcsawceSEhkcbhxcbhmcbhPcbhwcbhlindnaiaD9nmbc9:hoxikdndnaqRbbgoc;Ve0mbavc;abfalaocu7gscl4fcsGcitfgzydlhrazydbhzdnaocsGgHak9pmbavawasfcsGcdtfydbaxaHEhoaHThsdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkaxasfhxcdhHavawcdtfaoBdbawasfhwcehsalhOxdkdndnaHcsSmbaHc987aHamffcefhoxekaicefhoai8SbbgHcFeGhsdndnaHcu9mmbaohixekaicvfhiascFbGhscrhHdninao8SbbgOcFbGaHtasVhsaOcu9kmeaocefhoaHcrfgHc8J9hmbxdkkaocefhikasce4cbasceG9R7amfhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhHavawcdtfaoBdbcehsawcefhwalhOaohmxekdnaocpe0mbaxcefgHavawaDaocsGfRbbgocl49RcsGcdtfydbaocz6gzEhravawao9RcsGcdtfydbaHazfgAaocsGgHEhoaHThCdndnadcd9hmbabaPcetfgHax87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHaxBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfaxBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgOaxBdlaOarBdbavawazfgwcsGcdtfaoBdbalcefcsGhOawaCfhwaxhzaAaCfhxxekaxcbaiRbbgOEgzaoc;:eSgHfhraOcsGhCaOcl4hAdndnaOcs0mbarcefhoxekarhoavawaA9RcsGcdtfydbhrkdndnaCmbaocefhxxekaohxavawaO9RcsGcdtfydbhokdndnaHTmbaicefhHxekaicdfhHai8SbegscFeGhzdnascu9kmbaicofhXazcFbGhzcrhidninaH8SbbgscFbGaitazVhzascu9kmeaHcefhHaicrfgic8J9hmbkaXhHxekaHcefhHkazce4cbazceG9R7amfgmhzkdndnaAcsSmbaHhsxekaHcefhsaH8SbbgicFeGhrdnaicu9kmbaHcvfhXarcFbGhrcrhidninas8SbbgHcFbGaitarVhraHcu9kmeascefhsaicrfgic8J9hmbkaXhsxekascefhskarce4cbarceG9R7amfgmhrkdndnaCcsSmbashixekascefhias8SbbgocFeGhHdnaocu9kmbascvfhXaHcFbGhHcrhodninai8SbbgscFbGaotaHVhHascu9kmeaicefhiaocrfgoc8J9hmbkaXhixekaicefhikaHce4cbaHceG9R7amfgmhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfazBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgXazBdlaXarBdbavawaOcz6aAcsSVfgwcsGcdtfaoBdbawaCTaCcsSVfhwalcefcsGhOkaqcefhqavc;abfaOcitfgOarBdlaOaoBdbavc;abfalasfcsGcitfgraoBdlarazBdbawcsGhwalaHfcsGhlaPcifgPae6mbkkcbc99aiaDSEhokavc;aef8Kjjjjbaok:flevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk;oiliui99iue99dnaeTmbcbhiabhlindndnJ;Zl81Zalcof8UebgvciV:Y:vgoal8Ueb:YNgrJb;:FSNJbbbZJbbb:;arJbbbb9GEMgw:lJbbb9p9DTmbaw:OhDxekcjjjj94hDkalclf8Uebhqalcdf8UebhkabaiavcefciGfcetfaD87ebdndnaoak:YNgwJb;:FSNJbbbZJbbb:;awJbbbb9GEMgx:lJbbb9p9DTmbax:OhDxekcjjjj94hDkabaiavciGfgkcd7cetfaD87ebdndnaoaq:YNgoJb;:FSNJbbbZJbbb:;aoJbbbb9GEMgx:lJbbb9p9DTmbax:OhDxekcjjjj94hDkabaiavcufciGfcetfaD87ebdndnJbbjZararN:tawawN:taoaoN:tgrJbbbbarJbbbb9GE:rJb;:FSNJbbbZMgr:lJbbb9p9DTmbar:Ohvxekcjjjj94hvkabakcetfav87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2gdTmbinababydbgecwtcw91:Yaece91cjjj98Gcjjj;8if::NUdbabclfhbadcufgdmbkkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaeczfheaiczfhiadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkkkebcjwklzNbb",e="b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuikqbbebeedddilve9Weeeviebeoweuec:q:6dkr;leDo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949Wbwl79IV9RbDq:p9sqlbzik9:evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaec:q:yjjbfai86bbaecitc:q1jjbfab8Piw83ibaecefgecjd9hmbkk:N8JlHud97euo978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnadcefal0mbcuhoaiRbbc:Ge9hmbavaialfgrad9Rad;8qbbcj;abad9UhlaicefhodnaeTmbadTmbalc;WFbGglcjdalcjd6EhwcbhDinawaeaD9RaDawfae6Egqcsfglc9WGgkci2hxakcethmalcl4cifcd4hPabaDad2fhsakc;ab6hzcbhHincbhOaohAdndninaraA9RaP6meavcj;cbfaOak2fhCaAaPfhocbhidnazmbarao9Rc;Gb6mbcbhlinaCalfhidndndndndnaAalco4fRbbgXciGPlbedibkaipxbbbbbbbbbbbbbbbbpklbxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklbaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklbaoczfhokdndndndndnaXcd4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklzxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklzaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklzaoczfhokdndndndndnaXcl4ciGPlbedibkaipxbbbbbbbbbbbbbbbbpklaxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spklaaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaiaopbbbpklaaoczfhokdndndndndnaXco4Plbedibkaipxbbbbbbbbbbbbbbbbpkl8WxikaiaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WaoclfaYpQbfaXc:q:yjjbfRbbfhoxdkaiaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibaXc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgXcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkl8WaocwfaYpQbfaXc:q:yjjbfRbbfhoxekaiaopbbbpkl8Waoczfhokalc;abfhialcjefak0meaihlarao9Rc;Fb0mbkkdnaiak9pmbaici4hlinarao9RcK6miaCaifhXdndndndndnaAaico4fRbbalcoG4ciGPlbedibkaXpxbbbbbbbbbbbbbbbbpkbbxikaXaopbblaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLgQcdp:meaQpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogLpxiiiiiiiiiiiiiiiip8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkbbaoclfaYpQbfaKc:q:yjjbfRbbfhoxdkaXaopbbwaopbbbgQclp:meaQpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogLpxssssssssssssssssp8JgQp5b9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibaKc:q:yjjbfpbbbgYaYpmbbbbbbbbbbbbbbbbaQp5e9cjF;8;4;W;G;ab9:9cU1:NgKcitc:q1jjbfpbibp9UpmbedilvorzHOACXQLpPaLaQp9spkbbaocwfaYpQbfaKc:q:yjjbfRbbfhoxekaXaopbbbpkbbaoczfhokalcdfhlaiczfgiak6mbkkaoTmeaohAaOcefgOclSmdxbkkc9:hoxlkdnakTmbavcjdfaHfhiavaHfpbdbhYcbhXinaiavcj;cbfaXfglpblbgLcep9TaLpxeeeeeeeeeeeeeeeegQp9op9Hp9rgLalakfpblbg8Acep9Ta8AaQp9op9Hp9rg8ApmbzeHdOiAlCvXoQrLgEalamfpblbg3cep9Ta3aQp9op9Hp9rg3alaxfpblbg5cep9Ta5aQp9op9Hp9rg5pmbzeHdOiAlCvXoQrLg8EpmbezHdiOAlvCXorQLgQaQpmbedibedibedibediaYp9UgYp9AdbbaiadfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaEa8EpmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaLa8ApmwKDYq8AkEx3m5P8Es8FgLa3a5pmwKDYq8AkEx3m5P8Es8Fg8ApmbezHdiOAlvCXorQLgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfglaYaLa8ApmwDKYqk8AExm35Ps8E8FgQaQpmbedibedibedibedip9UgYp9AdbbaladfglaYaQaQpmlvorlvorlvorlvorp9UgYp9AdbbaladfglaYaQaQpmwDqkwDqkwDqkwDqkp9UgYp9AdbbaladfglaYaQaQpmxmPsxmPsxmPsxmPsp9UgYp9AdbbaladfhiaXczfgXak6mbkkaHclfgHad6mbkasavcjdfaqad2;8qbbavavcjdfaqcufad2fad;8qbbaqaDfgDae6mbkkcbc99arao9Radcaadca0ESEhokavcj;kbf8Kjjjjbaokwbz:bjjjbk::seHu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnaeci9UgrcHfal0mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgwce0mbavc;abfcFecje;8kbavcUf9cu83ibavc8Wf9cu83ibavcyf9cu83ibavcaf9cu83ibavcKf9cu83ibavczf9cu83ibav9cu83iwav9cu83ibaialfc9WfhDaicefgqarfhidnaeTmbcmcsawceSEhkcbhxcbhmcbhPcbhwcbhlindnaiaD9nmbc9:hoxikdndnaqRbbgoc;Ve0mbavc;abfalaocu7gscl4fcsGcitfgzydlhrazydbhzdnaocsGgHak9pmbavawasfcsGcdtfydbaxaHEhoaHThsdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkaxasfhxcdhHavawcdtfaoBdbawasfhwcehsalhOxdkdndnaHcsSmbaHc987aHamffcefhoxekaicefhoai8SbbgHcFeGhsdndnaHcu9mmbaohixekaicvfhiascFbGhscrhHdninao8SbbgOcFbGaHtasVhsaOcu9kmeaocefhoaHcrfgHc8J9hmbxdkkaocefhikasce4cbasceG9R7amfhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhHavawcdtfaoBdbcehsawcefhwalhOaohmxekdnaocpe0mbaxcefgHavawaDaocsGfRbbgocl49RcsGcdtfydbaocz6gzEhravawao9RcsGcdtfydbaHazfgAaocsGgHEhoaHThCdndnadcd9hmbabaPcetfgHax87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHaxBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfaxBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgOaxBdlaOarBdbavawazfgwcsGcdtfaoBdbalcefcsGhOawaCfhwaxhzaAaCfhxxekaxcbaiRbbgOEgzaoc;:eSgHfhraOcsGhCaOcl4hAdndnaOcs0mbarcefhoxekarhoavawaA9RcsGcdtfydbhrkdndnaCmbaocefhxxekaohxavawaO9RcsGcdtfydbhokdndnaHTmbaicefhHxekaicdfhHai8SbegscFeGhzdnascu9kmbaicofhXazcFbGhzcrhidninaH8SbbgscFbGaitazVhzascu9kmeaHcefhHaicrfgic8J9hmbkaXhHxekaHcefhHkazce4cbazceG9R7amfgmhzkdndnaAcsSmbaHhsxekaHcefhsaH8SbbgicFeGhrdnaicu9kmbaHcvfhXarcFbGhrcrhidninas8SbbgHcFbGaitarVhraHcu9kmeascefhsaicrfgic8J9hmbkaXhsxekascefhskarce4cbarceG9R7amfgmhrkdndnaCcsSmbashixekascefhias8SbbgocFeGhHdnaocu9kmbascvfhXaHcFbGhHcrhodninai8SbbgscFbGaotaHVhHascu9kmeaicefhiaocrfgoc8J9hmbkaXhixekaicefhikaHce4cbaHceG9R7amfgmhokdndnadcd9hmbabaPcetfgHaz87ebaHclfao87ebaHcdfar87ebxekabaPcdtfgHazBdbaHcwfaoBdbaHclfarBdbkcdhsavawcdtfazBdbavawcefgwcsGcdtfarBdbcihHavc;abfalcitfgXazBdlaXarBdbavawaOcz6aAcsSVfgwcsGcdtfaoBdbawaCTaCcsSVfhwalcefcsGhOkaqcefhqavc;abfaOcitfgOarBdlaOaoBdbavc;abfalasfcsGcitfgraoBdlarazBdbawcsGhwalaHfcsGhlaPcifgPae6mbkkcbc99aiaDSEhokavc;aef8Kjjjjbaok:flevu8Jjjjjbcz9Rhvc9:hodnaecvfal0mbcuhoaiRbbc;:eGc;qe9hmbav9cb83iwaicefhraialfc98fhwdnaeTmbdnadcdSmbcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcdtfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfglBdbaoalBdbaDcefgDae9hmbxdkkcbhDindnaraw6mbc9:skarcefhoar8SbbglcFeGhidndnalcu9mmbaohrxekarcvfhraicFbGhicrhldninao8SbbgdcFbGaltaiVhiadcu9kmeaocefhoalcrfglc8J9hmbxdkkaocefhrkabaDcetfaic8Etc8F91aicd47avcwfaiceGcdtVgoydbfgl87ebaoalBdbaDcefgDae9hmbkkcbc99arawSEhokaok:wPliuo97eue978Jjjjjbca9Rhiaec98Ghldndnadcl9hmbdnalTmbcbhvabhdinadadpbbbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDpxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbadczfhdavclfgval6mbkkalaeSmeaipxbbbbbbbbbbbbbbbbgqpklbaiabalcdtfgdaeciGglcdtgv;8qbbdnalTmbaiaipblbgocKp:RecKp:Sep;6egraocwp:RecKp:Sep;6earp;Geaoczp:RecKp:Sep;6egwp;Gep;Kep;LegDaqp:2egqarpxbbbjbbbjbbbjbbbjgkp9op9rp;Kegrpxbb;:9cbb;:9cbb;:9cbb;:9cararp;MeaDaDp;Meawaqawakp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFbbbFbbbFbbbFbbbp9oaopxbbbFbbbFbbbFbbbFp9op9qarawp;Meaqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaDawp;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpklbkadaiav;8qbbskdnalTmbcbhvabhdinadczfgxaxpbbbgopxbbbbbbFFbbbbbbFFgkp9oadpbbbgDaopmbediwDqkzHOAKY8AEgwczp:Reczp:Sep;6egraDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eawczp:Sep;6egwp;Gearp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegrpxb;:FSb;:FSb;:FSb;:FSararp;Meaoaop;Meawaqawamp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFFbbFFbbFFbbFFbbp9oaoawp;Meaqp;Keczp:Rep9qgoarawp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogrpmwDKYqk8AExm35Ps8E8Fp9qpkbbadaDakp9oaoarpmbezHdiOAlvCXorQLp9qpkbbadcafhdavclfgval6mbkkalaeSmbaiaeciGgvcitgdfcbcaad9R;8kbaiabalcitfglad;8qbbdnavTmbaiaipblzgopxbbbbbbFFbbbbbbFFgkp9oaipblbgDaopmbediwDqkzHOAKY8AEgwczp:Reczp:Sep;6egraDaopmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eawczp:Sep;6egwp;Gearp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egqarpxbbbjbbbjbbbjbbbjgmp9op9rp;Kegrpxb;:FSb;:FSb;:FSb;:FSararp;Meaoaop;Meawaqawamp9op9rp;Kegrarp;Mep;Kep;Kep;Jep;Negwp;Mepxbbn0bbn0bbn0bbn0gqp;KepxFFbbFFbbFFbbFFbbp9oaoawp;Meaqp;Keczp:Rep9qgoarawp;Meaqp;KepxFFbbFFbbFFbbFFbbp9ogrpmwDKYqk8AExm35Ps8E8Fp9qpklzaiaDakp9oaoarpmbezHdiOAlvCXorQLp9qpklbkalaiad;8qbbkk;4wllue97euv978Jjjjjbc8W9Rhidnaec98GglTmbcbhvabhoinaiaopbbbgraoczfgwpbbbgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklbaopxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaDakp;Mearp;Keamp9oaqakp;Mearp;Keczp:Rep9qgkpmbezHdiOAlvCXorQLgrp5baipblbpEb:T:j83ibaocwfarp5eaipblbpEe:T:j83ibawaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblbpEd:T:j83ibaocKfakp5eaipblbpEi:T:j83ibaocafhoavclfgval6mbkkdnalaeSmbaiaeciGgvcitgofcbcaao9R;8kbaiabalcitfgwao;8qbbdnavTmbaiaipblbgraipblzgDpmlvorxmPsCXQL358E8Fgqczp:Segkclp:RepklaaipxbbjZbbjZbbjZbbjZpx;Zl81Z;Zl81Z;Zl81Z;Zl81Zakpxibbbibbbibbbibbbp9qp;6ep;NegkaraDpmbediwDqkzHOAKY8AEgrczp:Reczp:Sep;6ep;MegDaDp;Meakarczp:Sep;6ep;Megxaxp;Meakaqczp:Reczp:Sep;6ep;Megqaqp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jepxb;:FSb;:FSb;:FSb;:FSgkp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbgmp9oaxakp;Mearp;Keczp:Rep9qgxaDakp;Mearp;Keamp9oaqakp;Mearp;Keczp:Rep9qgkpmbezHdiOAlvCXorQLgrp5baipblapEb:T:j83ibaiarp5eaipblapEe:T:j83iwaiaxakpmwDKYqk8AExm35Ps8E8Fgkp5baipblapEd:T:j83izaiakp5eaipblapEi:T:j83iKkawaiao;8qbbkk:Pddiue978Jjjjjbc;ab9Rhidnadcd4ae2glc98GgvTmbcbheabhdinadadpbbbgocwp:Recwp:Sep;6eaocep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepkbbadczfhdaeclfgeav6mbkkdnavalSmbaialciGgecdtgdVcbc;abad9R;8kbaiabavcdtfgvad;8qbbdnaeTmbaiaipblbgocwp:Recwp:Sep;6eaocep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepklbkavaiad;8qbbkk9teiucbcbydj1jjbgeabcifc98GfgbBdj1jjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkkebcjwklz:Dbb",t=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),n=new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);if(typeof WebAssembly!="object")return{supported:!1};var i=WebAssembly.validate(t)?o(e):o(s),r,a=WebAssembly.instantiate(i,{}).then(function(d){r=d.instance,r.exports.__wasm_call_ctors()});function o(d){for(var x=new Uint8Array(d.length),_=0;_<d.length;++_){var v=d.charCodeAt(_);x[_]=v>96?v-97:v>64?v-39:v+4}for(var T=0,_=0;_<d.length;++_)x[T++]=x[_]<60?n[x[_]]:(x[_]-60)*64+x[++_];return x.buffer.slice(0,T)}function c(d,x,_,v,T,A,C){var D=d.exports.sbrk,w=v+3&-4,S=D(w*T),I=D(A.length),z=new Uint8Array(d.exports.memory.buffer);z.set(A,I);var O=x(S,v,T,I,A.length);if(O==0&&C&&C(S,w,T),_.set(z.subarray(S,S+v*T)),D(S-D(0)),O!=0)throw new Error("Malformed buffer data: "+O)}var l={NONE:"",OCTAHEDRAL:"meshopt_decodeFilterOct",QUATERNION:"meshopt_decodeFilterQuat",EXPONENTIAL:"meshopt_decodeFilterExp"},h={ATTRIBUTES:"meshopt_decodeVertexBuffer",TRIANGLES:"meshopt_decodeIndexBuffer",INDICES:"meshopt_decodeIndexSequence"},u=[],f=0;function p(d){var x={object:new Worker(d),pending:0,requests:{}};return x.object.onmessage=function(_){var v=_.data;x.pending-=v.count,x.requests[v.id][v.action](v.value),delete x.requests[v.id]},x}function m(d){for(var x="self.ready = WebAssembly.instantiate(new Uint8Array(["+new Uint8Array(i)+"]), {}).then(function(result) { result.instance.exports.__wasm_call_ctors(); return result.instance; });self.onmessage = "+g.name+";"+c.toString()+g.toString(),_=new Blob([x],{type:"text/javascript"}),v=URL.createObjectURL(_),T=u.length;T<d;++T)u[T]=p(v);for(var T=d;T<u.length;++T)u[T].object.postMessage({});u.length=d,URL.revokeObjectURL(v)}function b(d,x,_,v,T){for(var A=u[0],C=1;C<u.length;++C)u[C].pending<A.pending&&(A=u[C]);return new Promise(function(D,w){var S=new Uint8Array(_),I=++f;A.pending+=d,A.requests[I]={resolve:D,reject:w},A.object.postMessage({id:I,count:d,size:x,source:S,mode:v,filter:T},[S.buffer])})}function g(d){var x=d.data;if(!x.id)return self.close();self.ready.then(function(_){try{var v=new Uint8Array(x.count*x.size);c(_,_.exports[x.mode],v,x.count,x.size,x.source,_.exports[x.filter]),self.postMessage({id:x.id,count:x.count,action:"resolve",value:v},[v.buffer])}catch(T){self.postMessage({id:x.id,count:x.count,action:"reject",value:T})}})}return{ready:a,supported:!0,useWorkers:function(d){m(d)},decodeVertexBuffer:function(d,x,_,v,T){c(r,r.exports.meshopt_decodeVertexBuffer,d,x,_,v,r.exports[l[T]])},decodeIndexBuffer:function(d,x,_,v){c(r,r.exports.meshopt_decodeIndexBuffer,d,x,_,v)},decodeIndexSequence:function(d,x,_,v){c(r,r.exports.meshopt_decodeIndexSequence,d,x,_,v)},decodeGltfBuffer:function(d,x,_,v,T,A){c(r,r.exports[h[T]],d,x,_,v,r.exports[l[A]])},decodeGltfBufferAsync:function(d,x,_,v,T){return u.length>0?b(d,x,_,h[v],l[T]):a.then(function(){var A=new Uint8Array(d*x);return c(r,r.exports[h[v]],A,d,x,_,r.exports[l[T]]),A})}}})();function g_(s){const e=new Map,t=new Map,n=s.clone();return Zf(s,n,function(i,r){e.set(r,i),t.set(i,r)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;const r=i,a=e.get(i),o=a.skeleton.bones;r.skeleton=a.skeleton.clone(),r.bindMatrix.copy(a.bindMatrix),r.skeleton.bones=o.map(function(c){return t.get(c)}),r.bind(r.skeleton,r.bindMatrix)}),n}function Zf(s,e,t){t(s,e);for(let n=0;n<s.children.length;n++)Zf(s.children[n],e.children[n],t)}const J=globalThis.__LS_BASE__||"/Lost-signal-/",Jf=new Oy;Jf.setMeshoptDecoder(Kf);const b_={environment:`${J}assets/blender/bunker_environment_v3.glb`,desk:`${J}assets/blender/desk_station.glb`,radio:`${J}assets/blender/radio.glb`,cctv:`${J}assets/blender/cctv_console_v2.glb`,vault:`${J}assets/blender/gun_vault_v2.glb`,rifle:`${J}assets/blender/hunting_rifle.glb`,armory:`${J}assets/blender/walk_in_armory_v1.glb`,generator:`${J}assets/blender/generator.glb`,bed:`${J}assets/blender/bed.glb`,chair:`${J}assets/blender/chair.glb`,storage:`${J}assets/blender/storage_rack.glb`,blastDoor:`${J}assets/blender/blast_door_v2.glb`,pipes:`${J}assets/blender/pipe_cluster.glb`,ceilingLight:`${J}assets/blender/ceiling_light.glb`,ventilation:`${J}assets/blender/ventilation_unit_v3.glb`,electrical:`${J}assets/blender/electrical_wall_v3.glb`,lockers:`${J}assets/blender/locker_bank_v3.glb`,bench:`${J}assets/blender/maintenance_bench_v3.glb`,clutter:`${J}assets/blender/survival_clutter_v3.glb`,statusBoard:`${J}assets/blender/status_board_v3.glb`,accessControl:`${J}assets/blender/access_control_v3.glb`,wallCamera:`${J}assets/blender/wall_camera_v3.glb`},x_={adventurer:`${J}assets/supplied/adventurer.glb`,armoryAssault01:`${J}assets/supplied/assault_rifle_01.glb`,armoryAssault02:`${J}assets/supplied/assault_rifle_02.glb`,armoryAssault03:`${J}assets/supplied/assault_rifle_03.glb`,armoryBayonet:`${J}assets/supplied/bayonet.glb`,armoryBipod:`${J}assets/supplied/bipod.glb`,armoryBullpup:`${J}assets/supplied/bullpup.glb`,armoryPistol01:`${J}assets/supplied/pistol_01.glb`,armoryPistol02:`${J}assets/supplied/pistol_02.glb`,armoryPistol03:`${J}assets/supplied/pistol_03.glb`,armoryPistol04:`${J}assets/supplied/pistol_04.glb`,armoryRevolver01:`${J}assets/supplied/revolver_01.glb`,armoryRevolver02:`${J}assets/supplied/revolver_02.glb`,armoryRevolver03:`${J}assets/supplied/revolver_03.glb`,armoryScope:`${J}assets/supplied/scope.glb`,armoryShotgunSawed:`${J}assets/supplied/shotgun_sawed_off.glb`,armoryShotgunShort:`${J}assets/supplied/shotgun_short_stock.glb`,armoryShotgun01:`${J}assets/supplied/shotgun_01.glb`,armoryShotgun02:`${J}assets/supplied/shotgun_02.glb`,armorySniper01:`${J}assets/supplied/sniper_rifle_01.glb`,armorySniper02:`${J}assets/supplied/sniper_rifle_02.glb`,armorySniper03:`${J}assets/supplied/sniper_rifle_03.glb`,armorySniper04:`${J}assets/supplied/sniper_rifle_04.glb`,armorySmg01:`${J}assets/supplied/submachine_gun_01.glb`,armorySmg02:`${J}assets/supplied/submachine_gun_02.glb`,armoryTripod:`${J}assets/supplied/tripod.glb`},v_={armoryAkm:`${J}assets/supplied/akm.glb`,armoryMossberg:`${J}assets/supplied/mossberg_590a1.glb`,armoryGlock:`${J}assets/supplied/glock_19.glb`,armoryCombatKnife:`${J}assets/supplied/combat_knife.glb`,solarArray:`${J}assets/supplied/solar_array.glb`,deadTree01:`${J}assets/supplied/dead_tree_01.glb`,deadTree02:`${J}assets/supplied/dead_tree_02.glb`,deadTree03:`${J}assets/supplied/dead_tree_03.glb`,deadTree04:`${J}assets/supplied/dead_tree_04.glb`,deadTree05:`${J}assets/supplied/dead_tree_05.glb`,propBarrel:`${J}assets/supplied/prop_barrel.glb`,propContainer:`${J}assets/supplied/prop_container.glb`,propContainerRed:`${J}assets/supplied/prop_container_red.glb`,propPallet:`${J}assets/supplied/prop_pallet.glb`,propPalletBroken:`${J}assets/supplied/prop_pallet_broken.glb`,propCinderBlock:`${J}assets/supplied/prop_cinder_block.glb`,propPipes:`${J}assets/supplied/prop_pipes.glb`,propBarrier:`${J}assets/supplied/prop_barrier.glb`,propCone:`${J}assets/supplied/prop_cone.glb`,propStreetLight:`${J}assets/supplied/prop_street_light.glb`,propTownSign:`${J}assets/supplied/prop_town_sign.glb`,propWaterTower:`${J}assets/supplied/prop_water_tower.glb`,propWheels:`${J}assets/supplied/prop_wheels.glb`,propTrashBags:`${J}assets/supplied/prop_trash_bags.glb`,propChest:`${J}assets/supplied/prop_chest.glb`,propTruck:`${J}assets/supplied/prop_truck.glb`,soldier:`${J}assets/supplied/soldier.glb`,germanShepherd:`${J}assets/supplied/german_shepherd.glb`,survivalFirstAid:`${J}assets/supplied/survival_first_aid_kit.glb`,survivalWaterBottle:`${J}assets/supplied/survival_water_bottle.glb`,survivalGasCan:`${J}assets/supplied/survival_gas_can.glb`,survivalBattery:`${J}assets/supplied/survival_battery.glb`,survivalCan:`${J}assets/supplied/survival_can.glb`,survivalPot:`${J}assets/supplied/survival_pot.glb`,survivalPan:`${J}assets/supplied/survival_pan.glb`,survivalBackpack:`${J}assets/supplied/survival_backpack.glb`,survivalTorch:`${J}assets/supplied/survival_torch.glb`,survivalMatchbox:`${J}assets/supplied/survival_matchbox.glb`,survivalPropaneTank:`${J}assets/supplied/survival_propane_tank.glb`,survivalShovel:`${J}assets/supplied/survival_shovel.glb`,survivalAxe:`${J}assets/supplied/survival_axe.glb`,survivalRadio:`${J}assets/supplied/survival_radio.glb`},y_={deer:`${J}assets/blender/deer_v3.glb`,rabbit:`${J}assets/blender/rabbit_v3.glb`},__={habShell:`${J}assets/blender/hab_shell_v4.glb`,habLevel:`${J}assets/blender/hab_level_v4.glb`,habStair:`${J}assets/blender/hab_stair_v4.glb`,habHydroponics:`${J}assets/blender/hab_hydroponics_v4.glb`,habCommons:`${J}assets/blender/hab_commons_v4.glb`,habSecureDoor:`${J}assets/blender/hab_secure_door_v4.glb`,habDirectory:`${J}assets/blender/hab_directory_v4.glb`,habLanding:`${J}assets/blender/hab_landing_v4.glb`,habTopLanding:`${J}assets/blender/hab_top_landing_v1.glb`,habApartment:`${J}assets/blender/hab_apartment_v4.glb`,habDoor:`${J}assets/blender/hab_door_v4.glb`,habCrown:`${J}assets/blender/hab_crown_v5.glb`,habSump:`${J}assets/blender/hab_sump_v5.glb`,habTunnel:`${J}assets/blender/hab_tunnel_v6.glb`,habBulkheadDoor:`${J}assets/blender/hab_bulkhead_door_v6.glb`,residentA:`${J}assets/blender/resident_a_v6.glb`,residentB:`${J}assets/blender/resident_b_v6.glb`,residentC:`${J}assets/blender/resident_c_v6.glb`,residentD:`${J}assets/blender/resident_d_v6.glb`,residentE:`${J}assets/blender/resident_e_v6.glb`,residentF:`${J}assets/blender/resident_f_v6.glb`,residentStillA:`${J}assets/blender/resident_still_a_v6.glb`,residentStillB:`${J}assets/blender/resident_still_b_v6.glb`,residentStillC:`${J}assets/blender/resident_still_c_v6.glb`,residentStillD:`${J}assets/blender/resident_still_d_v6.glb`,residentStillE:`${J}assets/blender/resident_still_e_v6.glb`,residentStillF:`${J}assets/blender/resident_still_f_v6.glb`,accessHatch:`${J}assets/blender/access_hatch_v3.glb`,siloCache:`${J}assets/blender/silo_cache_v3.glb`},M_={exteriorGround:`${J}assets/blender/exterior_ground_v3.glb`,exteriorEntrance:`${J}assets/blender/exterior_entrance_v3.glb`,fence:`${J}assets/blender/perimeter_fence_v3.glb`,gate:`${J}assets/blender/perimeter_gate.glb`,floodlight:`${J}assets/blender/floodlight.glb`,deadTree:`${J}assets/blender/dead_tree.glb`,remainsCovered:`${J}assets/blender/remains_covered_v1.glb`,remainsSlumped:`${J}assets/blender/remains_slumped_v1.glb`,barrier:`${J}assets/blender/concrete_barrier_v3.glb`,rubble:`${J}assets/blender/rubble_cluster_v3.glb`,rangeTarget:`${J}assets/blender/range_target_v1.glb`,distantTown:`${J}assets/blender/distant_town_v1.glb`,estateCar:`${J}assets/blender/estate_car_v1.glb`},S_="LS_ORIENT_YUP";function w_(s){const e=Bn(s,S_);if(e)return e.parent?.remove(e),s;const t=new kn;t.name="LS_LegacyOrientation",t.rotation.x=Math.PI/2,t.add(s);const n=new kn;return n.name="LS_AssetRoot",n.add(t),n}const T_=2.2,fd=new gn,to=new P;function E_(s){const e=s.geometry,t=e?.attributes?.uv;if(!t||e.userData.lsRetiled)return;e.userData.lsRetiled=!0;let n=0;for(let o=0;o<t.count;o++)if(n=Math.max(n,Math.abs(t.getX(o)),Math.abs(t.getY(o))),n>1.05)return;e.computeBoundingBox(),fd.copy(e.boundingBox),fd.getSize(to),s.updateWorldMatrix(!0,!1);const i=new P().setFromMatrixScale(s.matrixWorld),r=[to.x*i.x,to.y*i.y,to.z*i.z].sort((o,c)=>c-o),a=Ke.clamp(Math.round(Math.sqrt(r[0]*r[1])/T_),1,24);if(a!==1){for(let o=0;o<t.count;o++)t.setXY(o,t.getX(o)*a,t.getY(o)*a);t.needsUpdate=!0}}function A_(s,e={}){return s.traverse(t=>{if(!t.isMesh&&!t.isSkinnedMesh)return;t.castShadow=!0,t.receiveShadow=!0;const n=Array.isArray(t.material)?t.material:[t.material];let i=!1;for(const r of n)if(r){for(const a of["map","normalMap","roughnessMap","metalnessMap","aoMap"]){const o=r[a];o&&(i=!0,o.wrapS=Yn,o.wrapT=Yn,o.anisotropy=8,a==="map"&&(o.colorSpace=Xt))}"roughness"in r&&r.roughness==null&&(r.roughness=.65)}i&&e.retile!==!1&&E_(t)}),s}async function ih(s,e={}){const t=await Jf.loadAsync(s);return t.scene=e.legacyOrientation===!1?t.scene:w_(t.scene),A_(t.scene,e),t}async function Bl(s,e,t,n={}){await Promise.all(s.map(async([i,r])=>{e[i]=await ih(r,n),t(i)}))}async function R_(s=()=>{}){await Kf.ready;const e={},t=Object.entries(b_),n=Object.entries(M_),i=Object.entries(x_),r=t.length+n.length+i.length;let a=0;const o=c=>{a+=1,s(`Blender asset: ${c}`,a,r)};return await Promise.all([Bl(t,e,o),Bl(n,e,o),Bl(i,e,o,{legacyOrientation:!1,retile:!1})]),await Promise.all([...Object.entries({...y_,...__}).map(async([c,l])=>{try{e[c]=await ih(l)}catch(h){console.warn(`Optional asset unavailable (${c}); that part of the world stays sealed until the Blender workflow publishes it.`,h)}}),...Object.entries(v_).map(async([c,l])=>{try{e[c]=await ih(l,{legacyOrientation:!1,retile:!1})}catch(h){console.warn(`Supplied pack asset unavailable (${c}); the compound runs without it.`,h)}})]),s("Complete Blender world ready",r,r),e}function Cs(s){return g_(s.scene)}function Bn(s,e){let t=null;return s.traverse(n=>{!t&&n.name===e&&(t=n)}),t}const nn=1e-4,zl=Math.PI*2,no=s=>(s%zl+zl)%zl,io=new gn,kl=new P;class En{constructor(e=null){this.boxes=[],this.rings=[],this.arcs=[],this.orientedBoxes=[],this.bounds=e}addRing({innerRadius:e,outerRadius:t,minY:n,maxY:i,gaps:r=[],climbable:a=!1}){const o={r0:Math.min(e,t),r1:Math.max(e,t),minY:n,maxY:i,climbable:a,gaps:r.map(([c,l])=>[no(c),Math.abs(l)])};return this.rings.push(o),o}addArc({innerRadius:e,outerRadius:t,minY:n,maxY:i,centre:r,halfWidth:a,climbable:o=!1,enabled:c=!0}){const l={r0:Math.min(e,t),r1:Math.max(e,t),minY:n,maxY:i,climbable:o,enabled:c,centre:no(r),halfWidth:Math.abs(a)};return this.arcs.push(l),l}addOrientedBox({cx:e,cz:t,halfX:n,halfZ:i,rotationY:r=0,minY:a,maxY:o,climbable:c=!1,enabled:l=!0}){const h={cx:e,cz:t,halfX:Math.abs(n),halfZ:Math.abs(i),cos:Math.cos(r),sin:Math.sin(r),minY:a,maxY:o,climbable:c,enabled:l};return this.orientedBoxes.push(h),h}static _local(e,t,n){const i=t-e.cx,r=n-e.cz;return{x:i*e.cos-r*e.sin,z:i*e.sin+r*e.cos}}static _overlapsOriented(e,t,n,i){const r=En._local(e,t,n),a=Math.max(-e.halfX,Math.min(r.x,e.halfX)),o=Math.max(-e.halfZ,Math.min(r.z,e.halfZ));return(r.x-a)**2+(r.z-o)**2<=i*i+nn}static _inArc(e,t,n){let i=no(t)-e.centre;return i>Math.PI&&(i-=Math.PI*2),i<-Math.PI&&(i+=Math.PI*2),Math.abs(i)<=e.halfWidth+n}static _inGap(e,t,n){for(const[i,r]of e.gaps){if(r<=n)continue;let a=no(t)-i;if(a>Math.PI&&(a-=Math.PI*2),a<-Math.PI&&(a+=Math.PI*2),Math.abs(a)<=r-n)return!0}return!1}addObject(e,t={}){return e.updateWorldMatrix(!0,!0),io.setFromObject(e),!isFinite(io.min.x)||io.isEmpty()?null:this.addBox(io.clone(),t)}addBox(e,t={}){const{shrink:n=0,climbable:i=!1}=t;if(n&&(e.min.x+=n,e.max.x-=n,e.min.z+=n,e.max.z-=n,e.min.x>=e.max.x||e.min.z>=e.max.z)||(e.getSize(kl),kl.x<.02||kl.z<.02))return null;const r={box:e,climbable:i,enabled:t.enabled??!0};return this.boxes.push(r),r}floorAt(e,t,n,i){let r=0;for(const{box:a,climbable:o,enabled:c=!0}of this.boxes)c&&o&&(a.max.y>i||a.max.y<=r||e<a.min.x-n||e>a.max.x+n||t<a.min.z-n||t>a.max.z+n||(r=a.max.y));for(const a of this.rings){if(!a.climbable||a.maxY>i||a.maxY<=r)continue;const o=Math.hypot(e,t);o<a.r0-n||o>a.r1+n||En._inGap(a,Math.atan2(t,e),n/Math.max(o,.01))||(r=a.maxY)}for(const a of this.arcs){if(!a.enabled||!a.climbable||a.maxY>i||a.maxY<=r)continue;const o=Math.hypot(e,t);o<a.r0-n||o>a.r1+n||En._inArc(a,Math.atan2(t,e),n/Math.max(o,.01))&&(r=a.maxY)}for(const a of this.orientedBoxes)!a.enabled||!a.climbable||a.maxY>i||a.maxY<=r||En._overlapsOriented(a,e,t,n)&&(r=a.maxY);return r}resolve(e,t,n,i,r=0){let a=!1;for(let o=0;o<3;o++){let c=!1;for(const{box:l,climbable:h,enabled:u=!0}of this.boxes){if(!u||l.max.y<=n+nn||l.min.y>=i-nn||h&&l.max.y<=n+r+nn)continue;const f=Math.max(l.min.x,Math.min(e.x,l.max.x)),p=Math.max(l.min.z,Math.min(e.z,l.max.z)),m=e.x-f,b=e.z-p,g=m*m+b*b;if(!(g>=t*t)){if(g>nn){const d=Math.sqrt(g),x=t-d;e.x+=m/d*x,e.z+=b/d*x}else{const d=e.x-l.min.x,x=l.max.x-e.x,_=e.z-l.min.z,v=l.max.z-e.z,T=Math.min(d,x,_,v);T===d?e.x=l.min.x-t:T===x?e.x=l.max.x+t:T===_?e.z=l.min.z-t:e.z=l.max.z+t}c=!0,a=!0}}for(const l of this.rings){if(l.maxY<=n+nn||l.minY>=i-nn||l.climbable&&l.maxY<=n+r+nn)continue;const h=Math.hypot(e.x,e.z);if(h<l.r0-t||h>l.r1+t)continue;const u=Math.atan2(e.z,e.x);if(En._inGap(l,u,t/Math.max(h,.01)))continue;const f=h-l.r0<l.r1-h?l.r0-t:l.r1+t;f<=0||(e.x=Math.cos(u)*f,e.z=Math.sin(u)*f,c=!0,a=!0)}for(const l of this.arcs){if(!l.enabled||l.maxY<=n+nn||l.minY>=i-nn||l.climbable&&l.maxY<=n+r+nn)continue;const h=Math.hypot(e.x,e.z);if(h<l.r0-t||h>l.r1+t)continue;const u=Math.atan2(e.z,e.x);if(!En._inArc(l,u,t/Math.max(h,.01)))continue;const f=h-l.r0<l.r1-h?l.r0-t:l.r1+t;f<=0||(e.x=Math.cos(u)*f,e.z=Math.sin(u)*f,c=!0,a=!0)}for(const l of this.orientedBoxes){if(!l.enabled||l.maxY<=n+nn||l.minY>=i-nn||l.climbable&&l.maxY<=n+r+nn)continue;const h=En._local(l,e.x,e.z),u=Math.max(-l.halfX,Math.min(h.x,l.halfX)),f=Math.max(-l.halfZ,Math.min(h.z,l.halfZ)),p=h.x-u,m=h.z-f,b=p*p+m*m;if(b>=t*t)continue;let g=h.x,d=h.z;if(b>nn){const x=Math.sqrt(b),_=t-x;g+=p/x*_,d+=m/x*_}else{const x=h.x+l.halfX,_=l.halfX-h.x,v=h.z+l.halfZ,T=l.halfZ-h.z,A=Math.min(x,_,v,T);A===x?g=-l.halfX-t:A===_?g=l.halfX+t:A===v?d=-l.halfZ-t:d=l.halfZ+t}e.x=l.cx+g*l.cos+d*l.sin,e.z=l.cz-g*l.sin+d*l.cos,c=!0,a=!0}if(!c)break}if(this.bounds){const o=this.bounds,c=Ke.clamp(e.x,o.minX+t,o.maxX-t),l=Ke.clamp(e.z,o.minZ+t,o.maxZ-t);(c!==e.x||l!==e.z)&&(a=!0),e.x=c,e.z=l}return a}contains(e,t,n=0,i=.1,r=1.8){if(this.bounds){const a=this.bounds;if(e<a.minX+n||e>a.maxX-n||t<a.minZ+n||t>a.maxZ-n)return!0}for(const{box:a,enabled:o=!0}of this.boxes)if(o&&!(a.max.y<=i||a.min.y>=r)&&e>a.min.x-n&&e<a.max.x+n&&t>a.min.z-n&&t<a.max.z+n)return!0;for(const a of this.rings){if(a.climbable||a.maxY<=i||a.minY>=r)continue;const o=Math.hypot(e,t);if(!(o<a.r0-n||o>a.r1+n)&&!En._inGap(a,Math.atan2(t,e),n/Math.max(o,.01)))return!0}for(const a of this.arcs){if(!a.enabled||a.climbable||a.maxY<=i||a.minY>=r)continue;const o=Math.hypot(e,t);if(!(o<a.r0-n||o>a.r1+n)&&En._inArc(a,Math.atan2(t,e),n/Math.max(o,.01)))return!0}for(const a of this.orientedBoxes)if(!(!a.enabled||a.climbable)&&!(a.maxY<=i||a.minY>=r)&&En._overlapsOriented(a,e,t,n))return!0;return!1}}class C_{constructor(e={}){this.radius=e.radius??.34,this.standHeight=e.standHeight??1.78,this.crouchHeight=e.crouchHeight??1.14,this.eyeOffset=e.eyeOffset??-.11,this.stepHeight=e.stepHeight??.34,this.gravity=e.gravity??-18.5,this.position=new P,this.velocity=new P,this.height=this.standHeight,this.crouching=!1,this.grounded=!0,this.groundY=0,this.landingImpact=0,this.distanceWalked=0}get eyeHeight(){return this.height+this.eyeOffset}step(e,t,n,i={}){const{crouch:r=!1,jump:a=!1,jumpSpeed:o=4.4}=i,c=r?this.crouchHeight:this.standHeight;if(c>this.height){const b=this.position.y+c;!n.contains(this.position.x,this.position.z,this.radius*.9,this.position.y+this.height,b)&&(this.height=Ke.damp(this.height,c,12,e))}else this.height=Ke.damp(this.height,c,14,e);this.crouching=r;const l=this.grounded?13:2.6;this.velocity.x=Ke.damp(this.velocity.x,t.x,l,e),this.velocity.z=Ke.damp(this.velocity.z,t.z,l,e),a&&this.grounded&&(this.velocity.y=o,this.grounded=!1),this.velocity.y+=this.gravity*e;const h={x:this.position.x,z:this.position.z};this.position.x+=this.velocity.x*e,this.position.z+=this.velocity.z*e,this.position.y+=this.velocity.y*e;const u=this.position.y,f=this.position.y+this.height;n.resolve(this.position,this.radius,u,f,this.stepHeight);const p=(this.position.x-h.x)/Math.max(e,nn),m=(this.position.z-h.z)/Math.max(e,nn);return Math.abs(p)<Math.abs(this.velocity.x)&&(this.velocity.x=p),Math.abs(m)<Math.abs(this.velocity.z)&&(this.velocity.z=m),this.groundY=n.floorAt(this.position.x,this.position.z,this.radius,this.position.y+this.stepHeight),this.position.y<=this.groundY+nn?(!this.grounded&&this.velocity.y<-2.2&&(this.landingImpact=Math.min(1,-this.velocity.y/9)),this.position.y=this.groundY,this.velocity.y=0,this.grounded=!0):this.grounded=!1,this.landingImpact=Ke.damp(this.landingImpact,0,7,e),this.grounded&&(this.distanceWalked+=Math.hypot(this.position.x-h.x,this.position.z-h.z)),this}get horizontalSpeed(){return Math.hypot(this.velocity.x,this.velocity.z)}teleport(e,t,n){return this.position.set(e,t,n),this.velocity.set(0,0,0),this.grounded=!0,this.landingImpact=0,this}}new P(0,1,0);const es=new P,Hl=new P;function Qf(s,e){const t={};for(const[n,i]of Object.entries(e)){const r=Bn(s,i);r&&(t[n]={node:r,rest:r.rotation.x})}return t}function pi(s,e,t,n){e.forEach((i,r)=>{const a=s[i];a&&(a.node.rotation.x=a.rest+Math.sin(t+r*Math.PI)*n)})}class $f{constructor(e,t,n={}){this.dying=0,this.stagger=0,this.detourTimer=0,this.detourHeading=0,this.root=e,this.kind=t,this.speed=n.speed??1.6,this.turnRate=n.turnRate??2.4,this.radius=n.radius??.4,this.phase=Math.random()*Math.PI*2,this.heading=Math.random()*Math.PI*2,this.state="idle",this.timer=Math.random()*4,e.userData.kind=t,e.userData.alive=!0}get position(){return this.root.position}collapse(e){this.dying=Math.min(1,this.dying+e*2.2);const t=this.dying*this.dying*(3-2*this.dying);this.root.rotation.z=t*(Math.PI/2)*this.fallDirection,this.root.position.y=this.groundY-t*this.dropHeight;for(const n of Object.values(this.limbs||{}))n.node.rotation.x=Ke.lerp(n.node.rotation.x,n.rest+.4,e*4)}kill(){if(this.root.userData.alive===!1)return!1;this.root.userData.alive=!1,this.fallDirection=Math.random()<.5?-1:1,this.groundY=this.root.position.y;const e=new gn().setFromObject(this.root);return this.dropHeight=Math.max(0,(e.max.y-e.min.y)*.22),!0}steer(e){this.detourTimer<=0&&(this.heading=e)}advance(e,t,n){this.detourTimer>0&&(this.detourTimer-=e,this.heading=this.detourHeading);let r=(this.heading-this.root.rotation.y+Math.PI*3)%(Math.PI*2)-Math.PI;this.root.rotation.y+=Ke.clamp(r,-this.turnRate*e,this.turnRate*e),Hl.set(Math.sin(this.root.rotation.y),0,Math.cos(this.root.rotation.y)).multiplyScalar(t*e);const a=this.root.position.x+Hl.x,o=this.root.position.z+Hl.z,c=this.root.position.y+.05,l=c+(this.kind==="resident"?1.72:1.15);return n.contains(a,o,this.radius,c,l)?(this.detourTimer=.8+Math.random()*.7,this.detourHeading=this.heading+(Math.random()<.5?-1:1)*(Math.PI/2.1),0):(this.root.position.x=a,this.root.position.z=o,t)}}class P_ extends $f{constructor(e,t,n){super(e,t,n),this.limbs=Qf(e,t==="deer"?{legFL:"Deer_LegFL",legFR:"Deer_LegFR",legBL:"Deer_LegBL",legBR:"Deer_LegBR",head:"Deer_Head",neck:"Deer_Neck",tail:"Deer_Tail"}:{legFL:"Rabbit_LegFL",legFR:"Rabbit_LegFR",legBL:"Rabbit_LegBL",legBR:"Rabbit_LegBR",head:"Rabbit_Head"}),this.fleeRange=t==="deer"?11:7,this.grazeHeight=this.limbs.head?.rest??0}update(e,t,n){if(this.root.userData.alive===!1)return;this.timer-=e,es.subVectors(t,this.root.position),es.length()<this.fleeRange?(this.state="flee",this.steer(Math.atan2(-es.x,-es.z)),this.timer=2.5):this.timer<=0&&(this.state=Math.random()<.45?"graze":"wander",this.state==="wander"&&(this.heading=Math.random()*Math.PI*2),this.timer=2+Math.random()*5);const r=this.state==="flee"?this.speed*2.6:this.state==="graze"?0:this.speed,a=r>0?this.advance(e,r,n):0;if(this.phase+=a*(this.kind==="rabbit"?7:4)*e,pi(this.limbs,["legFL","legBR"],this.phase,a*.16),pi(this.limbs,["legFR","legBL"],this.phase+Math.PI,a*.16),this.limbs.head){const o=this.state==="graze"?.9:this.state==="flee"?-.18:.1;this.limbs.head.node.rotation.x=Ke.damp(this.limbs.head.node.rotation.x,this.limbs.head.rest+o,3,e)}this.limbs.tail&&(this.limbs.tail.node.rotation.x=this.limbs.tail.rest+Math.sin(this.phase*2.2)*(this.state==="flee"?.5:.12)),this.kind==="rabbit"&&(this.root.position.y=Math.max(0,Math.sin(this.phase)*.09*(a>0?1:0)))}}const sh=["Level six is out of filters again. Nobody upstairs wants to hear it.","You are the one from the shelter. We wondered if anyone was still up there.","Three hundred of us. Three hundred and one, if you are staying.","My grandmother was born on this level. She never saw the outside either.","They will not say what the secure unit is for. That is how you know.","Hydroponics is short again this quarter. We are all short this quarter.","The stair goes all the way down. Do not take it in the dark.","You get used to the hum. It is when it stops that you should worry.","Someone painted the sky on four. It is not right, but it is something.","Whatever happened up there, it happened fast. That is all anyone agrees on."];class I_ extends $f{constructor(e,t){super(e,"resident",t),this.limbs=Qf(e,{legL:"Resident_Leg_-1",legR:"Resident_Leg_1",shinL:"Resident_Shin_-1",shinR:"Resident_Shin_1",armL:"Resident_Arm_-1",armR:"Resident_Arm_1",foreL:"Resident_Forearm_-1",foreR:"Resident_Forearm_1",torso:"Resident_Torso",head:"Resident_Head"}),this.eyes=[Bn(e,"Resident_EyeWhite_-1"),Bn(e,"Resident_EyeWhite_1")].filter(Boolean),this.line=t.line??sh[0],this.homeY=t.homeY??0,this.radius=t.radius??.34,this.state="stroll",this.greeting=0,this.panic=0}alarm(e,t=1){this.panic=Math.max(this.panic,t),this.heading=Math.atan2(this.root.position.x-e.x,this.root.position.z-e.z),this.detourTimer=0,this.state="flee",this.timer=3+Math.random()*3}update(e,t,n){if(this.root.userData.alive===!1)return;es.subVectors(t,this.root.position);const i=es.length(),r=Math.abs(t.y-this.root.position.y)<2.2;if(this.panic>0){this.panic=Math.max(0,this.panic-e*.28),this.timer-=e,this.greeting=0;const c=Math.atan2(this.root.position.x,this.root.position.z)+Math.PI/2,l=Math.atan2(this.root.position.x-t.x,this.root.position.z-t.z),h=Math.cos(l-c)>=0?c:c+Math.PI;this.steer(h);const u=this.advance(e,this.speed*2.35,n);this.phase+=(u>0?u*3.2:.6)*e,this.root.position.y=this.homeY,this.animate(e,u,0),this.timer<=0&&this.panic<=.05&&(this.state="stroll");return}if(this.timer-=e,i<3.4&&r?(this.state="greet",this.greeting=Math.min(1,this.greeting+e*3),this.steer(Math.atan2(es.x,es.z))):(this.greeting=Math.max(0,this.greeting-e*2),this.timer<=0&&(this.state=Math.random()<.35?"rest":"stroll",this.state==="stroll"&&(this.orbitDirection=Math.random()<.5?0:Math.PI),this.timer=3+Math.random()*7)),this.state==="stroll"){const c=Math.atan2(this.root.position.x,this.root.position.z)+Math.PI/2;this.steer(c+(this.orbitDirection||0))}const a=this.state==="stroll"?this.speed:0,o=a>0?this.advance(e,a,n):0;this.phase+=(o>0?o*2.9:.6)*e,this.root.position.y=this.homeY,this.animate(e,o,this.greeting)}animate(e,t,n){if(pi(this.limbs,["legL"],this.phase,t*.14),pi(this.limbs,["legR"],this.phase+Math.PI,t*.14),pi(this.limbs,["shinL"],this.phase+1.1,t*.07),pi(this.limbs,["shinR"],this.phase+Math.PI+1.1,t*.07),pi(this.limbs,["armL"],this.phase+Math.PI,t*.12),pi(this.limbs,["armR"],this.phase,t*.12),pi(this.limbs,["foreL"],this.phase+Math.PI,t*.045),pi(this.limbs,["foreR"],this.phase,t*.045),this.limbs.armR){const r=this.limbs.armR.rest-n*.54;this.limbs.armR.node.rotation.x=Ke.damp(this.limbs.armR.node.rotation.x,r,7,e)}if(this.limbs.foreR){const r=this.limbs.foreR.rest-n*.82;this.limbs.foreR.node.rotation.x=Ke.damp(this.limbs.foreR.node.rotation.x,r,8,e)}if(this.limbs.torso&&(this.limbs.torso.node.rotation.z=Math.sin(this.phase*.5)*.03*(t>0?1:.3)),this.limbs.head){const r=Math.sin(this.phase*.4)*.3;this.limbs.head.node.rotation.y=Ke.lerp(r,0,n),this.limbs.head.node.rotation.x=Math.sin(this.phase*.7)*.018-n*.035}const i=Math.pow(Math.max(0,Math.sin(this.phase*.53+this.root.id)),22);for(const r of this.eyes)r.scale.y=1-i*.86}}function L_(s,e,t,n){for(let i=0;i<60;i++){const r=t.minX+Math.random()*(t.maxX-t.minX),a=t.minZ+Math.random()*(t.maxZ-t.minZ);if(!s.contains(r,a,e+.5,.2,1.6)&&!n.some(o=>Math.hypot(o.x-r,o.z-a)<o.r))return{x:r,z:a}}return null}const D_=[4147794,4866104,3097666,5456703,3686735,5065274,4344388,5588032],N_=[2830134,3485739,2304556,3814703,2764083],O_=[1512208,3023128,4863526,7037529,986380,4008732],U_=[9070160,11569512,7031350,13081720,5453866,10253141];function ep(s,e){const t=(r,a)=>r[(e*7+a)%r.length],n={HabJacket:t(D_,0),HabTrouser:t(N_,3),HabHair:t(O_,5),HabSkin:t(U_,1)},i=new Map;return s.traverse(r=>{if(!r.isMesh)return;const o=(Array.isArray(r.material)?r.material:[r.material]).map(c=>{const l=c&&n[c.name];if(l===void 0)return c;let h=i.get(c.name);return h||(h=c.clone(),h.color.setHex(l),i.set(c.name,h)),h});r.material=Array.isArray(r.material)?o:o[0]}),s}const F_=["A","B","C","D","E","F"];function B_({scene:s,colliders:e,assets:t,walkable:n,count:i=20}){const r=[],a=[],o=new Map,c=F_.map(m=>t[`resident${m}`]).filter(Boolean);if(!c.length||!n?.length)return{residents:r,agents:a,byRoot:o,update:()=>{},resolvePlayer:()=>!1,agentFor:()=>null,alarm:()=>0};const l=Math.min(4,n.length);for(let m=0;m<i;m++){const b=n[n.length-1-m%l],g=m/i*Math.PI*2+Math.random()*.6,d=ep(Cs(c[m%c.length]),m);d.position.set(Math.cos(g)*b.radius,b.y,Math.sin(g)*b.radius),d.rotation.y=Math.atan2(-Math.cos(g),-Math.sin(g)),d.traverse(_=>{_.isMesh&&(_.castShadow=!0,_.receiveShadow=!0)}),s.add(d);const x=new I_(d,{speed:.85+Math.random()*.35,turnRate:2.6,homeY:b.y,line:sh[m%sh.length]});a.push(x),r.push(d),o.set(d,x),d.userData.resident=x}const h=m=>o.get(m)||null;function u(m,b=22){let g=0;for(const d of a){if(d.root.userData.alive===!1||Math.abs(d.root.position.y-m.y)>2.4)continue;const x=Math.hypot(d.root.position.x-m.x,d.root.position.z-m.z);x>b||(d.alarm(m,1-x/(b*2)),g++)}return g}function f(m,b,g){if(b!=="silo"){for(const d of a)d.dying>0&&d.dying<1&&d.collapse(m);return}for(const d of a){if(d.root.userData.alive===!1){d.dying<1&&d.collapse(m);continue}d.update(m,g,e)}for(let d=0;d<a.length;d++)if(a[d].root.userData.alive!==!1)for(let x=d+1;x<a.length;x++){if(a[x].root.userData.alive===!1)continue;const _=a[d].root.position,v=a[x].root.position;if(Math.abs(_.y-v.y)>1)continue;const T=v.x-_.x,A=v.z-_.z,C=a[d].radius+a[x].radius,D=T*T+A*A;if(D>=C*C||D<1e-6)continue;const w=Math.sqrt(D),S=(C-w)*.5;_.x-=T/w*S,_.z-=A/w*S,v.x+=T/w*S,v.z+=A/w*S}}function p(m,b=.34,g=1.78){let d=!1;for(const x of a){if(x.root.userData.alive===!1)continue;const _=x.root.position;if(Math.abs(m.y-_.y)>Math.max(1.25,g*.75))continue;let v=m.x-_.x,T=m.z-_.z;const A=b+x.radius+.04;let C=Math.hypot(v,T);if(C>=A)continue;if(C<1e-5){const w=x.root.id*1.618;v=Math.cos(w),T=Math.sin(w),C=1}const D=A-C;m.x+=v/C*D,m.z+=T/C*D,d=!0}return d&&e.resolve(m,b,m.y,m.y+g,0),d}return{residents:r,agents:a,byRoot:o,agentFor:h,alarm:u,update:f,resolvePlayer:p}}function z_({scene:s,colliders:e,assets:t,counts:n={},wildlife:i=!0}){const r=[];if(!i)return{wildlife:r,agents:[],update:()=>{}};const a=[],o=new Map,c={minX:-17.5,maxX:17.5,minZ:-24,maxZ:15.5},l=[{x:0,z:-13,r:7}],h=(m,b,g)=>{if(!m)return null;const d=L_(e,g.radius??.4,c,l);if(!d)return null;const x=Cs(m);x.position.set(d.x,0,d.z),x.rotation.y=Math.random()*Math.PI*2,x.traverse(v=>{v.isMesh&&(v.castShadow=!0,v.receiveShadow=!0)}),s.add(x);const _=new P_(x,b,g);return a.push(_),o.set(x,_),r.push(x),_};for(let m=0;m<(n.deer??3);m++)h(t.deer,"deer",{speed:1.9,radius:.55});for(let m=0;m<(n.rabbit??5);m++)h(t.rabbit,"rabbit",{speed:1.5,radius:.22,turnRate:4});function u(m){return o.get(m)||null}function f(){for(let m=0;m<a.length;m++){const b=a[m];if(b.root.userData.alive!==!1)for(let g=m+1;g<a.length;g++){const d=a[g];if(d.root.userData.alive===!1)continue;const x=d.root.position.x-b.root.position.x,_=d.root.position.z-b.root.position.z,v=b.radius+d.radius,T=x*x+_*_;if(T>=v*v||T<1e-6)continue;const A=Math.sqrt(T),C=(v-A)*.5,D=x/A,w=_/A;b.root.position.x-=D*C,b.root.position.z-=w*C,d.root.position.x+=D*C,d.root.position.z+=w*C}}}function p(m,b,g){if(b!=="outside"){for(const d of a)d.dying>0&&d.dying<1&&d.collapse(m);return}for(const d of a){if(d.root.userData.alive===!1){d.dying<1&&d.collapse(m);continue}d.update(m,g,e)}f()}return{wildlife:r,agents:a,update:p,agentFor:u,byRoot:o}}const k_={shellRadius:30.8,wellRadius:13,deckOuter:19.6,levelHeight:4,levels:7,segments:12,stairRadius:5.4,stairColumn:1.2,stairSteps:36,stairTurn:Math.PI*2,landingHalf:1.8,landingInner:1.38,apartmentBack:29.6,doorHalf:.84},Zs=Math.PI*2,kr=6,pd=1.45,so=.98,Vl=3.72,md=[{facade:3486253,accent:6371884},{facade:3159599,accent:5857348},{facade:3159610,accent:4217701},{facade:3813420,accent:7619885},{facade:3354671,accent:6114402},{facade:3094325,accent:4023645},{facade:3749164,accent:7692602},{facade:3157548,accent:7028020}];function gd(s,e){if(!s)return;const t=md[e%md.length],n=new Map,i=r=>{if(!r)return r;if(n.has(r))return n.get(r);const a=(r.name||"").toLowerCase();if(!a.includes("facade")&&!a.includes("tileband")&&!a.includes("paint"))return r;const o=r.clone();return a.includes("facade")?o.color.setHex(t.facade):a.includes("tileband")?o.color.setHex(t.accent):o.color.lerp(new De(t.facade),.18),o.roughness=Math.max(o.roughness??.7,.74),n.set(r,o),o};s.traverse(r=>{r.isMesh&&(r.material=Array.isArray(r.material)?r.material.map(i):i(r.material))})}const H_=(s,e,t,n,i,r)=>new gn(new P(s,e,t),new P(n,i,r));function V_({scene:s,colliders:e,place:t,addInteraction:n,assets:i}){if(!i.habShell||!i.habLevel||!i.habStair)return null;const{shellRadius:r,wellRadius:a,deckOuter:o,levelHeight:c,levels:l,segments:h,stairRadius:u,stairColumn:f,stairSteps:p,stairTurn:m,landingHalf:b,landingInner:g,apartmentBack:d,doorHalf:x}=k_,_=(u-f)/2,v=f+_,T=m/p*u/2*1.06,A=u+.16,C=Math.asin(b/A),D=l*c,w=(o+a)/2;s.background=new De(1183243),s.fog=new Rs(2168848,.0095),t(i.habShell,s,[0,0,0],[0,0,0],1,{world:"silo",collide:!1}),e.addRing({innerRadius:r,outerRadius:r+1.4,minY:-1,maxY:D+c*2});const S=B=>B*c,I=x/(o-.3),z=pd/(o-.3),O=b/a;function G(B,re=!0){e.addRing({innerRadius:a,outerRadius:o,minY:B-.3,maxY:B+.02,climbable:!0}),e.addRing({innerRadius:a-.1,outerRadius:a+.1,minY:B+.02,maxY:B+1.15,gaps:[[0,O]]});const E=re?Array.from({length:h},(k,V)=>[V*Zs/h,V===kr?z:I]):[];e.addRing({innerRadius:o-.45,outerRadius:o-.15,minY:B,maxY:B+2.24,gaps:E}),e.addRing({innerRadius:o-.45,outerRadius:o-.15,minY:B+2.24,maxY:B+c})}function j(B){e.addRing({innerRadius:o,outerRadius:d,minY:B-.3,maxY:B+.02,climbable:!0}),e.addRing({innerRadius:o,outerRadius:d,minY:B+c-.4,maxY:B+c}),e.addRing({innerRadius:d-.3,outerRadius:d+.3,minY:B,maxY:B+c})}function K(B,re,E,k,V,ae,oe={}){const Ue=E-re,Fe=Math.max(1,Math.ceil(Ue/.9)),lt=Ue/Fe;for(let Ct=0;Ct<Fe;Ct++){const M=re+lt*(Ct+.5);e.addOrientedBox({cx:Math.cos(B)*M,cz:Math.sin(B)*M,halfX:lt/2,halfZ:k,rotationY:-B,minY:V,maxY:ae,...oe})}}function ee(B,re,E,k,V,ae,oe={}){const Ue=Math.max(1,Math.ceil(E/.45)),Fe=E*2/Ue;for(let lt=0;lt<Ue;lt++){const Ct=-E+Fe*(lt+.5),M=B+Ct/re;e.addOrientedBox({cx:Math.cos(M)*re,cz:Math.sin(M)*re,halfX:k,halfZ:Fe/2,rotationY:-M,minY:V,maxY:ae,...oe})}}const X=(B,re)=>(B*5+re*7)%4<2,de=B=>{const re=[];for(let E=0;E<h;E++)E!==kr&&X(B,E)&&re.push(E);return re};for(let B=0;B<l;B++){const re=S(B),E=t(i.habLevel,s,[0,re,0],[0,0,0],1,{world:"silo",collide:!1});gd(E,B),G(re,!0),j(re)}for(let B=0;B<l;B++){const re=S(B),E=B*m;t(i.habStair,s,[0,re,0],[0,-E,0],1,{world:"silo",collide:!1});const k=c/p;for(let V=0;V<p;V++){const ae=E+V*m/p,oe=re+V*k+.09;e.addOrientedBox({cx:Math.cos(ae)*v,cz:Math.sin(ae)*v,halfX:_,halfZ:T,rotationY:-ae,minY:oe-.55,maxY:oe,climbable:!0});const Ue=V*m/p,Fe=Ue-m/p/2,lt=Ue+m/p/2,Ct=Math.max(Fe,C),M=Math.min(lt,m-C);if(M>Ct){const U=E+(Ct+M)/2;e.addArc({innerRadius:A-.18,outerRadius:A+.18,centre:U,halfWidth:(M-Ct)/2,minY:oe,maxY:oe+1.05})}}e.addBox(H_(-1.05,re,-1.05,f-.15,re+c,f-.15),{})}const se=[],ge=(B,re,E,k,V=!0)=>{const ae={id:se.length,color:new De(B),base:re,distance:E,position:k.clone(),active:V};return se.push(ae),ae},Ee=(o+d)/2,$e=(d-o)/2,at=[],et=[],Q=[],$=[],xe=[],Oe=[],we=new Map,Qe=new Map,Rt=new P(0,1,0),L=new As(1.95,.92,.72),ft=new As(1.95,.58,.48),qe=new Pn({transparent:!0,opacity:0,depthWrite:!1,colorWrite:!1}),ze=B=>{const re=B.root?.userData?.interaction;re&&(re.name=`${B.open?"CLOSE":"OPEN"} ${B.label}`)};function Re(B,re,E){const k=we.get(`${B}:${re}`);if(!k)return!1;k.open=!!E,k.collider.enabled=!k.open;for(const V of k.lights)V.active=k.open;return ze(k),!0}function pt(B,re){const E=Qe.get(B);if(!E)return!1;E.open=!!re,E.collider.enabled=!E.open;for(const k of E.lights)k.active=E.open;return ze(E),!0}for(let B=0;B<l;B++){const re=S(B);for(let E=0;E<h;E++){const k=E*Zs/h,V=X(B,E);if(E===kr){const Nt=-k+Math.PI/2,bt=o-.3,en=new P(Math.cos(k)*bt,re,Math.sin(k)*bt);i.habTunnel&&t(i.habTunnel,s,en.toArray(),[0,Nt,0],1,{world:"silo",collide:!1});const st=bt+Vl,jt=new P(-so,0,Vl).applyAxisAngle(Rt,Nt),cn=en.clone().add(jt);let kt=null;const Ht=Nt;i.habBulkheadDoor&&(kt=t(i.habBulkheadDoor,s,cn.toArray(),[0,Ht,0],1,{world:"silo",collide:!1}));const Jn=e.addArc({innerRadius:st-.18,outerRadius:st+.18,minY:re,maxY:re+2.32,centre:k,halfWidth:so/st}),Vn=(pd-so)/2,Zo=so+Vn;for(const Cr of[-1,1])e.addArc({innerRadius:st-.22,outerRadius:st+.22,minY:re,maxY:re+2.48,centre:k+Cr*Zo/st,halfWidth:Vn/st});for(const Cr of[-.5,.5])K((E+Cr)*Zs/h,o-.1,d,.16,re,re+c);const wi={level:B,bay:E,open:!1,root:kt,collider:Jn,closedRotation:Ht,lights:[],label:`SERVICE BULKHEAD — LEVEL ${l-B}`};Oe.push(wi),Qe.set(B,wi),kt&&n(kt,`OPEN ${wi.label}`,"silo",()=>{pt(B,!wi.open),window.dispatchEvent(new CustomEvent("lostsignal:bulkhead",{detail:{open:wi.open,level:l-B}}))}),ge(16760194,10,8.5,new P(Math.cos(k)*(bt+1.45),re+2.65,Math.sin(k)*(bt+1.45))),wi.lights.push(ge(16763281,8,9.5,new P(Math.cos(k)*(st+2.15),re+2.8,Math.sin(k)*(st+2.15)),!1)),ze(wi);continue}if(i.habApartment){const Nt=-k+Math.PI/2,bt=new P(Math.cos(k)*Ee,re,Math.sin(k)*Ee),en=t(i.habApartment,s,bt.toArray(),[0,Nt,0],1,{world:"silo",collide:!1});en.userData.home={level:B,bay:E},at.push(en);const st=new Kt(L,qe);st.name=`SofaInteraction_${B}_${E}`,st.position.set(2.6,.55,.28),en.add(st);const jt=Pr=>Pr.applyAxisAngle(Rt,Nt).add(bt),cn=jt(new P(2.6,.02,.28)),kt=jt(new P(2.6,.02,-1.6)),Ht=`QUARTERS ${String(l-B).padStart(2,"0")}-${String(E+1).padStart(2,"0")}`;n(st,`SIT ON SOFA — ${Ht}`,"silo",()=>{window.dispatchEvent(new CustomEvent("lostsignal:sofa",{detail:{seat:cn.clone(),stand:kt.clone(),yaw:Nt,unit:Ht}}))}),et.push(st),Q.push(st);const Jn=new Kt(ft,qe);Jn.name=`DiningSeatInteraction_${B}_${E}`,Jn.position.set(1,.36,-2.33),en.add(Jn);const Vn=jt(new P(1,.02,-2.33)),Zo=jt(new P(1,.02,-3.55));n(Jn,`SIT AT DINING TABLE — ${Ht}`,"silo",()=>{window.dispatchEvent(new CustomEvent("lostsignal:sofa",{detail:{seat:Vn.clone(),stand:Zo.clone(),yaw:Nt,unit:`${Ht} · DINING TABLE`}}))}),Q.push(Jn);const wi=(Pr,Tp,Ep,Ap,Rp,Cp,Pp,Ip=!1)=>{const Hh=new P(Tp,0,Ep).applyAxisAngle(Rt,Nt),Vh=e.addOrientedBox({cx:bt.x+Hh.x,cz:bt.z+Hh.z,halfX:Ap,halfZ:Rp,rotationY:Nt,minY:re+Cp,maxY:re+Pp,climbable:Ip});Vh.name=`${Pr}_${B}_${E}`,$.push(Vh)},Cr=[["hall-console",-4.36,-3.88,.5,.58,0,.84,!1],["hall-plant",4.38,-3.48,.38,.38,0,1.28,!1],["kitchen-counter",-4.43,-1.55,.46,1.15,0,1.04,!0],["kitchen-larder",-2.12,-2.2,.42,.42,0,2.1,!1],["dining-table",1,-1.45,1,.62,0,.8,!0],["dining-bench-front",1,-2.33,.96,.24,0,.49,!0],["dining-bench-back",1,-.57,.96,.24,0,.49,!0],["sofa",2.6,.42,1.06,.62,0,1.02,!0],["coffee-table",2.6,-.7,.48,.48,0,.61,!0],["living-pouf-a",.65,.55,.42,.42,0,.78,!0],["living-pouf-b",4.15,.6,.38,.38,0,.72,!0],["tub-chair",4.05,-.75,.55,.55,0,1,!0],["bookcase",4.43,-1.85,.26,.66,0,2.6,!1],["living-plant",-.55,.48,.34,.34,0,1.3,!1],["parent-bed",-2.55,3.15,1.02,1.1,0,.72,!0],["bedside-table",-1.18,2.27,.28,.28,0,.66,!0],["wardrobe",-4.25,4.52,.5,.4,0,2.2,!1],["parent-pouf",-4.05,1.95,.35,.35,0,.65,!0],["bunk-bed",2.25,3.2,1.03,1.1,0,2.35,!1],["child-desk",4.25,3.7,.38,.59,0,.8,!0],["toy-crate",.55,4.55,.36,.3,0,.46,!0]];for(const Pr of Cr)wi(...Pr)}const ae=-x+.04,oe=Math.cos(k)*(o-.28)+Math.sin(k)*ae,Ue=Math.sin(k)*(o-.28)-Math.cos(k)*ae,Fe=-k+Math.PI/2;let lt=null;i.habDoor&&(lt=t(i.habDoor,s,[oe,re,Ue],[0,Fe-(V?1.82:0),0],1,{world:"silo",collide:!1}));const Ct=o-.3,M=e.addArc({innerRadius:Ct-.18,outerRadius:Ct+.18,minY:re,maxY:re+2.22,centre:k,halfWidth:x/Ct,enabled:!V}),U={level:B,bay:E,open:V,root:lt,collider:M,closedRotation:Fe,lights:[],label:`QUARTERS ${String(l-B).padStart(2,"0")}-${String(E+1).padStart(2,"0")}`};xe.push(U),we.set(`${B}:${E}`,U),lt&&n(lt,`${V?"CLOSE":"OPEN"} ${U.label}`,"silo",()=>{Re(B,E,!U.open),window.dispatchEvent(new CustomEvent("lostsignal:quarters",{detail:{open:U.open,unit:U.label}}))});for(const[Nt,bt]of[[2.2,6],[5,8],[8.4,5]])U.lights.push(ge(16762767,bt,9.5,new P(Math.cos(k)*(o+Nt),re+3.05,Math.sin(k)*(o+Nt)),V));ze(U);const q=(2*(Math.PI*o/h)-.3)/2,F=$e,ce=Ee,Me=.1,Ce=.62,Pe=1.8,Xe=re+c-.5,Ve=(Nt,bt,en)=>ee(k+(bt+en)/2/ce,ce+Nt,(en-bt)/2,Me,re,Xe),He=(Nt,bt,en)=>K(k+Nt/ce,ce+bt,ce+en,Me,re,Xe),it=-2.75,yt=-1.4,Dt=-.35,_t=1.25,Mt=-3.1,Ge=0,Pt=-2.5,ut=2.5;Ve(it,-q,Mt-Ce),Ve(it,Mt+Ce,Ge-Pe),Ve(it,Ge+Pe,q),He(yt,it,Dt),Ve(_t,-q,Pt-Ce),Ve(_t,Pt+Ce,ut-Ce),Ve(_t,ut+Ce,q),He(0,_t,F);const xn=(E+.5)*Zs/h;K(xn,o,d,.2,re,re+c)}}const ve=S(l)+c;if(i.habCrown){t(i.habCrown,s,[0,ve,0],[0,0,0],1,{world:"silo",collide:!1}),e.addRing({innerRadius:0,outerRadius:a+1.7,minY:ve-.6,maxY:ve+1.2});const B=new Fn(15918796,58,24,1.8);B.position.set(0,ve-.9,0),s.add(B)}if(i.habSump){t(i.habSump,s,[0,0,0],[0,0,0],1,{world:"silo",collide:!1}),e.addRing({innerRadius:0,outerRadius:a+.4,minY:-.4,maxY:.02,climbable:!0});for(const B of[1.9,5.1]){const re=new Fn(14676223,42,18,1.8);re.position.set(Math.cos(B)*(a-3.4),1.72,Math.sin(B)*(a-3.4)),s.add(re)}}const Ye=(a+.3-u)/2,gt=u+Ye,R=(a+.3-g)/2,y=g+R;for(let B=0;B<=l;B++){const re=S(B),E=B*m,k=B===l?i.habTopLanding:i.habLanding;k&&t(k,s,[Math.cos(E)*gt,re,Math.sin(E)*gt],[0,-E+Math.PI/2,0],1,{world:"silo",collide:!1}),e.addOrientedBox({cx:Math.cos(E)*y,cz:Math.sin(E)*y,halfX:R,halfZ:b,rotationY:-E,minY:re-.3,maxY:re+.02,climbable:!0});const V=a+.12;for(const ae of[-1,1]){const oe=ae*b,Fe=(ae<0?B<l:!0)?A:g,lt=(Fe+V)/2,Ct=(V-Fe)/2;e.addOrientedBox({cx:Math.cos(E)*lt+Math.sin(E)*oe,cz:Math.sin(E)*lt-Math.cos(E)*oe,halfX:Ct,halfZ:.19,rotationY:-E,minY:re+.02,maxY:re+1.18})}if(B===l){const ae=g+.15;e.addOrientedBox({cx:Math.cos(E)*ae,cz:Math.sin(E)*ae,halfX:.19,halfZ:b+.04,rotationY:-E,minY:re+.02,maxY:re+1.18})}}const H=[];for(let B=0;B<l;B++){const re=S(B);if(i.habHydroponics&&B%3===1)for(let E=0;E<3;E++){const k=E*Math.PI*2/3+B*.4,V=o-2.6,ae=t(i.habHydroponics,s,[Math.cos(k)*V,re,Math.sin(k)*V],[0,-k+Math.PI/2,0],1,{world:"silo"});E===0&&n(ae,`HYDROPONICS — LEVEL ${l-B}`,"silo",()=>window.dispatchEvent(new CustomEvent("lostsignal:hydroponics",{detail:{level:l-B}}))),H.push(ae)}if(i.habCommons&&B%3===2)for(let E=0;E<2;E++){const k=E*Math.PI+B*.7,V=o-3.4;H.push(t(i.habCommons,s,[Math.cos(k)*V,re,Math.sin(k)*V],[0,-k,0],1,{world:"silo"}))}if(i.habDirectory){const E=B*.9+.28,k=a+1.1;t(i.habDirectory,s,[Math.cos(E)*k,re,Math.sin(E)*k],[0,-E+Math.PI/2,0],1,{world:"silo",collide:!1})}}const Z=S(l),ie=t(i.habLevel,s,[0,Z,0],[0,0,0],1,{world:"silo",collide:!1});gd(ie,l),G(Z,!1);for(let B=0;B<h;B++){const re=B*Math.PI*2/h;if(i.habDoor){const E=-x+.04;t(i.habDoor,s,[Math.cos(re)*(o-.28)+Math.sin(re)*E,Z,Math.sin(re)*(o-.28)-Math.cos(re)*E],[0,-re+Math.PI/2,0],1,{world:"silo",collide:!1})}}const Y=Math.PI*.25,Te=o-.9,he=new P(Math.cos(Y)*Te,Z,Math.sin(Y)*Te);let _e=null;i.habSecureDoor&&(_e=t(i.habSecureDoor,s,[he.x,Z,he.z],[0,-Y+Math.PI/2,0],1,{world:"silo",collide:!1}),n(_e,"SECURE UNIT — ENTRANCE","silo",()=>window.dispatchEvent(new CustomEvent("lostsignal:secureunit"))));const ye=Math.PI*1.25,le=new P(Math.cos(ye)*(o-1),Z,Math.sin(ye)*(o-1));if(i.accessControl){const B=t(i.accessControl,s,[le.x,Z+1.05,le.z],[0,-ye+Math.PI/2,0],.75,{world:"silo",collide:!1});n(B,"ACCESS SHAFT — CLIMB TO SHELTER","silo",()=>window.dispatchEvent(new CustomEvent("lostsignal:ascend")))}const be=i.siloCache?t(i.siloCache,s,[Math.cos(2.1)*(o-2.2),0,Math.sin(2.1)*(o-2.2)],[0,-2.1,0],1,{world:"silo"}):null;be&&n(be,"SILO STORES","silo",()=>window.dispatchEvent(new CustomEvent("lostsignal:cache")));const ke=["A","B","C","D","E","F"].map(B=>i[`residentStill${B}`]).filter(Boolean);if(ke.length)for(let B=0;B<l;B++){const re=S(B),E=3+B*5%4;for(let k=0;k<E;k++){const V=k/E*Math.PI*2+B*.83,ae=a+.55+(k+B)%3*.5,oe=t(ke[(B*3+k)%ke.length],s,[Math.cos(V)*ae,re,Math.sin(V)*ae],[0,Math.atan2(-Math.cos(V),-Math.sin(V))+(k%2?.4:-.3),0],1,{world:"silo",collide:!1});ep(oe,B*5+k)}}s.add(new Nh(11115913,2169622,1.08)),s.add(new Zc(6708301,.44));for(const[B,re]of[[1,.35],[-1,-.35]]){const E=new Po(13351328,.33);E.position.set(B*40,D*.6,re*40),E.target.position.set(0,D*.35,0),s.add(E,E.target)}for(let B=0;B<=l;B++){const re=S(B)+c-.5,E=4;for(let k=0;k<E;k++){const V=k*Zs/E+B*.5;ge(16767394,28,14,new P(Math.cos(V)*(o-2.2),re,Math.sin(V)*(o-2.2)))}}const Le=12,pe=Array.from({length:Le},()=>{const B=new Fn(16767394,0,14,2);return B.visible=!0,s.add(B),{light:B,source:null,target:0}}),Ne=[];function N(B,re,E){const k=B.position.x-re.x,V=B.position.z-re.z,ae=B.position.y-re.y;return(k*k+V*V+ae*ae*5.5)*(E?.72:1)}function fe(B,re){const E=B.position.x-re.x,k=B.position.z-re.z,V=(B.position.y-re.y)*1.8,ae=Math.hypot(E,V,k);return B.base*(1-Ke.smoothstep(ae,8,18))}function me(B,re){const E=new Set(pe.map(oe=>oe.source).filter(Boolean));Ne.length=0;for(const oe of se)oe.active&&(oe.score=N(oe,re,E.has(oe)),Ne.push(oe));Ne.sort((oe,Ue)=>oe.score-Ue.score);const k=Ne.slice(0,Le),V=new Set(k);for(const oe of pe)oe.source&&!V.has(oe.source)&&(oe.target=0),oe.source&&!V.has(oe.source)&&oe.light.intensity<.035&&(oe.source=null);const ae=new Set(pe.map(oe=>oe.source).filter(Boolean));for(const oe of k){if(ae.has(oe))continue;const Ue=pe.find(Fe=>!Fe.source);if(!Ue)break;Ue.source=oe,Ue.light.position.copy(oe.position),Ue.light.color.copy(oe.color),Ue.light.distance=oe.distance,Ue.light.decay=2,Ue.light.intensity=0,ae.add(oe)}for(const oe of pe)oe.target=oe.source&&V.has(oe.source)?fe(oe.source,re):0,oe.light.intensity=Ke.damp(oe.light.intensity,oe.target,oe.target>oe.light.intensity?5:4,B)}const Ae=u+2.4;for(let B=0;B<4;B++){const re=B*Zs/4+.35,E=new Fn(13350811,104,34,1.8);E.position.set(Math.cos(re)*Ae,D/3*B+c*.55,Math.sin(re)*Ae),s.add(E)}const ue=new va(15260870,330,D+12,.46,.78,2);ue.position.set(0,Z+c-.4,0),ue.target.position.set(0,0,0),s.add(ue,ue.target);const te=new Fn(16738890,8,5.5,2);te.position.copy(he).setY(Z+1.6),s.add(te);const Ie=420,je=new wn,mt=new Float32Array(Ie*3),ot=new Float32Array(Ie);for(let B=0;B<Ie;B++){const re=Math.random()*Math.PI*2,E=Math.random()*(o-.5);mt[B*3]=Math.cos(re)*E,mt[B*3+1]=Math.random()*(D+c),mt[B*3+2]=Math.sin(re)*E,ot[B]=.1+Math.random()*.36}je.setAttribute("position",new rn(mt,3));const bn=new Co(je,new la({color:13818582,size:.03,transparent:!0,opacity:.26,depthWrite:!1}));s.add(bn);const $t=new P(Math.cos(ye)*(o-2.6),Z+.06,Math.sin(ye)*(o-2.6)),os=[];for(let B=0;B<l;B++)os.push({y:S(B)+.02,radius:w});function Zn(B,re){re&&me(B,re);for(const V of xe)V.root&&(V.root.rotation.y=Ke.damp(V.root.rotation.y,V.closedRotation-(V.open?1.82:0),6.5,B));for(const V of Oe)V.root&&(V.root.rotation.y=Ke.damp(V.root.rotation.y,V.closedRotation-(V.open?1.62:0),5.2,B));const E=je.attributes.position.array,k=D+c;for(let V=0;V<Ie;V++)E[V*3+1]-=ot[V]*B,E[V*3+1]<.1&&(E[V*3+1]=k);je.attributes.position.needsUpdate=!0}const Hi=[];for(let B=0;B<l;B++)Hi.push(de(B));const Ds=Array.from({length:l},()=>Array.from({length:h},(B,re)=>re).filter(B=>B!==kr));return{spawn:$t,update:Zn,walkable:os,secureDoor:_e,securePosition:he,topY:Z,shaftHeight:D,homes:at,sofas:et,seats:Q,furnitureColliders:$,openBays:Hi,homeBays:Ds,homeDoors:xe,tunnelDoors:Oe,setHomeDoor:Re,setTunnelDoor:pt,lightState:()=>({energy:pe.reduce((B,re)=>B+re.light.intensity,0),active:pe.filter(B=>B.light.intensity>.05).length,maximum:Math.max(0,...pe.map(B=>B.light.intensity)),assignments:pe.filter(B=>B.source).length,slots:pe.map(B=>({source:B.source?.id??-1,intensity:B.light.intensity}))}),tunnelBay:kr,tunnelDoorRadius:o-.3+Vl,apartmentMid:Ee,stairRadius:u,stairColumn:f,stairSteps:p,stairTurn:m,landingHalf:b,landingInner:g,wellRadius:a,deckOuter:o,levelHeight:c,levels:l,segments:h}}const Vt=(s,e,t=.5,n=.05,i=2.2,r=0)=>({at:s,hz:e,level:t,decay:n,q:i,tone:r}),Tn=(s=1,e=2.1)=>[Vt(0,1500*s,.34,.035,3,900*s),Vt(.22*e,620*s,.3,.1,1.4),Vt(.55*e,900*s,.52,.09,1.8,320*s),Vt(.84*e,2200*s,.46,.05,3.4,1400*s)],Hr=(s=1,e=4,t=3)=>{const n=[];for(let i=0;i<e;i++)n.push(Vt((.06+i*.62/e)*t,780*s,.34,.07,1.9,260*s));return n.push(Vt(.8*t,1250*s,.5,.07,2.2,420*s)),n.push(Vt(.92*t,1650*s,.54,.06,2.6,300*s)),n},bd=(s=1,e=2.8)=>[Vt(0,1750*s,.4,.045,3.2,780*s),Vt(.16*e,1100*s,.34,.09,1.6),Vt(.42*e,700*s,.3,.11,1.5,240*s),Vt(.72*e,1200*s,.4,.08,1.8),Vt(.9*e,1950*s,.46,.05,3.4,860*s)],Gl=(s=1,e=2.6)=>[Vt(0,2100*s,.32,.035,3.6,1150*s),Vt(.14*e,520*s,.26,.13,1.2),Vt(.34*e,1400*s,.38,.07,2.4,640*s),Vt(.56*e,860*s,.3,.1,1.7),Vt(.72*e,980*s,.32,.09,1.9),Vt(.9*e,1750*s,.5,.05,3,520*s)],G_=()=>[Vt(0,3200,.26,.14,1.1),Vt(.3,2400,.22,.1,1.3)],ki=({level:s,bodyHz:e,bodyEndHz:t,bodyDecay:n,crackHz:i,crackQ:r,crackDecay:a,tailHz:o,tailDecay:c,tailLevel:l})=>({level:s,bodyHz:e,bodyEndHz:t,bodyDecay:n,crackHz:i,crackQ:r,crackDecay:a,tailHz:o,tailDecay:c,tailLevel:l}),Vr=(s=1,e=.5)=>ki({level:e,bodyHz:210*s,bodyEndHz:52*s,bodyDecay:.13,crackHz:2600*s,crackQ:1,crackDecay:.075,tailHz:1100*s,tailDecay:.34,tailLevel:.3}),W_=(s=1,e=.4)=>ki({level:e,bodyHz:260*s,bodyEndHz:84*s,bodyDecay:.07,crackHz:3200*s,crackQ:1.5,crackDecay:.045,tailHz:1500*s,tailDecay:.18,tailLevel:.2}),Gr=(s=1,e=.62)=>ki({level:e,bodyHz:150*s,bodyEndHz:34*s,bodyDecay:.22,crackHz:1500*s,crackQ:.6,crackDecay:.14,tailHz:700*s,tailDecay:.55,tailLevel:.42}),ro=(s=1,e=.7)=>ki({level:e,bodyHz:175*s,bodyEndHz:40*s,bodyDecay:.18,crackHz:3600*s,crackQ:.8,crackDecay:.1,tailHz:820*s,tailDecay:.85,tailLevel:.5}),Wr=(s=1,e=.44)=>ki({level:e,bodyHz:300*s,bodyEndHz:96*s,bodyDecay:.08,crackHz:2900*s,crackQ:1.3,crackDecay:.055,tailHz:1300*s,tailDecay:.24,tailLevel:.24}),Wl=(s=1,e=.6)=>ki({level:e,bodyHz:190*s,bodyEndHz:46*s,bodyDecay:.16,crackHz:2100*s,crackQ:.8,crackDecay:.11,tailHz:900*s,tailDecay:.62,tailLevel:.44}),X_=()=>ki({level:.3,bodyHz:520,bodyEndHz:180,bodyDecay:.05,crackHz:4200,crackQ:2.6,crackDecay:.09,tailHz:2600,tailDecay:.16,tailLevel:.14}),It=(s,e=0,t=0,n=0,i=!1)=>({scale:s,offset:[e,t,n],flip:i}),fn={armoryAssault01:{name:"SERVICE RIFLE",family:"rifle",calibre:.095,kind:"firearm",automatic:!0,magazine:30,reserve:90,damage:34,headshot:2.6,rpm:700,reloadTime:2.1,spread:.011,adsSpread:.0035,range:90,recoil:.18,view:It(.16,-.04,-.08,0),audio:{fire:Vr(1),reload:Tn(1,2.1)}},armoryAssault02:{name:"CARBINE MK2",family:"rifle",calibre:.085,kind:"firearm",automatic:!0,magazine:30,reserve:120,damage:29,headshot:2.6,rpm:820,reloadTime:1.95,spread:.013,adsSpread:.004,range:80,recoil:.15,view:It(.155,-.03,-.075,0),audio:{fire:Vr(1.14,.46),reload:Tn(1.12,1.95)}},armoryAssault03:{name:"HEAVY RIFLE",family:"rifle",calibre:.125,kind:"firearm",automatic:!0,magazine:20,reserve:80,damage:44,headshot:2.5,rpm:580,reloadTime:2.45,spread:.014,adsSpread:.0045,range:100,recoil:.26,view:It(.17,-.05,-.085,0),audio:{fire:Vr(.82,.58),reload:Tn(.86,2.45)}},armoryBullpup:{name:"BULLPUP RIFLE",family:"rifle",calibre:.09,kind:"firearm",automatic:!0,magazine:32,reserve:128,damage:31,headshot:2.6,rpm:780,reloadTime:1.85,spread:.01,adsSpread:.003,range:88,recoil:.16,view:It(.16,-.02,-.08,0),audio:{fire:Vr(1.07,.48),reload:Tn(1.22,1.85)}},armoryAkm:{name:"AKM",family:"rifle",calibre:.125,kind:"firearm",automatic:!0,magazine:30,reserve:120,damage:38,headshot:2.5,rpm:600,reloadTime:2.3,spread:.016,adsSpread:.0055,range:85,recoil:.24,view:It(.155,-.03,-.08,0),audio:{fire:Vr(.9,.56),reload:Tn(.94,2.3)}},armoryShotgun01:{name:"COMBAT SHOTGUN",family:"shotgun",calibre:.042,kind:"firearm",automatic:!1,magazine:8,reserve:32,damage:17,headshot:1.5,rpm:95,pellets:8,reloadTime:3,spread:.055,adsSpread:.038,range:34,recoil:.42,view:It(.165,-.04,-.085,0),audio:{fire:Gr(1),reload:Hr(1,4,3)}},armoryShotgun02:{name:"RIOT SHOTGUN",family:"shotgun",calibre:.04,kind:"firearm",automatic:!1,magazine:6,reserve:30,damage:16,headshot:1.5,rpm:80,pellets:9,reloadTime:2.8,spread:.062,adsSpread:.044,range:30,recoil:.45,view:It(.165,-.04,-.085,0),audio:{fire:Gr(.92,.66),reload:Hr(.9,3,2.8)}},armoryShotgunShort:{name:"SHORT-STOCK SHOTGUN",family:"shotgun",calibre:.044,kind:"firearm",automatic:!1,magazine:5,reserve:25,damage:18,headshot:1.5,rpm:105,pellets:9,reloadTime:2.6,spread:.07,adsSpread:.052,range:26,recoil:.48,view:It(.175,-.02,-.08,0),audio:{fire:Gr(1.1,.6),reload:Hr(1.15,3,2.6)}},armoryShotgunSawed:{name:"SAWED-OFF SHOTGUN",family:"shotgun",calibre:.038,kind:"firearm",automatic:!1,magazine:2,reserve:20,damage:15,headshot:1.4,rpm:160,pellets:12,reloadTime:2.2,spread:.098,adsSpread:.08,range:18,recoil:.55,view:It(.2,.02,-.07,0),audio:{fire:Gr(1.22,.68),reload:Hr(1.3,2,2.2)}},armoryMossberg:{name:"MOSSBERG 590A1",family:"shotgun",calibre:.042,kind:"firearm",automatic:!1,magazine:9,reserve:36,damage:17,headshot:1.5,rpm:88,pellets:8,reloadTime:3.2,spread:.058,adsSpread:.04,range:32,recoil:.44,view:It(.15,-.03,-.08,0),audio:{fire:Gr(.86,.7),reload:Hr(.82,5,3.2)}},armorySniper01:{name:"MARKSMAN RIFLE",family:"sniper",calibre:.135,kind:"firearm",automatic:!1,magazine:10,reserve:40,damage:72,headshot:3,rpm:210,reloadTime:2.5,spread:.01,adsSpread:.0012,range:160,recoil:.34,zoom:34,scope:"4x",view:It(.16,-.05,-.085,0),audio:{fire:ro(1),reload:Tn(.9,2.5)}},armorySniper02:{name:"BOLT-ACTION RIFLE",family:"sniper",calibre:.165,kind:"firearm",automatic:!1,magazine:5,reserve:30,damage:115,headshot:3.2,rpm:45,reloadTime:2.9,spread:.012,adsSpread:9e-4,range:190,recoil:.5,zoom:26,scope:"6x",view:It(.165,-.05,-.09,0),audio:{fire:ro(.86,.76),reload:bd(.9,2.9)}},armorySniper03:{name:"SCOUT RIFLE",family:"sniper",calibre:.14,kind:"firearm",automatic:!1,magazine:8,reserve:32,damage:80,headshot:3,rpm:180,reloadTime:2.4,spread:.011,adsSpread:.0014,range:150,recoil:.36,zoom:32,scope:"5x",view:It(.16,-.04,-.085,0),audio:{fire:ro(1.12,.68),reload:Tn(1.05,2.4)}},armorySniper04:{name:"ANTI-MATERIEL RIFLE",family:"sniper",calibre:.26,kind:"firearm",automatic:!1,magazine:5,reserve:20,damage:165,headshot:2.6,rpm:38,reloadTime:3.4,spread:.014,adsSpread:.0011,range:220,recoil:.7,zoom:22,scope:"8x",view:It(.175,-.06,-.095,0),audio:{fire:ro(.66,.84),reload:bd(.72,3.4)}},armorySmg01:{name:"COMPACT SMG",family:"smg",calibre:.07,kind:"firearm",automatic:!0,magazine:32,reserve:160,damage:21,headshot:2.2,rpm:900,reloadTime:1.7,spread:.017,adsSpread:.007,range:55,recoil:.11,view:It(.18,-.01,-.075,0),audio:{fire:W_(1),reload:Tn(1.25,1.7)}},armorySmg02:{name:"SUPPRESSED SMG",family:"smg",calibre:.068,kind:"firearm",automatic:!0,magazine:30,reserve:150,damage:19,headshot:2.2,rpm:950,reloadTime:1.75,spread:.015,adsSpread:.006,range:50,recoil:.09,quiet:!0,view:It(.18,-.02,-.075,0),audio:{fire:ki({level:.26,bodyHz:340,bodyEndHz:130,bodyDecay:.05,crackHz:1200,crackQ:2.4,crackDecay:.035,tailHz:620,tailDecay:.1,tailLevel:.12}),reload:Tn(1.32,1.75)}},armoryPistol01:{name:"SIDEARM 9MM",family:"pistol",calibre:.072,kind:"firearm",automatic:!1,magazine:15,reserve:60,damage:26,headshot:2.4,rpm:380,reloadTime:1.55,spread:.016,adsSpread:.006,range:45,recoil:.14,view:It(.19,.02,-.05,0),audio:{fire:Wr(1),reload:Tn(1.4,1.55)}},armoryPistol02:{name:"COMPACT PISTOL",family:"pistol",calibre:.068,kind:"firearm",automatic:!1,magazine:12,reserve:48,damage:24,headshot:2.4,rpm:420,reloadTime:1.45,spread:.019,adsSpread:.008,range:38,recoil:.13,view:It(.2,.03,-.05,0),audio:{fire:Wr(1.16,.4),reload:Tn(1.52,1.45)}},armoryPistol03:{name:"SERVICE PISTOL",family:"pistol",calibre:.074,kind:"firearm",automatic:!1,magazine:17,reserve:68,damage:27,headshot:2.4,rpm:360,reloadTime:1.6,spread:.015,adsSpread:.0055,range:48,recoil:.15,view:It(.19,.02,-.05,0),audio:{fire:Wr(.92,.46),reload:Tn(1.3,1.6)}},armoryPistol04:{name:"HEAVY PISTOL",family:"pistol",calibre:.13,kind:"firearm",automatic:!1,magazine:8,reserve:40,damage:48,headshot:2.5,rpm:260,reloadTime:1.8,spread:.021,adsSpread:.008,range:52,recoil:.3,view:It(.2,.02,-.05,0),audio:{fire:Wr(.74,.56),reload:Tn(1.1,1.8)}},armoryGlock:{name:"GLOCK 19",family:"pistol",calibre:.07,kind:"firearm",automatic:!1,magazine:15,reserve:75,damage:25,headshot:2.4,rpm:440,reloadTime:1.4,spread:.017,adsSpread:.0058,range:42,recoil:.12,view:It(.205,.02,-.05,0),audio:{fire:Wr(1.08,.42),reload:Tn(1.46,1.4)}},armoryRevolver01:{name:".357 REVOLVER",family:"revolver",calibre:.14,kind:"firearm",automatic:!1,magazine:6,reserve:36,damage:60,headshot:2.6,rpm:200,reloadTime:2.6,spread:.018,adsSpread:.006,range:60,recoil:.34,view:It(.2,.02,-.05,0),audio:{fire:Wl(1),reload:Gl(1,2.6)}},armoryRevolver02:{name:"SNUB REVOLVER",family:"revolver",calibre:.13,kind:"firearm",automatic:!1,magazine:5,reserve:30,damage:52,headshot:2.6,rpm:230,reloadTime:2.4,spread:.025,adsSpread:.01,range:34,recoil:.32,view:It(.21,.03,-.05,0),audio:{fire:Wl(1.18,.54),reload:Gl(1.2,2.4)}},armoryRevolver03:{name:".44 REVOLVER",family:"revolver",calibre:.16,kind:"firearm",automatic:!1,magazine:6,reserve:30,damage:76,headshot:2.7,rpm:165,reloadTime:2.8,spread:.02,adsSpread:.0065,range:68,recoil:.44,view:It(.205,.02,-.052,0),audio:{fire:Wl(.82,.66),reload:Gl(.86,2.8)}},armoryBayonet:{name:"BAYONET",family:"blade",calibre:.075,kind:"melee",automatic:!1,magazine:0,reserve:0,damage:68,headshot:1.8,rpm:140,reloadTime:.45,reach:2.05,recoil:.12,view:It(.3,.06,-.1,.06),audio:{fire:X_(),reload:G_()}},armoryCombatKnife:{name:"COMBAT KNIFE",family:"blade",calibre:.08,kind:"melee",automatic:!1,magazine:0,reserve:0,damage:74,headshot:1.9,rpm:165,reloadTime:.4,reach:2.2,recoil:.14,view:It(.3,.05,-.09,.05),audio:{fire:ki({level:.32,bodyHz:460,bodyEndHz:150,bodyDecay:.055,crackHz:3700,crackQ:2.2,crackDecay:.1,tailHz:2300,tailDecay:.19,tailLevel:.16}),reload:[Vt(0,2900,.28,.15,1.2),Vt(.26,2100,.24,.11,1.4)]}},armoryScope:{name:"RIFLE OPTIC",family:"attachment",kind:"attachment"},armoryBipod:{name:"BIPOD",family:"attachment",kind:"attachment"},armoryTripod:{name:"TRIPOD MOUNT",family:"attachment",kind:"attachment"}},xd={rifle:[.03,-.13,-.64],smg:[.03,-.12,-.6],shotgun:[.03,-.14,-.66],sniper:[.02,-.12,-.62],pistol:[.01,-.16,-.5],revolver:[.01,-.16,-.52],blade:[.18,-.28,-.58]},q_=s=>xd[s?.family]||xd.rifle,vd={rifle:[.32,-.38,-.72],smg:[.3,-.35,-.68],shotgun:[.32,-.38,-.72],sniper:[.32,-.38,-.74],pistol:[.24,-.18,-.56],revolver:[.24,-.18,-.58],blade:[.26,-.13,-.46]},Y_=s=>vd[s?.family]||vd.rifle;Object.keys(fn).filter(s=>fn[s].kind!=="attachment");const yr="armoryAssault01",ca=s=>!!fn[s]&&fn[s].kind!=="attachment",tp=s=>60/Math.max(1,s?.rpm??600);function j_(){const s=new Map;return{for(e){if(!s.has(e)){const t=fn[e];s.set(e,{magazine:t?.magazine??0,reserve:t?.reserve??0})}return s.get(e)},resupply(e){const t=fn[e];t&&s.set(e,{magazine:t.magazine??0,reserve:t.reserve??0})},snapshot(){return Object.fromEntries([...s].map(([e,t])=>[e,{...t}]))},restore(e){if(e)for(const[t,n]of Object.entries(e))!fn[t]||!n||s.set(t,{magazine:Math.max(0,Math.min(fn[t].magazine??0,n.magazine|0)),reserve:Math.max(0,n.reserve|0)})}}}const vo=new P(3.8,0,2.6),yd=["armoryAssault01","armoryAssault02","armoryAssault03","armoryBullpup","armoryAkm","armoryShotgunSawed","armoryShotgunShort","armoryShotgun01","armoryShotgun02","armoryMossberg","armorySniper01","armorySniper02"],_d=["armoryPistol01","armoryPistol02","armoryPistol03","armoryPistol04","armoryGlock","armoryRevolver01","armoryRevolver02","armoryRevolver03","armoryBayonet","armoryCombatKnife"],Md=["armorySniper03","armorySniper04","armorySmg01","armorySmg02","armoryBipod","armoryScope","armoryTripod"],K_=new gn,Sd=new P,wd=new P;function Xl({assets:s,scene:e,place:t},n,i,r,a){const o=s[n];if(!o)return null;const c=t(o,e,[0,0,0],r,a,{world:"bunker",collide:!1});return c.name=`Armory_Display_${n}`,c.updateWorldMatrix(!0,!0),K_.setFromObject(c).getCenter(Sd),wd.copy(vo).add(new P(...i)),c.position.add(wd.sub(Sd)),c.userData.armoryWeapon=n,c}function Td(s,...e){for(const t of e){const n=s?.animations?.find(i=>i.name.endsWith(t));if(n)return n}return s?.animations?.[0]||null}function Z_({assets:s,scene:e,colliders:t,place:n,addInteraction:i}){if(!s.armory||!s.armoryAssault01)return null;const r=n(s.armory,e,vo.toArray(),[0,0,0],1,{world:"bunker",collide:!1});r.name="Walk_In_Armoury",r.updateWorldMatrix(!0,!0);let a=0;r.traverse(O=>{if(!O.isMesh||!/^Armory_(Floor|Wall_|Rack_|Counter_|Ammo_|Door_Header|Door_Jamb)/.test(O.name))return;t.addObject(O,{shrink:O.name==="Armory_Floor"?0:.015,climbable:O.name==="Armory_Floor"||/Counter_Top|Ammo_(Shelf|Crate)/.test(O.name)})&&a++});const o=[];r.traverse(O=>{/^Armory_Door_(Leaf|Inset|Window|Brace_)/.test(O.name)&&o.push({part:O,closedX:O.position.x})});const c=Bn(r,"Armory_Door_Leaf"),l=Bn(r,"Armory_Keypad"),h=c?t.addObject(c,{shrink:.01}):null;let u=!1,f=0;const p=()=>{u=!u,h&&(h.enabled=!u),window.dispatchEvent(new CustomEvent("lostsignal:vaultopen",{detail:{open:u}}))};c&&i(c,"ARMOURY SECURITY DOOR","bunker",p),l&&i(l,"ARMOURY ACCESS KEYPAD","bunker",p);const m=[];for(let O=0;O<yd.length;O++){const G=O%3,j=Math.floor(O/3),K=yd[O],ee=!/Sawed/.test(K),X=Xl({assets:s,scene:e,place:n},K,[-1.44+G*1.44,.58+j*.55,1.75],[0,0,0],ee?.165:.185);X&&m.push(X)}for(let O=0;O<_d.length;O++){const G=O%2,j=Math.floor(O/2),K=_d[O],ee=/Bayonet|CombatKnife/.test(K),X=Xl({assets:s,scene:e,place:n},K,[-2.01,.55+j*.55,-.84+G*1.68],[0,-Math.PI/2,0],ee?.25:.18);X&&m.push(X)}for(let O=0;O<Md.length;O++){const G=O%2,j=Math.floor(O/2),K=Md[O],ee=/Bipod|Scope|Tripod/.test(K),X=Xl({assets:s,scene:e,place:n},K,[2.01,.65+j*.69,.84-G*1.68],[0,Math.PI/2,0],ee?.25:.17);X&&m.push(X)}const b=new Map;for(const O of m)b.set(O.userData.armoryWeapon,O);const g=b.get("armoryAssault01")||null;let d=null;for(const O of m){const G=O.userData.armoryWeapon,K=fn[G]?.name||"WEAPON";if(!ca(G)){i(O,`INSPECT ${K}`,"bunker",()=>{window.dispatchEvent(new CustomEvent("lostsignal:inspectkit",{detail:{key:G,name:K}}))});continue}i(O,`TAKE ${K}`,"bunker",()=>{if(!u){window.dispatchEvent(new CustomEvent("lostsignal:rackedlocked",{detail:{key:G,name:K}}));return}window.dispatchEvent(new CustomEvent("lostsignal:takegun",{detail:{key:G,name:K}}))})}let x=null,_=null,v=null,T=null,A=null,C=0,D=1;if(s.adventurer){x=Cs(s.adventurer),x.name="Quartermaster_Adventurer",x.position.copy(vo).add(new P(1.17,.01,1.43)),x.rotation.y=Math.PI,x.userData.kind="quartermaster",e.add(x),_=new Jc(x);const O=Td(s.adventurer,"|Idle_Neutral","|Idle"),G=Td(s.adventurer,"|Wave","|Interact");O&&(v=_.clipAction(O),v.play()),G&&(T=_.clipAction(G),T.setLoop(yf,1),T.clampWhenFinished=!0,T.enabled=!0,_.addEventListener("finished",j=>{j.action!==T||!v||(T.fadeOut(.18),v.reset().fadeIn(.18).play())})),A=t.addOrientedBox({cx:x.position.x,cz:x.position.z,halfX:.34,halfZ:.34,minY:0,maxY:1.84}),x.userData.kind="quartermaster",x.userData.alive=!0,i(x,"QUARTERMASTER ELI","bunker",()=>{x.userData.alive!==!1&&(T&&(v?.fadeOut(.12),T.reset().fadeIn(.12).play()),window.dispatchEvent(new CustomEvent("lostsignal:quartermaster",{detail:{line:u?"Everything on the wall is inventoried and everything on it works. Take whatever you can carry — one at a time, and put the last one back on its hook.":"Use the access panel. Once that door clears its pocket, the whole armoury is yours to inspect."}})))})}const w=[];for(const O of[-.76,.76]){const G=new Fn(14349535,12,7.2,2);G.position.copy(vo).add(new P(0,2.84,O)),e.add(G),w.push(G)}function S(){return!x||x.userData.alive===!1?!1:(x.userData.alive=!1,D=Math.random()<.5?-1:1,v?.stop(),T?.stop(),A&&(A.enabled=!1),!0)}function I(O){const G=u?-1.84:0;f=Ke.damp(f,G,7.2,O);for(const j of o)j.part.position.x=j.closedX+f;if(x&&x.userData.alive===!1){if(C<1){C=Math.min(1,C+O*2.1);const j=C*C*(3-2*C);x.rotation.z=j*(Math.PI/2)*D,x.position.y=.01-j*.28}return}_?.update(O)}function z(O){const G=new Set(Array.isArray(O)?O:O?[O]:[]);d=G.size?[...G][G.size-1]:null;for(const[j,K]of b)K.visible=!G.has(j)}return{shell:r,displayWeapons:m,displayByKey:b,primaryDisplay:g,quartermaster:x,lights:w,weaponAsset:s.armoryAssault01,animationCount:s.adventurer?.animations?.length??0,staticColliderCount:a,doorCollider:h,setEquipped:z,update:I,downQuartermaster:S,quartermasterAlive:()=>x?x.userData.alive!==!1:!1,isOpen:()=>u,equippedKey:()=>d,isIssued:()=>d!==null,open:()=>{u||p()}}}const ql=(s,...e)=>{const t=s?.animations||[];for(const n of e){const i=t.find(r=>r.name.toLowerCase().endsWith(n));if(i)return i}return t[0]||null},J_=[["survivalFirstAid",-.82,.9,.28],["survivalFirstAid",-.54,2.6,.28],["survivalWaterBottle",-.28,.4,.26],["survivalCan",-.06,1.7,.13],["survivalPot",.14,.2,.18],["survivalPan",.36,2.2,.1],["survivalMatchbox",.54,1.1,.06],["survivalBattery",.7,.5,.15],["survivalTorch",.88,2.9,.27]],Q_=[["survivalBackpack",-1.85,1.4,.54],["survivalGasCan",1.62,.6,.36],["survivalPropaneTank",1.98,2.4,.62]];function $_({scene:s,colliders:e,assets:t,place:n,addInteraction:i,silo:r}){if(!r)return null;const{topY:a,deckOuter:o}=r,c=[];let l=null;if(t.soldier){const se=Math.PI*.25+.16,ge=o-1.55;l=Cs(t.soldier),l.name="Secure_Unit_Sentry",l.position.set(Math.cos(se)*ge,a+.02,Math.sin(se)*ge),l.rotation.y=Math.atan2(-Math.cos(se),-Math.sin(se))+Math.PI/2,l.userData.kind="sentry",l.userData.alive=!0,s.add(l);const Ee=ql(t.soldier,"idle","mixamo.com");if(Ee){const $e=new Jc(l);$e.clipAction(Ee).play(),c.push($e)}e.addOrientedBox({cx:l.position.x,cz:l.position.z,halfX:.34,halfZ:.34,minY:a,maxY:a+1.86}),i(l,"SECURE UNIT SENTRY","silo",()=>{window.dispatchEvent(new CustomEvent("lostsignal:sentry",{detail:{line:"Nobody goes through that door without the unit commander. Walk the ring, talk to whoever will talk to you, and stay off the stair rail."}}))})}let h=null,u=null,f=null,p=null;const m={radius:o-2.9,from:Math.PI*.55,to:Math.PI*1.35};let b=m.from,g=1,d=0;if(t.germanShepherd){h=Cs(t.germanShepherd),h.name="Patrol_Dog",h.position.set(Math.cos(b)*m.radius,a+.02,Math.sin(b)*m.radius),h.userData.kind="dog",h.userData.alive=!0,s.add(h),u=new Jc(h);const se=ql(t.germanShepherd,"walk"),ge=ql(t.germanShepherd,"idle_2","idle");se&&(f=u.clipAction(se)),ge&&(p=u.clipAction(ge)),f?.play(),c.push(u),i(h,"PATROL DOG","silo",()=>{window.dispatchEvent(new CustomEvent("lostsignal:dog",{detail:{line:"He works the top ring on his own. Nobody has told him the world ended."}}))})}const x=Math.PI*.75,_=o-1.15,v=new P(Math.cos(x)*_,a,Math.sin(x)*_),T=new P(-Math.sin(x),0,Math.cos(x)),A=new P(-Math.cos(x),0,-Math.sin(x)),C=-x+Math.PI/2,D=[],w=a+.92;let S=null;t.bench&&(S=n(t.bench,s,v.toArray(),[0,C,0],1,{world:"silo"}));const I=new gn,z=new P,O=(se,ge,Ee)=>(se.updateWorldMatrix(!0,!0),I.setFromObject(se).getSize(z),z.y>1e-4&&se.scale.multiplyScalar(Ee/z.y),se.updateWorldMatrix(!0,!0),I.setFromObject(se),se.position.y+=ge-I.min.y,se),G=(se,ge,Ee,$e,at,et)=>{if(!t[se])return;const Q=v.clone().addScaledVector(T,ge).addScaledVector(A,$e);Q.y=at;const $=n(t[se],s,Q.toArray(),[0,C+Ee,0],1,{world:"silo",collide:!1});D.push(O($,at,et))};for(const[se,ge,Ee,$e]of J_)G(se,ge,Ee,.16,w,$e);for(const[se,ge,Ee,$e]of Q_)G(se,ge,Ee,.58,a+.02,$e);let j=3;const K=D[0]||S;K&&i(K,"INFIRMARY — TREAT INJURIES","silo",()=>{window.dispatchEvent(new CustomEvent("lostsignal:medical",{detail:{remaining:j>0?--j:0,empty:j<=0}}))});const ee=new Fn(14676198,16,9.5,2);ee.position.copy(v).setY(a+2.5).addScaledVector(A,.4),s.add(ee);const X=new P;function de(se){for(const ge of c)ge.update(se);if(h){if(d>0){d-=se,d<=0&&(p?.fadeOut(.25),f?.reset().fadeIn(.25).play());return}b+=g*(.95/m.radius)*se,(b>=m.to||b<=m.from)&&(b=Ke.clamp(b,m.from,m.to),g*=-1,d=2.4+Math.random()*2.6,f?.fadeOut(.25),p?.reset().fadeIn(.25).play()),X.set(Math.cos(b)*m.radius,a+.02,Math.sin(b)*m.radius),h.position.copy(X),h.rotation.y=Math.atan2(-Math.sin(b)*g,Math.cos(b)*g)+Math.PI}}return{sentry:l,dog:h,bench:S,kitRoots:D,lamp:ee,update:de,dosesRemaining:()=>j,medicalCentre:v}}const eM=6,Xr=12,Ed=2,ms=-17.4;function tM({scene:s,colliders:e,assets:t,place:n,addInteraction:i}){if(!t.rangeTarget)return null;const r=[];for(let b=0;b<eM;b++){const g=Ed-b*3.1,d=ms+b%2*1.5,x=n(t.rangeTarget,s,[d,0,g],[0,Math.PI,0],1,{collide:!1});x.name=`Range_Target_${b}`;const _=Bn(x,"Target_Pivot"),v=Bn(x,"Target_Plate"),T=e.addOrientedBox({cx:d,cz:g,halfX:.56,halfZ:.42,minY:0,maxY:1.42}),A={lane:b,root:x,pivot:_,plate:v,stand:T,x:d,z:g,distance:+Math.hypot(d-ms,g-Xr).toFixed(1),down:!1,fall:0};(_||v)?.traverse(C=>{C.userData.rangeTarget=A}),r.push(A)}let a=0,o=0;function c(b){return!b||b.down?!1:(b.down=!0,a++,window.dispatchEvent(new CustomEvent("lostsignal:rangehit",{detail:{lane:b.lane,distance:b.distance,hits:a,standing:h()}})),!0)}function l(b){let g=b;for(;g&&!g.userData.rangeTarget;)g=g.parent;return g?.userData.rangeTarget||null}const h=()=>r.filter(b=>!b.down).length;function u(){for(const b of r)b.down=!1;window.dispatchEvent(new CustomEvent("lostsignal:rangereset",{detail:{hits:a,shots:o,standing:r.length}})),a=0,o=0}const f=t.accessControl?n(t.accessControl,s,[ms+3.2,.55,Xr+.4],[0,-Math.PI/2,0],.64,{collide:!1}):null;f&&(f.name="Range_Control",i(f,"RANGE CONTROL — RESET TARGETS","outside",u)),t.bench&&n(t.bench,s,[ms+3,0,Xr+1.9],[0,-Math.PI/2,0],1,{});const p=new va(14477808,5.5,42,.72,.5,1.5);p.position.set(ms+.4,5.4,Xr+1.2),p.target.position.set(ms+.4,0,Ed-7),s.add(p,p.target);function m(b){for(const g of r){if(!g.pivot)continue;const d=g.down?1:0;Math.abs(g.fall-d)<.002||(g.fall=Ke.damp(g.fall,d,g.down?14:6,b),g.pivot.rotation.x=g.fall*(Math.PI/2)*.94)}}return{lamp:p,targets:r,update:m,reset:u,strike:c,targetFor:l,firingLine:new P(ms+.4,0,Xr),standing:h,score:()=>({hits:a,shots:o,standing:h(),lanes:r.length}),countShot:()=>{o++}}}const nM=Math.PI*2,ao=[[0,329486,725015,9414845,2766404,1315855],[.22,791584,1909808,10466502,3885656,1710612],[.27,2569807,9067070,16757370,7035474,3024416],[.34,4155281,12491384,16766893,9348020,5260858],[.5,5078958,12043981,16774370,11124944,6971984],[.68,4221338,12624260,16768180,9676467,5721151],[.76,2372170,9394745,16751971,6509644,2827294],[.83,857378,1844015,10269124,3819605,1644819],[1,329486,725015,9414845,2766404,1315855]],rh=new De,Ad=new De;function iM(s){let e=0;for(;e<ao.length-2&&ao[e+1][0]<=s;)e++;const t=ao[e],n=ao[e+1],i=Math.max(1e-5,n[0]-t[0]),r=Ke.clamp((s-t[0])/i,0,1),a=[];for(let o=1;o<t.length;o++)rh.setHex(t[o]),Ad.setHex(n[o]),a.push(rh.clone().lerp(Ad,r));return a}const sM=`
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,rM=`
  uniform vec3 zenith;
  uniform vec3 horizon;
  uniform vec3 sunColor;
  uniform vec3 sunDirection;
  uniform vec3 moonDirection;
  uniform float sunAbove;
  uniform float starOpacity;
  uniform float cloud;
  varying vec3 vDirection;

  // A cheap stable hash, so the stars are in the same place every frame and
  // the same place every run.
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    vec3 dir = normalize(vDirection);
    float up = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
    // Band the gradient toward the horizon rather than spreading it evenly:
    // most of a sky's colour change happens in the bottom quarter of it.
    vec3 base = mix(horizon, zenith, pow(up, 0.62));

    // Stars: a sparse grid of points, brightest overhead, gone in daylight and
    // dimmed by cloud.
    float star = 0.0;
    if (starOpacity > 0.001) {
      vec3 cell = floor(dir * 220.0);
      float h = hash(cell);
      if (h > 0.9955) {
        vec3 centre = (cell + 0.5) / 220.0;
        float d = length(normalize(centre) - dir);
        star = smoothstep(0.0045, 0.0, d) * (0.35 + hash(cell + 3.3) * 0.65);
      }
      star *= starOpacity * smoothstep(-0.02, 0.35, dir.y);
    }

    // The sun: a disc with a wide warm bloom around it.
    float sunAngle = dot(dir, sunDirection);
    float sunDisc = smoothstep(0.99955, 0.99985, sunAngle);
    float sunGlow = pow(max(sunAngle, 0.0), 220.0) * 0.5
                  + pow(max(sunAngle, 0.0), 8.0) * 0.10;

    // The moon: smaller, colder, with a faint halo.
    float moonAngle = dot(dir, moonDirection);
    float moonDisc = smoothstep(0.99975, 0.99992, moonAngle);
    float moonGlow = pow(max(moonAngle, 0.0), 900.0) * 0.35;

    vec3 colour = base;
    colour += star;
    colour += sunColor * (sunGlow * (1.0 - cloud * 0.85));
    colour += sunColor * sunDisc * 2.6 * (1.0 - cloud * 0.9);
    colour += vec3(0.72, 0.79, 0.88) * (moonGlow + moonDisc * 1.5)
            * (1.0 - sunAbove) * (1.0 - cloud * 0.8);

    // Overcast flattens everything toward a single grey.
    vec3 overcast = mix(vec3(0.055, 0.062, 0.070), vec3(0.40, 0.42, 0.44), sunAbove);
    colour = mix(colour, overcast, cloud * 0.72);
    gl_FragColor = vec4(colour, 1.0);
  }
`;function aM({scene:s,dayLength:e=240,startAt:t=.3}){const n={zenith:{value:new De(329486)},horizon:{value:new De(725015)},sunColor:{value:new De(16774370)},sunDirection:{value:new P(0,1,0)},moonDirection:{value:new P(0,-1,0)},sunAbove:{value:0},starOpacity:{value:1},cloud:{value:0}},i=new Kt(new Wo(760,32,20),new Ft({uniforms:n,vertexShader:sM,fragmentShader:rM,side:Mn,depthWrite:!1,fog:!1,toneMapped:!0}));i.name="Sky_Dome",i.renderOrder=-1e3,i.frustumCulled=!1,s.add(i);const r=new Po(16774370,0);r.castShadow=!0,r.shadow.mapSize.set(1024,1024),r.shadow.camera.left=-46,r.shadow.camera.right=46,r.shadow.camera.top=46,r.shadow.camera.bottom=-46,r.shadow.camera.far=220,s.add(r,r.target);const a=new Po(10927561,0);s.add(a,a.target);const o=new Nh(2766404,1315855,1);s.add(o);let c=.15,l=.15,h=0,u=26,f=t*e;const p={timeOfDay:t,dayFactor:0,cloud:l,rain:h,label:"CLEAR"},m=new P,b=new P;function g(d){f+=d;const x=f/e%1;p.timeOfDay=x;const _=(x-.25)*nM;m.set(Math.cos(_)*.42,Math.sin(_),Math.cos(_)*.86).normalize(),b.copy(m).negate();const v=m.y,T=Ke.smoothstep(v,-.14,.22);if(p.dayFactor=T,u-=d,u<=0){const O=Math.random();c=O<.34?.08+Math.random()*.14:O<.68?.35+Math.random()*.22:.72+Math.random()*.26,u=40+Math.random()*70}l=Ke.damp(l,c,.28,d);const A=Ke.smoothstep(l,.62,.92);h=Ke.damp(h,A,A>h?.35:.16,d),p.cloud=l,p.rain=h,p.label=h>.45?"RAIN":l>.55?"OVERCAST":T>.5?"CLEAR":"CLEAR NIGHT";const[C,D,w,S,I]=iM(x);n.zenith.value.copy(C),n.horizon.value.copy(D),n.sunColor.value.copy(w),n.sunDirection.value.copy(m),n.moonDirection.value.copy(b),n.sunAbove.value=T,n.starOpacity.value=(1-T)*(1-l*.9),n.cloud.value=l;const z=1-l*.72;return r.position.copy(m).multiplyScalar(120),r.color.copy(w),r.intensity=Math.max(0,T)*3.6*z,r.visible=r.intensity>.01,a.position.copy(b).multiplyScalar(120),a.intensity=Math.max(0,1-T)*2.4*(1-l*.55),a.visible=a.intensity>.01,o.color.copy(S),o.groundColor.copy(I),o.intensity=(.85+T*1.25)*(1-l*.25),s.fog&&(s.fog.color.copy(D).lerp(rh.setHex(10135213),l*.35*T),s.fog.density=.0075+h*.012+l*.003),p}return g(0),{dome:i,sun:r,moon:a,ambient:o,uniforms:n,state:p,update:g,setTimeOfDay(d){f=(d%1+1)%1*e,g(0)},setWeather(d){c=Ke.clamp(d,0,1),u=90}}}function oM(s){const e=new vl;e.background=new De(197892),e.fog=new Rs(329735,.019);const t=new vl;t.fog=new Rs(1318182,.0095);const n=new vl,i=new kn,r=new qt(70,innerWidth/innerHeight,.05,900),a=new P,o=new P,c=new P;r.rotation.order="YXZ",r.position.set(0,1.67,0),i.add(r),i.position.set(0,0,5),e.add(i);const l=[],h={bunker:new En({minX:-6.55,maxX:6.55,minZ:-6.85,maxZ:6.85}),outside:new En({minX:-19.2,maxX:19.2,minZ:-26,maxZ:17.2}),silo:new En(null)},u=[];function f(E,k,V,ae){E.userData.interaction={name:k,world:V,onUse:ae},l.push(E)}function p(E,k,V,ae=[0,0,0],oe=1,Ue={}){const Fe=Cs(E);Fe.position.set(...V),Fe.rotation.set(...ae),Fe.scale.setScalar(oe),k.add(Fe);const lt=Ue.world??(k===t?"outside":k===n?"silo":"bunker");return Ue.collide!==!1&&h[lt]&&h[lt].addObject(Fe,{shrink:Ue.shrink??.04,climbable:Ue.climbable??!1}),Fe}p(s.environment,e,[0,0,0],[0,0,0],1,{collide:!1});const m=new Fn(16738874,3.2,7.5,2);m.position.set(0,3.35,6),e.add(m);const b=[[-3.4,-3.6],[3.4,-3.6],[-3.4,2.35],[3.4,2.35]];for(const[E,k]of b){p(s.ceilingLight,e,[E,3.76,k],[0,0,0],1,{collide:!1});const V=new Fn(14673631,16,11,2);V.position.set(E,3.4,k),e.add(V),u.push(V)}p(s.pipes,e,[6.25,.14,-4.8],[0,Math.PI,0]),p(s.pipes,e,[-6.25,.14,1.8],[0,0,0]);const g=p(s.ventilation,e,[5.2,0,-4.85],[0,-Math.PI/2,0],.88);f(g,"AIR FILTRATION UNIT","bunker",()=>window.dispatchEvent(new CustomEvent("lostsignal:filtration"))),p(s.electrical,e,[-4.85,.1,6.88],[0,0,0],.9),p(s.lockers,e,[-2.55,0,6.55],[0,0,0],.84),p(s.bench,e,[4.85,0,6.25],[0,Math.PI,0],.88),p(s.clutter,e,[-4.55,0,2.55],[0,Math.PI/2,0],.92,{climbable:!0}),p(s.statusBoard,e,[0,1.15,7.17],[0,Math.PI,0],.9,{collide:!1}),[[[-5.9,3.15,-6.55],[0,.6,0]],[[5.9,3.15,-6.55],[0,-.6,0]],[[-5.9,3.15,6.55],[0,2.48,0]],[[5.9,3.15,6.55],[0,-2.48,0]]].forEach(([E,k])=>p(s.wallCamera,e,E,k,.72,{collide:!1}));const x=p(s.desk,e,[2.5,0,-3.2]),_=Bn(x,"Terminal_Screen")||x;f(_,"COMPUTER TERMINAL","bunker",()=>window.dispatchEvent(new CustomEvent("lostsignal:computer")));const v=p(s.radio,e,[3.55,1.1,-2.85],[0,0,0],.92,{collide:!1});f(v,"SHORTWAVE RADIO","bunker",()=>window.dispatchEvent(new CustomEvent("lostsignal:radio")));const T=p(s.cctv,e,[-3.15,0,-3.18]);f(T,"CCTV SURVEILLANCE","bunker",()=>window.dispatchEvent(new CustomEvent("lostsignal:cctv"))),p(s.chair,e,[-3.15,0,-1.45],[0,0,0],1,{climbable:!0}),p(s.bed,e,[.7,0,5.55],[0,Math.PI/2,0],1,{climbable:!0}),p(s.storage,e,[5.9,0,-1.1],[0,Math.PI/2,0],.92),p(s.storage,e,[-5.9,0,-1.35],[0,-Math.PI/2,0],.92);const A=p(s.generator,e,[-4.6,0,4.72],[0,0,0],.9);f(A,"DIESEL GENERATOR","bunker",()=>window.dispatchEvent(new CustomEvent("lostsignal:generator")));const C=Z_({assets:s,scene:e,colliders:h.bunker,place:p,addInteraction:f});C?.lights?.length&&u.push(...C.lights);const D=p(s.blastDoor,e,[0,0,-7.3],[0,0,0],1,{collide:!1}),w=Bn(D,"BlastDoor_Door"),S=Bn(D,"DoorWheel_Rim")||D;let I=!1;f(S,"BLAST DOOR","bunker",()=>{I=!I,window.dispatchEvent(new CustomEvent("lostsignal:door",{detail:{open:I}}))});let z=!1,O=null;const G=s.habShell?V_({scene:n,colliders:h.silo,place:p,addInteraction:f,assets:s}):null,j=G?B_({scene:n,colliders:h.silo,assets:s,walkable:G.walkable,count:20}):null,K=G?$_({scene:n,colliders:h.silo,assets:s,place:p,addInteraction:f,silo:G}):null;if(G){const E=p(s.accessHatch,e,[-1.75,0,3.35],[0,0,0],1,{climbable:!0}),k=Bn(E,"Hatch_Wheel")||E,V=Bn(E,"Hatch_Void");V?.isMesh&&(V.position.y=Math.max(V.position.y,.165),V.material=new Pn({color:0,toneMapped:!1}));const ae=[];if(E.traverse(oe=>{/^Hatch_(Lid|Bolt_|Wheel$|Spoke_|Hub$)/.test(oe.name)&&ae.push(oe)}),ae.length){O=new kn,O.name="Hatch_Hinge",O.position.set(0,0,.84),E.add(O),E.updateWorldMatrix(!0,!0);for(const oe of ae)O.attach(oe)}f(k,"SILO ACCESS HATCH","bunker",()=>{z=!z,window.dispatchEvent(new CustomEvent("lostsignal:hatch",{detail:{open:z}}))}),f(E,"DESCEND TO SILO","bunker",()=>{window.dispatchEvent(new CustomEvent("lostsignal:descend",{detail:{allowed:z}}))})}const ee=p(s.accessControl,e,[-1.82,.6,-6.96],[0,0,0],.62,{collide:!1});f(ee,"SURFACE ACCESS","bunker",()=>window.dispatchEvent(new CustomEvent("lostsignal:surface",{detail:{allowed:I}})));const X=300,de=new wn,se=new Float32Array(X*3);for(let E=0;E<X;E++)se[E*3]=(Math.random()-.5)*13,se[E*3+1]=.3+Math.random()*3.5,se[E*3+2]=(Math.random()-.5)*14;de.setAttribute("position",new rn(se,3));const ge=new Co(de,new la({color:14147545,size:.018,transparent:!0,opacity:.19,depthWrite:!1}));e.add(ge),p(s.exteriorGround,t,[0,0,0],[0,0,0],1,{collide:!1}),p(s.exteriorEntrance,t,[0,0,-17],[0,0,0],1,{shrink:.12});const Ee=aM({scene:t,dayLength:240,startAt:.3});for(let E=-18;E<=18;E+=4)p(s.fence,t,[E,0,-27],[0,0,0]);for(let E=-23;E<=15;E+=4)p(s.fence,t,[-20,0,E],[0,Math.PI/2,0]),p(s.fence,t,[20,0,E],[0,Math.PI/2,0]);for(let E=-18;E<=-6;E+=4)p(s.fence,t,[E,0,18],[0,0,0]);for(let E=6;E<=18;E+=4)p(s.fence,t,[E,0,18],[0,0,0]);p(s.gate,t,[0,0,18],[0,0,0]);const $e=[[-14,0,-20],[14,0,-20],[-14,0,11],[14,0,11]],at=[];$e.forEach(([E,k,V])=>{p(s.floodlight,t,[E,k,V],[0,0,0],1,{shrink:.1});const ae=new va(14412528,4.5,34,.62,.45,1.6);ae.position.set(E,4.35,V),ae.target.position.set(E*.35,0,V*.35),t.add(ae,ae.target),at.push(ae)});const et=[s.deadTree01,s.deadTree02,s.deadTree03,s.deadTree04,s.deadTree05].filter(Boolean);et.length?[[-30,-34,.4,.95],[-14,-35,2.1,.8],[4,-37,1.2,1.05],[22,-34,3.4,.85],[-34,-18,.9,.9],[-36,2,2.6,1],[-33,20,1.7,.8],[-28,32,4.2,.95],[30,-20,5.1,.85],[34,-2,.3,1],[32,17,2.9,.9],[26,30,1.4,.8],[-10,33,3.7,.95],[10,35,.6,.9]].forEach(([k,V,ae,oe],Ue)=>p(et[Ue%et.length],t,[k,0,V],[0,ae,0],oe,{collide:!1})):[[-16,0,-6,0],[16,0,1,1.1],[-12,0,13,-.5],[11,0,-22,.7]].forEach(([E,k,V,ae])=>p(s.deadTree,t,[E,k,V],[0,ae,0],.9)),[[-8,0,-9,0],[8,0,-8,.2],[-7,0,8,-.1],[7,0,7,.1]].forEach(([E,k,V,ae])=>p(s.barrier,t,[E,k,V],[0,ae,0],.9)),[[-11,0,-14,0],[11,0,-14,.7],[-15,0,5,.2],[13,0,12,-.5]].forEach(([E,k,V,ae])=>p(s.rubble,t,[E,k,V],[0,ae,0],1,{climbable:!0}));let Q=null;if(s.solarArray){const E=new Map,k=V=>{if(!V)return V;if(E.has(V))return E.get(V);const ae=V.clone();return ae.color&&ae.color.getHex()>3355443&&ae.color.multiplyScalar(.42),ae.roughness=Math.max(ae.roughness??.7,.82),E.set(V,ae),ae};for(let V=0;V<3;V++)for(let ae=0;ae<2;ae++)p(s.solarArray,t,[11.4+ae*5.7,0,-17.4+V*6.6],[0,-.18+V*.05,0],1,{shrink:.1}).traverse(Ue=>{Ue.isMesh&&(Ue.material=Array.isArray(Ue.material)?Ue.material.map(k):k(Ue.material))});Q=new Fn(9417668,4.5,24,2),Q.position.set(14.2,3.6,-8.4),t.add(Q)}const $=(E,k,V={})=>{if(E)for(const[ae,oe,Ue,Fe=1]of k)p(E,t,[ae,0,oe],[0,Ue,0],Fe,V)};$(s.propContainer,[[-13.6,-23.4,0],[-6.4,-23.4,0]]),$(s.propContainerRed,[[.8,-23.4,0]]),$(s.propWaterTower,[[10.4,-24.6,.35]],{shrink:.35}),$(s.propBarrel,[[-15.2,-20.4,.3],[-14.4,-20.9,1.2],[-15.6,-21.3,2.4],[4.6,-21.6,.8],[5.4,-22.1,2.1]]),$(s.propPipes,[[-2.4,-20.8,0],[-1.6,-21.4,0]]),$(s.propTruck,[[6.8,13.8,3.02],[-6.8,13.8,3.02]]),$(s.propPallet,[[10.6,9.4,.2],[11.4,10.1,1.1]]),$(s.propPalletBroken,[[10.1,11,2.2]]),$(s.propWheels,[[12.4,12.2,.3]]),$(s.propTrashBags,[[-10.4,12.2,.9],[-11.2,13,2.6]],{collide:!1}),$(s.propTownSign,[[0,21.6,0]],{shrink:.2}),$(s.estateCar,[[-12.2,6.4,1.42],[13.2,-6.8,2.86]],{shrink:.05});const xe=s.estateCar?p(s.estateCar,t,[2.8,0,16.2],[0,Math.PI*.02,0],1,{shrink:.05}):null;xe&&(xe.name="Gate_Estate_Car",f(xe,"ESTATE CAR — NOT RUNNING","outside",()=>window.dispatchEvent(new CustomEvent("lostsignal:car"))));const Oe=[];if(s.distantTown){const E=p(s.distantTown,t,[-210,0,470],[0,-.42,0],1,{collide:!1});E.name="Distant_Town",E.traverse(k=>{k.isMesh&&(k.material=k.material.clone(),k.material.fog=!1,k.castShadow=!1,k.receiveShadow=!1,k.material.userData.baseColor=k.material.color.clone(),Oe.push(k.material))})}$(s.propStreetLight,[[-4.2,17.2,1.6],[4.2,17.2,-1.6]],{shrink:.2}),$(s.propCone,[[-3.2,14,0],[-3.2,9,0],[-3.2,4,0],[3.2,14,0],[3.2,9,0],[3.2,4,0]],{collide:!1}),$(s.propBarrier,[[-2.6,-8.4,0],[-1.3,-8.4,0],[1.3,-8.4,0],[2.6,-8.4,0]]),$(s.propChest,[[-4.8,-7.6,.6]]),s.remainsCovered&&[[-6.4,0,-12.8,.4],[9.2,0,-5.6,-1.1],[-13.5,0,3.2,2.2],[5.8,0,15.4,.9]].forEach(([E,k,V,ae])=>p(s.remainsCovered,t,[E,k,V],[0,ae,0],1,{collide:!1})),s.remainsSlumped&&[[-8.9,0,-8.2,.35],[12.4,0,9.1,-2.4],[2.6,0,-19.2,3]].forEach(([E,k,V,ae])=>p(s.remainsSlumped,t,[E,k,V],[0,ae,0],1,{collide:!1}));const we=tM({scene:t,colliders:h.outside,assets:s,place:p,addInteraction:f}),Qe=new Map,Rt=E=>{if(!E?.color)return E;if(Qe.has(E))return Qe.get(E);const k=E.color.r*.29+E.color.g*.59+E.color.b*.12;if(k>=.055)return Qe.set(E,E),E;const V=E.clone();return V.color.addScalar(.055-k),Qe.set(E,V),V};t.traverse(E=>{E.isMesh&&(E.material=Array.isArray(E.material)?E.material.map(Rt):Rt(E.material))});const L=p(s.accessControl,t,[-2.15,.55,-13.55],[0,0,0],.64,{collide:!1});f(L,"RETURN TO SHELTER","outside",()=>window.dispatchEvent(new CustomEvent("lostsignal:return")));const ft=z_({scene:t,colliders:h.outside,assets:s,wildlife:!1}),qe=ft.wildlife,ze=320,Re=new Mr(.012,.44),pt=new Pn({color:11452875,transparent:!0,opacity:.16,depthWrite:!1,side:ni}),ve=new Lf(Re,pt,ze),Ye=[],gt=new Je;for(let E=0;E<ze;E++){const k=new P((Math.random()-.5)*55,3+Math.random()*18,-30+Math.random()*58);Ye.push({p:k,v:7+Math.random()*7}),gt.makeRotationZ(-.08),gt.setPosition(k),ve.setMatrixAt(E,gt)}ve.frustumCulled=!1,ve.visible=!1,t.add(ve);const vt=420,R=new wn,y=new Float32Array(vt*3),H=[];for(let E=0;E<vt;E++)y[E*3]=(Math.random()-.5)*64,y[E*3+1]=Math.random()*9,y[E*3+2]=(Math.random()-.5)*70,H.push(.25+Math.random()*.7);R.setAttribute("position",new rn(y,3));const Z=new Co(R,new la({color:13616818,size:.035,transparent:!0,opacity:.22,depthWrite:!1}));Z.frustumCulled=!1,t.add(Z);const ie=new kn;r.add(ie),ie.position.set(.32,-.38,-.72),ie.rotation.set(-.04,-.08,0),ie.visible=!1;const Y=new kn;ie.add(Y);let Te=null,he=null;const _e=new gn,ye=new P,le=new P,be=new P;function ke(E){E.updateWorldMatrix(!0,!0),_e.setFromObject(E),_e.getSize(ye),_e.getCenter(le);const k=ye.x>=ye.z?"x":"z",V=ye[k];if(V<1e-5)return null;let ae=0,oe=0,Ue=0,Fe=0;for(const U of Le(E)){const W=U.geometry?.attributes?.position;if(!W)continue;const q=Math.max(1,Math.floor(W.count/400));for(let F=0;F<W.count;F+=q){be.fromBufferAttribute(W,F).applyMatrix4(U.matrixWorld),oe+=be[k],ae++;const ce=Math.abs(be.y-le.y);be[k]<le[k]?Ue=Math.max(Ue,ce):Fe=Math.max(Fe,ce)}}if(!ae)return null;const lt=(oe/ae-le[k])/V,Ct=Math.abs(lt)>=.02?Math.sign(lt):Math.sign(Fe-Ue);if(!Ct)return null;const M=new P;return M[k]=-Ct,M}function Le(E){const k=[];return E.traverse(V=>{(V.isMesh||V.isSkinnedMesh)&&k.push(V)}),k}function pe(E){if(he===E&&Te)return Te;Te&&(Y.remove(Te),Te=null);const k=E&&s[E]||C?.weaponAsset||s.rifle;if(!k)return he=null,null;he=E&&s[E]?E:null;const V=Cs(k),ae=fn[he]?.view||{scale:C?.weaponAsset?.16:.78,offset:[C?.weaponAsset?-.04:0,C?.weaponAsset?-.08:-.02,0]};V.rotation.set(0,0,0);const oe=ke(V),Ue=ye.x>=ye.z;let Fe;return oe?Fe=Math.atan2(oe.x,-oe.z):Fe=Ue?Math.PI/2:Math.PI,ae.flip&&(Fe+=Math.PI),V.rotation.set(0,Fe,0),V.scale.setScalar(ae.scale),V.position.set(...ae.offset),V.name=`Equipped_${he||"Rifle"}`,Y.add(V),Te=V,V}pe(yr);const Ne=[new qt(48,16/9,.1,160),new qt(50,16/9,.1,160),new qt(48,16/9,.1,160),new qt(42,16/9,.1,190),new qt(56,16/9,.1,90)],N=[new P(0,1.5,18),new P(20,1.6,-4),new P(2,1.1,-5),new P(0,1,-4)];if(Ne[0].position.set(0,4.2,-12),Ne[1].position.set(17,4.5,10),Ne[2].position.set(-16,4,-10),Ne[3].position.set(-18,11,20),G){const E=G.securePosition;Ne[4].position.set(E.x*.55,G.topY+2.9,E.z*.55),N.push(E.clone().setY(G.topY+1.2))}else Ne[4].position.set(0,3,0),N.push(new P(0,1,-4));Ne.forEach((E,k)=>E.lookAt(N[k]));const fe=Ne.map(E=>E.rotation.clone()),me=["outside","outside","outside","outside","silo"],Ae={bunker:e,outside:t,silo:n},ue={bunker:new P(0,0,-5.4),outside:new P(0,0,-12.15),silo:G?G.spawn.clone():new P(0,0,0)};function te(E){return i.parent&&i.parent.remove(i),(Ae[E]||e).add(i),i.position.copy(ue[E]||ue.bunker),i.position}function Ie(E,k,V,ae=.34,oe=.35,Ue=1.7){const Fe=h[E];return Fe?Fe.contains(k,V,ae,oe,Ue):!1}function je(E){const k=new kf;k.far=3.15,k.setFromCamera({x:0,y:0},r),r.getWorldPosition(c);const V=l.filter(Ue=>Ue.userData.interaction?.world!==E?!1:(Ue.getWorldPosition(o),o.distanceToSquared(c)<=18)),ae=k.intersectObjects(V,!0);if(!ae.length)return null;let oe=ae[0].object;for(;oe&&!oe.userData.interaction;)oe=oe.parent;return oe?.userData.interaction||null}function mt(E){const k=E===!0?yr:E||null;return ie.visible=!!k,k&&pe(k),C?.setEquipped(k),k}let ot=0,bn=0,$t="magazine";const os={rifle:"magazine",smg:"magazine",pistol:"magazine",shotgun:"pump",sniper:"magazine",revolver:"cylinder",blade:"stow"};function Zn(E,k=0){if(E==="shoot"||E!=="reload")return;const V=fn[he];$t=V?.family==="sniper"&&/bolt|materiel/i.test(V.name)?"bolt":os[V?.family]||"magazine",bn=Math.max(.25,k||V?.reloadTime||1.2),ot=bn}function Hi(E){let k=0,V=0,ae=0,oe=0,Ue=0;if(ot>0){ot=Math.max(0,ot-E);const Fe=1-ot/bn,lt=Math.sin(Math.PI*Math.min(1,Fe)),Ct=Math.sin(Math.PI*2*Math.min(1,Fe));$t==="pump"?(ae=lt*.1+Ct*.05,oe=lt*.12):$t==="bolt"?(Ue=-lt*.4,ae=Ct*.045,oe=lt*.1):$t==="cylinder"?(Ue=lt*.62,V=-lt*.07):$t==="stow"?(V=-lt*.22,oe=lt*.55):(V=-lt*.13,Ue=-lt*.3,oe=lt*.16)}Y.position.set(Ke.damp(Y.position.x,k,18,E),Ke.damp(Y.position.y,V,18,E),Ke.damp(Y.position.z,ae,18,E)),Y.rotation.x=Ke.damp(Y.rotation.x,oe,18,E),Y.rotation.z=Ke.damp(Y.rotation.z,Ue,18,E)}function Ds(E){I=!!E}function Rr(E){z=!!E}let B=0;function re(E,k="bunker",V=i.position){if(B+=E,k==="silo"&&(G?.update(E,r.getWorldPosition(a)),K?.update(E)),k==="outside"&&we?.update(E),Ee.update(E),ft.update(E,k,V),j?.update(E,k,V),C?.update(E),Hi(E),w&&(w.position.x=Ke.damp(w.position.x,I?3.55:0,3.4,E)),O&&(O.rotation.x=Ke.damp(O.rotation.x,z?1.38:0,5.2,E)),ge.rotation.y+=E*.008,k==="outside"){ve.visible=Ee.state.rain>.02,pt.opacity=.05+Ee.state.rain*.2;const ae=R.attributes.position.array;for(let Fe=0;Fe<vt;Fe++)ae[Fe*3]+=H[Fe]*E*1.6,ae[Fe*3+1]+=Math.sin(B*.6+Fe)*E*.08,ae[Fe*3]>32&&(ae[Fe*3]=-32,ae[Fe*3+2]=(Math.random()-.5)*70);R.attributes.position.needsUpdate=!0,Z.material.opacity=.06+(1-Ee.state.rain)*.18*(.4+Ee.state.dayFactor*.6);const oe=1-Ee.state.dayFactor;for(const Fe of at)Fe.intensity=4.5*oe;we?.lamp&&(we.lamp.intensity=5.5*oe),Q&&(Q.intensity=4.5*oe);const Ue=Ee.uniforms.horizon.value;for(const Fe of Oe)Fe.color.copy(Fe.userData.baseColor).lerp(Ue,.58)}if(ve.visible){for(let ae=0;ae<Ye.length;ae++){const oe=Ye[ae];oe.p.y-=oe.v*E,oe.p.x-=.85*E,oe.p.y<.05&&(oe.p.y=10+Math.random()*13,oe.p.x=(Math.random()-.5)*55,oe.p.z=-30+Math.random()*58),gt.makeRotationZ(-.08),gt.setPosition(oe.p),ve.setMatrixAt(ae,gt)}ve.instanceMatrix.needsUpdate=!0}}return{assets:s,bunker:e,outside:t,silo:n,scenes:Ae,player:i,camera:r,interactions:l,wildlife:qe,residents:j,cctvCameras:Ne,cctvBaseRot:fe,weaponView:ie,weaponAction:Y,blocked:Ie,colliders:h,spawnPoints:ue,creatures:ft,cctvScenes:me,nearestInteraction:je,setWorld:te,setArmed:mt,playGun:Zn,setWeapon:pe,setDoorOpen:Ds,setHatchOpen:Rr,update:re,heldWeapon:()=>he,bunkerLights:u,emergency:m,siloWorld:G,armory:C,garrison:K,range:we,sky:Ee,floodLights:at,doorOpen:()=>I,hatchOpen:()=>z}}const lM={darkSteel:3093810,steel:4672840,brushed:6975594,green:3557434,concrete:5132361,fabric:4344128,rubber:1645594,wood:4994857,warning:8142896,deck:5790546,facade:3749423,inner:6446418,cream:7037781,door:2704192,orange:8010532,tile:5846312};function Yl(s){const e=Object.fromEntries(Object.entries(lM).map(([t,n])=>[t,new De(n)]));s.traverse(t=>{if(!t.isMesh)return;const n=Array.isArray(t.material)?t.material:[t.material];for(const i of n){if(!i?.color||i.userData.lsGraded)continue;i.userData.lsGraded=!0;const r=(i.name||"").toLowerCase();if(r.includes("darksteel"))i.color.copy(e.darkSteel);else if(r.includes("brushed"))i.color.copy(e.brushed);else if(r.includes("steel"))i.color.copy(e.steel);else if(r.includes("militarygreen")||r.includes("greenpaint"))i.color.copy(e.green);else if(r.includes("plate"))i.color.copy(e.deck);else if(r.includes("concrete"))i.color.copy(e.concrete);else if(r.includes("fabric"))i.color.copy(e.fabric);else if(r.includes("rubber"))i.color.copy(e.rubber);else if(r.includes("wood"))i.color.copy(e.wood);else if(r.includes("warningred"))i.color.copy(e.warning);else if(r.includes("facade"))i.color.copy(e.facade);else if(r.includes("innerwall"))i.color.copy(e.inner);else if(r.includes("cream"))i.color.copy(e.cream);else if(r.includes("doorpaint"))i.color.copy(e.door);else if(r.includes("orange"))i.color.copy(e.orange);else if(r.includes("tileband"))i.color.copy(e.tile);else{const a=i.emissive?Math.max(i.emissive.r,i.emissive.g,i.emissive.b):0,o=i.color.r*.2126+i.color.g*.7152+i.color.b*.0722;a<.08&&o<.06&&i.color.lerp(e.darkSteel,.55)}r.includes("plate")?("roughness"in i&&(i.roughness=.94),"metalness"in i&&(i.metalness=.22)):("roughness"in i&&(i.roughness=Ke.clamp(i.roughness??.6,.42,.98)),"metalness"in i&&i.metalness>.8&&(i.metalness=.7)),i.normalScale&&i.normalScale.multiplyScalar(.65),i.emissive&&Math.max(i.emissive.r,i.emissive.g,i.emissive.b)>.05&&(r.includes("whitelight")?i.emissiveIntensity=.48:r.includes("window")?i.emissiveIntensity=.28:r.includes("warmlamp")||r.includes("pendant")?i.emissiveIntensity=.52:r.includes("growlight")?i.emissiveIntensity=.82:i.emissiveIntensity=Math.min(i.emissiveIntensity??.9,1.05)),i.needsUpdate=!0}})}function cM(s){const e=oM(s),{bunker:t,outside:n}=e;t.background=new De(856080),t.fog=new Rs(1514265,.019),Yl(t),Yl(n),e.silo&&Yl(e.silo);const i=new Nh(9148303,2369055,.72);t.add(i);const r=new Zc(5923676,.3);t.add(r),e.bunkerLights.map((l,h)=>{l.color.setHex(14673631),l.intensity=48,l.distance=13,l.decay=2,l.castShadow=h%2===0,l.castShadow&&(l.shadow.mapSize.set(1024,1024),l.shadow.bias=-9e-4,l.shadow.normalBias=.022,l.shadow.camera.near=.25,l.shadow.camera.far=12);const u=new va(15659750,28,11,.95,.62,2);return u.position.copy(l.position),u.target.position.set(l.position.x*.6,0,l.position.z*.6),t.add(u,u.target),{light:l,pool:u}});const a=(l,h,u,f)=>{const p=new Fn(l,h,u,2);return p.position.set(...f),t.add(p),p};a(16767392,22,4.6,[2.45,1.55,-2.95]),a(12575446,20,4.4,[-3.15,1.55,-2.95]),a(16761466,14,3.8,[4.6,1.35,4.75]),a(16764554,11,3.4,[-5.95,1.45,.6]),a(11065531,10,3.6,[-4.85,1.3,6.35]);const o=e.emergency;o.color.setHex(16738874),o.intensity=14,o.distance=7.5,o.decay=2,n.background=new De(1714225),n.fog=new Rs(2241597,.0125),n.traverse(l=>{l.isHemisphereLight&&(l.color.setHex(8494255),l.groundColor.setHex(2700079),l.intensity=2.15),l.isDirectionalLight&&(l.color.setHex(12637151),l.intensity=3.4,l.shadow.bias=-.0012,l.shadow.normalBias=.03),l.isSpotLight&&(l.color.setHex(15134690),l.intensity=230,l.distance=40,l.decay=2,l.penumbra=.5,l.angle=.72)}),n.add(new Zc(5466229,.38));const c=e.update.bind(e);return e.update=(l,...h)=>{c(l,...h)},e}const np={name:"LostSignalGrade",uniforms:{tDiffuse:{value:null},time:{value:0},vignette:{value:.34},grain:{value:.006},aberration:{value:45e-5},contrast:{value:1.025},saturation:{value:.94},lift:{value:new De(725267)},damage:{value:0}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float time, vignette, grain, aberration, contrast, saturation, damage;
    uniform vec3 lift;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec2 centered = vUv - 0.5;
      float radius = length(centered);

      // Lateral chromatic aberration, strongest at the edge of the frame.
      float spread = aberration * (1.0 + damage * 5.0) * radius;
      vec3 color;
      color.r = texture2D(tDiffuse, vUv - centered * spread).r;
      color.g = texture2D(tDiffuse, vUv).g;
      color.b = texture2D(tDiffuse, vUv + centered * spread).b;

      color = (color - 0.5) * contrast + 0.5;
      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(vec3(luma), color, saturation);
      color += lift * (1.0 - luma);

      float falloff = smoothstep(1.05, 0.32, radius);
      color *= mix(1.0, falloff, vignette);

      float noise = hash(vUv * vec2(1024.0, 768.0) + fract(time) * 91.7) - 0.5;
      color += noise * grain * (0.35 + luma * 0.9);

      // Injury tint pulls the frame red and dark at the edges.
      color = mix(color, vec3(0.42, 0.05, 0.04) * luma * 1.6, damage * (0.25 + radius));

      gl_FragColor = vec4(max(color, 0.0), 1.0);
    }`},hM={name:"LostSignalCameraFeed",uniforms:{tDiffuse:{value:null},time:{value:0},nightVision:{value:0},signal:{value:1},scanline:{value:.28},curvature:{value:.12}},vertexShader:np.vertexShader,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float time, nightVision, signal, scanline, curvature;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      // Barrel distortion, so the feed sits on a curved tube.
      vec2 centered = vUv - 0.5;
      float r2 = dot(centered, centered);
      vec2 uv = 0.5 + centered * (1.0 + curvature * r2);
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }

      // Horizontal tearing that drifts down the frame like a bad tape head.
      float tear = step(0.995, hash(vec2(floor(uv.y * 90.0), floor(time * 8.0))));
      uv.x += tear * (hash(vec2(floor(time * 30.0), 3.0)) - 0.5) * 0.05 * (2.0 - signal);

      vec3 color = texture2D(tDiffuse, uv).rgb;

      if (nightVision > 0.5) {
        float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
        luma = pow(clamp(luma * 3.4 + 0.06, 0.0, 1.0), 0.78);
        color = vec3(luma * 0.32, luma, luma * 0.42);
      } else {
        float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
        color = mix(vec3(luma), color, 0.45) * vec3(0.86, 0.95, 0.9);
        color = pow(color, vec3(0.88));
      }

      // Interlaced scanlines and a slow roll bar.
      float lines = sin(uv.y * 900.0 + time * 6.0) * 0.5 + 0.5;
      color *= 1.0 - scanline * lines;
      float roll = smoothstep(0.0, 0.08, abs(fract(uv.y - time * 0.09) - 0.5));
      color *= 0.88 + 0.12 * roll;

      // Sensor noise, heavier when the signal is weak.
      float noise = hash(uv * vec2(640.0, 480.0) + fract(time) * 57.3);
      color += (noise - 0.5) * mix(0.30, 0.06, signal);
      color *= mix(0.35, 1.0, signal);

      float vig = smoothstep(0.95, 0.25, length(centered));
      color *= mix(0.55, 1.0, vig);

      gl_FragColor = vec4(max(color, 0.0), 1.0);
    }`},Rd=240,uM={day:1,power:87,air:71,water:19,food:8,fuel:6,filters:4};class dM{constructor(e={}){Object.assign(this,uM,e),this.elapsed=0,this.blackout=!1,this.strain=0}get snapshot(){const{day:e,power:t,air:n,water:i,food:r,fuel:a,filters:o}=this;return{day:e,power:t,air:n,water:i,food:r,fuel:a,filters:o}}tick(e,{indoors:t}){this.elapsed+=e;const n=e/Rd;this.power=Math.max(0,this.power-n*7.5),this.air=Math.max(0,this.air-n*(t?9:4)),this.water=Math.max(0,this.water-n),this.food=Math.max(0,this.food-n),this.power<=0&&(this.air=Math.max(0,this.air-n*14));const i=this.blackout;this.blackout=this.power<=0;let r=0;this.food<=0&&(r+=1),this.water<=0&&(r+=1),this.air<25&&(r+=(25-this.air)/25),this.strain=r;const a=this.day;return this.day=1+Math.floor(this.elapsed/Rd),{dayChanged:this.day!==a,blackoutChanged:this.blackout!==i,damage:r*e*1.4}}refuel(){return this.fuel<=0?{ok:!1,reason:"NO FUEL CANS LEFT"}:this.power>92?{ok:!1,reason:`GENERATOR AT ${Math.round(this.power)}% — NOT YET`}:(this.fuel-=1,this.power=Math.min(100,this.power+34),{ok:!0,reason:`GENERATOR REFUELLED — ${Math.round(this.power)}% · ${this.fuel} CANS LEFT`})}serviceFilters(){return this.filters<=0?{ok:!1,reason:"NO SPARE FILTERS LEFT"}:this.air>90?{ok:!1,reason:`AIR AT ${Math.round(this.air)}% — FILTERS STILL GOOD`}:(this.filters-=1,this.air=Math.min(100,this.air+38),{ok:!0,reason:`FILTERS REPLACED — AIR ${Math.round(this.air)}% · ${this.filters} SPARE`})}resupply({food:e=0,water:t=0,fuel:n=0,filters:i=0}){this.food+=e,this.water+=t,this.fuel+=n,this.filters+=i}}const ip="lost-signal-run-v1";function fM(){try{const s=localStorage.getItem(ip);return s?JSON.parse(s):null}catch{return null}}function pM(s){try{localStorage.setItem(ip,JSON.stringify(s))}catch{}}const Cd=64,mM=34,gM=7;function bM(){const e=document.createElement("canvas");e.width=e.height=64;const t=e.getContext("2d");t.clearRect(0,0,64,64);const n=64/2,i=t.createRadialGradient(n,n,64*.1,n,n,n);i.addColorStop(0,"rgba(60,56,52,0.95)"),i.addColorStop(.45,"rgba(96,90,84,0.5)"),i.addColorStop(1,"rgba(120,114,108,0)"),t.fillStyle=i,t.beginPath(),t.arc(n,n,n,0,Math.PI*2),t.fill(),t.strokeStyle="rgba(38,34,31,0.8)";for(let o=0;o<9;o++){const c=o/9*Math.PI*2+Math.random()*.4,l=64*(.16+Math.random()*.26);t.lineWidth=1+Math.random(),t.beginPath(),t.moveTo(n+Math.cos(c)*64*.1,n+Math.sin(c)*64*.1),t.lineTo(n+Math.cos(c)*l,n+Math.sin(c)*l),t.stroke()}const r=t.createRadialGradient(n,n,0,n,n,64*.19);r.addColorStop(0,"rgba(6,5,4,1)"),r.addColorStop(.7,"rgba(14,11,9,0.95)"),r.addColorStop(1,"rgba(30,25,21,0)"),t.fillStyle=r,t.beginPath(),t.arc(n,n,64*.19,0,Math.PI*2),t.fill();const a=new lg(e);return a.colorSpace=Xt,a}const Pd={hole:12170152,scorch:2762017,gouge:13617080,blood:7148560},xM=.12;function vM(){if(typeof document>"u")return{add:()=>null,update:()=>{},clear:()=>{},count:()=>0,total:()=>0};const s=new Mr(1,1),e=bM(),t=[];for(let f=0;f<Cd;f++){const p=new Pn({map:e,transparent:!0,opacity:0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4,toneMapped:!1}),m=new Kt(s,p);m.name=`Bullet_Mark_${f}`,m.visible=!1,m.frustumCulled=!0,m.renderOrder=3,t.push({mesh:m,material:p,scene:null,life:0,strength:0})}let n=0,i=0;const r=new P,a=new P;function o(f,p,m,{kind:b="hole",size:g=.11}={}){return!f||!p?null:(b==="hole"&&g>=xM&&c(f,p,m,"scorch",g*2.1,.3),c(f,p,m,b,g,b==="blood"?.72:b==="gouge"?.6:.95))}function c(f,p,m,b,g,d){const x=t[n];n=(n+1)%Cd,i++,x.scene&&x.scene!==f&&x.scene.remove(x.mesh),x.mesh.parent!==f&&f.add(x.mesh),x.scene=f,r.copy(m&&m.lengthSq()>1e-6?m:r.set(0,1,0)),r.normalize(),x.mesh.position.copy(p).addScaledVector(r,.006),a.copy(x.mesh.position).add(r),x.mesh.lookAt(a),x.mesh.rotateZ(Math.random()*Math.PI*2);const _=g*(.82+Math.random()*.42);return x.mesh.scale.set(b==="gouge"?_*.34:_,_,1),x.material.color.setHex(Pd[b]??Pd.hole),x.strength=d,x.material.opacity=x.strength,x.mesh.visible=!0,x.life=mM,x.mesh}function l(f){for(const p of t)if(!(p.life<=0)){if(p.life-=f,p.life<=0){p.mesh.visible=!1,p.material.opacity=0;continue}p.material.opacity=p.strength*Math.min(1,p.life/gM)}}function h(){for(const f of t)f.life=0,f.mesh.visible=!1,f.material.opacity=0}return{add:o,update:l,clear:h,count:()=>t.filter(f=>f.life>0).length,total:()=>i,pool:t}}const ts=matchMedia("(pointer:coarse)").matches,sp=document.getElementById("boot"),Js=document.getElementById("start"),oo=document.getElementById("engineState"),yM=document.getElementById("fatal"),_M=document.getElementById("fatalText"),di=document.getElementById("prompt"),jl=document.getElementById("msg"),MM=document.getElementById("backend"),SM=document.getElementById("ammo"),Id=document.getElementById("foodStat"),Ld=document.getElementById("healthStat"),Dd=document.getElementById("motion"),Nd=document.getElementById("staminaBar"),Od=document.getElementById("staminaFill"),Ud=document.getElementById("taskList"),wM=document.getElementById("dayStat"),Fd=document.getElementById("clockStat"),Kl=document.getElementById("skyStat"),Bd=document.getElementById("powerStat"),zd=document.getElementById("waterStat"),kd=document.getElementById("airStat");let At,gi,Io,ah,Ji,_s,Ui,$r,ne,zt="bunker",yi=!1,ln=!1,Sn=!1,Ut=0,Rn=0,Xn=-.03,jn=!1;const rp=30,ap=90,_r=j_();let Ls=yr,tt=fn[yr],qn=rp,Kn=ap,rs=!1,ws=0,Ki=!1;const zh=vM();let sn=100;const Lt=new dM;let Zl=0,Jl=0,oh=0,ea=!1,lh=0,Ts=0,_n=!1,On=1,Bi=null,dn=!1,ch=!1;const An={sprint:!1,crouch:!1};let Ms=0;const St=new C_,hh=new zf,mi={},ns=new kf;let Hd=0;function _a(){return ne.scenes?.[zt]||ne.bunker}function Yo(){document.body.classList.toggle("portrait",innerHeight>innerWidth)}Yo();addEventListener("resize",Yo);addEventListener("orientationchange",()=>setTimeout(Yo,160));function Ze(s,e=1800){jl.textContent=s,jl.classList.add("on"),clearTimeout(Hd),Hd=setTimeout(()=>jl.classList.remove("on"),e)}function TM(s){console.error(s),yM.style.display="flex",_M.textContent=`Game startup failed: ${s?.message||s}`,sp.style.display="none"}const lo={mobile:{name:"mobile",pixelRatio:1.5,shadows:mh,samples:0,smaa:!0,grain:0,ao:!1},balanced:{name:"balanced",pixelRatio:1.75,shadows:nc,samples:2,smaa:!0,grain:.004,ao:!1},high:{name:"high",pixelRatio:2,shadows:nc,samples:4,smaa:!0,grain:.007,ao:!0}},Qi=(()=>{const s=lo[new URLSearchParams(location.search).get("quality")];if(s)return s;const e=navigator.hardwareConcurrency||4;return ts||e<=4?lo.mobile:e<=8?lo.balanced:lo.high})();function EM(){At=new wy({antialias:!0,powerPreference:"high-performance",alpha:!1}),At.setPixelRatio(Math.min(devicePixelRatio,Qi.pixelRatio)),At.setSize(innerWidth,innerHeight),At.shadowMap.enabled=!0,At.shadowMap.type=Qi.shadows,At.outputColorSpace=Xt,At.toneMapping=gh,At.toneMappingExposure=1,At.domElement.style.zIndex="0",document.body.insertBefore(At.domElement,document.body.firstChild)}function AM(){const s=new We;At.getDrawingBufferSize(s);const e=new pn(s.x,s.y,{type:In,samples:Qi.samples,colorSpace:mn});gi=new rd(At,e),Io=new ad(ne.bunker,ne.camera),gi.addPass(Io),Qi.ao&&(_s=new ti(ne.bunker,ne.camera,s.x,s.y),_s.output=ti.OUTPUT.Default,_s.updateGtaoMaterial({radius:.55,distanceExponent:1.4,thickness:.6,scale:1.1}),gi.addPass(_s)),ah=new vr(new We(innerWidth,innerHeight),.11,.34,1.02),gi.addPass(ah),Ji=new eh(np),Ji.uniforms.grain.value=Qi.grain,gi.addPass(Ji),gi.addPass(new od),Qi.smaa&&!Qi.samples&&gi.addPass(new Py(s.x,s.y)),Ui=new rd(At,e.clone()),Ui.addPass(new ad(ne.outside,ne.cctvCameras[0])),$r=new eh(hM),Ui.addPass($r),Ui.addPass(new od)}async function RM(){try{EM(),oo.textContent="Restoring Shelter 47 lighting, controls and life-support displays…";const s=await R_((e,t,n)=>{oo.textContent=`Bringing site systems online — ${t}/${n}`});ne=cM(s),ne.camera.rotation.order="YXZ",AM(),St.teleport(ne.player.position.x,0,ne.player.position.z),CM(),GM(),oo.textContent="✓ Shelter 47, walk-in armoury, habitation silo and service rifle loaded.",MM.textContent=`S47 INTERNAL // EXTERNAL LINK LOST // ${Qi.name.toUpperCase()} DISPLAY`,Js.disabled=!1,Js.textContent="ENTER SHELTER",At.setAnimationLoop(uS)}catch(s){console.error(s),oo.innerHTML=`<span style="color:#ff9b88">ASSET LOAD FAILED: ${String(s?.message||s)}</span><br>The project will not substitute primitive animals. Reload after the asset workflow finishes.`,Js.disabled=!1,Js.textContent="RETRY ASSET LOAD",Js.onclick=()=>location.reload(),At?.setAnimationLoop(()=>At.clear())}}function CM(){addEventListener("lostsignal:computer",()=>Gd("computer")),addEventListener("lostsignal:radio",()=>{Gd("radio"),uo(.2)}),addEventListener("lostsignal:generator",()=>{const t=Lt.refuel();Ze(t.reason,2600),xi(),t.ok&&Ot(180,.3,.06)}),addEventListener("lostsignal:filtration",()=>{const t=Lt.serviceFilters();Ze(t.reason,2600),xi(),t.ok&&Ot(340,.18,.05)}),addEventListener("lostsignal:vaultopen",t=>Ze(t.detail?.open===!1?"ARMOURY SECURITY DOOR CLOSED":"ARMOURY UNLOCKED — WALK IN AND INSPECT THE WALL RACKS")),addEventListener("lostsignal:takegun",t=>{mp(t.detail?.key||yr)}),addEventListener("lostsignal:rangehit",t=>{const{distance:n,standing:i,hits:r}=t.detail;Ze(i>0?`PLATE DOWN AT ${n} M — ${i} STANDING`:`ALL PLATES DOWN — ${r} FOR ${ne.range.score().shots}`,1600)}),addEventListener("lostsignal:rangereset",t=>{const{hits:n,shots:i}=t.detail;Ze(i>0?`RANGE RESET — LAST STRING ${n} HITS FROM ${i} ROUNDS`:"RANGE RESET — SIX PLATES STANDING",2400),Ot(520,.08,.04)}),addEventListener("lostsignal:sentry",t=>{Ze(t.detail?.line||"…",5200),Ot(300,.07,.035)}),addEventListener("lostsignal:dog",t=>{Ze(t.detail?.line||"…",4200),Ot(520,.05,.03)}),addEventListener("lostsignal:medical",t=>{if(t.detail?.empty&&sn>=100){Ze("INFIRMARY STORES ARE EMPTY",2200);return}if(t.detail?.empty){Ze("INFIRMARY STORES ARE EMPTY — NOTHING LEFT TO TREAT WITH",2600),Ot(140,.09,.045);return}if(sn>=100){Ze("NO INJURIES TO TREAT",1800);return}sn=Math.min(100,sn+45),oh=0,ha(),xi(),Ze(`TREATED — CONDITION ${Math.round(sn)}%, ${t.detail.remaining} COURSE(S) LEFT`,2800),Ot(660,.12,.05),Li("secure")}),addEventListener("lostsignal:rackedlocked",t=>{Ze(`${t.detail?.name||"THAT RACK"} IS BEHIND THE SECURITY DOOR`,1800),Ot(150,.07,.04)}),addEventListener("lostsignal:inspectkit",t=>{Ze(`${t.detail?.name||"BENCH KIT"} — BENCH FITTING, NOT A WEAPON`,2e3),Ot(520,.05,.035)}),addEventListener("lostsignal:door",t=>Ze(t.detail.open?"BLAST SEAL RELEASED":"BLAST SEAL LOCKED")),addEventListener("lostsignal:surface",t=>{if(!t.detail.allowed){Ze("OPEN THE BLAST DOOR FIRST");return}zt="outside";const n=ne.setWorld("outside");St.teleport(n.x,n.y,n.z),Rn=Math.PI,Xn=-.03,Ps(!0),Ze("SURFACE COMPOUND — PERIMETER FENCE ACTIVE",2200)}),addEventListener("lostsignal:return",()=>{zt="bunker";const t=ne.setWorld("bunker");St.teleport(t.x,t.y,t.z),Rn=0,Xn=-.02,Ps(!1),Ze("SHELTER 47 — BLAST CHAMBER")}),addEventListener("lostsignal:cctv",()=>{VM(),Li("cameras")}),addEventListener("lostsignal:hatch",t=>{ea=t.detail.open,Ze(ea?"HATCH UNSEALED — SILO ACCESS OPEN":"HATCH RESEALED"),Ot(ea?210:160,.22,.06),Li("hatch")}),addEventListener("lostsignal:descend",t=>{if(!t.detail.allowed){Ze("THE HATCH IS STILL SEALED — TURN THE WHEEL");return}Vd("silo",Math.PI*.5,-.05),Ze("SILO 47 — TOP LANDING · SEVEN RESIDENTIAL LEVELS BELOW",3200),Li("descend")}),addEventListener("lostsignal:ascend",()=>{Vd("bunker",0,-.02),Ze("SHELTER 47 — BLAST CHAMBER")}),addEventListener("lostsignal:quarters",t=>{Ze(t.detail.open?`${t.detail.unit} — DOOR OPEN`:`${t.detail.unit} — DOOR CLOSED`,1800)}),addEventListener("lostsignal:sofa",t=>{if(zt!=="silo")return;const{seat:n,stand:i,yaw:r,unit:a}=t.detail;Bi={stand:new P(i.x,i.y,i.z),yaw:r},St.teleport(n.x,n.y,n.z),ne.player.position.copy(St.position),Rn=r,Xn=.015,An.sprint=!1,An.crouch=!1,Hn(!1),document.getElementById("sprintBtn").classList.remove("on"),document.getElementById("crouchBtn").classList.remove("on"),Ze(`${a} — SEATED · USE AGAIN TO STAND`,2600)}),addEventListener("lostsignal:bulkhead",t=>{Ze(t.detail.open?`LEVEL ${t.detail.level} SERVICE BULKHEAD OPEN — MAINTENANCE ROOM ACCESSIBLE`:`LEVEL ${t.detail.level} SERVICE BULKHEAD SEALED`,2600)}),addEventListener("lostsignal:hydroponics",t=>{Lt.resupply({food:2}),xi(),Ze(`LEVEL ${t.detail.level} HYDROPONICS — TWO DAYS OF GREENS`,2800),Li("hydroponics")}),addEventListener("lostsignal:secureunit",()=>{Ze("SECURE UNIT — CARD READER REJECTS YOU. NOBODY WILL SAY WHAT IS BEHIND IT.",4200),Ot(150,.2,.05),Li("secure")}),addEventListener("lostsignal:resident",t=>{Ze(t.detail.line,4200)}),addEventListener("lostsignal:quartermaster",t=>{Ze(`QUARTERMASTER ELI: ${t.detail.line}`,5200)}),addEventListener("lostsignal:cache",()=>{if(Lo){Ze("THE CACHE IS EMPTY");return}Lo=!0,Kn+=60,Lt.resupply({food:6,water:8,fuel:3,filters:2}),Ar(),xi(),Ze("+60 ROUNDS · RATIONS · WATER · FUEL · FILTERS",3600),Ot(520,.12,.05),Li("cache")}),document.querySelectorAll(".modal .x").forEach(t=>{t.onclick=()=>{t.parentElement.classList.remove("open"),document.body.classList.remove("overlay-open"),ln=!1,uo(0),Ot(280)}});let s=104.3;const e=()=>{document.getElementById("freq").textContent=`${s.toFixed(2)} MHz`;const t=document.getElementById("radioText");s>105.77&&s<105.84?(t.innerHTML='<span style="color:#ffd187">SIGNAL: VOICE CARRIER<br>STRENGTH: 67%<br><br>“…shelter… if anyone can hear… do not…”</span>',uo(.035),ZM()):(t.innerHTML=`SIGNAL: STATIC<br>STRENGTH: 0${2+Math.floor(Math.random()*7)}%`,uo(.2))};document.getElementById("down").onclick=()=>{s=Math.max(88,s-.05),e(),Ot(420)},document.getElementById("up").onclick=()=>{s=Math.min(118,s+.05),e(),Ot(520)}}let Lo=!1;const Do=[{id:"rifle",text:"Enter the armoury and take a weapon off the wall"},{id:"cameras",text:"Sweep the CCTV feeds, including the silo"},{id:"hatch",text:"Unseal the hatch in the shelter floor"},{id:"descend",text:"Descend into Silo 47"},{id:"resident",text:"Speak to someone who lives down there"},{id:"secure",text:"Find the secure unit on the top landing"},{id:"hydroponics",text:"Reach the hydroponics levels"},{id:"cache",text:"Find the silo stores at the bottom"}],ss=new Set;function op(){const s=Do.filter(t=>!ss.has(t.id)),e=[...Do.filter(t=>ss.has(t.id)).slice(-2),...s.slice(0,2)];Ud.innerHTML="";for(const t of e){const n=document.createElement("li");n.textContent=t.text,ss.has(t.id)&&(n.className="done"),Ud.appendChild(n)}}function Li(s){ss.has(s)||!Do.some(e=>e.id===s)||(ss.add(s),op(),Ot(700,.09,.035),ss.size===Do.length&&setTimeout(()=>Ze("EVERY SYSTEM IN SHELTER 47 IS YOURS. THE SIGNAL IS STILL TRANSMITTING.",5e3),2600))}function Vd(s,e,t){Bi=null,Hn(!1),zt=s;const n=ne.setWorld(s);St.teleport(n.x,n.y,n.z),Rn=e,Xn=t,Ps(s==="outside")}function lp(s=!0){if(!Bi)return!1;const{stand:e,yaw:t}=Bi;return Bi=null,St.teleport(e.x,e.y,e.z),ne.player.position.copy(St.position),Rn=t,Xn=-.02,s&&Ze("STOOD UP"),!0}function co(s){const e=document.getElementById("help"),t=s??!e.classList.contains("open");e.classList.toggle("open",t),document.body.classList.toggle("overlay-open",t),ln=t||Sn,t&&Hn(!1),t&&document.exitPointerLock?.(),Ot(t?480:300,.05,.03)}function Gd(s){ln=!0,Hn(!1),document.exitPointerLock?.(),document.getElementById(s).classList.add("open"),document.body.classList.add("overlay-open")}function cp(){if(zt!=="outside")return null;const s=new P(0,0,-1).applyEuler(ne.camera.rotation).normalize();let e=null,t=2.5;for(const n of ne.wildlife){if(n.userData.alive!==!1||n.userData.harvested)continue;const i=n.position.distanceTo(ne.player.position);if(i>=t)continue;const r=n.position.clone().sub(ne.player.position).normalize();s.dot(r)<.15||(e=n,t=i)}return e}function hp(){if(zt!=="silo"||!ne.residents)return null;const s=new P(0,0,-1).applyEuler(ne.camera.rotation).normalize();let e=null,t=2.6;for(const n of ne.residents.residents){const i=n.position.distanceTo(ne.player.position);if(i>=t||Math.abs(n.position.y-ne.player.position.y)>=2.2)continue;const r=n.position.clone().sub(ne.player.position).normalize();s.dot(r)>.12&&(e=n,t=i)}return e}function Wd(){if(!yi||ln||Sn||lp())return;const s=ne.nearestInteraction(zt);if(s){Ot(420,.04,.035),s.onUse();return}const e=hp();if(e){window.dispatchEvent(new CustomEvent("lostsignal:resident",{detail:{line:e.userData.resident?.line||"…"}})),Li("resident");return}const t=cp();if(t){t.userData.harvested=!0;const n=t.userData.kind==="deer"?3:1;Lt.resupply({food:n}),xi(),t.parent?.remove(t),Ze(`${t.userData.kind.toUpperCase()} HARVESTED — +${n} DAYS FOOD`,2200)}}const Xd=document.getElementById("scopeRange");let Di=!1;function PM(s){const e=!!s&&!!tt?.scope;return Di===e||(Di=e,document.body.classList.toggle("scoped",Di),ne&&(ne.weaponView.visible=jn&&!Di),Di&&Xd&&(Xd.textContent=`${tt.scope} — ${tt.name}`)),Di}function Hn(s){const e=!!s&&jn&&!rs&&!ln&&!Sn&&!Bi&&!_n;return dn===e||(dn=e,document.body.classList.toggle("aiming",dn),document.getElementById("aimBtn")?.classList.toggle("on",dn),PM(dn)),dn}function qd(){return!yi||ln||Sn?!1:Bi?(lp(),!1):(ch=!0,Hn(!1),!0)}const IM=3,up=["resident","quartermaster"],LM=["deer","rabbit","zombie",...up],dp=new P,or=new P,No=new nt;function jo(){const s=_r.for(Ls);s.magazine=qn,s.reserve=Kn}const fp=4,Yt=[];function pp(s,{announce:e=!0}={}){if(!ca(s)||!Yt.includes(s))return!1;jn&&jo(),Ls=s,tt=fn[s];const t=_r.for(s);return qn=t.magazine,Kn=t.reserve,jn=!0,rs=!1,lr=0,ta=0,ws=0,Hn(!1),ne.setArmed(s),ne.armory?.setEquipped(Yt),document.body.classList.add("armed"),Ar(),e&&(Ze(tt.kind==="melee"?`${tt.name} DRAWN`:`${tt.name} — ${tt.automatic?"AUTOMATIC":"SEMI-AUTOMATIC"}`,2200),Ot(360,.08,.05)),Li("rifle"),!0}function mp(s,{announce:e=!0}={}){if(!ca(s))return!1;if(!Yt.includes(s))if(Yt.length>=fp){const t=Math.max(0,Yt.indexOf(Ls)),n=Yt[t];Yt[t]=s,e&&n&&Ze(`${fn[n].name} RACKED`,1600)}else Yt.push(s);return pp(s,{announce:e})}function uh(s){const e=Yt[s];return!e||e===Ls||rs||ln||Sn?!1:pp(e,{announce:!1})&&(Ze(fn[e].name,1200),!0)}function Yd(s){if(Yt.length<2)return!1;const t=(Math.max(0,Yt.indexOf(Ls))+s+Yt.length*2)%Yt.length;return uh(t)}function gp(){const s=[];for(const t of ne.wildlife)t.parent&&t.userData.alive!==!1&&s.push(t);if(zt==="silo")for(const t of ne.residents?.residents||[])t.parent&&t.userData.alive!==!1&&s.push(t);const e=ne.armory?.quartermaster;return zt==="bunker"&&e?.parent&&e.userData.alive!==!1&&s.push(e),s}function Oo(s){let e=s;for(;e&&!LM.includes(e.userData.kind);)e=e.parent;return e||null}function bp(s){return s.children.filter(e=>e!==ne.player&&!e.userData.isDecal)}function DM(s,e,t){const n=e>0?{x:(Math.random()*2-1)*e,y:(Math.random()*2-1)*e}:{x:0,y:0};ns.setFromCamera(n,ne.camera),ns.far=tt.range??90;const i=ns.intersectObjects(gp(),!0),r=i.length?Oo(i[0].object):null,a=ns.intersectObjects(bp(s),!0).find(o=>o.object.isMesh&&o.object.visible&&!Oo(o.object));if(r&&(!a||i[0].distance<=a.distance))return xp(r,i[0].point,t),!0;if(a){const o=ne.range?.targetFor(a.object);if(o&&ne.range.strike(o))return ma(a.point,"dust",5,.22),eS(o.distance),!1;ma(a.point,"dust",4,.16),a.face?(No.getNormalMatrix(a.object.matrixWorld),or.copy(a.face.normal).applyMatrix3(No).normalize()):or.copy(ne.camera.getWorldPosition(dp)).sub(a.point).normalize();const c=zh.add(s,a.point,or,{kind:tt.kind==="melee"?"gouge":"hole",size:tt.calibre??.1});c&&(c.userData.isDecal=!0)}return!1}function yo(){if(!jn||rs||ln||Sn||!yi||ws>0)return!1;if(tt.kind==="melee")return NM();if(qn<=0)return Kn>0?Fo():Ot(120,.05,.05),!1;qn--,jo(),Ar(),ws=tp(tt),ne.playGun("shoot"),wp(tt),nS(tt),Ts=tt.recoil??.18;const s=_a();s.updateMatrixWorld(),ne.range?.countShot();const e=(dn?tt.adsSpread??0:tt.spread??0)*IM,t=Math.max(1,tt.pellets??1);let n=!1;for(let i=0;i<t;i++)n=DM(s,e,tt.damage)||n;return!n&&zt!=="outside"&&!tt.quiet&&Ze("THE SHOT ECHOES THROUGH THE SHELTER",900),tt.quiet||Uo(1),qn===0&&Kn>0&&(ta=.45),!0}function NM(){ws=tp(tt),Ts=tt.recoil??.12,ne.playGun("shoot"),wp(tt);const s=_a();s.updateMatrixWorld(),ns.setFromCamera({x:0,y:0},ne.camera),ns.far=tt.reach??2;const e=ns.intersectObjects(gp(),!0),t=e.length?Oo(e[0].object):null;if(t)return xp(t,e[0].point,tt.damage),Uo(.6),!0;const n=ns.intersectObjects(bp(s),!0).find(i=>i.object.isMesh&&i.object.visible&&!Oo(i.object));if(n){n.face?(No.getNormalMatrix(n.object.matrixWorld),or.copy(n.face.normal).applyMatrix3(No).normalize()):or.copy(ne.camera.getWorldPosition(dp)).sub(n.point).normalize();const i=zh.add(s,n.point,or,{kind:"gouge",size:tt.calibre??.08});i&&(i.userData.isDecal=!0),ma(n.point,"dust",3,.1)}return!1}function Uo(s){return zt!=="silo"?0:ne.residents?.alarm?.(ne.player.position,18*s)??0}function xp(s,e,t=tt?.damage??34){const n=s.userData.kind;if(up.includes(n))return OM(s,e,t);ma(e,"blood",8,.3);const i=ne.creatures.agentFor(s);if(n!=="zombie"){i?.kill()&&Ze(`${n.toUpperCase()} DOWN — APPROACH TO HARVEST`,1700);return}const r=e.y-s.position.y>1.42;if(s.userData.hp=(s.userData.hp??3)-(r?3:1),s.userData.hp<=0){i?.kill()&&Ze(r?"HEADSHOT — INFECTED DOWN":"INFECTED DOWN",1300);return}i&&(i.stagger=i.staggerTime),Ze("INFECTED HIT",700)}function OM(s,e,t){ma(e,"blood",9,.34);const n=e.y-s.position.y>1.5,i=n?tt?.headshot??2.2:1;s.userData.hp=(s.userData.hp??100)-t*i;const r=s.userData.kind==="quartermaster"?"QUARTERMASTER ELI":"RESIDENT";if(s.userData.hp>0){Ze(`${r} HIT`,900),Uo(1);return}const a=ne.residents?.agentFor?.(s);(a?a.kill():ne.armory?.downQuartermaster?.())!==!1&&(Ze(n?`${r} DOWN — HEADSHOT`:`${r} DOWN`,2200),Uo(1.4))}let lr=0,ta=0;function Fo(){!jn||tt.kind==="melee"||rs||qn>=tt.magazine||Kn<=0||(Hn(!1),rs=!0,lr=tt.reloadTime??1.2,ne.playGun("reload",lr),tS(tt),Ze("RELOADING…",Math.round(lr*1e3)))}function UM(s){if(ta>0&&(ta-=s,ta<=0&&Fo()),!rs||(lr-=s,lr>0))return;const e=Math.min(tt.magazine-qn,Kn);qn+=e,Kn-=e,rs=!1,jo(),Ar()}const Ql=document.getElementById("weaponSlots");function Ar(){const s=document.getElementById("weaponName");s&&(s.textContent=jn?tt.name:"UNARMED"),SM.textContent=jn?tt.kind==="melee"?"BLADE":`${qn} / ${Kn}`:"—",Ql&&(Ql.innerHTML="",Yt.forEach((e,t)=>{const n=document.createElement("button");n.type="button",n.className=e===Ls?"slot on":"slot",n.dataset.slot=String(t),n.textContent=`${t+1} ${fn[e].name}`,Ql.appendChild(n)}))}let qr=null;function FM(s){qr||(qr=[],ne.bunker.traverse(e=>{e.isPointLight&&e!==ne.emergency&&qr.push({light:e,base:e.intensity}),e.isSpotLight&&qr.push({light:e,base:e.intensity})}));for(const e of qr)e.light.intensity=s?e.base*.02:e.base;Ze(s?"THE GENERATOR HAS STOPPED — REFUEL IT":"POWER RESTORED",3200),s&&JM()}function BM(){pM({survival:Lt.snapshot,elapsed:Lt.elapsed,health:sn,ammo:qn,reserve:Kn,armed:jn,weaponKey:Ls,carried:[...Yt],loadout:(jn&&jo(),_r.snapshot()),completed:[...ss],cacheEmptied:Lo,doorOpen:ne.doorOpen?.()??!1,hatchOpen:ne.hatchOpen?.()??!1})}function zM(){const s=fM();if(!s)return!1;Object.assign(Lt,s.survival||{}),Lt.elapsed=s.elapsed||0,sn=s.health??100,_r.restore(s.loadout),qn=s.ammo??rp,Kn=s.reserve??ap,Lo=!!s.cacheEmptied,ea=!!s.hatchOpen,ne.setDoorOpen?.(!!s.doorOpen),ne.setHatchOpen?.(ea);for(const e of s.completed||[])ss.add(e);if(s.armed){const e=ca(s.weaponKey)?s.weaponKey:yr;for(const t of s.carried||[e])ca(t)&&!Yt.includes(t)&&Yt.length<fp&&Yt.push(t);if(Yt.includes(e)||Yt.push(e),!s.loadout){const t=_r.for(e);t.magazine=qn,t.reserve=Kn}mp(e,{announce:!1})}return Ar(),!0}const ho=(s,e,t)=>s<=t?"bad":s<=e?"warn":"ok";function xi(){wM.textContent=String(Lt.day);const s=ne?.sky?.state;if(s&&Fd){const e=Math.floor(s.timeOfDay*24*60);Fd.textContent=`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}s&&Kl&&(Kl.textContent=s.label,Kl.className=s.rain>.45?"warn":"ok"),Bd.textContent=`${Math.round(Lt.power)}%`,Bd.className=ho(Lt.power,35,12),zd.textContent=`${Math.floor(Lt.water)} DAYS`,zd.className=ho(Lt.water,5,1),kd.textContent=`${Math.round(Lt.air)}%`,kd.className=ho(Lt.air,30,15),Id.textContent=`${Math.floor(Lt.food)} DAYS`,Id.className=ho(Lt.food,3,1)}function ha(){Ld.textContent=`${Math.round(sn)}%`,Ld.className=sn>60?"ok":sn>25?"warn":"bad"}function kM(){sn=45,Lt.food=Math.max(0,Lt.food-2),ha(),xi(),zt="bunker";const s=ne.setWorld("bunker");St.teleport(s.x,s.y,s.z),Rn=0,Xn=-.02,Ps(!1),Ze("YOU WOKE UP BACK IN THE SHELTER — TWO DAYS OF FOOD GONE",3200)}const ua=[0,0,0,0,0],da=[0,0,0,0,0],fa=[48,50,48,42,56],vp=[1,.82,.93,.66,.88];let tr=!1;const HM=["MAIN GATE","EAST FENCE / WOODLINE","SERVICE YARD","TOWER OVERVIEW","SILO TOP — SECURE UNIT"];function VM(){Sn=!0,ln=!0,Hn(!1),document.exitPointerLock?.(),document.getElementById("cctv").classList.add("open"),document.body.classList.add("overlay-open"),Ps(!0),kh(Ut)}function yp(){Sn=!1,ln=!1,document.getElementById("cctv").classList.remove("open"),document.body.classList.remove("overlay-open"),zt!=="outside"&&Ps(!1)}function kh(s){Ut=s,Sn&&Ps(s<4);const e=Math.round(vp[s]*100);document.getElementById("camTitle").textContent=`CAM 0${s+1} // ${HM[s]}  ·  SIG ${e}%${tr?"  ·  IR":""}`,Ko(),Ot(650,.035,.025)}function _p(){tr=!tr,document.getElementById("nightVision")?.classList.toggle("on",tr),kh(Ut),Ot(tr?880:420,.06,.03)}function Ko(){const s=Math.round(ua[Ut]*180/Math.PI),e=Math.round(da[Ut]*180/Math.PI);document.getElementById("ptzReadout").textContent=`PTZ ${s>=0?"+":""}${s}° / ${e>=0?"+":""}${e}°   ZOOM ${(50/fa[Ut]).toFixed(1)}×`}function Mp(s){fa[Ut]=Math.max(22,Math.min(70,fa[Ut]+s)),Ko()}document.getElementById("exitCam").onclick=yp;document.querySelectorAll("[data-c]").forEach(s=>s.onclick=()=>kh(+s.dataset.c));document.getElementById("zoomIn").onclick=()=>Mp(-6);document.getElementById("zoomOut").onclick=()=>Mp(6);document.getElementById("ptzReset").onclick=()=>{ua[Ut]=0,da[Ut]=0,fa[Ut]=[48,50,48,42,56][Ut],Ko()};document.getElementById("nightVision")?.addEventListener("click",_p);const Bo=document.querySelector("#cctv .frame");let zo=null,dh=0,fh=0;Bo.addEventListener("pointerdown",s=>{s.target.closest("button")||(zo=s.pointerId,dh=s.clientX,fh=s.clientY,Bo.setPointerCapture?.(zo))});Bo.addEventListener("pointermove",s=>{if(s.pointerId!==zo)return;const e=s.clientX-dh,t=s.clientY-fh;dh=s.clientX,fh=s.clientY,ua[Ut]=Math.max(-1.35,Math.min(1.35,ua[Ut]-e*.0033)),da[Ut]=Math.max(-.7,Math.min(.6,da[Ut]-t*.0028)),Ko()});Bo.addEventListener("pointerup",()=>zo=null);function GM(){addEventListener("keydown",m=>{mi[m.code]=!0,m.code==="KeyE"&&!m.repeat&&Wd(),m.code==="KeyR"&&!m.repeat&&Fo(),m.code==="KeyF"&&!m.repeat&&(Ki=!0,yo()),m.code==="KeyQ"&&!m.repeat&&Hn(!dn),/^Digit[1-4]$/.test(m.code)&&!m.repeat&&uh(+m.code.slice(5)-1),m.code==="Tab"&&(m.preventDefault(),m.repeat||Yd(1)),m.code==="KeyH"&&(m.preventDefault(),co()),m.code==="Space"&&(m.preventDefault(),m.repeat||qd()),m.code==="Escape"&&document.getElementById("help").classList.contains("open")?co(!1):m.code==="Escape"&&Sn&&yp(),m.code==="KeyN"&&Sn&&_p()}),addEventListener("keyup",m=>{mi[m.code]=!1,m.code==="KeyF"&&(Ki=!1)}),At.domElement.addEventListener("click",()=>{yi&&!ts&&!ln&&Promise.resolve(At.domElement.requestPointerLock?.()).catch(()=>{})}),At.domElement.addEventListener("pointerdown",m=>{!yi||ts||ln||(m.button===2?(m.preventDefault(),Hn(!0)):m.button===0&&document.pointerLockElement===At.domElement&&(Ki=!0,yo()))}),At.domElement.addEventListener("pointerup",m=>{m.button===2&&Hn(!1),m.button===0&&(Ki=!1)}),addEventListener("blur",()=>{Ki=!1}),At.domElement.addEventListener("contextmenu",m=>m.preventDefault()),addEventListener("mousemove",m=>{if(document.pointerLockElement===At.domElement&&!ln){const b=Di?(tt?.zoom??52)/70:1;Rn-=m.movementX*.0022*b,Xn=Math.max(-1.25,Math.min(1.15,Xn-m.movementY*.0018*b))}}),At.domElement.addEventListener("wheel",m=>{!yi||ln||Sn||(m.preventDefault(),Yd(m.deltaY>0?1:-1))},{passive:!1});const s={x:0,y:0},e=document.getElementById("movePad"),t=document.getElementById("moveNub");let n=null,i=0,r=0;e.addEventListener("pointerdown",m=>{n=m.pointerId,e.setPointerCapture(n);const b=e.getBoundingClientRect();i=b.left+b.width/2,r=b.top+b.height/2}),e.addEventListener("pointermove",m=>{if(m.pointerId!==n)return;let b=m.clientX-i,g=m.clientY-r;const d=39,x=Math.hypot(b,g)||1,_=Math.min(1,d/x);b*=_,g*=_,s.x=b/d,s.y=g/d,t.style.transform=`translate(${b}px,${g}px)`});const a=()=>{n=null,s.x=s.y=0,t.style.transform="translate(0,0)"};e.addEventListener("pointerup",a),e.addEventListener("pointercancel",a),ne.mobileMove=s;const o=document.getElementById("lookZone");let c=null,l=0,h=0;o.addEventListener("pointerdown",m=>{c=m.pointerId,o.setPointerCapture(c),l=m.clientX,h=m.clientY}),o.addEventListener("pointermove",m=>{if(m.pointerId!==c||ln)return;const b=m.clientX-l,g=m.clientY-h;l=m.clientX,h=m.clientY,Rn-=b*.004,Xn=Math.max(-1.25,Math.min(1.15,Xn-g*.0031))}),o.addEventListener("pointerup",()=>c=null),o.addEventListener("pointercancel",()=>c=null),document.getElementById("use").addEventListener("pointerdown",m=>{m.preventDefault(),m.stopPropagation(),Wd()});const u=document.getElementById("fire");u.addEventListener("pointerdown",m=>{m.preventDefault(),m.stopPropagation(),Ki=!0,yo()});const f=()=>{Ki=!1};u.addEventListener("pointerup",f),u.addEventListener("pointercancel",f),u.addEventListener("pointerleave",f),document.getElementById("reloadBtn").addEventListener("pointerdown",m=>{m.preventDefault(),m.stopPropagation(),Fo()}),document.getElementById("jumpBtn").addEventListener("pointerdown",m=>{m.preventDefault(),m.stopPropagation(),qd()}),document.getElementById("aimBtn").addEventListener("pointerdown",m=>{m.preventDefault(),m.stopPropagation(),Hn(!dn)}),document.getElementById("weaponSlots")?.addEventListener("pointerdown",m=>{const b=m.target.closest(".slot");b&&(m.preventDefault(),m.stopPropagation(),uh(+b.dataset.slot))}),document.getElementById("helpBtn").addEventListener("click",()=>co()),document.querySelector("#help .x").addEventListener("click",()=>co(!1));const p=(m,b)=>{document.getElementById(m).addEventListener("pointerdown",d=>{d.preventDefault(),d.stopPropagation(),An[b]=!An[b],b==="sprint"&&An.sprint&&(An.crouch=!1),b==="crouch"&&An.crouch&&(An.sprint=!1),document.getElementById("sprintBtn").classList.toggle("on",An.sprint),document.getElementById("crouchBtn").classList.toggle("on",An.crouch),Ot(b==="sprint"?520:300,.04,.03)})};p("sprintBtn","sprint"),p("crouchBtn","crouch")}const $l=new P,jd=new P,Kd=new P;function WM(s){if(!yi||ln)return;if(ne.camera.rotation.y=Rn,ne.camera.rotation.x=Xn,Bi){$l.set(0,0,0),St.velocity.set(0,0,0),St.grounded=!0,ne.player.position.set(St.position.x,St.position.y,St.position.z),ne.camera.position.set(0,1.18+Math.sin(Ms)*.003,0),ne.camera.rotation.z=0,Ms+=s*.55,_n=!1,On=Math.min(1,On+s/4),Od.style.transform=`scaleX(${On.toFixed(3)})`,Nd.classList.toggle("on",On<.995);return}let e=(mi.KeyD?1:0)-(mi.KeyA?1:0)+(ne.mobileMove?.x||0),t=(mi.KeyW?1:0)-(mi.KeyS?1:0)-(ne.mobileMove?.y||0);const n=Math.hypot(e,t);n>1&&(e/=n,t/=n);const i=!!mi.ControlLeft||!!mi.KeyC||An.crouch;_n=(!!mi.ShiftLeft||!!mi.ShiftRight||An.sprint)&&t>.1&&!i&&On>.05,_n&&dn&&Hn(!1),On=Ke.clamp(On+(_n?-s/6.5:s/(On<.2?9:5)),0,1),An.sprint&&On<=.02&&(An.sprint=!1,document.getElementById("sprintBtn").classList.remove("on"));const a=zt==="outside"?3.05:2.55,o=a*(_n?1.72:1)*(i?.48:1);jd.set(-Math.sin(Rn),0,-Math.cos(Rn)),Kd.set(Math.cos(Rn),0,-Math.sin(Rn)),$l.copy(jd).multiplyScalar(t*o).addScaledVector(Kd,e*o);const c=ch;ch=!1,St.step(s,$l,ne.colliders[zt],{crouch:i,jump:c,jumpSpeed:5.8}),ne.residents?.resolvePlayer?.(St.position,St.radius,St.height),ne.player.position.set(St.position.x,St.position.y,St.position.z);const l=Ke.clamp(St.horizontalSpeed/a,0,2),h=St.distanceWalked*3.4,u=l*(_n?.045:.028)*(i?.5:1);Ms+=s*(_n?3.4:1.15),ne.camera.position.y=St.eyeHeight+Math.sin(h)*u+Math.sin(Ms)*.006-St.landingImpact*.22,ne.camera.position.x=Math.cos(h*.5)*u*.55,ne.camera.rotation.z=Math.cos(h*.5)*u*.22+(_n?Math.sin(h*.5)*.012:0),XM(s,l,i),Od.style.transform=`scaleX(${On.toFixed(3)})`,Nd.classList.toggle("on",On<.995)}let Zd=0;function XM(s,e,t){if(!St.grounded||e<.15)return;const n=t||_n?1.05:.78;if(St.distanceWalked<Zd)return;Zd=St.distanceWalked+n,QM(zt==="outside",t?.35:_n?1:.7)}function qM(){if(!yi||ln||Sn){di.classList.remove("on");return}if(Bi){di.textContent=`${ts?"USE":"[ E ]"}  STAND UP`,di.classList.add("on");return}const s=ne.nearestInteraction(zt);if(s){di.textContent=`${ts?"USE":"[ E ]"}  ${s.name}`,di.classList.add("on");return}if(hp()){di.textContent=`${ts?"USE":"[ E ]"}  SPEAK TO RESIDENT`,di.classList.add("on");return}const t=cp();if(t){di.textContent=`${ts?"USE":"[ E ]"}  HARVEST ${t.userData.kind.toUpperCase()}`,di.classList.add("on");return}di.classList.remove("on")}let Be=null,on=null,nr=null,ir=null;function pa(s=2){const e=Be.createBuffer(1,Be.sampleRate*s,Be.sampleRate),t=e.getChannelData(0);for(let n=0;n<t.length;n++)t[n]=Math.random()*2-1;return e}function YM(){if(Be){Be.resume?.();return}Be=new(window.AudioContext||window.webkitAudioContext),on=Be.createGain(),on.gain.value=.3,on.connect(Be.destination),[47,94,141].forEach((i,r)=>{const a=Be.createOscillator(),o=Be.createGain();a.type=r?"sine":"triangle",a.frequency.value=i,o.gain.value=[.09,.03,.01][r],a.connect(o),o.connect(on),a.start()});const s=Be.createBufferSource();s.buffer=pa(),s.loop=!0;const e=Be.createBiquadFilter();e.type="bandpass",e.frequency.value=1800,nr=Be.createGain(),nr.gain.value=0,s.connect(e),e.connect(nr),nr.connect(on),s.start();const t=Be.createBufferSource();t.buffer=pa(3),t.loop=!0;const n=Be.createBiquadFilter();n.type="lowpass",n.frequency.value=900,ir=Be.createGain(),ir.gain.value=0,t.connect(n),n.connect(ir),ir.connect(on),t.start(),jM()}const Sp=[];function Jd(s,e,t){if(!Be)return;const n=Be.createGain();n.gain.value=0,n.connect(on),t(n),Sp.push({position:new P(...s),radius:e,gain:n})}function jM(){Jd([4.6,1.2,4.95],7,s=>{const e=Be.createOscillator(),t=Be.createOscillator(),n=Be.createGain();e.type="sawtooth",e.frequency.value=38,t.frequency.value=5.6,n.gain.value=9,t.connect(n),n.connect(e.frequency);const i=Be.createBiquadFilter();i.type="lowpass",i.frequency.value=220;const r=Be.createGain();r.gain.value=.5,e.connect(i),i.connect(r),r.connect(s),e.start(),t.start()}),Jd([5.2,1.3,-4.85],6,s=>{const e=Be.createBufferSource();e.buffer=pa(3),e.loop=!0;const t=Be.createBiquadFilter();t.type="bandpass",t.frequency.value=640,t.Q.value=.8;const n=Be.createGain();n.gain.value=.35,e.connect(t),t.connect(n),n.connect(s),e.start()})}function KM(){if(!Be||!ne)return;const s=zt==="bunker"&&!Sn;for(const e of Sp){const t=s?e.position.distanceTo(ne.player.position):1/0,n=Ke.clamp(1-t/e.radius,0,1);e.gain.gain.setTargetAtTime(n*n*.09,Be.currentTime,.2)}}function uo(s){nr&&Be&&nr.gain.setTargetAtTime(s,Be.currentTime,.04)}function Ps(s){ir&&Be&&ir.gain.setTargetAtTime(s?.045:0,Be.currentTime,.15)}function Ot(s=500,e=.05,t=.04){if(!Be)return;const n=Be.currentTime,i=Be.createOscillator(),r=Be.createGain();i.frequency.value=s,r.gain.setValueAtTime(t,n),r.gain.exponentialRampToValueAtTime(.001,n+e),i.connect(r),r.connect(on),i.start(n),i.stop(n+e+.01)}function ZM(){Ot(760,.25,.035)}function JM(){if(!Be)return;const s=Be.currentTime,e=Be.createOscillator(),t=Be.createGain();e.type="square",e.frequency.setValueAtTime(140,s),e.frequency.exponentialRampToValueAtTime(62,s+.28),t.gain.setValueAtTime(.16,s),t.gain.exponentialRampToValueAtTime(.001,s+.3),e.connect(t),t.connect(on),e.start(s),e.stop(s+.31)}function QM(s,e=1){if(!Be)return;const t=Be.currentTime,n=Be.createBufferSource();n.buffer=pa(.25);const i=Be.createBiquadFilter();i.type=s?"bandpass":"lowpass",i.frequency.value=s?1400+Math.random()*700:320+Math.random()*140,i.Q.value=s?1.1:.7;const r=Be.createGain(),a=(s?.05:.07)*e;r.gain.setValueAtTime(0,t),r.gain.linearRampToValueAtTime(a,t+.008),r.gain.exponentialRampToValueAtTime(6e-4,t+.17),n.connect(i),i.connect(r),r.connect(on),n.start(t),n.stop(t+.2)}let ec=null;function $M(){return ec||(ec=pa(2)),ec}function ko({at:s,hz:e,q:t,decay:n,level:i,type:r="bandpass"}){const a=Be.createBufferSource();a.buffer=$M(),a.loop=!0;const o=Be.createBiquadFilter();o.type=r,o.frequency.value=e,o.Q.value=t;const c=Be.createGain();c.gain.setValueAtTime(Math.max(8e-4,i),s),c.gain.exponentialRampToValueAtTime(6e-4,s+n),a.connect(o),o.connect(c),c.connect(on),a.start(s,Math.random()*1.4),a.stop(s+n+.03)}function wp(s){if(!Be||!on)return;const e=s?.audio?.fire;if(!e)return;const t=Be.currentTime,n=Be.createOscillator();n.type="sawtooth",n.frequency.setValueAtTime(e.bodyHz,t),n.frequency.exponentialRampToValueAtTime(Math.max(20,e.bodyEndHz),t+e.bodyDecay);const i=Be.createGain();i.gain.setValueAtTime(e.level*.78,t),i.gain.exponentialRampToValueAtTime(8e-4,t+e.bodyDecay+.04),n.connect(i),i.connect(on),n.start(t),n.stop(t+e.bodyDecay+.06),ko({at:t,hz:e.crackHz,q:e.crackQ,decay:e.crackDecay,level:e.level}),ko({at:t+.012,hz:e.tailHz,q:.6,decay:e.tailDecay,level:e.level*e.tailLevel,type:"lowpass"})}function eS(s=20){if(!Be||!on)return;const e=Be.currentTime+Math.min(.35,s/343);for(const[t,n]of[[1,.16],[2.41,.09],[3.86,.05]]){const i=Be.createOscillator();i.type="triangle",i.frequency.setValueAtTime(880*t,e),i.frequency.exponentialRampToValueAtTime(860*t,e+.9);const r=Be.createGain();r.gain.setValueAtTime(n,e),r.gain.exponentialRampToValueAtTime(6e-4,e+.9),i.connect(r),r.connect(on),i.start(e),i.stop(e+.95)}ko({at:e,hz:2600,q:1.4,decay:.05,level:.12})}function tS(s){if(!Be||!on)return;const e=s?.audio?.reload;if(!e)return;const t=Be.currentTime;for(const n of e){const i=t+n.at;if(ko({at:i,hz:n.hz,q:n.q,decay:n.decay,level:n.level*.5}),!n.tone)continue;const r=Be.createOscillator();r.type="square",r.frequency.setValueAtTime(n.tone,i),r.frequency.exponentialRampToValueAtTime(Math.max(40,n.tone*.55),i+n.decay);const a=Be.createGain();a.gain.setValueAtTime(n.level*.16,i),a.gain.exponentialRampToValueAtTime(5e-4,i+n.decay),r.connect(a),a.connect(on),r.start(i),r.stop(i+n.decay+.03)}}let ys=null,_o=0;function nS(s=tt){ys||(ys=new Fn(16767392,0,9,2),ys.position.set(.3,-.25,-.9),ne.camera.add(ys));const e=s?.quiet?.28:s?.family==="shotgun"?1.5:s?.family==="sniper"?1.3:1;_o=.06,ys.intensity=260*e}const iS=new Wo(.035,6,5),sS={blood:new Pn({color:8000786}),dust:new Pn({color:10132626,transparent:!0,opacity:.75})},Mo=[];function ma(s,e,t=7,n=.26){const i=_a();for(let r=0;r<t;r++){const a=new Kt(iS,sS[e]);a.position.copy(s),i.add(a),Mo.push({mesh:a,scene:i,life:.45+Math.random()*.25,velocity:new P((Math.random()-.5)*n*8,Math.random()*n*6,(Math.random()-.5)*n*8)})}}function rS(s){zh.update(s),_o>0&&(_o-=s,_o<=0&&ys&&(ys.intensity=0));for(let e=Mo.length-1;e>=0;e--){const t=Mo[e];if(t.life-=s,t.life<=0){t.scene.remove(t.mesh),Mo.splice(e,1);continue}t.velocity.y-=14*s,t.mesh.position.addScaledVector(t.velocity,s)}}function aS({restore:s=!0}={}){if(!ne||yi)return;yi=!0;const e=s&&zM();xi(),Ar(),ha(),op(),document.body.classList.add("playing"),sp.style.display="none",Yo(),setTimeout(()=>{At.setSize(innerWidth,innerHeight),gi.setSize(innerWidth,innerHeight),Ui.setSize(innerWidth,innerHeight),ne.camera.aspect=innerWidth/innerHeight,ne.camera.updateProjectionMatrix()},160),Ze(e?`RUN RESUMED — DAY ${Lt.day}`:"SHELTER 47 // REPOSITORY BUILD",e?2600:2200)}Js.onclick=async()=>{if(!ne){location.reload();return}YM();try{document.documentElement.requestFullscreen&&!document.fullscreenElement&&await document.documentElement.requestFullscreen({navigationUI:"hide"}).catch(()=>{}),screen.orientation?.lock&&await screen.orientation.lock("landscape").catch(()=>{})}catch{}aS(),ts||Promise.resolve(At.domElement.requestPointerLock?.()).catch(()=>{})};const Qd=new P(.32,-.38,-.72),$d=new P(.03,-.13,-.64),gs=new P;function oS(s){if(!jn)return;const e=dn?1:0,t=Math.min(St.horizontalSpeed/3,1)*(dn?.22:1),n=St.distanceWalked*3.4;Qd.set(...Y_(tt)),$d.set(...q_(tt)),gs.lerpVectors(Qd,$d,e),gs.x+=Math.cos(n*.5)*.014*t,gs.y+=Math.sin(n)*.011*t+Math.sin(Ms*.8)*.004+Ts*.07,gs.z+=Ts*.13+(_n?.05:0),ne.weaponView.position.x=Ke.damp(ne.weaponView.position.x,gs.x,15,s),ne.weaponView.position.y=Ke.damp(ne.weaponView.position.y,gs.y,15,s),ne.weaponView.position.z=Ke.damp(ne.weaponView.position.z,gs.z,15,s),ne.weaponView.rotation.x=Ke.damp(ne.weaponView.rotation.x,(dn?.13:-.04)-Ts*.5+(_n?.22:0),16,s),ne.weaponView.rotation.y=Ke.damp(ne.weaponView.rotation.y,(dn?0:-.08)+Math.sin(n*.5)*.02*t+(_n?.3:0),16,s),ne.weaponView.rotation.z=Ke.damp(ne.weaponView.rotation.z,_n?.24:0,16,s);const i=dn?tt?.zoom??52:70;if(Di){const a=Math.min(1,.35+(1-On)*.9);Rn+=Math.sin(Ms*.83)*28e-5*a,Xn+=Math.cos(Ms*.61)*22e-5*a}const r=Ke.damp(ne.camera.fov,i,12,s);Math.abs(r-ne.camera.fov)>.001&&(ne.camera.fov=r,ne.camera.updateProjectionMatrix())}const ef=new Go,tf=new Je,tc=new P;function lS(s){tf.multiplyMatrices(s.projectionMatrix,s.matrixWorldInverse),ef.setFromProjectionMatrix(tf);let e=0,t=!1;const n=ne.cctvScenes?.[Ut]==="silo"?ne.residents?.residents||[]:ne.wildlife;for(const i of n)!i.parent||i.userData.alive===!1||(tc.copy(i.position),tc.y+=.9,ef.containsPoint(tc)&&e++);return{contacts:e,hostile:t}}function cS(){const s=ne.cctvCameras[Ut];s.rotation.copy(ne.cctvBaseRot[Ut]),s.rotation.y+=ua[Ut],s.rotation.x+=da[Ut],s.fov=fa[Ut],s.aspect=16/9,s.updateProjectionMatrix(),Ui.passes[0].scene=ne.scenes[ne.cctvScenes?.[Ut]||"outside"],Ui.passes[0].camera=s,$r.uniforms.time.value=hh.elapsedTime,$r.uniforms.nightVision.value=tr?1:0,$r.uniforms.signal.value=vp[Ut],s.updateMatrixWorld();const{contacts:e,hostile:t}=lS(s);Dd.textContent=e?`MOTION ${e} CONTACT${e>1?"S":""}${t?" — HOSTILE":""}`:"NO MOTION",Dd.classList.toggle("alert",t),Ui.render()}function hS(s){WM(s),_a().updateMatrixWorld(),qM(),ne.update(s,zt,ne.player.position),Ts=Ke.damp(Ts,0,13,s),ws>0&&(ws=Math.max(0,ws-s)),Ki&&jn&&tt?.automatic&&yo(),oS(s),UM(s),rS(s),KM();const e=Lt.tick(s,{indoors:zt!=="outside"});e.damage>0&&(sn=Math.max(0,sn-e.damage),ha(),sn<=0&&kM()),e.dayChanged&&(xi(),Ze(`DAY ${Lt.day} IN SHELTER 47`,2600)),e.blackoutChanged&&FM(Lt.blackout),Jl+=s,Jl>1&&(Jl=0,xi()),Zl+=s,Zl>5&&(Zl=0,BM()),lh=Ke.damp(lh,0,1.6,s),oh+=s,sn<100&&zt==="bunker"&&oh>6&&Lt.strain===0&&(sn=Math.min(100,sn+s*1.6),ha())}function uS(){const s=Math.min(hh.getDelta(),.05);if(!ne)return;if(hS(s),Sn){cS();return}const e=_a();Io.scene=e,Io.camera=ne.camera,_s&&(_s.scene=e,_s.camera=ne.camera),Ji.uniforms.time.value=hh.elapsedTime;const t=Ke.clamp(1-sn/100,0,1);Ji.uniforms.damage.value=Math.max(lh*.8,t*.45);const n=1-On;Ji.uniforms.vignette.value=.44+n*.16,Ji.uniforms.saturation.value=.96-n*.14,Ji.uniforms.aberration.value=.0012+n*.001,ah.strength=zt==="outside"?.12:.2,gi.render()}addEventListener("resize",()=>{!At||!ne||(At.setSize(innerWidth,innerHeight),gi?.setSize(innerWidth,innerHeight),Ui?.setSize(innerWidth,innerHeight),ne.camera.aspect=innerWidth/innerHeight,ne.camera.updateProjectionMatrix())});RM().catch(TM);
