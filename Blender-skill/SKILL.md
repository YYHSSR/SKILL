---
name: blender-skill
description: Use when creating or modifying Blender models, applying UV image textures to CAD/STL environments, or exporting textured static models for Gazebo Classic. Includes portable bpy scripts and a runnable modeling example.
---

# Blender 建模、贴图与仿真模型导出

通过 Blender 自带 Python API `bpy` 执行工作。此技能不需要原对话、专用 MCP、付费插件或已有沙盒文件。用户须提供待编辑模型；也可从基本几何体开始建模。随附脚本是起点，不是自然语言自动建模引擎：AI 需要根据新任务编写或调整场景脚本。

## 工作流程

1. 找到 Blender 可执行文件，检查版本与输入文件。先读 [运行与脚本说明](references/usage.md)。脚本面向 Blender 4.x/5.x；实际验证版本见该文末。使用命令行的 `--python-exit-code 1` 捕获脚本失败。
2. 用 `scripts/inspect_scene.py` 查看物体、世界坐标边界、单位、材质与 UV。仅从 STL 无法确定米/毫米；结合用户尺寸或可信 CAD 参数确定比例，不按外观猜测。
3. 记录用户要求保留的尺寸、障碍和通道。将道路、建筑、绿化、展示相机分开组织。在任务工作目录编写脚本，从 `scripts/scene_tools.py` 复用工具。为新任务另定坐标和参数，不能复用原沙盒的硬编码边界。
4. 地面标线优先绘制成图片，再按世界 XY 坐标赋 UV；有立体轮廓或碰撞需求的建筑、树和平台使用网格。修改已有场景时打开输入 `.blend`，不要执行示例中的清空场景操作。另存结果，保护原文件。
5. 渲染俯视图核对路线、接缝、标线与植被，再查看透视图核对高度和结构。用户要求先审图时，到预览阶段等待反馈，再应用到正式交付。
6. 按需求交付：编辑用打包贴图的 `.blend`，展示用 GLB，Gazebo Classic 用 OBJ/MTL/图片及 STL 碰撞网格。Gazebo 分支读 [导出限制与验证](references/gazebo.md)。只交付用户需要的格式。
7. 在新进程重新打开文件；检查关键尺寸、资源路径及图片可读性。没有实际运行 Gazebo，就报告资源检查结果，不能称已通过仿真。

## 脚本选择

| 文件 | 用途 |
|---|---|
| `scripts/inspect_scene.py` | 检查 `.blend` 或导入 STL 后输出 JSON |
| `scripts/scene_tools.py` | 创建材质/盒体、STL 导入、世界 XY UV、保存打包模型 |
| `scripts/demo.py` | 无外部素材的完整建模+道路贴图示例，可直接运行并改写 |
| `scripts/export_gazebo.py` | 导出静态 Gazebo Classic 模型目录，含材质路径整理 |
| `scripts/verify_export.py` | 新进程重导入 OBJ，检查图片、SDF 引用及 STL/OBJ 边界 |

本次 ROS 沙盒的具体经验及约束见 [沙盒案例](references/sandbox.md)，仅在类似任务中参考。
