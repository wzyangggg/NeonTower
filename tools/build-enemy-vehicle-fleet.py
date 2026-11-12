"""Build game-scale, flat-shaded enemy skins and render review images."""
import sys
from math import cos, sin, tau
from pathlib import Path

import bmesh
import bpy
from mathutils import Quaternion, Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
from vehicle_mesh_common import box, clear, cylinder, export, mat, mesh


def palette(primary, shadow, trim, light, glass, highlight):
    return {
        'armor': mat('01 Painted armor', primary),
        'edge': mat('02 Armor shadow', shadow),
        'trim': mat('03 Ceramic panels', trim),
        'frame': mat('04 Graphite structure', '#273042'),
        'void': mat('05 Recesses', '#111829'),
        'light': mat('06 Powered emitters', light, True),
        'glass': mat('07 Polarized glass', glass),
        'shine': mat('08 Glass highlight', highlight),
    }


def loft(name, stations, surface, flank, x=0):
    """Octagonal cross sections, ordered from nose to tail."""
    verts = []
    for z, width, bottom, top in stations:
        for u, v in [(-.65, 0), (.65, 0), (1, .26), (1, .68),
                     (.65, 1), (-.65, 1), (-1, .68), (-1, .26)]:
            verts.append((x + u * width, bottom + v * (top - bottom), z))
    last = len(verts) - 8
    faces = [tuple(range(8))]
    for start in range(0, last, 8):
        for side in range(8):
            a, b = start + side, start + (side + 1) % 8
            faces.append((a, b, b + 8, a + 8))
    faces.append(tuple(range(last, last + 8)))
    obj = mesh(name, verts, faces, surface)
    obj.data.materials.append(flank)
    for face in list(obj.data.polygons)[1:-1]:
        face.material_index = int((face.index - 1) % 8 in (0, 1, 2, 6, 7))
    return obj


def plate(name, outline, bottom, top, surface, side=1, inset=.91):
    cx = sum(x for x, _ in outline) / len(outline)
    cz = sum(z for _, z in outline) / len(outline)
    n = len(outline)
    verts = [(side*x, bottom, z) for x, z in outline]
    verts += [(side*(cx+(x-cx)*inset), top, cz+(z-cz)*inset) for x, z in outline]
    faces = [tuple(range(n)), tuple(range(n, 2*n))]
    faces += [(i, (i+1)%n, (i+1)%n+n, i+n) for i in range(n)]
    return mesh(name, verts, faces, surface)


def cockpit(stations, colors):
    loft('Canopy gasket', [(z, w+.9, b-.5, t-.35) for z, w, b, t in stations],
         colors['void'], colors['frame'])
    obj = loft('Faceted canopy', stations, colors['glass'], colors['edge'])
    obj.data.materials.append(colors['shine'])
    obj.data.polygons[4].material_index = 2
    return obj


def grille(x, y, z, colors, count=3, width=4):
    for i in range(count):
        box('Cooling slot', (x, y, z-i*2.15), (width, .4, .85), colors['void'])


def gun(x, y, z, colors, size=1):
    loft('Gun shroud', [(z, 1.7*size, y-1.7, y+1.7), (z-8, 2.7*size, y-2.8, y+2.6)],
         colors['trim'], colors['frame'], x)
    cylinder('Gun barrel', (x, y, z+1), 1.15*size, 4.5, colors['frame'], (0,0,1), 8)
    cylinder('Gun bore', (x, y, z+3.3), .58*size, .15, colors['light'], (0,0,1), 8)


def ring(name, center, profile, colors, vertical=True, sides=10):
    """Closed annular nozzle with a visible opening and layered lip."""
    x, y, z = center
    verts = []
    for radius, offset, _ in profile:
        for i in range(sides):
            u, v = radius*cos(tau*i/sides), radius*sin(tau*i/sides)
            verts.append((x+u, y+offset, z+v) if vertical else (x+u, y+v, z+offset))
    faces = []
    for j in range(len(profile)):
        a, b = j*sides, ((j+1)%len(profile))*sides
        faces.extend((a+i, a+(i+1)%sides, b+(i+1)%sides, b+i) for i in range(sides))
    obj = mesh(name, verts, faces, colors[profile[0][2]])
    keys = list(dict.fromkeys(key for _, _, key in profile))
    for key in keys[1:]:
        obj.data.materials.append(colors[key])
    for polygon in obj.data.polygons:
        polygon.material_index = keys.index(profile[polygon.index//sides][2])


def jet(x, y, z, radius, colors):
    ring('Thrust nozzle', (x,y,z), [(radius,1,'frame'), (radius,-2,'trim'),
         (radius*.76,-2.3,'light'), (radius*.57,-2.3,'void'), (radius*.57,.6,'void')], colors, False, 8)
    cylinder('Deep thrust core', (x,y,z-.6), radius*.52, .4, colors['light'], (0,0,1), 8)


def needle():
    c = palette('#F35062', '#8C2B4B', '#F2D7CB', '#60F4FB', '#197897', '#83E8EF')
    loft('Arrowhead fuselage', [(35,1.7,20,23),(21,5,17,26),(4,9.4,16,30),
         (-16,10,15,30),(-30,8,18,26)], c['armor'], c['edge'])
    cockpit([(21,.8,25,27),(11,4.3,26,33),(-2,5.2,28,37),(-10,3.9,28,34)], c)
    for s in (-1,1):
        plate('Swept delta wing', [(5,17),(12,11),(36,-17),(34,-25),(13,-23),(7,-15)],17,23,c['armor'],s)
        plate('Wing leading ceramic insert', [(13,7),(35,-17),(32,-19),(17,-8),(11,-2)],22.7,23.45,c['trim'],s)
        plate('Black trailing flap', [(10,-16),(33,-20),(34,-25),(13,-24)],16.7,18.5,c['frame'],s)
        plate('Wingtip running light', [(29,-16),(34,-18),(33,-20),(28,-18)],23,23.65,c['light'],s)
        loft('Close-coupled engine', [(-9,2.8,18,26),(-17,4.5,16,28),(-29,4.2,17,26)],c['edge'],c['frame'],s*9.5)
        jet(s*9.5,21,-29,3.9,c)
        grille(s*11.6,24,-8,c)
        gun(s*18,18,-2,c,.75)
        blade = [(s*x,y,z) for x,y,z in [(8,25,-12),(11,37,-23),(12,36,-29),(8,25,-30),
                  (9.2,25,-12),(12.2,37,-23),(13.2,36,-29),(9.2,25,-30)]]
        mesh('Canted tail blade',blade,[(0,1,2,3),(4,7,6,5),(0,4,5,1),
             (1,5,6,2),(2,6,7,3),(3,7,4,0)],c['edge'])
    grille(0,30,-13,c,3,5)


def mantis():
    c = palette('#9ABC42','#456C34','#DAE7B3','#FCE272','#CB7A25','#FFE58D')
    loft('Mantis central frame', [(25,2.7,18,24),(11,8,15,29),(-7,9,15,32),(-25,5,18,28)],c['armor'],c['frame'])
    cockpit([(17,1.2,24,26),(8,4.4,26,32),(-6,5.3,29,37),(-13,3.4,28,34)],c)
    for s in (-1,1):
        plate('Gapped outrigger arm', [(6,1),(17,-7),(28,-4),(31,-13),(19,-20),(6,-16)],16,23,c['frame'],s)
        plate('Forward talon nacelle', [(19,8),(28,18),(32,34),(35,26),(35,4),(30,-16),(21,-19),(17,-9)],
              17,27,c['armor'],s,.82)
        plate('Talon cutting edge', [(29,17),(32,33),(35,26),(35,5),(31,-4),(31,14)],23,27.5,c['trim'],s)
        plate('Chevron lamp', [(20,1),(24,9),(26,7),(23,0)],26.7,27.55,c['light'],s)
        plate('Dorsal tail spur', [(9,-14),(18,-22),(19,-31),(15,-33),(9,-25)],21,29,c['edge'],s)
        grille(s*26.3,27.3,-5,c,3,4.5)
        gun(s*19,19,14,c,1.05)
        jet(s*25.2,21,-17,4.3,c)


def forge():
    c = palette('#F49A38','#9B4E2D','#FFE2AE','#72F1E5','#287D93','#91F3EA')
    loft('Armored bomb carrier', [(27,6,17,24),(17,13,13,31),(-10,16,13,35),(-26,12,15,31),
         (-31,8,17,27)],c['armor'],c['edge'])
    cockpit([(21,2.5,24,27),(15,6,28,34),(5,7.4,29,38),(-3,5,29,35)],c)
    for s in (-1,1):
        plate('Wide load-bearing shoulder', [(11,10),(26,13),(34,2),(34,-17),(25,-26),(11,-22)],14,24,c['edge'],s)
        plate('Pale upper armor', [(13,12),(24,12),(32,2),(31,-5),(24,-10),(14,-4)],23,28,c['trim'],s)
        loft('Flank rocket magazine', [(15,5.4,15,26),(6,7.2,13,26),(-13,7.2,13,24),(-23,5,16,22)],
             c['frame'],c['void'],s*24)
        gun(s*13,26,12,c,1.55)
        ring('Lift duct', (s*24,23,-15),[(8,0,'frame'),(8,3,'armor'),(7,4,'trim'),
             (5.5,4,'light'),(4.7,3,'void'),(4.7,0,'void')],c)
        cylinder('Lift duct dark well', (s*24,23.3,-15),5,.5,c['void'],(0,1,0),10)
        for a in range(0,360,120):
            vane=box('Fan vane',(s*24,24,-15),(8,.65,1.45),c['edge'])
            vane.rotation_euler.y=a*tau/360
        cylinder('Lift fan center', (s*24,24.8,-15),1.8,1,c['light'],(0,1,0),8)
        jet(s*7.8,22,-29,5.3,c)
    plate('Dorsal payload cover', [(-7,0),(7,0),(9,-12),(6,-22),(-6,-22),(-9,-12)],32,36,c['edge'])
    grille(0,36.1,-9,c,4,8)


def wraith():
    c = palette('#9670D6','#4A3A82','#DFDDF7','#FB6EBD','#B12C75','#FFC1EA')
    loft('Compact pulse drone body', [(24,3.2,20,25),(14,9,16,30),(-7,11,16,34),(-23,7,18,30)],c['armor'],c['edge'])
    cockpit([(18,1.7,25,27),(10,5.6,28,34),(-2,6,30,39),(-11,3,29,34)],c)
    for s in (-1,1):
        plate('Wing web', [(7,8),(14,12),(22,3),(24,-12),(17,-22),(7,-16)],17,23,c['edge'],s)
        plate('Crescent blade', [(14,10),(19,17),(30,22),(37,15),(39,0),(34,-15),
              (22,-29),(12,-31),(19,-22),(27,-12),(30,0),(25,9),(21,11)],18,26,c['armor'],s,.92)
        plate('Crescent tip inlay', [(26,18),(30,21),(36,15),(38,3),(34,4),(31,13)],24,26.7,c['trim'],s)
        ring('Pulse coil', (s*23,23,-3),[(9,0,'frame'),(9,3,'trim'),(7.2,4,'armor'),
             (6.3,4,'light'),(4.7,3.3,'void'),(4.7,0,'void')],c,True,12)
        cylinder('Pulse emitter iris', (s*23,23.5,-3),4.6,.6,c['void'],(0,1,0),10)
        cylinder('Pulse emitter', (s*23,24.6,-3),2.65,2,c['light'],(0,1,0),6)
        gun(s*31,22,21,c)
        jet(s*10,21,-23,4,c)
    plate('Violet spine', [(-4,-11),(4,-11),(3,-29),(0,-32),(-3,-29)],26,32,c['trim'])
    grille(0,32.2,-15,c,3,4)


def fin(name, profile, thickness, material):
    count = len(profile)
    vertices = [(x+offset, y, z) for offset in (-thickness/2, thickness/2) for x,y,z in profile]
    faces = [tuple(range(count)), tuple(range(count, 2*count))]
    faces += [(i,(i+1)%count,(i+1)%count+count,i+count) for i in range(count)]
    return mesh(name, vertices, faces, material)


def ember():
    c = palette('#FC5420','#A83025','#FFF0D4','#57F8D2','#FFAD14','#FFDD5C')
    black, white = c['frame'], c['trim']
    jade = mat('Deep jade trailing edge', '#247955')
    orange = mat('Nose highlight orange', '#FF7831')
    loft('Graphite wedge chassis', [(35,1.3,18,22),(22,7,16,26),(4,11,14,28),
         (-16,10,15,29),(-31,5,18,25)], black, c['void'])
    loft('Orange raised dorsal spine', [(32,.6,22,23.5),(21,2.7,22,27),(3,6,25,30),
         (-13,7,25,34),(-27,4.4,23,29)],orange,c['edge'])
    cockpit([(22,1,24,27),(13,4,26,32),(0,5,27,35),(-6,3.3,29,35)],c)
    for s in (-1,1):
        plate('Ceramic delta wing underlay',[(1,29),(11,16),(31,-10),(34,-27),(21,-33),(7,-25)],15,21,white,s,.96)
        plate('Orange swept wing armor',[(4,27),(11,16),(30,-10),(32,-24),(19,-30),(7,-23)],19,24,c['armor'],s,.96)
        plate('Dark wing break',[(8,9),(13,6),(21,-7),(31,-13),(32,-22),(19,-17),(10,-11)],23.5,24.65,black,s)
        plate('Aft jade edge',[(31,-9),(34,-16),(34,-27),(22,-33),(21,-30),(31,-25)],17,21.6,jade,s)
        plate('Vent trim',[(14,6),(18,1),(24,-8),(20,-7),(15,-1)],24,24.9,orange,s)
        plate('Aqua light pod',[(13,7),(20,0),(22,-5),(18,-6),(13,-2)],16,19.5,c['light'],s)
        fin('Tall swept ivory blade',[(s*16,22,-6),(s*20,32,-16),(s*23,38,-34),
             (s*20,27,-34),(s*16,21,-27)],2.6,white)
        fin('Orange fin root',[(s*14,22,-3),(s*18,29,-12),(s*20,31,-22),
             (s*17,24,-26),(s*14,22,-22)],3.1,c['armor'])
        gun(s*29,18,-12,c,1)
        jet(s*6.3,22,-29.4,3.8,c)
        for x,z in [(9,10),(11,8),(13,6)]:
            slot=box('Leading edge cooling slot',(s*x,24.2,z),(1.4,.4,.75),c['void'])
            slot.rotation_euler.y=s*.65


def cobalt():
    c = palette('#388FDE','#224376','#DDE7EB','#69E4FF','#FFAA19','#FFDE51')
    navy = mat('Blue-black radome', '#23375D')
    alloy = mat('Inlet grille ribs', '#7B9EBE')
    loft('Round blue fighter fuselage', [(33,1.5,20,23),(29,6,17,25),(20,10,15,28),
         (-2,11.5,15,31),(-20,10,16,32),(-30,7,18,27)],c['armor'],c['edge'])
    loft('Blunt dark radome', [(34,.9,20,22),(30,5.4,17.5,24.5),(25,7.7,16.2,26.8),
         (18,9,16,28.3)],navy,c['edge'])
    cockpit([(20,2.6,25,28),(13,5.3,27,34),(1,5.6,28,37),
             (-8,4.6,29,35),(-13,2.4,29,32)],c)
    box('Dark canopy divider',(0,35.55,7.5),(9.5,.75,1.95),c['void'],.25)
    fin('Tall swept dorsal stabilizer',[(0,29,-4),(0,37,-6),(0,55,-33),
         (0,41,-29),(0,29,-26)],2.6,c['edge'])
    fin('Bright dorsal fin spine',[(0,37,-6),(0,55,-33),(0,51,-32),(0,36,-9)],2.9,c['armor'])
    for s in (-1,1):
        plate('Stubby wing with aft cutout',[(8,16),(17,11),(35,-7),(32,-17),(22,-24),
              (14,-18),(9,-27)],17,22,c['armor'],s)
        plate('Pale outer wing spar',[(14,9),(30,-5),(33,-8),(27,-10),(15,2)],21.6,23,c['trim'],s)
        plate('Raised canopy shoulder',[(6,17),(10,12),(13,0),(12,-12),(8,-15),(6,-8)],25,29,c['armor'],s)
        loft('Broad pale intake housing', [(3,5,21,32),(-2,8.7,19,39),(-15,9.8,17,40),
             (-25,7.1,18,36)],c['trim'],alloy,s*18)
        loft('Recessed charcoal intake mouth', [(4,4.7,22,32),(-1,6.5,21,36)],
             c['void'],c['frame'],s*18)
        for y,z in [(24,4),(26,3.8),(28,3.1),(30,1.8),(32,-.2)]:
            box('Pale louver edge',(s*18,y,z),(6.7,.48,1.05),alloy)
        fin('Outboard blue tail',[(s*20,30,-17),(s*22,40,-27),(s*23,40,-32),
             (s*21,30,-31)],2.7,c['armor'])
        gun(s*15.5,18.8,19,c,.94)
        gun(s*26.5,18.5,5.5,c,.76)
        jet(s*17.7,24,-25.5,5.6,c)
        plate('Blue wingtip float',[(29,-6),(35,-6),(39,-10),(36,-14),(29,-13)],
              17,23,c['armor'],s)
    for x in (-2.5,2.5):
        box('Small radome port',(x,25.6,26.5),(1.25,.32,2),c['void'])


def prism():
    c = palette('#ED3487','#923064','#DCD9F2','#42CFFF','#FF761E','#FFC943')
    violet = mat('Slate-purple frame', '#504B7A')
    loft('Compact central drive body', [(14,4.4,16,22),(4,8.5,15,27),(-10,9,16,32),
         (-22,7.5,17,28),(-30,4.3,20,25)],violet,c['frame'])
    cockpit([(10,2,24,26),(4,4.5,24,31),(-5,5,29,38),
             (-13,4.4,29,38),(-18,2,27,34)],c)
    orb_center = (0,25,19)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=12.4,location=orb_center)
    orb = bpy.context.object
    orb.name = 'Blue faceted prism core'
    for name, color in [('Azure','#3490ED'),('Ice','#B6F6FF'),('Cyan','#5CCBFF'),
                        ('Periwinkle','#767CEE'),('Sky','#8ACBFF')]:
        orb.data.materials.append(mat('Prism '+name,color,True))
    for face in orb.data.polygons:
        tone = (face.index*17+face.index//5)%7
        face.material_index = (0,0,3,2,2,4,1)[tone]
    for s in (-1,1):
        plate('Graphite crescent frame',[(6,-14),(16,-17),(27,-10),(33,2),(33,15),(25,28),
              (14,32),(10,28),(17,22),(22,13),(21,5),(12,1),(6,-4)],15,27,violet,s)
        plate('Magenta outer pincer',[(23,-6),(30,0),(33,13),(28,24),(19,30),(13,30),
              (17,25),(24,17),(25,7)],18,28,c['armor'],s)
        plate('Pale segmented pincer armor',[(8,-8),(16,-13),(24,-8),(29,0),(24,5),
              (19,-1),(13,-3),(9,-2)],25,31,c['trim'],s)
        plate('Pale pincer knuckle',[(19,5),(26,6),(28,12),(25,16),(21,14),(19,10)],
              24,29,c['trim'],s)
        loft('Cylindrical wingtip cannon', [(26,3.5,17,24),(17,5.1,15,26),(5,5,16,26)],
             violet,c['void'],s*29.5)
        ring('Cyan ring around front cannon bore',(s*29.5,21,25.5),
             [(4.4,-2,'frame'),(4.2,0,'trim'),(3.4,1,'light'),
              (2.7,1,'void'),(2.7,-1.3,'void')],c,False,10)
        cylinder('Recessed cannon bore',(s*29.5,21,24.65),2.65,.4,c['void'],(0,0,1),10)
        ring('Vertical turbine at each shoulder',(s*26,25,1),
             [(6.8,0,'frame'),(6.8,2,'edge'),(5.1,3,'light'),(4,3,'void'),(4,0,'void')],c)
        cylinder('Turbine hub',(s*26,26,1),3.8,1,c['void'],(0,1,0),10)
        jet(s*12.2,21,-18.8,4.2,c)
        fin('Raised pink aft antenna root',[(s*12,24,-15),(s*15,33,-20),
             (s*20,37,-31),(s*19,27,-31),(s*13,23,-24)],5,c['armor'])
        fin('Cyan antenna tip',[(s*19,29,-27),(s*20,36,-30),(s*25,40,-40),
             (s*23,33,-40)],2.25,c['light'])
    plate('Ivory cockpit collar',[(-5,-11),(-6,-18),(0,-24),(6,-18),(5,-11),(0,-15)],
          28,32,c['trim'])


def setup_view(roll):
    target = Vector((0, 23, 0))
    eye = Vector((70, 157, 106))
    rotation = (target-eye).to_track_quat('-Z', 'Y') @ Quaternion((0,0,1), tau*roll)
    scene = bpy.context.scene
    bpy.context.view_layer.update()
    inverse = rotation.inverted()
    corners = [inverse @ (obj.matrix_world @ Vector(corner))
               for obj in scene.objects for corner in obj.bound_box]
    view_target = inverse @ target
    for axis in (0, 1):
        view_target[axis] = (min(v[axis] for v in corners) + max(v[axis] for v in corners)) / 2
    shift = rotation @ view_target - target
    target += shift
    eye += shift
    scene.render.engine = 'BLENDER_WORKBENCH'
    scene.display.shading.light = 'STUDIO'
    scene.display.shading.studio_light = 'paint.sl'
    scene.display.shading.color_type = 'MATERIAL'
    scene.display.shading.show_shadows = False
    scene.display.shading.show_cavity = True
    scene.display.shading.cavity_type = 'BOTH'
    scene.display.shading.show_specular_highlight = True
    scene.display.shading.show_object_outline = True
    scene.display.shading.object_outline_color = (.045,.065,.105)
    scene.view_settings.view_transform = 'Standard'
    scene.render.resolution_x = 600
    scene.render.resolution_y = 460
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    camera = bpy.data.objects.new('Studio camera', bpy.data.cameras.new('Orthographic'))
    scene.collection.objects.link(camera)
    camera.location, camera.rotation_euler = eye, rotation.to_euler()
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = 129
    scene.camera = camera
    camera.hide_set(True)
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == 'VIEW_3D':
                space = area.spaces.active
                space.region_3d.view_rotation = rotation
                space.region_3d.view_location = target
                space.region_3d.view_distance = 110
                space.region_3d.view_perspective = 'ORTHO'
                space.overlay.show_overlays = False
                space.shading.type = 'SOLID'
                space.shading.color_type = 'MATERIAL'
                space.clip_end = 1600


def build(kind, construct, previews, roll):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.filepaths.save_version = 0
    clear()
    construct()
    for obj in bpy.context.scene.objects:
        bm = bmesh.new()
        bm.from_mesh(obj.data)
        bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
        bm.to_mesh(obj.data)
        bm.free()
        assert obj.data.validate() is False, obj.name
    bpy.ops.object.select_all(action='DESELECT')
    setup_view(roll)
    export(kind)
    if previews:
        previews.mkdir(parents=True, exist_ok=True)
        bpy.context.scene.render.filepath = str(previews / (kind + '.png'))
        bpy.ops.render.render(write_still=True)


if __name__ == '__main__':
    args = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    marked = args[:1] == ['marked']
    if marked:
        args.pop(0)
    previews = Path(args[0]).resolve() if args else None
    models = [('ember', ember), ('cobalt', cobalt), ('prism', prism)] if marked else [
        ('needle', needle), ('mantis', mantis), ('forge', forge), ('wraith', wraith)]
    for kind, construct in models:
        build(kind, construct, previews, .42 if marked else .46)
