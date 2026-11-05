"""Rounded personal skypod with uninterrupted glazing and four open ducted fans."""
import sys, math, bmesh
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from vehicle_mesh_common import *
clear()
white=mat('Porcelain white side shell','#E7EAEB')
black=mat('Soft graphite underbody and tail','#191F25')
glass=mat('Smoky black windshield','#222E38')
sideglass=mat('Side glazing graphite','#18232C')
trim=mat('Black window seals','#0C1219')
metal=mat('Fan blades satin graphite','#48535C')
blue=mat('Fine ice blue light','#4CBEFF',True)
stations=[(31,.8,17,22),(29,5,14,24),(24,9,12,28),(17,12,11,33),
          (8,14,10,38),(0,15,10,41),(-8,15.5,11,42),(-16,15,12,41),
          (-22,13,13,35),(-28,9,15,29),(-32,3,17,24),(-32.5,.5,19,22)]
N=24
verts=[]
for z,w,b,t in stations:
    for j in range(N):
        a=j*math.tau/N
        verts.append((w*math.cos(a),(t+b)/2+(t-b)/2*math.sin(a),z))
faces=[]
for k in range(len(stations)-1):
    for j in range(N): faces.append((k*N+j,k*N+(j+1)%N,(k+1)*N+(j+1)%N,(k+1)*N+j))
faces.extend([tuple(range(N-1,-1,-1)),tuple((len(stations)-1)*N+j for j in range(N))])
body=mesh('One piece rounded skypod shell',verts,faces,white)
for m in (black,glass,sideglass,trim): body.data.materials.append(m)
for k in range(len(stations)-1):
    for j in range(N):
        face=body.data.polygons[k*N+j]
        if j>=12 or k>=9: face.material_index=1
        elif 2<=k<=6 and 4<=j<=7: face.material_index=2 if k<=4 else 3
        else: face.material_index=0

def point(k,a,offset=.10):
    z,w,b,t=stations[k]
    return ((w+offset)*math.cos(a),(t+b)/2+((t-b)/2+offset)*math.sin(a),z)
def curved_strip(name,k,a0,a1,width,material):
    steps=20; v=[]
    for dz in (-width/2,width/2):
        for i in range(steps+1):
            p=point(k,a0+(a1-a0)*i/steps,.16);v.append((p[0],p[1],p[2]+dz))
    return mesh(name,v,[(i,i+1,steps+2+i,steps+1+i) for i in range(steps)],material)
curved_strip('Windshield upper frame',4,math.pi/3,math.pi*2/3,.5,trim)
curved_strip('C shoulder rear canopy gasket',7,math.pi/3,math.pi*2/3,.65,trim)
for s in (-1,1):
    a=math.pi/3 if s>0 else math.pi*2/3
    v=[]
    for k in range(2,8):
        for da in (-.018,.018): v.append(point(k,a+da,.19))
    mesh('Longitudinal side window seal '+str(s),v,[(i*2,i*2+1,i*2+3,i*2+2) for i in range(5)],trim)

def annulus(name,x,z,profile,material,n=18):
    v=[(x+r*math.cos(math.tau*j/n),y,z+r*math.sin(math.tau*j/n)) for r,y in profile for j in range(n)]
    f=[]
    for p in range(len(profile)):
        q=(p+1)%len(profile)
        for j in range(n): f.append((p*n+j,p*n+(j+1)%n,q*n+(j+1)%n,q*n+j))
    return mesh(name,v,f,material)
for s in (-1,1):
    for front in (True,False):
        x=s*23; z=17 if front else -19
        label=('front ' if front else 'rear ')+('left' if s<0 else 'right')
        box('Broad porcelain fan outrigger '+label,(s*16,19,z),(12,4,7),white,1.6)
        annulus('Open ceramic duct '+label,x,z,[(7.7,14),(8.4,15),(8.4,19),(7.8,20.5),(6.6,20.5),(6.25,19),(6.25,15),(6.7,14)],white)
        annulus('Deep graphite inner wall '+label,x,z,[(6.25,15),(6.25,19.7),(6.0,19.7),(6.0,15)],trim)
        annulus('Thin blue inner light '+label,x,z,[(6.04,18.8),(6.04,19.15),(5.95,19.15),(5.95,18.8)],blue)
        annulus('Black lower duct gasket '+label,x,z,[(8.25,14.5),(8.25,15.3),(7.9,15.3),(7.9,14.5)],black)
        for blade in range(7):
            a=blade*math.tau/7
            outline=[(1.2,-.5),(5.6,-.9),(5.8,.15),(2.6,1.15),(1.2,.65)]
            v=[]
            for dy in (-.22,.22):
                for r,tan in outline:
                    v.append((x+r*math.cos(a)-tan*math.sin(a),17+dy+tan*.32,z+r*math.sin(a)+tan*math.cos(a)))
            f=[(4,3,2,1,0),(5,6,7,8,9)]+[(j,(j+1)%5,(j+1)%5+5,j+5) for j in range(5)]
            mesh('Recessed propeller blade '+label+' '+str(blade),v,f,metal)
        cylinder('Propeller central shaft '+label,(x,17.4,z),1.25,2,black,(0,1,0),12)
        ellipsoid('Rounded fan hub '+label,(x,18.2,z),(1.35,.8,1.35),metal)
for s in (-1,1):
    mesh('Blue front light '+str(s),[(s*3.9,23.3,28),(s*7.1,24,25.7),(s*7.3,24.6,25.7),(s*4,23.9,28)],[(0,1,2,3)],blue)
    mesh('Side shell door shut line '+str(s),[(s*14.91,21,-7),(s*14.9,21,-14),(s*13.7,24,-20),(s*13.65,24.2,-20),(s*14.75,21.2,-14),(s*14.75,21.2,-7)],[(0,1,2,3,4,5)],trim)
    box('Rear blue marker '+str(s),(s*5,24,-28),(3,.5,.5),blue,.15)
box('Small dorsal sensor',(0,41.3,-8),(3,1,3),black,.6)
for obj in bpy.context.scene.objects:
    if obj.type!='MESH': continue
    bm=bmesh.new();bm.from_mesh(obj.data)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
bpy.context.preferences.filepaths.save_version=0
export('hovercar')
