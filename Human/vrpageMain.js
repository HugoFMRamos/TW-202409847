import * as BABYLON from "@babylonjs/core";
import "@babylonjs/core/Materials/Node/Blocks";
import * as GUI from "@babylonjs/gui";

import "./vrpage.css";
import { Animation } from "babylonjs";

var canvas = document.getElementById("vrCanvas");
var sphereBool = false;

const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));
    light.intensity = 0.7;

    const box = BABYLON.MeshBuilder.CreateBox("box", {});
    box.position.y = 0.5;

    var boxMaterial = new BABYLON.StandardMaterial(scene);
    boxMaterial.alpha = 1;
    boxMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 1.0);
    box.material = boxMaterial;

    createBoxAnimation(box, scene);

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
    sphere.position.y = 2.5;

    var sphereMaterial = new BABYLON.StandardMaterial(scene);
    sphereMaterial.alpha = 1;
    sphereMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.3, 0.3);

    sphere.material = sphereMaterial;

    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
    ground.position = new BABYLON.Vector3(0, 0, 0);

    var groundMaterial = new BABYLON.StandardMaterial(scene);
    groundMaterial.alpha = 1;
    groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 1.0, 0.3);
    ground.material = groundMaterial;

    const xr = await scene.createDefaultXRExperienceAsync ({
        floorMeshes: [ground],
        optionalFeatures: true,
    });

    scene.onPointerObservable.add((pointerInfo) => {            
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERTAP:
                if(pointerInfo.pickInfo.hit) {
                    pointerDown(pointerInfo.pickInfo.pickedMesh)
                }
                break;
        }
    });

    const pointerDown = (mesh) => {
        if (!mesh.name.includes ("sphere")) {
            return;
        }

        if(sphereBool) {
            sphereMaterial.diffuseColor = new BABYLON.Color3(1.0, 0.3, 0.3);
        } else {
            sphereMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 1.0);
        }

        sphereBool = !sphereBool;
    }

    return scene;
}



function createBoxAnimation(mesh, scene) {
    const rotateFrames = [];
    const fps = 60;

    const rotateAnim = new Animation(
        "rotateAnim", 
        "rotation.y", 
        fps, 
        Animation.ANIMATIONTYPE_FLOAT, 
        Animation.ANIMATIONLOOPMODE_CYCLE
    );

    rotateFrames.push({frame:0, value:0});
    rotateFrames.push({frame:180, value: Math.PI/2});

    rotateAnim.setKeys(rotateFrames);
    mesh.animations.push(rotateAnim);

    return scene.beginAnimation(mesh, 0, 180, true);
}

createScene().then((sceneToRender) => {
    engine.runRenderLoop(() => sceneToRender.render());
});

window.addEventListener("resize", function () {
    engine.resize();
});