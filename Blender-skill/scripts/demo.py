"""Self-contained modeling/texturing demo; no external assets or pip packages."""
import argparse, sys, math
from pathlib import Path
from array import array
sys.path.insert(0, str(Path(__file__).resolve().parent))
import bpy
from mathutils import Vector
from scene_tools import box, material, planar_uv, save_bundle
p = argparse.ArgumentParser()
p.add_argument('--out', required=True)
p.add_argument('--render', action='store_true')
a = p.parse_args(sys.argv[sys.argv.index('--')+1:])
out = Path(a.out).resolve()
if out.exists() and any(out.iterdir()):
    raise FileExistsError('Demo requires an empty/new output folder')
out.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
s = bpy.context.scene
s.unit_settings.system = 'METRIC'
s.unit_settings.scale_length = 1.
# Pixel origin matches Blender UV bottom-left. All dimensions below are meters.
n = 512
pix = array('f', [.10, .13, .15, 1.]) * (n*n)
def rect(x0,y0,x1,y1,c):
    for y in range(max(0,int(y0*n/4)), min(n,int(y1*n/4))):
        for x in range(max(0,int(x0*n/4)), min(n,int(x1*n/4))):
            k = 4*(y*n+x)
            pix[k:k+4] = array('f', [*c,1])
green=(.13,.32,.10); yellow=(.9,.65,.05); white=(.9,.9,.85)
rect(0,0,4,4,green)
rect(.18,.18,3.82,3.82,yellow)
rect(.21,.21,3.79,3.79,(.10,.13,.15))
rect(.86,.86,3.14,3.14,yellow)
rect(.9,.9,3.1,3.1,green)
for i in range(8):
    rect(.22,1.5+i*.09,.84,1.54+i*.09,white)
im=bpy.data.images.new('road_grass_crosswalk',width=n,height=n)
im.pixels.foreach_set(pix)
im.filepath_raw=str(out/'ground.png');im.file_format='PNG';im.save()
floor=box('Ground',(2,2,-.025),(4,4,.05),material('Ground',image=im))
planar_uv(floor,(0,0,4,4))
objects=[floor]
stone=material('Warm_stone',(.55,.58,.52,1))
objects.append(box('Building',(2,2,.3),(.75,.7,.6),stone))
objects.append(box('Vehicle_pedestal',(2.7,2.6,.13),(.28,.28,.26),stone))
objects.append(box('Platform_fixed_top',(2.7,2.6,.28),(.5,.5,.04),material('Deck',(.1,.17,.2,1))))
leaf=material('Green_canopy',(.12,.4,.08,1));bark=material('Trunk',(.12,.2,.06,1))
for x,y in [(1.15,1.15),(1.15,2.85),(2.85,1.15)]:
    objects.append(box('Tree_trunk',(x,y,.1),(.045,.045,.2),bark))
    bpy.ops.mesh.primitive_cone_add(vertices=8,radius1=.14,depth=.4,location=(x,y,.35))
    t=bpy.context.object;t.name='Tree_canopy';t.data.materials.append(leaf);objects.append(t)
bpy.ops.object.camera_add(location=(6,-5,7))
cam=bpy.context.object;cam.rotation_euler=(Vector((2,2,0))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.type='ORTHO';cam.data.ortho_scale=6.3;s.camera=cam
bpy.ops.object.light_add(type='AREA',location=(2,2,6));bpy.context.object.data.energy=700;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=5
s.world=bpy.data.worlds.new('World');s.world.color=(.3,.3,.3)
s.render.engine='CYCLES';s.cycles.samples=16
s.render.resolution_x=800;s.render.resolution_y=800;s.render.resolution_percentage=100
s.render.filepath=str(out/'preview.png')
save_bundle(out,objects)
assert tuple(round(v,6) for v in bpy.data.objects['Platform_fixed_top'].dimensions)==(.5,.5,.04)
if a.render:bpy.ops.render.render(write_still=True)
