-- Native pixel artwork. Run with Aseprite --batch --script (no desktop input).
local root = app.params['root'] or '.'
local sprite = Sprite(32, 32, ColorMode.RGB)
sprite.layers[1].name = 'Outline'
local colors = {
 outline={49,5,52}, metalDark={111,0,57}, metal={211,0,88},
 metalLight={250,31,154}, shine={255,104,229},
 goldDark={155,33,0}, gold={255,132,0}, goldLight={255,212,0},
 gripDark={71,8,78}, grip={124,25,121}, gripLight={202,75,162},
 gemDark={216,64,0}, gem={255,171,0}, gemLight={255,245,116}
}
local rgba = {}
for name,c in pairs(colors) do rgba[name]=app.pixelColor.rgba(c[1],c[2],c[3],255) end
local masks, union = {}, {}
local function inside(x,y,points)
 local yes=false
 local j=#points
 for i=1,#points do
  local a,b=points[i],points[j]
  if ((a[2]>y)~=(b[2]>y)) and x<(b[1]-a[1])*(y-a[2])/(b[2]-a[2])+a[1] then yes=not yes end
  j=i
 end
 return yes
end
local function part(name,poly,shade)
 local pixels={}
 for y=0,31 do for x=0,31 do
  if inside(x+.5,y+.5,poly) then
   local k=y*32+x
   pixels[k]=shade(x,y);union[k]=true
  end
 end end
 masks[#masks+1]={name=name,pixels=pixels}
end
-- Deliberately placed hard-edged clusters, inspired by the supplied curved blade.
part('Purple wrapped grip',{{4,27},{9,22},{12,25},{7,30}},function(x,y)
 if (x+y)%4==1 then return 'gripLight' end
 return x+y<33 and 'grip' or 'gripDark'
end)
part('Curved blade dark silhouette',{{10,21},{17,15},{21,11},{24,7},{24,2},{27,5},{29,9},{29,13},{26,17},{21,21},{14,26}},function() return 'metalDark' end)
part('Magenta blade face',{{11,21},{18,15},{22,11},{25,7},{25,4},{28,8},{28,12},{25,16},{20,20},{13,25}},function(x,y)
 if x>=26 then return 'shine' end
 if x>=24 or (x+y)%5==0 then return 'metalLight' end
 return 'metal'
end)
part('Ember blade bevel',{{13,24},{19,19},{25,15},{28,11},{28,13},{25,17},{20,21},{14,25}},function(x,y)
 if x+y>=41 then return 'goldDark' end
 return 'gold'
end)
part('Yellow cutting edge',{{14,23},{19,18},{24,15},{27,11},{28,10},{28,12},{25,16},{20,20},{15,24}},function(x,y)
 if x>=27 then return 'gemLight' end
 return 'goldLight'
end)
part('Upper purple hooked guard',{{4,17},{5,19},{8,18},{10,18},{8,20},{7,21},{9,23},{7,24},{3,21},{3,19}},function(x,y)
 if y>=21 then return 'gripLight' end
 return y<=18 and 'gripDark' or 'grip'
end)
part('Lower purple hooked guard',{{12,24},{14,26},{16,26},{17,24},{18,23},{18,28},{16,29},{14,28},{11,26}},function(x,y)
 if x+y<40 then return 'gripLight' end
 return x>=17 and 'gripDark' or 'grip'
end)
part('Golden hilt jewel',{{9,21},{12,21},{14,23},{13,25},{10,26},{8,24}},function(x,y)
 if x+y<=33 then return 'gemLight' end
 if y>=25 then return 'gemDark' end
 return 'gem'
end)
part('Purple pommel',{{3,27},{5,27},{6,29},{5,30},{2,30},{2,28}},function(x,y)
 if y>=29 then return 'gripLight' end
 return 'grip'
end)
local outline=Image(32,32,ColorMode.RGB)
for k in pairs(union) do
 local x,y=k%32,math.floor(k/32)
 for _,d in ipairs({{-1,0},{1,0},{0,-1},{0,1}}) do
  local xx,yy=x+d[1],y+d[2]
  if xx>=0 and xx<32 and yy>=0 and yy<32 and not union[yy*32+xx] then outline:drawPixel(xx,yy,rgba.outline) end
 end
end
sprite:newCel(sprite.layers[1],1,outline,Point(0,0))
for _,part in ipairs(masks) do
 local layer=sprite:newLayer();layer.name=part.name
 local image=Image(32,32,ColorMode.RGB)
 for k,c in pairs(part.pixels) do image:drawPixel(k%32,math.floor(k/32),rgba[c]) end
 sprite:newCel(layer,1,image,Point(0,0))
end
local palette=Palette(15)
palette:setColor(0,Color{r=0,g=0,b=0,a=0})
local i=1
for _,name in ipairs({'outline','metalDark','metal','metalLight','shine','goldDark','gold','goldLight','gripDark','grip','gripLight','gemDark','gem','gemLight'}) do
 local c=colors[name];palette:setColor(i,Color{r=c[1],g=c[2],b=c[3],a=255});i=i+1
end
sprite:setPalette(palette)
sprite:saveAs(root..'/source-assets/ui-item-aseprite/rose-saber-v1.aseprite')
local rendered=Image(sprite)
rendered:saveAs(root..'/dist/assets/ui-item-aseprite/rose-saber-v1.png')
-- Integer enlargement for inspection; preserve the 32px source separately.
local preview=Image(256,256,ColorMode.RGB)
for y=0,255 do for x=0,255 do preview:drawPixel(x,y,rendered:getPixel(math.floor(x/8),math.floor(y/8))) end end
preview:saveAs(root..'/source-assets/ui-item-aseprite/rose-saber-v1-8x.png')
sprite:close()
