"""Run inside Blender. Explicit objects, meter units, portable file paths."""
from pathlib import Path
import json
import bpy
from mathutils import Vector


def material(name, color=(.5, .5, .5, 1), image=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = color
    p.inputs['Roughness'].default_value = .8
    if image:
        t = m.node_tree.nodes.new('ShaderNodeTexImage')
        t.image = image
        m.node_tree.links.new(t.outputs['Color'], p.inputs['Base Color'])
    return m


def box(name, center, size, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    obj = bpy.context.object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    return obj


def planar_uv(obj, bounds):
    """World XY -> UV; bounds = xmin,ymin,xmax,ymax. Use on floor surfaces."""
    x0, y0, x1, y1 = bounds
    if x1 <= x0 or y1 <= y0:
        raise ValueError('Invalid UV bounds')
    uv = obj.data.uv_layers.active or obj.data.uv_layers.new(name='World_XY')
    for loop in obj.data.loops:
        v = obj.matrix_world @ obj.data.vertices[loop.vertex_index].co
        uv.data[loop.index].uv = ((v.x-x0)/(x1-x0), (v.y-y0)/(y1-y0))


def import_stl(path, scale=1., matrix=None):
    """matrix: optional 4x4 mathutils.Matrix converting source coordinates to Z-up."""
    bpy.ops.object.select_all(action='DESELECT')
    if hasattr(bpy.ops.wm, 'stl_import'):
        bpy.ops.wm.stl_import(filepath=str(Path(path).resolve()))
    else:
        raise RuntimeError('This helper requires Blender 4.x+ STL importer')
    objs = list(bpy.context.selected_objects)
    for obj in objs:
        for v in obj.data.vertices:
            v.co *= scale
            if matrix is not None:
                v.co = matrix @ v.co
    return objs


def inspect_scene():
    rows = []
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH':
            continue
        points = [obj.matrix_world @ Vector(p) for p in obj.bound_box]
        rows.append(dict(name=obj.name, vertices=len(obj.data.vertices),
                         bounds=[[min(p[i] for p in points), max(p[i] for p in points)] for i in range(3)],
                         materials=[m.name if m else None for m in obj.data.materials],
                         uv_layers=len(obj.data.uv_layers)))
    return dict(blender=bpy.app.version_string, unit_scale=bpy.context.scene.unit_settings.scale_length,
                meshes=rows, images=[dict(name=i.name, path=i.filepath, packed=bool(i.packed_file),
                                         size=list(i.size)) for i in bpy.data.images if i.type != 'RENDER_RESULT'])


def save_bundle(out, objects):
    """Save editable packed scene and selected-mesh GLB. Refuse overwrite."""
    out = Path(out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    if (out/'scene.blend').exists() or (out/'scene.glb').exists():
        raise FileExistsError('Use a new output directory')
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        if obj.type != 'MESH':
            raise ValueError('Export list must contain only mesh objects')
        obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(out/'scene.glb'), export_format='GLB', use_selection=True)
    for im in bpy.data.images:
        if im.type != 'RENDER_RESULT' and im.has_data:
            im.pack()
    bpy.ops.wm.save_as_mainfile(filepath=str(out/'scene.blend'))
    (out/'inspection.json').write_text(json.dumps(inspect_scene(), ensure_ascii=False, indent=2), encoding='utf-8')
