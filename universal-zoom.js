/* Living Universe zoom geometry.
 * Pure, local-first math shared by the opening Tree and its acceptance tests.
 * Browser page zoom is left to the browser; this only operates inside an
 * explicitly interactive SVG camera. No storage, telemetry or network calls.
 */
(function(root){
 'use strict';
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 function fractions(rect,center){
  const side=Math.min(rect.width,rect.height);
  if(!Number.isFinite(side)||side<=0)return {x:.5,y:.5};
  // Default SVG preserveAspectRatio="xMidYMid meet": account for letterboxing.
  const left=rect.left+(rect.width-side)/2;
  const top=rect.top+(rect.height-side)/2;
  return {x:clamp((center.x-left)/side,0,1),y:clamp((center.y-top)/side,0,1)};
 }
 function frame({start,anchor,center,rect,ratio,min=250,max=1000,extent=1000}){
  const valid=Number.isFinite(ratio)&&ratio>0&&Number.isFinite(start?.w)&&start.w>0
    &&Number.isFinite(anchor?.x)&&Number.isFinite(anchor?.y);
  if(!valid)throw new TypeError('A valid camera, anchor, and positive pinch ratio are required.');
  const size=clamp(start.w/ratio,min,Math.min(max,extent));
  const f=fractions(rect,center),limit=Math.max(0,extent-size);
  return {x:clamp(anchor.x-size*f.x,0,limit),y:clamp(anchor.y-size*f.y,0,limit),w:size,h:size};
 }
 root.AIFT_UNIVERSAL_ZOOM=Object.freeze({fractions,frame});
})(typeof window!=='undefined'?window:globalThis);
