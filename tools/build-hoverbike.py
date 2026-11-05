"""Reference-inspired broad-front hover scooter with an open footwell."""
import sys, math, bpy, bmesh
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from vehicle_mesh_common import *
clear()
white=mat('Ceramic pearl panels','#dce5eb'); shade=mat('Side panel cool pearl','#b8c6d0'); dark=mat('Graphite mechanical core','#252e38'); black=mat('Black padded seat','#101820'); metal=mat('Brushed silver mechanics','#8196a3'); cyan=mat('Cyan ion accents','#19d9ed',True); glass=mat('Smoky windscreen','#48636e')

def loft(name,sections,m,n=16):
    # Rounded cross sections along Z, with independently shaped roofs/floors.
    verts=[]
    for z,w,cy,h in sections:
        for j in range(n):
            a=2*math.pi*j/n
            x=math.cos(a); y=math.sin(a)
            verts.append((w*math.copysign(abs(x)**.65,x),cy+h*math.copysign(abs(y)**.72,y),z))
    faces=[tuple(reversed(range(n))),tuple(range(len(verts)-n,len(verts)))]
    for k in range(len(sections)-1):
        for j in range(n):faces.append((k*n+j,k*n+(j+1)%n,(k+1)*n+(j+1)%n,(k+1)*n+j))
    return mesh(name,verts,faces,m)

def ring(name,at,major,minor,m):
    # Crosswise side-mounted torus, with enough arc segmentation to read round.
    verts=[];N=24;M=6
    for i in range(N):
        a=i*math.tau/N
        for j in range(M):
            b=j*math.tau/M;r=major+minor*math.cos(b)
            verts.append((at[0]+minor*math.sin(b),at[1]+r*math.sin(a),at[2]+r*math.cos(a)))
    faces=[]
    for i in range(N):
        for j in range(M):faces.append((i*M+j,((i+1)%N)*M+j,((i+1)%N)*M+(j+1)%M,i*M+(j+1)%M))
    return mesh(name,verts,faces,m)

# The low flat deck connects two clearly separate tall volumes: saddle/rear
# luggage and the broad scooter leg shield, leaving a visible open footwell.
loft('Broad dark hovering floor deck',[(-28,6,11,2),(-25,12,11,3),(-14,14,11,3),(3,13,11,3),(20,11,12,3),(26,6,13,2)],dark)
box('Recessed open footwell',(0,14,2),(17,2,16),black,1.8)
for s in (-1,1):
    box('Pearl footwell sill',(s*11,14,2),(3,3,20),white,1)
    box('Foot tread inset',(s*8,15,1),(2.5,.6,10),metal,.5)
# Broad blunt apron, taller at the rider end. Roof narrows rather than tapering
# into a spaceship nose; front corners are rolled through multiple sections.
loft('High wraparound front leg shield',[(6,9,23,10),(9,14,24,13),(15,15.3,24,13),(22,14.4,22,11),(26,11,21,8),(28,7,21,5)],white)
loft('Recessed central graphite apron',[(8,4.5,33,2),(11,5.7,36,1.5),(17,5.4,35.1,1.2),(24,3.5,30,1.2)],dark)
# Wide angled windscreen spans the top of the shield, leaning toward the nose.
# This is a solid curved plate, not a pointed canopy.
verts=[]
for z,y,w in [(9,35,11),(12,40,10.5),(16,45,9),(18,46,8)]:
    for x in [-1,-.5,0,.5,1]:verts.append((x*w,y-(x*x)*1.4,z))
verts+= [(x,y-.8,z+.5) for x,y,z in verts]
faces=[]
for k in range(3):
    for j in range(4):
        a=k*5+j;faces.extend([(a,a+1,a+6,a+5),(a+20,a+25,a+26,a+21)])
perimeter=[0,1,2,3,4,9,14,19,18,17,16,15,10,5]
for i,a in enumerate(perimeter):
    b=perimeter[(i+1)%len(perimeter)];faces.append((a,b,b+20,a+20))
mesh('Slanted rounded smoke windshield',verts,faces,glass)
box('Dashboard handle bridge',(0,34,6),(20,2,3),dark,.8)
for s in (-1,1):
    box('Rubber handle grip',(s*11,34,4),(5,2,2.3),black,.7)
    box('Front cyan inset lamp',(s*10,30,23),(4,1.5,2),cyan,.6)
# Long black scooped saddle behind the footwell; white body is split into
# thick pannier-like side shells so the black U-shaped sitting area stays clear.
loft('Saddle pedestal',[(-25,5,19,6),(-20,7,20,7),(-12,6.7,20,6),(-5,4,20,4)],dark)
loft('Scooped continuous padded seat',[(-24,5,27,2.3),(-20,6.3,26,2.5),(-14,6.7,24,2),(-7,6,23.5,2),(-3,4,24.5,1.8)],black)
back=loft('Tall padded wraparound backrest',[(-25,4.7,34,10),(-23,5.8,34,10),(-21,5.8,34,9),(-19,4.7,34,7)],black)
# Taller side bolsters turn the saddle into an unmistakable U in top view.
for s in (-1,1):
    o=loft('Raised padded saddle side bolster',[(-22,1.2,28,3),(-16,1.2,26,2.5),(-8,.9,25,1.5)],black);o.location.x=s*5.8
    o=loft('Thick pearl rear luggage shell',[(-28,3.7,21,7),(-25,5,22,9),(-18,5.2,22,9),(-12,4.5,21,7),(-10,2.7,20,5)],white);o.location.x=s*10.2
    box('Luggage graphite seam',(s*12.8,30,-20),(1,1.3,9),shade,.4)
    # Side-mounted large circular engine and a cyan ring, as in the reference.
    cylinder('Large side ion motor',(s*12.5,18,-7),6.3,4.5,dark,(1,0,0),24)
    ring('Bright cyan motor ring',(s*15,18,-7),4.8,.65,cyan)
    cylinder('Recessed turbine face',(s*15.2,18,-7),3.8,.6,black,(1,0,0),24)
    cylinder('Silver turbine hub',(s*15.7,18,-7),1.8,.7,metal,(1,0,0),12)
    # Short integrated front barrels; they do not change the scooter profile.
    cylinder('Integrated cannon socket',(s*9,15,26),2,2,dark,(0,0,1),12)
    cylinder('Short muzzle',(s*9,15,27.2),1.1,.7,metal,(0,0,1),12)
    box('Rear cyan position lamp',(s*9,24,-28),(4,1.5,1),cyan,.5)
    cylinder('Rear exposed silver linkage',(s*7,14,-18),1.1,10,metal,(0,0,1),8)
# Ensure all solid custom mesh components have outward face winding.
for obj in bpy.context.scene.objects:
    if obj.type!='MESH':continue
    bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(obj.data);bm.free()
export('hoverbike')
