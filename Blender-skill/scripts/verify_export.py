"""Blender fresh-process OBJ/image reimport and STL bounds validation."""
import argparse,sys,struct,json,xml.etree.ElementTree as ET
from pathlib import Path
import bpy
p=argparse.ArgumentParser();p.add_argument('--model',required=True)
a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);root=Path(a.model).resolve()
for name in ['model.config','model.sdf']:ET.parse(root/name)
for node in ET.parse(root/'model.sdf').iter('uri'):
    prefix='model://'+root.name+'/'
    assert node.text.startswith(prefix) and (root/node.text[len(prefix):]).is_file(),node.text
mesh=root/'meshes';maps=[]
for l in (mesh/'visual.mtl').read_text('utf-8').splitlines():
    if l.startswith('map_'):
        f=mesh/l.split(' ',1)[1];assert f.is_file(),f;maps.append(f.resolve())
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.obj_import(filepath=str(mesh/'visual.obj'),forward_axis='Y',up_axis='Z')
for im in bpy.data.images:
    if im.source=='FILE':assert len(im.pixels)>0 and min(im.size)>0,im.filepath
verts=[o.matrix_world@v.co for o in bpy.context.scene.objects if o.type=='MESH' for v in o.data.vertices]
raw=(mesh/'collision.stl').read_bytes();count=struct.unpack_from('<I',raw,80)[0]
assert len(raw)==84+50*count
points=[]
for i in range(count):
    values=struct.unpack_from('<12fH',raw,84+50*i)
    points.extend([values[j:j+3] for j in (3,6,9)])
bounds=lambda vs:[[min(v[i] for v in vs),max(v[i] for v in vs)] for i in range(3)]
b1,b2=bounds(verts),bounds(points)
assert max(abs(a-b) for p,q in zip(b1,b2) for a,b in zip(p,q))<1e-5
print(json.dumps({'status':'passed','texture_files':len(set(maps)),'bounds':b1,'collision_triangles':count,'gazebo_runtime_tested':False}))
