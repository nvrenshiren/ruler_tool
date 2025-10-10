# Ruler_Tools

## Getting Started

Install [Node.js](https://nodejs.org/en/) if you don't already have it, and then:

```
npm install -g ruler_tool
```

### Using rulerTool as a command-line tool:

`rulerTool -h`

#### Converting a glTF to glb

`rulerTool gltf -i model.gltf -o model.glb`

`rulerTool gltf -i model.gltf -b`

#### Converting a glb to glTF

`rulerTool gltf -i model.glb -o model.gltf`

`rulerTool gltf -i model.glb -j`

#### Converting a glTF to Draco glTF

`rulerTool gltf -i model.gltf -o modelDraco.gltf -d`

### Saving separate textures

`rulerTool gltf -i model.gltf -t`
