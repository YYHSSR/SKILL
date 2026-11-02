"""Export a mesh collection to a self-contained Gazebo Classic model folder."""
import argparse, sys, re, json, shutil, xml.etree.ElementTree as ET
from pathlib import Path
import bpy
p=argparse.ArgumentParser()
p.add_argument('--out',required=True,help='New/empty parent directory')
p.add_argument('--name',default='textured_environment')
p.add_argument('--collection',help='Collection including child collections; otherwise all scene meshes')
a=p.parse_args(sys.argv[sys.argv.index('--')+1:])
if not re.fullmatch('[a-z][a-z0-9_]*',a.name):raise ValueError('Use a lowercase ASCII model name')
root=Path(a.out).resolve()/a.name
if root.exists() and any(root.iterdir()):raise FileExistsError('Refusing to overwrite existing model')
objs=list(bpy.data.collections[a.collection].all_objects) if a.collection else list(bpy.context.scene.objects)
objs=[o for o in objs if o.type=='MESH']
if not objs:raise ValueError('No meshes selected for export')
if abs(bpy.context.scene.unit_settings.scale_length-1)>1e-8:raise ValueError('Convert geometry to meters before export; unit scale must be 1')
materials={m for o in objs for m in o.data.materials if m}
# OBJ cannot preserve arbitrary shader graphs. Fail rather than silently lose them.
for m in materials:
    if not m.use_nodes:continue
    nodes=m.node_tree.nodes
    bs=[n for n in nodes if n.type=='BSDF_PRINCIPLED']
    if len(bs)!=1 or any(n.type not in {'BSDF_PRINCIPLED','OUTPUT_MATERIAL','TEX_IMAGE'} for n in nodes):
        raise ValueError('Bake complex material to an image first: '+m.name)
    outputs=[n for n in nodes if n.type=='OUTPUT_MATERIAL' and n.is_active_output]
    if len(outputs)!=1 or not outputs[0].inputs['Surface'].is_linked or outputs[0].inputs['Surface'].links[0].from_node!=bs[0]:
        raise ValueError('Principled must connect directly to active Material Output: '+m.name)
    for inp in bs[0].inputs:
        if inp.is_linked and (inp.name!='Base Color' or inp.links[0].from_node.type!='TEX_IMAGE' or inp.links[0].from_socket.name!='Color'):
            raise ValueError('Only base-color image links are supported: '+m.name)
    if bs[0].inputs['Alpha'].default_value<1:raise ValueError('Transparent materials need a separate export workflow')
for obj in objs:
    if any(m and m.use_nodes and any(n.type=='TEX_IMAGE' for n in m.node_tree.nodes) for m in obj.data.materials) and not obj.data.uv_layers:
        raise ValueError('Image-textured mesh needs UVs: '+obj.name)
mesh=root/'meshes';tex=root/'materials'/'textures';mesh.mkdir(parents=True);tex.mkdir(parents=True)
images={n.image for m in materials if m.use_nodes for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image}
for i,im in enumerate(sorted(images,key=lambda x:x.name)):
    if len(im.pixels):_ = im.pixels[0]
    if not im.has_data:im.reload()
    if not im.has_data:raise ValueError('Unreadable image: '+im.name)
    im.filepath_raw=str(tex/('source_%02d.png'%i));im.file_format='PNG';im.save()
old_names={m:m.name for m in materials}
try:
    for i,m in enumerate(sorted(materials,key=lambda x:x.name)):m.name='export_material_%03d'%i
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:o.hide_select=False;o.hide_viewport=False;o.hide_set(False);o.select_set(True)
    if set(bpy.context.selected_objects)!=set(objs):raise ValueError('Some meshes are excluded or unselectable; enable their collections in the export scene')
    bpy.ops.wm.obj_export(filepath=str(mesh/'visual.obj'),export_selected_objects=True,export_materials=True,path_mode='ABSOLUTE',forward_axis='Y',up_axis='Z')
    bpy.ops.wm.stl_export(filepath=str(mesh/'collision.stl'),export_selected_objects=True,ascii_format=False,apply_modifiers=True,global_scale=1.,forward_axis='Y',up_axis='Z')
finally:
    for m,name in old_names.items():m.name=name
mtl=mesh/'visual.mtl';lines=[];copied={}
for line in mtl.read_text(encoding='utf-8').splitlines():
    if line.startswith('map_'):
        key,src=line.split(' ',1);source=(mesh/src).resolve()
        if not source.is_file() and (tex/Path(src).name).is_file():source=tex/Path(src).name
        if not source.is_file():raise FileNotFoundError(source)
        if source not in copied:
            dest=source if source.parent==tex else tex/('texture_%02d'%len(copied)+source.suffix.lower())
            if source!=dest:shutil.copy2(source,dest)
            copied[source]=dest
        line=key+' ../materials/textures/'+copied[source].name
    lines.append(line)
mtl.write_text('\n'.join(lines)+'\n',encoding='utf-8')
# Remove only exporter-generated texture copies inside the fresh meshes folder.
for source in copied:
    if source.parent==mesh and source.suffix.lower() not in {'.obj','.mtl','.stl'}:source.unlink()
config=ET.Element('model');ET.SubElement(config,'name').text=a.name
ET.SubElement(config,'version').text='1.0';ET.SubElement(config,'sdf',version='1.6').text='model.sdf'
ET.SubElement(config,'description').text='Textured static environment'
ET.ElementTree(config).write(root/'model.config',encoding='utf-8',xml_declaration=True)
sdf=ET.Element('sdf',version='1.6');model=ET.SubElement(sdf,'model',name=a.name)
ET.SubElement(model,'static').text='true';link=ET.SubElement(model,'link',name='environment')
for tag,file in [('visual','visual.obj'),('collision','collision.stl')]:
    el=ET.SubElement(link,tag,name=tag);g=ET.SubElement(el,'geometry');m=ET.SubElement(g,'mesh')
    ET.SubElement(m,'uri').text='model://'+a.name+'/meshes/'+file
    ET.SubElement(m,'scale').text='1 1 1'
ET.ElementTree(sdf).write(root/'model.sdf',encoding='utf-8',xml_declaration=True)
for dest in copied.values():assert dest.is_file() and dest.stat().st_size>0
print(json.dumps({'model':str(root),'mesh_objects':len(objs),'textures':len(copied),'gazebo_runtime_tested':False}))
