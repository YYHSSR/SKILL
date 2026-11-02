# Gazebo Classic 导出

目标为静态环境模型，沿用本项目 Ubuntu 20.04 / Gazebo Classic 11 的目录形式。不能直接假设适用于其他 Gazebo 渲染器版本。

`export_gazebo.py` 输出：

```text
my_environment/
  model.config
  model.sdf
  meshes/visual.obj
  meshes/visual.mtl
  meshes/collision.stl
  materials/textures/texture_00.png
```

图片数量及扩展名由材质决定；纯色材质也支持。不产生 world、启动脚本、截图或说明。把整个模型目录复制到 Linux 的 `~/.gazebo/models/`，或把其父目录加入 `GAZEBO_MODEL_PATH`，再从 Gazebo 的 Insert 面板加载。

## 适用范围

- 几何应为米制、Z 向上，场景 unit scale 为 1。OBJ/STL 均使用 Y forward / Z up；通过包围盒验证导出比例和方向。
- 支持不透明基础色或简单 Image Texture → Principled Base Color。复杂节点、程序纹理、混合材质先烘焙为 UV 图片，脚本会拒绝已识别的不支持节点连接。
- OBJ 不保存完整 Blender 渲染效果。粗糙度、金属、灯光等在 Gazebo 中可能不同，需要目标软件检查；不要承诺像素一致。
- `--collection NAME` 可限制导出范围，包括子集合。省略时尝试导出所有场景网格，脚本会解除对象隐藏并检查选择是否完整；集合被排除时会报错，应先在导出副本中启用集合。相机、灯光自动排除。先清理测试网格或明确指定集合。
- 碰撞默认使用同一组网格导出 STL，适合低面数静态环境；高面数树木及装饰应制作独立简化碰撞网格，并相应改 SDF。不要把此脚本用于动态机器人关节、惯性配置。
- 全部图像文件必须可读取，不能仅存在失效外部路径。脚本通过 Blender 导出图片后整理 MTL 的相对引用；不应把 STL 当作携带材质的文件。

## 必做验证

检查 model.config 和 SDF 能解析；SDF 的 model:// URI 与模型文件夹名一致；MTL 各 map 路径存在。用新 Blender 进程导入 visual.obj 检查贴图；用顶点范围比较 OBJ/STL 的单位和方向。只有在目标机器实际加载成功后才能报告 Gazebo 运行验证成功。
