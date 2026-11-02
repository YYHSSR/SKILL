"""blender -b input.blend --python inspect_scene.py -- --out report.json"""
import argparse, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from scene_tools import inspect_scene, import_stl
p = argparse.ArgumentParser()
p.add_argument('--out', required=True)
p.add_argument('--stl')
p.add_argument('--scale', type=float, default=1.)
a = p.parse_args(sys.argv[sys.argv.index('--')+1:])
if a.stl:
    import bpy
    bpy.ops.wm.read_factory_settings(use_empty=True)
    import_stl(a.stl, a.scale)
Path(a.out).resolve().write_text(json.dumps(inspect_scene(), ensure_ascii=False, indent=2), encoding='utf-8')
