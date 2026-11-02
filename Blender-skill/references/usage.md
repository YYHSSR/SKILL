# 运行与脚本说明

## 给新 AI 的入口

把整个技能文件夹一起提供，并说：

> 请先读取 Blender-skill/SKILL.md，检查我提供的模型。根据我的尺寸和参考图完成建模、贴图及所需导出。输入模型是……，不可修改的尺寸是……，输出目录是……。

只上传 SKILL.md 会丢失脚本及参考文件。若 AI 无法执行本机命令，它只能生成可供你运行的脚本，不能宣称已经操作 Blender。

## 环境与命令

脚本仅依赖 Blender 自带 Python 标准库、`bpy` 和 `mathutils`，无需 pip。普通 Python 不能直接运行这些脚本。Blender 路径由使用者指定，不写死安装位置。

Windows PowerShell 示例，先将三个变量替换为本机路径：

```powershell
$blenderExe = 'E:/blender/blender.exe'
$skillDir = 'E:/CODE/Blender-skill'
$taskOut = 'C:/work/blender-demo'
& $blenderExe -b --python-exit-code 1 --python "$skillDir/scripts/demo.py" -- --out $taskOut --render
& $blenderExe -b "$taskOut/scene.blend" --python-exit-code 1 --python "$skillDir/scripts/inspect_scene.py" -- --out "$taskOut/check.json"
& $blenderExe -b "$taskOut/scene.blend" --python-exit-code 1 --python "$skillDir/scripts/export_gazebo.py" -- --out "$taskOut/gazebo" --name my_environment
& $blenderExe -b --python-exit-code 1 --python "$skillDir/scripts/verify_export.py" -- --model "$taskOut/gazebo/my_environment"
```

Linux 使用同样的 Blender 参数，例如 `blender -b --python-exit-code 1 --python /path/to/demo.py -- --out /tmp/blender-demo --render`。运行目录可以任意指定；导入辅助模块基于脚本自身位置。

STL 检查命令：

```powershell
& $blenderExe -b --python-exit-code 1 --python "$skillDir/scripts/inspect_scene.py" -- --stl 'C:/models/model.stl' --scale 0.001 --out 'C:/work/inspection.json'
```

这里的 0.001 仅适用于已确认以毫米存储的 STL。报告中的坐标是实际顶点坐标；修改场景单位标签本身不等于缩放网格。

## 编写自己的脚本

把辅助模块所在 `scripts` 目录加入 `sys.path`，再 `from scene_tools import ...`。代码中用 `Path` 和参数传路径；配置与素材放在任务目录。

- `import_stl(path, scale, matrix)`：先缩放，再应用可选的 4×4 坐标变换；轴转换矩阵应明确可追踪。
- `box(name, center, size, mat)`：参数为世界位置及完整 XYZ 边长，创建后应用缩放。
- `material(name, color, image)`：生成简单 Principled 材质，支持基础色图片。
- `planar_uv(obj, (xmin,ymin,xmax,ymax))`：世界 XY 映射，适合地板。建筑竖直面须单独根据 XZ/YZ 或展开 UV 处理。
- `save_bundle(out, objects)`：显式选择网格导出 GLB，打包图片并保存场景，输出检查 JSON；拒绝覆盖已有 scene.blend/scene.glb。

示例纹理使用 Blender 图片像素数组，原点位于左下。若改用 Pillow，图片像素原点在左上，需要翻转 Y：`pixel_y=(ymax-y)/(ymax-ymin)*height`。图片材质颜色与照明、色彩管理均影响最终观感。

示例参数以米定义道路、黄线和斑马线，修改宽度时直接重新生成相应标记。对照片式旧贴图按颜色选择扩张只适合可控的纯色纹理，会有误选及覆盖其他标记的风险。

## 输出检查

重新打开 `.blend`，查看图片是否打包；重新导入 GLB/OBJ 检查贴图。验证平台尺寸用世界坐标顶点范围或对象尺寸；对未授权修改的几何比较变换后的顶点/面。俯视图检查通道宽度不能替代车辆转弯及动力学测试。

黑色相机/灯光线框属于视口辅助显示，可关闭 overlays 的 extras/relationship lines。它们通常不会作为网格导出；如果是实体网格边线或重叠面造成的条纹，应检查实际几何，不能一概隐藏。

验证环境：Blender 5.2.2 LTS / Windows。独立示例已完成建模、图片生成、打包保存、GLB 导出及渲染；Gazebo 包已完成导出与新进程重导入检查。其他 Blender 版本及 Linux/Gazebo 运行效果需要目标环境验证。
