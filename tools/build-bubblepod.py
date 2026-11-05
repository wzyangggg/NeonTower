"""Reference-inspired upright yellow submersible hover capsule. Game Y-up/Z-forward."""
import sys, math
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from vehicle_mesh_common import *
clear()
yellow=mat('Sunflower enamel','#EFA52C'); gold=mat('Recessed ochre','#B97520'); cream=mat('Ivory ceramic','#F5E7BE'); dark=mat('Dark rubber seals','#233541'); glass=mat('Transparent blue bubble glass','#568BA6'); glass['canopy']=True; highlight=mat('Glass reflected blue','#568A9D'); cyan=mat('Aqua thruster cores','#60F3E1',True); metal=mat('Brushed mechanism','#697A7A'); seat=mat('Saddle leather','#996230')
N=20
# Longitudinal egg shell: a tall rounded rear shell wrapping the front aperture.
def zbody(name,profiles,m,n=N):
    verts=[]
    for z,rx,ry,yc in profiles:
        verts.extend((rx*math.cos(a*2*math.pi/n),yc+ry*math.sin(a*2*math.pi/n),z) for a in range(n))
    faces=[tuple(range(n-1,-1,-1))]
    for r in range(len(profiles)-1):
        for a in range(n):
            b=r*n; c=(r+1)*n; j=(a+1)%n
            faces.append((b+a,b+j,c+j,c+a))
    return mesh(name,verts,faces,m)
zbody('Upright rounded yellow pressure hull',[(-19,.2,.3,31),(-17,9,13,31),(-12,16,20,31),(-5,20,24,31),(3,20,24,31),(10,18,22,31),(14,15.8,19,31)],yellow)
# Front window is vertical and forward facing, never a horizontal roof dome.
zbody('Recessed blue bubble window',[(13,15.6,19,31),(18,14,17,31),(22,10,13,31),(24,3,5,31),(24.5,.1,.1,31)],glass)
# Round vertical window gasket/armor frame with annular cross section.
def oval_ring(name,z,rx,ry,width,m,yc=31,n=32):
    verts=[]
    for depth,radius in [(z-.55,0),(z+.55,0),(z+.55,-width),(z-.55,-width)]:
        verts.extend(((rx+radius)*math.cos(a*2*math.pi/n),yc+(ry+radius)*math.sin(a*2*math.pi/n),depth) for a in range(n))
    faces=[]
    for r in range(4):
        for a in range(n):
            j=(a+1)%n;s=r*n;t=((r+1)%4)*n
            faces.append((s+a,s+j,t+j,t+a))
    return mesh(name,verts,faces,m)
oval_ring('Black recessed oval seal',14.5,16.5,20,1.1,dark)
oval_ring('Thick ivory forward window frame',15.1,17.3,20.8,1.2,cream)
# Bucket seat sits inside the real transparent observation bubble.
box('Pilot seat headrest',(0,39,13),(6,5.6,2.7),seat,1)
box('Pilot seat back',(0,32.7,14),(8.8,9,1.2),seat,1.3)
box('Seat cushion',(0,27.5,16),(9.4,2.5,1.3),gold,.8)
for s in (-1,1):
    box('Seat side bolster '+str(s),(s*4.7,31,15),(1.3,6.5,1.4),gold,.5)
    box('Pilot armrest '+str(s),(s*6,29,17),(2.1,1.6,3),dark,.5)
box('Cockpit dashboard',(0,24.5,21),(12,2.3,2),dark,.5)
for s in (-1,1): box('Dashboard lit instrument '+str(s),(s*3,25.6,21.8),(2,.35,.5),cyan,.1)
# Simple ivory robot pilot, readable through the forward bubble.
ellipsoid('Robot pilot helmet',(0,36,17),(4,4.3,3.5),cream)
box('Robot pilot visor',(0,36.3,20),(5.8,1.9,.7),dark,.6)
for s in (-1,1):
    box('Robot blue eye '+str(s),(s*1.4,36.4,20.45),(.7,.6,.25),cyan,.1)
box('Robot pilot chest',(0,30.7,18),(5.7,5.4,3.3),cream,.8)
for side in (-1,1):
    ellipsoid('Robot hands '+str(side),(side*4.3,28.5,20.5),(1.1,1.1,1.2),cream)
# Narrow asymmetric reflection ribbons communicate a bubble, retaining a blue upper window.
mesh('Bubble reflected highlight',[(-12,41,19.1),(-9,46,17.7),(-6.5,47.4,17.7),(-9.5,41.4,21.2),(-11,35,22.8),(-12.7,35,21)],[(0,1,2,3,4,5)],highlight)
mesh('Bubble right reflection',[(11.5,40,20),(12.9,34,21),(11.9,30,22.2),(10.8,36,22)],[(0,1,2,3)],highlight)
# Curved ivory lower bumper follows the lower window semicircle, rather than a straight tank fender.
verts=[]
for a in range(11):
    angle=math.pi+math.pi*a/10
    x=17.8*math.cos(angle);y=31+21.3*math.sin(angle)
    verts.extend([(x,y,14.9),(x,y+2.5,17.8),(x,y+3.6,15.8)])
faces=[]
for a in range(10):
    b=a*3;c=b+3
    faces.extend([(b,c,c+1,b+1),(b+1,c+1,c+2,b+2)])
mesh('Ivory curved chin bumper',verts,faces,cream)
# Ivory circular mechanical housings on both sides of the egg, visible from the oblique top camera.
for s in (-1,1):
    cylinder('Ivory round side service pod '+str(s),(s*19,32,-3),8.2,5,cream,axis=(s,0,0),vertices=20)
    cylinder('Side housing dark gasket '+str(s),(s*21.7,32,-3),5.5,.5,dark,axis=(s,0,0),vertices=20)
    cylinder('Side housing bronze ring '+str(s),(s*22,32,-3),4.4,.45,gold,axis=(s,0,0),vertices=16)
    cylinder('Service port center '+str(s),(s*22.3,32,-3),2.8,.45,metal,axis=(s,0,0),vertices=16)
    for a in range(4):
        t=a*math.pi/2
        cylinder('Service bolt '+str(s)+' '+str(a),(s*22.5,32+6.4*math.cos(t),-3+6.4*math.sin(t)),.55,.35,metal,axis=(s,0,0),vertices=6)
    # Exaggerated elbow arms leave open air between the egg and forward nacelles.
    box('Heavy shoulder crossbar '+str(s),(s*24,25,0),(16,5,5),gold,1)
    cylinder('Elbow mechanical joint '+str(s),(s*31,25,0),3.4,6,dark,vertices=12)
    cylinder('Elbow ivory cap '+str(s),(s*31,28.2,0),2.4,.7,cream,vertices=12)
    box('Forward bent arm '+str(s),(s*31,25,7),(5.5,5,15),yellow,1)
    box('Arm ivory top rail '+str(s),(s*31,27.8,7),(2.4,.8,11),cream,.35)
    ellipsoid('Forward side thruster cowl '+str(s),(s*31,26,16),(6.8,6.8,8),yellow)
    axis=(s*.12,.6,1)
    cylinder('Thruster dark intake '+str(s),(s*31.5,28.2,22),5.8,.8,dark,axis=axis,vertices=16)
    cylinder('Thruster glowing ring '+str(s),(s*31.6,28.6,22.6),4.8,.5,cyan,axis=axis,vertices=16)
    cylinder('Thruster inner nozzle '+str(s),(s*31.7,28.9,23),3.5,.4,metal,axis=axis,vertices=16)
    cylinder('Thruster cyan heart '+str(s),(s*31.75,29.2,23.3),2.6,.4,cyan,axis=axis,vertices=16)
    cylinder('Thruster top ion aperture '+str(s),(s*31,32.4,15),3.3,.5,dark,vertices=16)
    cylinder('Thruster top cyan core '+str(s),(s*31,32.7,15),2.4,.4,cyan,vertices=16)
    # Broad paired upper wings are an intentional reference silhouette, not little fins.
    # Broad swept paddle wing: rounded clipped outline and a readable top face.
    outline=[(s*12,-7),(s*19,-7),(s*35,-11),(s*38,-14),(s*37,-23),(s*33,-26),(s*17,-21),(s*12,-17)]
    v=[(x,48+(abs(x)-12)*.15,z) for x,z in outline]+[(x,50+(abs(x)-12)*.15,z) for x,z in outline]
    f=[tuple(range(7,-1,-1)),tuple(range(8,16))]
    for j in range(8): f.append((j,(j+1)%8,(j+1)%8+8,j+8))
    # Mirror changes winding, so reorient each polygon against its geometric centre.
    wing=mesh('Broad rounded upper yellow wing '+str(s),v,f,yellow)
    import bmesh
    bm=bmesh.new();bm.from_mesh(wing.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(wing.data);bm.free()
    mesh('Wing ivory leading stripe '+str(s),[(s*19,51.15,-7.5),(s*35,53.55,-11.7),(s*35,53.55,-12.9),(s*19,51.15,-8.7)],[(0,1,2,3)],cream)
    box('Lower landing clamp '+str(s),(s*10,10,0),(4,4,6),dark,.7)
# Rear whip antenna and compact upper radar puck.
cylinder('Rear mast',(-10,46,-12),.4,18,gold,vertices=8)
cylinder('Top radar stem',(0,54,-8),1,4,dark,vertices=8)
cylinder('Flat radar cap',(0,56,-8),3.5,1,metal,vertices=12)
box('Lower belly machinery',(0,10,0),(8,4,9),gold,1)
box('Front equipment coupler',(0,13,16),(5,3,4),dark,.7)
cylinder('Short forward utility gun',(0,15,20),1.6,5,metal,axis=(0,0,1),vertices=10)
cylinder('Utility gun muzzle',(0,15,22.6),.9,.3,dark,axis=(0,0,1),vertices=10)
export('bubblepod')
