"""Author the compact twin-engine interceptor in Blender, then export resident mesh."""
import sys, bmesh
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from vehicle_mesh_common import *

clear()
pearl=mat('Pearl ceramic armor','#DCE7EE')
edge=mat('Cool armor edges','#8BA8BA')
navy=mat('Midnight blue structure','#24364F')
dark=mat('Graphite intake cavities','#101B2B')
glass=mat('Smoked sapphire cockpit','#244F75')
cyan=mat('Ice cyan running lights','#62E8F2',True)
purple=mat('Violet engine core','#A184FF',True)
hot=mat('Warm cannon bores','#FFAC62',True)

def loft(name,rings,material):
    # Every station is an angular octagonal airframe cross section.
    verts=[]
    for z,w,b,t in rings:
        verts.extend([(-w*.65,b,z),(w*.65,b,z),(w,b+2,z),(w,t-2,z),
                      (w*.5,t,z),(-w*.5,t,z),(-w,t-2,z),(-w,b+2,z)])
    faces=[tuple(range(7,-1,-1))]
    for k in range(len(rings)-1):
        for j in range(8): faces.append((8*k+j,8*k+(j+1)%8,8*(k+1)+(j+1)%8,8*(k+1)+j))
    faces.append(tuple(8*(len(rings)-1)+j for j in range(8)))
    return mesh(name,verts,faces,material)

def plate(name,outline,low,high,material):
    n=len(outline); v=[(x,y,z) for y in (low,high) for x,z in outline]
    f=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
    f.extend((j,(j+1)%n,(j+1)%n+n,j+n) for j in range(n))
    return mesh(name,v,f,material)

loft('Continuous tapered interceptor fuselage',[(34,.9,20,22),(24,4,17,24),(8,8,15,27),(-12,10,14,27),(-28,8,16,24)],pearl)
loft('Ventral keel',[(26,1,17,19),(3,5,12,17),(-24,5,13,18)],navy)
for s in (-1,1):
    def mirrored(points): return [(s*x,z) for x,z in points]
    plate('Swept delta wing '+str(s),mirrored([(6,9),(11,7),(33,-22),(31,-27),(9,-18)]),17,19,pearl)
    plate('Graphite wing trailing edge '+str(s),mirrored([(9,-15),(32,-23),(31,-27),(9,-20)]),16.6,17.6,navy)
    plate('Wing ceramic inset '+str(s),mirrored([(13,-4),(27,-21),(14,-16)]),19.1,19.5,edge)
    plate('Wing navigation strip '+str(s),mirrored([(29,-20),(30,-22),(26,-20),(20,-14)]),19.6,19.9,cyan)
    # Prominent separate nacelles, with forward air scoops and rear exhaust throats.
    loft('Armored twin engine '+str(s),[(-3,3.6,16,25),(-13,4.7,14,26),(-29,4,15,24)],navy).location.x=s*9
    plate('Engine dorsal armor '+str(s),mirrored([(6,-7),(12,-8),(13,-23),(6,-22)]),26,27,pearl)
    cylinder('Recessed exhaust throat '+str(s),(s*9,20,-29),3.7,2,dark,(0,0,1))
    cylinder('Exhaust metallic collar '+str(s),(s*9,20,-29.7),3.2,1,edge,(0,0,1))
    cylinder('Violet turbine core '+str(s),(s*9,20,-30.3),2.5,.25,purple,(0,0,1))
    cylinder('Exhaust dark hub '+str(s),(s*9,20,-30.5),.9,.3,dark,(0,0,1))
    # The air intake opens toward the nose and remains readable from overhead.
    plate('Inlet cavity '+str(s),mirrored([(7,5),(12,2),(12,-5),(7,-2)]),25,26,dark)
    plate('Intake lip '+str(s),mirrored([(7,5),(12,2),(12,0),(7,3)]),26,27,edge)
    plate('Horizontal tailplane '+str(s),mirrored([(8,-20),(21,-28),(21,-32),(8,-28)]),24,25,pearl)
    # Canted vertical stabilizers: four-corner extruded blade instead of cube fins.
    x=s*8
    mesh('Canted vertical tail '+str(s),[(x,25,-17),(x+s*3,39,-24),(x+s*3,39,-29),(x,25,-29),
        (x+s*.9,25,-17),(x+s*3.8,39,-24),(x+s*3.8,39,-29),(x+s*.9,25,-29)],
        [(0,1,2,3),(4,7,6,5),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)],navy)
    mesh('Tail pale outer marking '+str(s),[(x+s*1.7,31,-24),(x+s*3.25,37,-25),(x+s*3.25,37,-27),(x+s*1.7,31,-26)],[(0,1,2,3)],pearl)
    # Visible paired wing cannons and missile rails give an enemy weapon silhouette.
    box('Cannon hardpoint '+str(s),(s*16,15,-9),(3,3,9),navy,1)
    cylinder('Forward cannon barrel '+str(s),(s*16,15,-1),.9,10,dark,(0,0,1),8)
    cylinder('Forward warm muzzle '+str(s),(s*16,15,4.1),.62,.3,hot,(0,0,1),8)
    loft('Wingtip guided missile '+str(s),[(0,.1,17,18),(-3,1.2,16,19),(-13,1.2,16,19),(-15,.7,16,19)],pearl).location.x=s*26
    plate('Missile fins '+str(s),mirrored([(24,-10),(28,-14),(28,-15),(24,-15)]),17,18,navy)

# A separate faceted cockpit sits inside an obvious ceramic frame, well ahead of wings.
loft('Cockpit dark recessed gasket',[(21,.5,24,25),(16,3,24,29),(5,4.3,25,33),(-2,3.2,25,30)],dark)
loft('Sapphire cockpit canopy',[(20,.5,25,26),(15,2.7,25,30),(5,3.7,26,34),(-1,2.8,26,31)],glass)
plate('Cockpit center specular facet',[(-.5,18),(.2,18),(.7,6),(-.4,4)],32,32.25,edge)
plate('Nose cyan targeting slit',[(-1.8,24),(1.8,24),(2,23),(-2,23)],25,25.3,cyan)
plate('Dorsal central panel',[(-2,0),(2,0),(3,-13),(-3,-13)],28,28.6,edge)
for z in (-5,-8,-11):
    box('Dorsal cooling grille',(0,29,z),(3.5,.5,1.2),dark)
# Mirrored armor and descending fuselage rings receive consistent outward normals.
for obj in bpy.context.scene.objects:
    if obj.type!='MESH': continue
    bm=bmesh.new(); bm.from_mesh(obj.data)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    bm.to_mesh(obj.data); bm.free()
export('fighter')
