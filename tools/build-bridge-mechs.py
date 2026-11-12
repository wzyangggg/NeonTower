"""Build editable Blender parts and export the game vertex buffers."""
import json
import sys
from math import cos, sin, tau
from pathlib import Path

import bpy
import bmesh
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
from vehicle_mesh_common import ROOT, box, cylinder, ellipsoid, mat, mesh


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.filepaths.save_version = 0
    frame = mat('Graphite frame', '#242d3e')
    steel = mat('Machined alloy', '#9eb3be')
    rubber = mat('Tire rubber', '#343b49')
    sky = mat('Sphere sky blue', '#36BFFF')
    rammer_orange = mat('Rammer traffic orange', '#FF902E')
    camera_paint = mat('Camera lemon yellow', '#F9EB38')
    lilac = mat('Hammer orchid pink', '#FF65BA')
    red = mat('Barrel safety red', '#F43F48')
    red_rib = mat('Stamped red steel', '#83272a')
    white = mat('Barrel enamel white', '#F6EFE7')
    mint = mat('Sweeper leaf green', '#55DE52')
    mint_shadow = mat('Sweeper shaded green', '#267838')
    cream = mat('Capsule turquoise', '#27DCB9')
    pale = mat('Capsule polarized window', '#258B86')
    cyan = mat('Cyan optics', '#8fffea', True)
    amber = mat('Amber optics', '#ffe0a0', True)
    parts = {}

    def part(key, build_part):
        before = set(bpy.context.scene.objects)
        build_part()
        objects = [obj for obj in bpy.context.scene.objects if obj not in before]
        collection = bpy.data.collections.new(key)
        bpy.context.scene.collection.children.link(collection)
        for obj in objects:
            for old in list(obj.users_collection):
                old.objects.unlink(obj)
            collection.objects.link(obj)
        parts[key] = objects

    def optic(x, y, z, radius, light):
        cylinder('Recessed optical collar', (x, y, z), radius, 3, frame, (0, 0, 1), 16)
        cylinder('Lens retaining ring', (x, y, z+1.6), radius*.76, 1, steel, (0, 0, 1), 16)
        cylinder('Emitter', (x, y, z+2.2), radius*.53, .5, light, (0, 0, 1), 12)

    def rim_segments(name, y, radius, color, *, z=0, depth_scale=1, width=1.2, sweep=.42):
        """Four interrupted trim inserts, with recessed gaps between panels."""
        for side in range(4):
            center = tau*(side+.5)/4
            angles = [center-sweep+2*sweep*i/6 for i in range(7)]
            vertices = [(r*cos(a), height, z+depth_scale*r*sin(a))
                        for a in angles for height, r in
                        ((y, radius), (y+.6, radius), (y+.6, radius-width), (y, radius-width))]
            faces = [(3, 2, 1, 0), (24, 25, 26, 27)]
            for start in range(0, 24, 4):
                for i in range(4):
                    a, b = start+i, start+(i+1)%4
                    faces.append((a, b, b+4, a+4))
            mesh(name, vertices, faces, color)

    def spider_core(round_shell):
        paint = sky if round_shell else camera_paint
        box('Four point hip frame', (0, 17, 0), (24, 9, 22), frame, 2)
        if round_shell:
            ellipsoid('Spherical cast shell', (0, 33, 0), (22, 21, 22), paint)
            cylinder('Equatorial armor seam', (0, 32, 0), 22.1, 1.6, frame, vertices=24)
            cylinder('Crown hatch', (0, 52, -3), 8, 3.2, paint, vertices=16)
            rim_segments('Interrupted sphere seam inlay', 32.85, 22.4, cyan, width=.75, sweep=.22)
            cylinder('Hatch gasket', (0, 51.2, -3), 8.7, 1.1, frame, vertices=16)
            for x in (-4.8, 4.8):
                cylinder('Captive hatch fastener', (x, 53.7, -3), 1.25, .6, steel, vertices=8)
        else:
            cylinder('Camera swivel mount', (0, 22, 0), 7, 5, frame)
            box('Chamfered camera housing', (0, 33, -1), (27, 24, 23), paint, 2.4)
            box('Lens hood brow', (0, 42, 10), (23, 4, 9), paint, 1)
            box('Side bracket', (14, 31, -6), (4, 12, 8), frame, 1)
            cylinder('Hinge pin', (16, 31, -6), 3.1, 1.5, steel, (1, 0, 0), 10)
            cylinder('Antenna', (13, 47, -9), .75, 12, frame, vertices=8)
            for x in (-10, 10):
                box('Camera edge guard', (x, 32, 10.9), (2.6, 13, 2.1), frame, .45)
                box('Inset running light', (x, 35, 12.05), (.85, 5, .45), cyan, .14)
            box('Recessed top service hatch', (-4, 45, -4), (11, 1.2, 9), frame, .65)
        optic(0, 33, 20 if round_shell else 12, 7 if round_shell else 9, cyan)

    def barrel_spider():
        box('Hip cradle', (0, 16, 0), (25, 8, 22), frame, 2)
        rings = [(13.5, 13.4), (14.2, 15.2), (15.6, 15.2), (16.4, 14),
                 (22, 14), (23, 14.8), (24, 14.8), (25, 14),
                 (34, 14), (35, 14.8), (36, 14.8), (37, 14),
                 (42, 14), (43, 15.2), (44.5, 15.2), (45.2, 13)]
        sides = 32
        verts = [(radius*cos(tau*i/sides), y, radius*sin(tau*i/sides))
                 for y, radius in rings for i in range(sides)]
        faces = [tuple(range(sides))]
        for row in range(len(rings)-1):
            for i in range(sides):
                a, b = row*sides+i, row*sides+(i+1)%sides
                faces.append((a, a+sides, b+sides, b))
        end = len(verts)-sides
        faces.append(tuple(reversed(range(end, end+sides))))
        drum = mesh('Rolled steel drum with painted bands', verts, faces, red)
        for material in (white, red_rib):
            drum.data.materials.append(material)
        for face in list(drum.data.polygons)[1:-1]:
            row = (face.index-1)//sides
            face.material_index = 1 if 4<=row<=10 or row==13 else 2 if row in (0, 1, 14) else 0
        cylinder('Recessed lid', (0, 45.25, 0), 12, .7, red, vertices=32)
        box('Stamped lid reinforcement', (0, 45.75, 4), (20, .55, 2), red_rib, .25)
        cylinder('Threaded filler cap', (5, 46, 2), 3.2, 2.4, frame, vertices=10)
        cylinder('Small vent plug', (5, 46, -6), 1.8, 1.5, steel, vertices=8)
        cylinder('Fuse housing', (-5, 46, -3), 3.3, 2.4, frame, vertices=12)
        cylinder('Fuse indicator', (-5, 47.5, -3), 1.6, .6, amber, vertices=12)

    def sweeper():
        cylinder('Low circular bumper', (0, 4, 0), 15, 5, frame, vertices=28)
        ellipsoid('Rounded appliance shell', (0, 7, 0), (14.9, 6.7, 14.9), mint)
        cylinder('Lidar turret', (0, 12.6, -3), 5.5, 2.7, mint_shadow, vertices=18)
        cylinder('Lidar cap', (0, 14, -3), 5.2, 1, mint, vertices=18)
        box('Single front status slit', (0, 7, 14.2), (5, 1.1, .8), mint_shadow, .25)
        for x in (-10, 10):
            cylinder('Side brush hub', (x, 1.8, 8), 3, 1.4, frame, vertices=10)
        rim_segments('Sweeper bumper wear guards', 5.8, 15.25, mint_shadow, sweep=.57)
        rim_segments('Sweeper short edge lights', 6.35, 15.1, cyan, width=.75, sweep=.18)
        rim_segments('Inset lidar edge', 14.55, 4.95, frame, z=-3, width=.8, sweep=.34)
        box('Dust cartridge seam', (0, 11.1, -8.7), (12, 1.2, 1.5), mint_shadow, .35)

    def capsule():
        cylinder('Leg mounting collar', (0, 18, 0), 12, 8, frame, vertices=20)
        cylinder('Tall porcelain sleeve', (0, 34, 0), 11, 26, cream, vertices=24)
        ellipsoid('Rounded capsule crown', (0, 46, 0), (11, 11, 11), pale)
        cylinder('Lower rubber gasket', (0, 22, 0), 11.5, 2.5, frame, vertices=20)
        box('Recessed inspection window', (0, 37, 10.4), (9, 16, 2.2), pale, 1)
        box('Status slit', (0, 25, 11.2), (5, 1, 1), cyan, .3)
        box('Transport handle', (0, 57, -1), (7, 2.5, 3), frame, .5)
        rim_segments('Capsule segmented sleeve lip', 44.8, 11.35, frame, sweep=.51)
        rim_segments('Capsule collar running lights', 22.6, 11.8, cyan, width=.8, sweep=.16)
        for side in (-1, 1):
            box('Sleeve guide rail', (side*5.1, 37, 10.2), (1.4, 15, 1.4), cream, .38)
            for y in (29, 44):
                cylinder('Sleeve fastener', (side*5.2, y, 10.7), .8, .8, frame, (0, 0, 1), 8)

    def beetle():
        indigo = mat('Beetle violet enamel', '#8854DB')
        wing = mat('Beetle violet wing enamel', '#A66CFA')
        wing_edge = mat('Recessed elytra lip', '#4B2F85')
        wing_ridge = mat('Elytra raised ribs', '#C8A3FF')
        ellipsoid('Armored underbody', (0, 19, -6), (13, 8, 24), frame)
        ellipsoid('Cast thorax', (0, 28, 5), (15, 12, 15), indigo)
        for side in (-1, 1):
            # One closed shell per side. Each cross section follows the straight
            # inner seam, convex shoulder, bevelled outer lip and underside.
            sections = [(-33, 2.3, 5, 24, 27), (-30, .9, 10, 22, 31),
                        (-24, .7, 15, 22, 37), (-15, .7, 17.6, 22, 40),
                        (-7, .8, 17.3, 23, 40.5), (0, 1.1, 14, 24, 36),
                        (4, 1.7, 10.5, 25, 31)]
            profile = [(0,.86),(.12,.97),(.30,1),(.50,.96),(.69,.86),
                       (.85,.70),(.96,.49),(1,.26),(.93,.08),(.56,0),(.08,.13),(0,.38)]
            vertices = [(side*(inner+(outer-inner)*u), bottom+(top-bottom)*v, z)
                        for z, inner, outer, bottom, top in sections for u, v in profile]
            size = len(profile)
            end = len(vertices)-size
            faces = [tuple(range(size))]
            for start in range(0, end, size):
                for i in range(size):
                    a, b = start+i, start+(i+1)%size
                    faces.append((a, b, b+size, a+size))
            faces.append(tuple(range(end, end+size)))
            shell = mesh('Left elytron' if side<0 else 'Right elytron', vertices, faces, wing)
            shell.data.materials.append(wing_edge)
            shell.data.materials.append(wing_ridge)
            for face in list(shell.data.polygons)[1:-1]:
                panel = (face.index-1)%size
                face.material_index = 1 if panel>=7 else 2 if panel in (1, 5) else 0
            edit = bmesh.new()
            edit.from_mesh(shell.data)
            bmesh.ops.recalc_face_normals(edit, faces=list(edit.faces))
            edit.to_mesh(shell.data)
            edit.free()
            cylinder('Elytron hinge pin', (side*8, 36, 1), 2.2, 1.4, steel, vertices=10)
            for z in (-10, -3, 9):
                cylinder('Recessed hip pivot', (side*12, 20, z), 3, 4, steel, (1, 0, 0), 10)
        ellipsoid('Head casing', (0, 24, 16), (10, 7, 10), indigo)
        optic(0, 23, 24, 3.8, amber)
        # Each station defines the center and elliptical section of the curved horn.
        for name, stations in (
            ('Long swept horn', [(12, 32, 8, 7), (22, 34, 6, 5.5), (31, 39, 4.1, 3.4),
                                 (41, 41, 2.7, 2.2), (49, 40, 1.2, 1.1), (54, 37, .2, .3)]),
            ('Lower opposing horn', [(19, 21, 4.4, 3), (28, 19, 3.1, 2.2),
                                     (34, 20, 1.8, 1.4), (38, 24, .2, .3)]),
        ):
            sides = 10
            vertices = [(cos(tau*i/sides)*width, y+sin(tau*i/sides)*height, z)
                        for z, y, width, height in stations for i in range(sides)]
            end = len(vertices)-sides
            faces = [tuple(reversed(range(sides))), tuple(range(end, end+sides))]
            for start in range(0, end, sides):
                for i in range(sides):
                    a, b = start+i, start+(i+1)%sides
                    faces.append((a, b, b+sides, a+sides))
            mesh(name, vertices, faces, indigo)

    def crab():
        shell = mat('Crab gold shell', '#F8BB3D')
        dark_shell = mat('Crab armor shadow', '#A05F2B')
        ellipsoid('Wide low carapace', (0, 25, -3), (26, 12, 19), shell)
        box('Undershell seam', (0, 19, -3), (43, 5, 29), dark_shell, 2)
        box('Recessed faceplate', (0, 19, 13), (23, 9, 7), frame, 1.8)
        for side in (-1, 1):
            box('Narrow sensor', (side*6, 20, 17), (6, 2.4, 1), amber, .4)
            cylinder('Arm pivot', (side*20, 19, 7), 5, 11, frame, (1, 0, 0), 12)
            x = side*28
            extent = 1.2 if side==1 else .85
            box('Chamfered claw plate', (x, 18, 15), (14*extent, 10, 20*extent), shell, 2.6)
            cylinder('Claw knuckle', (x, 23.1, 17), 3.8, 1.5, dark_shell, vertices=12)
            box('Claw outer edge bumper', (x+side*5.4*extent, 20, 15), (2.8, 5, 14*extent), dark_shell, 1)
            box('Claw edge light', (x+side*5.7*extent, 22.6, 14), (1.1, .6, 6*extent), amber, .25)
            for jaw in (-1, 1):
                point = x + jaw*4.7*extent
                box('Claw jaw', (point, 16, 26), (5*extent, 6, 13*extent), dark_shell, 1.6)
                box('Inward jaw tooth', (point-jaw*1.6, 16, 30), (4, 5, 4), shell, .9)
        box('Carapace access hatch', (0, 36.2, -7), (14, 2.4, 12), dark_shell, .9)
        rim_segments('Carapace segmented skirt', 24, 26, dark_shell, z=-3, depth_scale=.73, width=1.8, sweep=.48)
        rim_segments('Carapace corner inlays', 24.65, 26, amber, z=-3, depth_scale=.73, width=.85, sweep=.16)

    def hermit():
        shell = mat('Hermit raspberry shell', '#DF3979')
        paint = mat('Hermit rose enamel', '#FF8BA4')
        ellipsoid('Carried spherical shell', (0, 32, -12), (24, 24, 23), shell)
        cylinder('Shell opening collar', (0, 24, 5), 16, 7, frame, (0, 0, 1), 20)
        for axis in ((0, 1, 0), (-.8, .6, 0), (.8, .6, 0), (-1, 0, 0), (1, 0, 0), (0, .7, -.7)):
            direction = Vector(axis).normalized()
            at = Vector((0, 32, -12)) + 23*direction
            cylinder('Shell boss', at, 4.5, 6, shell, direction, 12)
        ellipsoid('Exposed terracotta body', (0, 20, 13), (13, 9, 13), paint)
        for side in (-1, 1):
            x = side*8
            cylinder('Eyestalk', (x, 29, 17), 2.5, 10, paint, vertices=10)
            cylinder('Eyestalk camera', (x, 34, 19), 4.5, 7, paint, (0, 0, 1), 14)
            ellipsoid('Dark eye lens', (x, 34, 22.6), (3.1, 3.1, 1.5), frame)
            ellipsoid('Foreclaw', (side*14, 15, 23), (6, 8, 8), paint)
            box('Claw fingertip', (side*12, 13, 30), (4, 6, 5), paint, 1)
            box('Foreclaw replaceable wear strip', (side*15.5, 21.8, 24), (3.5, 1.4, 6), frame, .5)
        rim_segments('Shell segmented reinforcing belt', 29, 24.1, frame, z=-12, depth_scale=.96, width=2.1, sweep=.57)
        rim_segments('Shell short status inserts', 29.65, 24.1, amber, z=-12, depth_scale=.96, width=.9, sweep=.12)

    def scorpion():
        graphite = mat('Scorpion electric blue armor', '#5276FF')
        for z, width in ((-18, 8), (-9, 11), (2, 13), (12, 13)):
            ellipsoid('Overlapping dorsal segment', (0, 19, z), (width, 8, 10), graphite)
            box('Raised dorsal panel', (0, 26.5, z), (width*1.15, 1.6, 5), frame, .6)
            for side in (-1, 1):
                box('Dorsal panel edge inlay', (side*width*.4, 27.3, z), (.95, .55, 3), amber, .2)
        box('Recessed visor', (0, 19, 20), (18, 8, 4), frame, 1.5)
        for side in (-1, 1):
            ellipsoid('Visor emitter', (side*4.7, 19, 22), (1.8, 2.2, 1), amber)
            box('Claw linkage', (side*13, 15, 19), (7, 7, 14), frame, 1.6)
            ellipsoid('Pincer palm', (side*17, 13, 26), (6, 5, 7), graphite)
            for finger in (-1, 1):
                jaw = box('Tapered pincer finger', (side*17+finger*3, 13, 32),
                          (3.2, 4.2, 10), graphite, 1.4)
                jaw.rotation_euler.y = -finger*.23

    def scorpion_tail():
        graphite = mat('Tail electric blue armor', '#5276FF')
        points = [(0, 0, 0), (0, 8, -6), (0, 19, -8), (0, 29, -4),
                  (0, 34, 5), (0, 32, 13), (0, 25, 18)]
        for i, (start, end) in enumerate(zip(points, points[1:])):
            a, b = Vector(start), Vector(end)
            delta = b-a
            radius = 5.6-i*.5
            cylinder('Tail hinge', a, radius*.81, 3, frame, delta, 10)
            segment = ellipsoid('Tail segment' if i<5 else 'Stinger', (a+b)*.5,
                                (radius, delta.length*.59, radius*.88), graphite)
            segment.rotation_mode = 'QUATERNION'
            segment.rotation_quaternion = Vector((0, 1, 0)).rotation_difference(delta.normalized())
            if i<5:
                box('Tail joint edge marker', a+Vector((0, 1.8, -radius*.65)), (2.3, .9, 1.2), amber, .25)
        a = Vector(points[-1])
        bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=2.5, radius2=.1, depth=6,
                                      location=a+Vector((0, -2.5, 1)))
        sting = bpy.context.object
        sting.name = 'Tapered sting tip'
        sting.rotation_euler.x = 1.95
        sting.data.materials.append(frame)

    def shin():
        # Unit mesh along +Y. Runtime stretches it between the knee and toe.
        rings = [(-.5, .38), (-.32, .5), (.19, .31), (.5, .085)]
        verts = [(cos(tau*i/8)*radius, y, sin(tau*i/8)*radius)
                 for y, radius in rings for i in range(8)]
        faces = [tuple(range(8))]
        for row in range(3):
            for i in range(8):
                a, b = row*8+i, row*8+(i+1)%8
                faces.append((a, a+8, b+8, b))
        faces.append(tuple(reversed(range(24, 32))))
        obj = mesh('Tapered armored leg', verts, faces, frame)
        obj.data.materials.append(steel)
        for face in obj.data.polygons:
            if face.index % 8 in (2, 3):
                face.material_index = 1

    def axle():
        cylinder('Carcass', (0, 0, 0), 11.2, 8.2, rubber, (1, 0, 0), 20)
        for side in (-1, 1):
            cylinder('Bead ring', (side*4.1, 0, 0), 8.5, 1.1, steel, (1, 0, 0), 16)
            cylinder('Recessed wheel hub', (side*4.8, 0, 0), 6.7, 1.1, frame, (1, 0, 0), 12)
            cylinder('Drive cap', (side*5.5, 0, 0), 3.5, 1.1, rammer_orange, (1, 0, 0), 10)
        for i in range(14):
            a = tau*i/14
            obj = box('Tread lug', (0, 11.1*cos(a), 11.1*sin(a)), (8.9, 1.8, 3), rubber, .4)
            obj.rotation_euler.x = a
        for i in range(3):
            a = tau*i/3
            cylinder('Wheel bolt', (5.55, 5*cos(a), 5*sin(a)), 1, .8, steel, (1, 0, 0), 8)
        box('Rotation marker', (4.8, 8.6, 0), (1.1, 2.1, 3), steel, .3)

    def rammer():
        box('Drivetrain', (0, 13, 0), (23, 12, 31), frame, 2)
        box('Upper fairing', (0, 20, -3), (25, 12, 24), rammer_orange, 3)
        box('Battery hatch', (0, 26.1, -5), (15, 2, 12), rammer_orange, .8)
        box('Layered impact bar', (0, 10, 16), (32, 9, 8), rammer_orange, 2)
        for x in (-10, 0, 10):
            box('Replaceable bumper pad', (x, 10, 20.4), (5, 6, 2.5), frame, .5)
        for x in (-8, 8):
            optic(x, 19, 10, 3, cyan)
            box('Armored fender edge', (x*1.5, 22, -2), (2.9, 3, 18), frame, .75)
            box('Fender inset light', (x*1.5, 23.5, 1), (1, .6, 8), cyan, .25)
        for z in (-9, -6, -3):
            box('Battery cover vent', (0, 27.25, z), (8, .55, 1.2), frame, .25)

    def hammer():
        box('Pelvis chassis', (0, 0, 0), (23, 10, 15), frame, 1.8)
        box('Chamfered thorax', (0, 10, -1), (25, 19, 18), lilac, 2.8)
        box('Sensor housing', (0, 21, 1), (17, 9, 14), lilac, 1.8)
        optic(0, 21, 8, 4.1, amber)
        for x in (-13, 13):
            cylinder('Shoulder motor', (x, 10, 0), 5, 4, frame, (1, 0, 0), 12)
        box('Hammer linkage', (16, 5, 5), (5, 20, 5), steel, 1)
        box('Hammer housing', (16, -3, 10), (13, 11, 18), lilac, 1.6)
        for z in (1, 19):
            box('Hammer wear face', (16, -3, z), (11, 9, 2.8), frame, .8)
        for x in (-9, 9):
            box('Chest armor border', (x, 11, 8), (3.2, 11, 2), frame, .55)
            box('Chest inset indicator', (x, 12, 9.1), (1.1, 5, .55), amber, .2)
        box('Hammer edge guard', (16, 2.5, 10), (11, 2, 13), frame, .7)
        box('Hammer inset indicator', (16, 3.55, 10), (1.6, .55, 7), amber, .2)

    def boot():
        box('Cleated sole', (0, -.4, 1), (9, 3, 14), frame, .65)
        box('Armored toe', (0, 1.4, 4), (8, 3, 8), lilac, 1)
        cylinder('Ankle pin', (0, 2.5, -2), 2.4, 7, steel, (1, 0, 0), 10)

    part('roundSpider', lambda: spider_core(True))
    part('squareSpider', lambda: spider_core(False))
    part('barrelSpider', barrel_spider)
    part('sweeper', sweeper)
    part('capsuleSpider', capsule)
    part('beetleSpider', beetle)
    part('crabSpider', crab)
    part('hermitSpider', hermit)
    part('scorpionSpider', scorpion)
    part('scorpionTail', scorpion_tail)
    part('spiderShin', shin)
    part('rammerBody', rammer)
    part('rammerWheel', axle)
    part('hammerBody', hammer)
    part('hammerFoot', boot)
    bpy.context.view_layer.update()
    buffers = {}
    for key, objects in parts.items():
        out = []
        for obj in objects:
            data = obj.data
            data.calc_loop_triangles()
            normal_matrix = obj.matrix_world.to_3x3().inverted().transposed()
            for tri in data.loop_triangles:
                material = data.materials[tri.material_index]
                normal = Vector((0, 2, 0)) if material.get('emission') else (normal_matrix @ tri.normal).normalized()
                for index in tri.vertices:
                    point = obj.matrix_world @ data.vertices[index].co
                    out.extend(round(value, 5) for value in (*point, *normal, *material.diffuse_color[:3]))
        buffers[key] = out
    target = ROOT / 'dist' / 'assets' / 'bridge-mechs.js'
    entries = [f'{key}:new Float32Array({json.dumps(data, separators=(",", ":"))})' for key, data in buffers.items()]
    target.write_text('globalThis.BridgeMechMeshes={\n'+',\n'.join(entries)+'\n};\n', encoding='utf-8')
    for index, objects in enumerate(parts.values()):
        for obj in objects:
            obj.location.x += index*55
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'source-assets' / 'bridge-mechs.blend'))
    print({key: len(data)//27 for key, data in buffers.items()}, flush=True)


if __name__ == '__main__':
    build()
