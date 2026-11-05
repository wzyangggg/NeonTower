-- Native pixel artwork. Run with Aseprite --batch --script (no desktop input).
local root = app.params['root'] or '.'
local sprite = Sprite(32, 32, ColorMode.RGB)
sprite.layers[1].name = 'Outline'
local colors = {
 outline={31,25,48}, metalDark={93,100,133}, metal={157,179,202},
 metalLight={214,235,239}, shine={247,255,240},
 goldDark={147,77,38}, gold={227,154,48}, goldLight={255,218,104},
 gripDark={66,38,90}, grip={116,58,143}, gripLight={179,102,181},
 gemDark={19,103,113}, gem={57,204,186}, gemLight={168,246,213}
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
part('Violet leather grip',{{6,25},{11,20},{15,24},{10,29}},function(x,y)
 if (x+y)%4==0 then return 'gripLight' end
 return x+y<34 and 'grip' or 'gripDark'
end)
part('Silver blade',{{12,17},{23,5},{28,4},{27,10},{17,22}},function(x,y)
 local d=x+y
 if d<=29 then return 'shine' end
 if d<=31 then return 'metalLight' end
 if d<=33 then return 'metal' end
 return 'metalDark'
end)
part('Gold crossguard',{{8,14},{11,14},{12,17},{18,21},{21,21},{21,24},{18,25},{8,17}},function(x,y)
 if x+y<28 then return 'goldLight' end
 if x+y>=39 then return 'goldDark' end
 return 'gold'
end)
part('Gold pommel',{{5,25},{8,25},{11,28},{10,30},{7,30},{4,27}},function(x,y)
 if y==25 or x==5 then return 'goldLight' end
 return y>=29 and 'goldDark' or 'gold'
end)
part('Teal guard gem',{{12,18},{15,18},{17,20},{15,22},{12,21},{11,20}},function(x,y)
 if y==18 or x==12 then return 'gemLight' end
 return y>=21 and 'gemDark' or 'gem'
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
sprite:saveAs(root..'/source-assets/ui-item-aseprite/short-sword-v1.aseprite')
local rendered=Image(sprite)
rendered:saveAs(root..'/dist/assets/ui-item-aseprite/short-sword-v1.png')
-- Integer enlargement for inspection; preserve the 32px source separately.
local preview=Image(256,256,ColorMode.RGB)
for y=0,255 do for x=0,255 do preview:drawPixel(x,y,rendered:getPixel(math.floor(x/8),math.floor(y/8))) end end
preview:saveAs(root..'/source-assets/ui-item-aseprite/short-sword-v1-8x.png')
sprite:close()
